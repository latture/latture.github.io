import numpy as np
import matplotlib
import matplotlib.pyplot as plt

# nodes = np.random.rand(125, 3)

# print nodes

# np.savetxt("box1_colors.csv", nodes, fmt='%f', delimiter=',')


# def plot_cmap():
#     gradient = np.linspace(0, 1, 256)
#     gradient = np.vstack((gradient, gradient))

#     fig = plt.figure(figsize=(8, 6), dpi=150)
#     axis = fig.add_subplot(111)
#     axis.imshow(gradient, aspect='auto', cmap=plt.cm.seismic)
#     axis.set_axis_off()
#     plt.savefig("cmap.svg", dpi=150, transparent=True, bbox_inches='tight')

def calc_colormap(data, cmap, vmin=0, vmax=1):
    cm = cmap # plt.get_cmap('seismic')
    cNorm = matplotlib.colors.Normalize(vmin=vmin, vmax=vmax)
    scalarMap = matplotlib.cm.ScalarMappable(norm=cNorm, cmap=cm)
    return scalarMap.to_rgba(data)

def main():
    data = np.random.rand(5, 5)
    data = data.ravel()
    d1 = calc_colormap(data, plt.get_cmap('seismic'))
    d2 = calc_colormap(data+1, plt.get_cmap('seismic'), vmin=1, vmax=2)
    print d2 - d1

main()
# calc_colormap()