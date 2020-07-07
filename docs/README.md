# Consumer documentation

For documentation on code: [**JSDocs**](https://engineering.cerner.com/carbon-graphs/docs/)

-   [Consumer documentation](#consumer-documentation)
    -   [Guides](#guides)
    -   [Colors](#colors)
    -   [Shapes](#shapes)
        -   [Dark](#dark)
        -   [Light](#light)
    -   [Locale](#locale)
        -   [Format](#format)
    -   [Important information](#important-information)
        -   [Errors](#errors)
            -   [Input](#input)
            -   [Axis Type: Timeseries](#axis-type-timeseries)
        -   [Constraints](#constraints)
            -   [Legend](#legend)
            -   [Axis](#axis)
            -   [Data-point OnClick](#data-point-onclick)
            -   [Locale](#locale-1)
            -   [Data-point values](#data-point-values)

## Guides

-   [Carbon Lifecycle](core/Lifecycle.md)
-   [Dateline](helpers/Dateline.md)
-   [Eventline](helpers/Eventline.md)
-   [Axes](helpers/Axes.md)
-   [Shape](core/Shape.md)

## Colors

### Dark Colors

| Constant | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| BLUE     | ![#176ba0](https://placehold.it/15/176ba0/000000?text=+) `#176ba0` |
| GREEN    | ![#076e00](https://placehold.it/15/076e00/000000?text=+) `#076e00` |
| ORANGE   | ![#b54900](https://placehold.it/15/b54900/000000?text=+) `#b54900` |
| PINK     | ![#ae0868](https://placehold.it/15/ae0868/000000?text=+) `#ae0868` |
| PURPLE   | ![#9c19a3](https://placehold.it/15/9c19a3/000000?text=+) `#9c19a3` |
| YELLOW   | ![#ffc20a](https://placehold.it/15/ffc20a/000000?text=+) `#ffc20a` |

### Light Colors

| Constant     | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| LIGHT_BLUE   | ![#008fe0](https://placehold.it/15/008fe0/000000?text=+) `#008fe0` |
| LIGHT_GREEN  | ![#4b9b1c](https://placehold.it/15/4b9b1c/000000?text=+) `#4b9b1c` |
| LIGHT_ORANGE | ![#e46511](https://placehold.it/15/e46511/000000?text=+) `#e46511` |
| LIGHT_PINK   | ![#e16092](https://placehold.it/15/e16092/000000?text=+) `#e16092` |
| LIGHT_PURPLE | ![#bc70c7](https://placehold.it/15/bc70c7/000000?text=+) `#bc70c7` |
| LIGHT_YELLOW | ![#ffda6c](https://placehold.it/15/ffda6c/000000?text=+) `#ffda6c` |

### Common Colors

| Constant | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| BLACK    | ![#1c1f21](https://placehold.it/15/1c1f21/000000?text=+) `#1c1f21` |
| GREY     | ![#a7aaab](https://placehold.it/15/a7aaab/000000?text=+) `#a7aaab` |
| LAVENDER | ![#8374c2](https://placehold.it/15/8374c2/000000?text=+) `#8374c2` |
| WHITE    | ![#ffffff](https://placehold.it/15/ffffff/000000?text=+) `#ffffff` |

**Note:**

-   In accordance with [accessibility guidelines](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html), Carbon colors must meet a contrast ratio of 3:1. Therefore, `COLORS.YELLOW` and `COLORS.LIGHT_YELLOW` will eventually be removed from the color palette in a future major release.
-   If you are currently using `COLORS.YELLOW` or `COLORS.LIGHT_YELLOW`, please switch to a different color.

## Shapes

### Dark

Used via `Carbon.helpers.SHAPES.DARK`

| Constant      | Rendered as                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIRCLE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0001_circle.svg?sanitize=true">       |
| CROSS         | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0003_plus.svg?sanitize=true">         |
| DIAMOND       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0008_thinDiamond.svg?sanitize=true">  |
| RHOMBUS       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0002_diamond.svg?sanitize=true">      |
| SQUARE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0005_square.svg?sanitize=true">       |
| TEAR_DROP     | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0006_teardrop.svg?sanitize=true">     |
| TEAR_ALT      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0007_teardropUp.svg?sanitize=true">   |
| TRIANGLE      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0009_triangle.svg?sanitize=true">     |
| TRIANGLE_DOWN | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0010_triangleDown.svg?sanitize=true"> |
| VERTICAL_BAR  | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0004_rectangle.svg?sanitize=true">    |
| X             | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0011_x.svg?sanitize=true">            |

### Light

Used via `Carbon.helpers.SHAPES.LIGHT`

| Constant      | Rendered as                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIRCLE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0001_circle_light.svg?sanitize=true">       |
| CROSS         | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0003_plus_light.svg?sanitize=true">         |
| DIAMOND       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0008_thinDiamond_light.svg?sanitize=true">  |
| RHOMBUS       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0002_diamond_light.svg?sanitize=true">      |
| SQUARE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0005_square_light.svg?sanitize=true">       |
| TEAR_DROP     | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0006_teardrop_light.svg?sanitize=true">     |
| TEAR_ALT      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0007_teardropUp_light.svg?sanitize=true">   |
| TRIANGLE      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0009_triangle_light.svg?sanitize=true">     |
| TRIANGLE_DOWN | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0010_triangleDown_light.svg?sanitize=true"> |
| VERTICAL_BAR  | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0004_rectangle_light.svg?sanitize=true">    |
| X             | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/main/src/icons/S_0011_x_light.svg?sanitize=true">            |

Carbon supports custom shapes as well! For more information on custom icon support, refer [Carbon Shape](core/Shape.md)

## Locale

| Language |
| -------- |
| de_DE    |
| en_AU    |
| en_CA    |
| en_GB    |
| en_US    |
| es_ES    |
| fr_FR    |
| ja_JP    |
| pt_BR    |
| nl_NL    |
| sv_SE    |

### Format

Consumers can provide a JSON for any locale, the format needs to be:

```javascript
const locale_custom = {
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["", " €"],
    dateTime: "%A, der %e. %B %Y, %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    days: [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
    ],
    shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ],
    shortMonths: [
        "Jan",
        "Feb",
        "Mrz",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
    ],
    noData: "No Data"
};
```

Resources on locale based tick formatting:

-   [Number formatting](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
-   [Datetime formatting](https://github.com/d3/d3-time-format/blob/master/README.md#timeFormatLocale)

## Important information

### Errors

#### Input

-   No bind id is provided
-   No axes information is provided [x, y]
-   No lower and upper limits are provided for axes
-   No Y axis label is provided
-   No data is provided
-   No data key is provided
-   Data keys are not unique (If multiple data-sets are provided)
-   No data values are not provided

#### Axis Type: Timeseries

-   Data points are type `timeseries` but the x-axis bounds are `default`
-   Data points are type `default` but the x-axis bounds are `timeseries`
-   Data point values provided should be in UTC
-   Data point values provided should be in [RFC 3339](http://www.faqs.org/rfcs/rfc3339.html) format

### Constraints

#### Legend

-   `Legend` only loads if the data-set label is provided
    -   This is part of a functionality, any `content` using Graph API will have the ability to load data within graph and not show legend item
-   `Graph` and `Legend` can be loaded in a separate containers when `bindTo` and `bindLegendTo` element id's are provided respectively

#### Axis

-   If `y2` axis is enabled, then the data-sets expect the `yAxis: "y2"` property

#### Data-point OnClick

-   The `onClick` property needs to be a callback function
-   Callback function will be called on click of a data point, this function will determine the action performed

#### Locale

-   If `locale` is provided, `ticks.format` is expected to be provided as well otherwise there is no effect on the graph itself.

#### Data-point values

-   `values` will not be subjected to any kind of pre-processing before generating the graph. `values` co-ordinates are expected to be linear/sorted.
