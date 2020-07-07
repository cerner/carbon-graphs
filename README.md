<p align="center">
    <img width="128" height="128" alt="Click for demo" src="https://github.com/cerner/carbon-graphs/raw/main/build/assets/icons/Carbon_256.png">
</p>

<h1 align="center">
  Carbon (carbon-graphs)
</h1>

[![Build Status](https://travis-ci.com/cerner/carbon-graphs.svg?branch=main)](https://travis-ci.com/cerner/carbon-graphs)
[![npm latest version](https://img.shields.io/npm/v/@cerner/carbon-graphs/latest.svg)](https://www.npmjs.com/package/@cerner/carbon-graphs)
[![Cerner OSS](https://badgen.net/badge/Cerner/OSS/blue)](https://engineering.cerner.com/open_source/)
[![License](https://badgen.net/badge/license/Apache-2.0/blue)](https://github.com/cerner/carbon-graphs/blob/main/LICENSE)
[![dependencies Status](https://david-dm.org/cerner/carbon-graphs/status.svg)](https://david-dm.org/cerner/carbon-graphs)
[![devDependencies Status](https://david-dm.org/cerner/carbon-graphs/dev-status.svg)](https://david-dm.org/cerner/carbon-graphs?type=dev)
[![Bugs](https://img.shields.io/github/issues/cerner/carbon-graphs/bug.svg)](https://github.com/cerner/carbon-graphs/issues?utf8=✓&q=is%3Aissue+is%3Aopen+label%3Abug)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Carbon is a graphing library built using D3 visualization library. It provides an API for generating native graphs such as Line and Paired Result graphs based on design standards.

-   [Install](#install)
-   [Getting Started](#getting-started)
-   [Dependencies](#dependencies)
-   [Features](#features)
    -   [Graph types](#graph-types)
    -   [Graph Settings/Toggles](#graph-settingstoggles)
    -   [Other highlights](#other-highlights)
-   [Resources](#resources)
-   [Browser support](#browser-support)
-   [Potential features](#potential-features)
-   [LICENSE](#license)

## Install

You can install Carbon via `npm` or download the [latest release](https://github.com/cerner/carbon-graphs/releases/latest) from GitHub.

```sh
npm i @cerner/carbon-graphs --save-dev
```

## Getting Started

-   [Getting Started](./docs/getting-started/GettingStarted.md)
-   [API Reference](docs/README.md)

## Dependencies

-   D3
-   Polyfills:
    -   Object.assign
    -   Object.values

## Features

-   Adheres to Cerner standard design template
-   Responsive
-   Native-built graphs
-   Default theme for data points

### Graph types

-   [Line](./docs/controls/Line.md#usage)
-   [Multi Line](./docs/controls/Line.md#multi-line)
-   [Spline Line](./docs/controls/Line.md#spline-line)
-   [Paired Result](./docs/controls/PairedResult.md#usage)
-   [Bar](./docs/controls/Bar.md#usage)
-   [Timeline](./docs/controls/Timeline.md#usage)
-   [Pie](./docs/controls/Pie.md#usage)
-   [Gantt](./docs/controls/Gantt.md#usage)
-   [Scatter](./docs/controls/Scatter.md#usage)
-   [Bubble](./docs/controls/Bubble.md#usage)

### Graph Settings/Toggles

-   Legend
-   Labels
-   Grid `vertical & horizontal`
-   Axes `x and y or y2`
-   Regions `horizontal`

### Other highlights

-   Supports different shapes for each data-set
-   Supports custom SVG shapes for data-sets
-   `Non-contiguous` data point line graph
-   `Sparkline` graph (with Shapes as hidden)
-   Criticality indicators for data point
-   Locale support for axes ticks
-   Y and Y2 Axes label along with respective shapes
-   Graph Panning

## Resources

-   [Demo](https://engineering.cerner.com/carbon-graphs/)
-   [Contributing to Carbon](docs/contributing/README.md)
-   [Release Notes](https://github.com/cerner/carbon-graphs/releases)

## Browser support

-   Android >= 4.4
-   Chrome >= 35
-   Firefox >= 31
-   Internet Explorer >= 10
-   iOS >= 7
-   Opera >= 12
-   Safari >= 7.1

## Potential features

-   [ ] Support additional themes
-   [ ] a11y
-   [ ] Area graph
-   [ ] Area spline graph
-   [ ] Separate graph types to plugin based
-   [ ] DST

## LICENSE

Copyright 2017 - 2020 Cerner Innovation, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

&nbsp;&nbsp;&nbsp;&nbsp;http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
