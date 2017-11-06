# Carbon (carbon-graphs)
Carbon is a graphing library built using d3 visualization library. It provides an API for generating native graphs such as Line and Paired Result graphs based on design standards.
Carbon provides an abstraction for c3 and d3. 

### [Demo](https://pages.github.cerner.com/Geneva/carbon-graphs/)

## Features
* Adheres to Cerner standard design template
* Toggles:
  * Legend
  * Labels
  * Grid `Vertical & Horizontal`
  * Axes `x, y or y2`
* Native graphs
    * Line graph
    * Multi-line graph
    * Paired Result graph
* Default theme for data points
* Locale support for axes ticks
* Responsive

## Usage
For convenience, there are 2 sets of distributions provided. 
* `lib/js` - [default] Only `core`. Does not contain any dependencies, consumers need to provide the items listed in the `Dependencies` section before loading the graph.
* `dist/js` - Contains core + `d3` + `c3` + all the necessary polyfills needed to load the graphs.

Add `dist/js/carbon-graphs.js` and `dist/css/carbon-graphs.css` in your page and call appropriate graph type declarations mentioned in below documentation.
### [Consumer documentation](./docs/README.md)

## Dependencies
* **d3** [_v3.5.17_]
* **c3** [_v0.4.18_] - For non-native graphs
* Polyfills:
    * Object.assign
    * Object.values

## Potential features
* [ ] Reference ranges
* [ ] Criticality indicator for data point
* [ ] Spline line graphs
* [ ] Area graphs
* [ ] Area spline graphs
* [ ] Datetime formatting
* [ ] Tick counts
* [ ] Show/hide ticks
* [ ] Axes labelling along with symbols
* [ ] Axes label text overflow
* [ ] Timeline graph
* [ ] Gantt charts
* [ ] Zoom
* [ ] Pan

## Install
* `npm install`
* `npm run dev`
* [http://localhost:9991/](http://localhost:9991/)

## Browser support
* Android >= 4.4
* Chrome >= 35
* Firefox >= 31
* Internet Explorer >= 10
* iOS >= 7
* Opera >= 12
* Safari >= 7.1
