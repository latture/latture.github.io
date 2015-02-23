/**
 * Created by ryan on 2/18/15.
 */

// Global variables
var canvas, engine, scene, camera, spriteManagerText, spriteManagerCmap, tree;
var box1_list = [];
var box2_list = [];
var material1_list = [];
var material2_list = [];
var parseResult;
var box1_dims;
var box2_dims;
var box1_colors;
var box2_colors;
var separation;

var alpha = 0.2;
var alpha_init = alpha;

var display_box1;
var display_box2;

var bcc_text, fcc_text, cmap_text;

var text_initialized = false;


document.addEventListener("DOMContentLoaded", function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();

        initBoxes("axial_vs_avg_colors.csv", 0);

        BABYLON.Tools.QueueNewFrame(renderLoop);

        // detect key press events
        window.addEventListener("keydown", onKeyDown);

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }
}, false);


function initScene() {
    // get canvas
    canvas = document.getElementById("renderCanvas");

    // create babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // create scene
    scene = new BABYLON.Scene(engine);

    // create camera
    camera = new BABYLON.ArcRotateCamera("Camera0", 0, 1, 15, BABYLON.Vector3.Zero(), scene);
    scene.activeCamera = camera;
    scene.activeCamera.attachControl(canvas);

    // create light
    var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 10, 0), scene);
    light0.diffuse = new BABYLON.Color3(1,1,1);
    light0.specular = new BABYLON.Color3(.5,.5,.5);
    light0.groundColor = new BABYLON.Color3(.1,.1,.1);

    spriteManagerText = new BABYLON.SpriteManager("textManager", "assets/text.png", 2, 556, scene);
    spriteManagerCmap = new BABYLON.SpriteManager("textManager", "assets/cmaps.png", 1, 2015, scene);
}

function initBoxes(box_color_file, cell_idx) {
    box1_dims = loadCSV("assets/bcc/dims.csv");
    box2_dims = loadCSV("assets/fcc/dims.csv");
    box1_colors = loadCSV("assets/bcc/" + box_color_file);
    box2_colors = loadCSV("assets/fcc/" + box_color_file);
    separation = (box1_dims[0] + box2_dims[0]) / 3.0;

    display_box1 = [];
    for (var i = 0; i < box1_dims[0]; i++) {
        display_box1[i] = true;
    }

    display_box2 = [];
    for (i = 0; i < box2_dims[0]; i++) {
        display_box2[i] = true;
    }

    var boxNmats = createBoxes(box1_dims, 1, box1_colors);
    box1_list = boxNmats[0];
    material1_list = boxNmats[1];
    var vec1 = [0, 0, -separation];
    box1_list = moveBoxes(box1_list, vec1);

    boxNmats = createBoxes(box2_dims, 2, box2_colors);
    box2_list = boxNmats[0];
    material2_list = boxNmats[1];

    var vec2 = [0, 0, separation];
    box2_list = moveBoxes(box2_list, vec2);

    if (!text_initialized) {
        bcc_text = createText(0, new BABYLON.Vector3(-3, box1_dims[1] / 2.0, -separation -.5));
        fcc_text = createText(1, new BABYLON.Vector3(-3, box2_dims[1] / 2.0, separation - .5));
        cmap_text = createCmap(new BABYLON.Vector3(0, - 0.5, box2_dims[2] + 0.75 * separation), cell_idx);
        text_initialized = true;
    }

    else {
        cmap_text.cellIndex = cell_idx;
    }
}


function createBoxes(dims, box_idx, colors) {
    var box_list = [];
    var material_list = [];
    var dimx = dims[0];
    var dimy = dims[1];
    var dimz = dims[2];
    var scalex = dimx / 2.0;
    var scaley = dimy / 2.0;
    var scalez = dimz / 2.0;
    var idx = 0;
    for (var i = 0; i < dimx; i++) {
        for (var j = 0; j < dimx; j++) {
            for (var k = 0; k < dimx; k++) {
                box_list[idx] = BABYLON.Mesh.CreateBox("box" + box_idx.toString() + idx.toString() , 1.0, scene);
                box_list[idx].position = new BABYLON.Vector3(i - scalex, j - scaley, k - scalez);

                material_list[idx] = new BABYLON.StandardMaterial("texture" + box_idx.toString() + idx.toString(), scene);
                material_list[idx].alpha = alpha;
                material_list[idx].diffuseColor = new BABYLON.Color3.FromArray(colors[idx]);

                box_list[idx].material = material_list[idx];
                idx++;
            }
        }
    }
    return [box_list, material_list];
}


function createText(cell_idx, pos) {
    var text = new BABYLON.Sprite("text", spriteManagerText);
    text.stopAnimation();

    text.cellIndex = cell_idx;
    text.position = pos;
    text.size = 4.0;
    return text;
}


function createCmap(pos, cell_idx) {
    var cmap = new BABYLON.Sprite("cmap", spriteManagerCmap);
    cmap.stopAnimation();

    cmap.cellIndex = cell_idx;
    cmap.position = pos;
    cmap.size = 7.0;
    return cmap;
}


function moveBoxes(box_list, vec) {
    for (var i = 0; i < box_list.length; i++) {
        box_list[i].position.x += vec[0];
        box_list[i].position.y += vec[1];
        box_list[i].position.z += vec[2];
    }
    return box_list;
}


function disposeBoxes() {
    for (var i = 0; i < box1_list.length; i++) {
        box1_list[i].dispose();
    }
    for (var i = 0; i < box2_list.length; i++) {
        box2_list[i].dispose();
    }
}


function updateAlpha(slice) {
    var numBoxesPerPlane1 = box1_dims[1] * box1_dims[2];
    var numBoxesPerPlane2 = box2_dims[1] * box2_dims[2];

    var box1_start = numBoxesPerPlane1 * slice;
    var box2_start = numBoxesPerPlane2 * slice;

    var box1_end = box1_start + numBoxesPerPlane1;
    var box2_end = box2_start + numBoxesPerPlane2;

    var newAlpha1 = display_box1[slice] ? alpha : 0.0;

    for (i = box1_start; i < box1_end; i++) {
        material1_list[i].alpha = newAlpha1;
    }

    var newAlpha2 = display_box2[slice] ? alpha : 0.0;

    for (i = box2_start; i < box2_end; i++) {
        material2_list[i].alpha = newAlpha2;
    }
}


function updateAllAlpha() {
    for (var i = 0; i < box1_dims[0]; i++) {
        updateAlpha(i);
    }
}


function onKeyDown(evt) {
    switch (evt.keyCode) {
        case 49 : // '1'
            display_box1[0] = !display_box1[0];
            display_box2[0] = !display_box2[0];
            updateAlpha(0);
            break;
        case 50 : // '2'
            display_box1[1] = !display_box1[1];
            display_box2[1] = !display_box2[1];
            updateAlpha(1);
            break;
        case 51 : // '3'
            display_box1[2] = !display_box1[2];
            display_box2[2] = !display_box2[2];
            updateAlpha(2);
            break;
        case 52 : // '4'
            display_box1[3] = !display_box1[3];
            display_box2[3] = !display_box2[3];
            updateAlpha(3);
            break;
        case 53 : // '5'
            display_box1[4] = !display_box1[4];
            display_box2[4] = !display_box2[4];
            updateAlpha(4);
            break;
        case 84 : //'t'
            alpha = alpha < 0.9 ? 1.0 : alpha_init;
            updateAllAlpha();
            break;
        case 55 : // '7'
            disposeBoxes();
            initBoxes("axial_vs_avg_colors.csv", 0);
            break;
        case 56 : // '8'
            disposeBoxes();
            initBoxes("shear_vs_avg_colors.csv", 1);
            break;
        case 57 : // '9'
            disposeBoxes();
            initBoxes("shear_vs_axial_colors.csv", 2);
            break;
    }
}


// Render loop
var renderLoop = function () {
    // Start new frame
    engine.beginFrame();

    scene.render();

    // Present
    engine.endFrame();

    // Register new frame
    BABYLON.Tools.QueueNewFrame(renderLoop);
};

function loadCSV(file) {
    var request;
    if (window.XMLHttpRequest) {
        // IE7+, Firefox, Chrome, Opera, Safari
        request = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        request = new ActiveXObject('Microsoft.XMLHTTP');
    }
    // load
    request.open('GET', file, false);
    request.send();
    parseData(request.responseText);
    if (parseResult.data.length == 1) {
        return parseResult.data[0];
    }
    else {
        return parseResult.data;
    }
}

function parseCallback(results) {
    parseResult = results;
}

function parseData(url) {
    Papa.parse(url, {
        dynamicTyping: true,
        fastMode: true,
        skipEmptyLines: true,
        complete: function(results, file) {
            parseCallback(results);
        }
    });
}
