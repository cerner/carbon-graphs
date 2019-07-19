<div align="center">
  <a href="https://engineering.cerner.com/carbon-graphs/">
    <img width="200" height="200" alt="Click for demo" src="https://github.com/cerner/carbon-graphs/raw/master/build/assets/icons/Carbon_256.png">
  </a>
</div>

<h1 align="center">
  Carbon (carbon-graphs)
</h1>

[![Build Status](https://travis-ci.com/cerner/carbon-graphs.svg?branch=master)](https://travis-ci.com/cerner/carbon-graphs)
[![npm latest version](https://img.shields.io/npm/v/@cerner/carbon-graphs/latest.svg)](https://github.com/cerner/carbon-graphs)
[![Cerner OSS](https://badgen.net/badge/Cerner/OSS/blue)](http://engineering.cerner.com/2014/01/cerner-and-open-source/)
[![License](https://badgen.net/badge/license/Apache-2.0/blue)](https://github.com/cerner/carbon-graphs/blob/master/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Carbon is a graphing library built using d3 visualization library. It provides an API for generating native graphs such as Line and Paired Result graphs based on design standards.

-   [Dependencies](#Dependencies)
-   [Features](#Features)
    -   [Graph types](#Graph-types)
    -   [Graph Settings/Toggles](#Graph-SettingsToggles)
    -   [Other highlights](#Other-highlights)
-   [Potential features](#Potential-features)
-   [Resources](#Resources)
-   [Usage](#Usage)
-   [Install](#Install)
-   [Browser support](#Browser-support)
-   [LICENSE](#LICENSE)

## Dependencies

-   **d3** [_v3.5.17_]
-   Polyfills:
    -   Object.assign
    -   Object.values

## Features

-   Adheres to Cerner standard design template
-   Responsive
-   Native-built graphs
-   Default theme for data points

### Graph types

-   Line
-   Multi-line
-   Paired Result
-   Spline line
-   Timeline
-   Pie
-   Bar
-   Gantt

### Graph Settings/Toggles

-   Legend
-   Labels
-   Grid `Vertical & Horizontal`
-   Axes `x, y or y2`
-   Regions `Horizontal`

### Other highlights

-   Supports different shapes for each data-set
-   Supports custom SVG shapes for data-sets
-   `Non-contiguous` data point line graph
-   `Sparkline` graph (with Shapes are hidden)
-   Criticality indicators for data point
-   Locale support for axes ticks
-   Y and Y2 Axes label along with respective shapes

## Potential features

-   [ ] Separate graph types to plugin based
-   [ ] a11y
-   [ ] Support additional themes
-   [ ] Scatter-plot graph
-   [ ] Area graphs
-   [ ] Area spline graphs
-   [ ] DST
-   [ ] Tick counts
-   [ ] Show/hide ticks
-   [ ] Pan

## Resources

-   [Demo](https://engineering.cerner.com/carbon-graphs/)
-   [Contributing to Carbon](docs/contributing/README.md)
-   [API Reference](docs/README.md)
-   [Release Notes](https://github.com/cerner/carbon-graphs/releases)

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

## LICENSE

Copyright 2017 - 2019 Cerner Innovation, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

&nbsp;&nbsp;&nbsp;&nbsp;http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
