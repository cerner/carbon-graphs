<div align="center">
  <a href="https://pages.github.cerner.com/Geneva/carbon-graphs/">
    <img width="200" height="200" alt="Click for demo" src="https://raw.github.cerner.com/Geneva/carbon-graphs/master/build/assets/icons/Carbon_256.png">
  </a>
</div>

# Carbon (carbon-graphs)

Carbon is a graphing library built using d3 visualization library. It provides an API for generating native graphs such as Line and Paired Result graphs based on design standards.
Carbon provides an abstraction for c3 and d3.

## Resources

-   [Demo](https://pages.github.cerner.com/Geneva/carbon-graphs/)
-   [API Reference](docs/README.md)
-   [JSDocs](https://pages.github.cerner.com/Geneva/carbon-graphs/docs/)
-   [Release Notes](https://github.cerner.com/Geneva/carbon-graphs/releases)

## Features

-   Adheres to Cerner standard design template
-   Responsive
-   Native-built graphs
-   Default theme for data points

    | Graph types   |
    | ------------- |
    | Line          |
    | Multi-line    |
    | Paired Result |
    | Spline line   |
    | Timeline      |
    | Bar           |
    | Gantt         |

    | Settings                     |
    | ---------------------------- |
    | Legend                       |
    | Labels                       |
    | Grid `Vertical & Horizontal` |
    | Axes `x, y or y2`            |
    | Regions `Horizontal`         |

### Other highlights

-   Criticality indicators for data point
-   Non-contiguous data point Line graph
-   Locale support for axes ticks

## Dependencies

-   **d3** [_v3.5.17_]
-   Polyfills:
    -   Object.assign
    -   Object.values

## Potential features

-   [ ] Sparkline graph
-   [ ] Scatter-plot graph
-   [ ] Axes labelling along with shapes
-   [ ] Area graphs
-   [ ] Area spline graphs
-   [ ] Datetime formatting
-   [ ] DST
-   [ ] Tick counts
-   [ ] Show/hide ticks
-   [ ] Zoom
-   [ ] Pan

## Usage

For convenience, there are 2 sets of distributions provided.

-   `lib/js` - [default] Only `core`. Does not contain any dependencies, consumers need to provide the items listed in the `Dependencies` section before loading the graph.
-   `dist/js` - Contains core + `d3` + all the necessary polyfills needed to load the graphs.

Add `dist/js/carbon-graphs.js` and `dist/css/carbon-graphs.css` in your page and call appropriate graph type declarations mentioned in below documentation.

## Install

-   `npm install`
-   `npm run dev`
-   [http://localhost:9991/](http://localhost:9991/)

## Browser support

-   Android >= 4.4
-   Chrome >= 35
-   Firefox >= 31
-   Internet Explorer >= 10
-   iOS >= 7
-   Opera >= 12
-   Safari >= 7.1
