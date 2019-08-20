# Consumer documentation

For documentation on code: [**JSDocs**](https://engineering.cerner.com/carbon-graphs/docs/)

-   [Consumer documentation](#consumer-documentation)
    -   [Guides](#guides)
    -   [Chart types](#chart-types)
    -   [Important information](#important-information)
        -   [Errors](#errors)
            -   [Input](#input)
            -   [Axis Type: Timeseries](#axis-type-timeseries)
        -   [Constraints](#constraints)
            -   [Legend](#legend)
            -   [Axis](#axis)
            -   [Data-point OnClick](#data-point-onclick)
            -   [Locale](#locale)
            -   [Data-point values](#data-point-values)
    -   [Colors](#colors)
    -   [Shapes](#shapes)
        -   [Dark](#dark)
        -   [Light](#light)
    -   [Locale](#locale-1)
        -   [Format](#format)

## Guides

-   [Carbon Interface](core/Interface.md)
-   [Dateline](helpers/Dateline.md)
-   [Axes](helpers/Axes.md)
-   [Shape](core/Shape.md)

## Chart types

Consumers can generate one of the following graphs:

-   [GraphAPI](core/GraphAPI.md)
    -   [Line](controls/Line.md)
    -   [Paired Result](controls/PairedResult.md)
    -   [Bar](controls/Bar.md)
-   [Gantt](controls/Gantt.md)
-   [Timeline](controls/Timeline.md)
-   [Pie](controls/Pie.md)

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

## Colors

| Constant     | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| BLACK        | ![#1c1f21](https://placehold.it/15/1c1f21/000000?text=+) `#1c1f21` |
| BLUE         | ![#007cc3](https://placehold.it/15/007cc3/000000?text=+) `#007cc3` |
| GREEN        | ![#78c346](https://placehold.it/15/78c346/000000?text=+) `#78c346` |
| LIGHT_PURPLE | ![#c985da](https://placehold.it/15/c985da/000000?text=+) `#c985da` |
| ORANGE       | ![#ed5e00](https://placehold.it/15/ed5e00/000000?text=+) `#ed5e00` |
| YELLOW       | ![#ffc20a](https://placehold.it/15/ffc20a/000000?text=+) `#ffc20a` |
| GREY         | ![#a7aaab](https://placehold.it/15/a7aaab/000000?text=+) `#a7aaab` |
| LIGHT_BLUE   | ![#26a2e5](https://placehold.it/15/26a2e5/000000?text=+) `#26a2e5` |
| LIGHT_GREEN  | ![#a5d784](https://placehold.it/15/a5d784/000000?text=+) `#a5d784` |
| PURPLE       | ![#78288c](https://placehold.it/15/78288c/000000?text=+) `#78288c` |
| LIGHT_ORANGE | ![#ff7d00](https://placehold.it/15/ff7d00/000000?text=+) `#ff7d00` |
| LIGHT_YELLOW | ![#ffda6c](https://placehold.it/15/ffda6c/000000?text=+) `#ffda6c` |
| WHITE        | ![#ffffff](https://placehold.it/15/ffffff/000000?text=+) `#ffffff` |

## Shapes

### Dark

Used via `Carbon.helpers.SHAPES.DARK`

| Constant      | Rendered as                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIRCLE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0001_circle.svg?sanitize=true">       |
| CROSS         | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0003_plus.svg?sanitize=true">         |
| DIAMOND       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0008_thinDiamond.svg?sanitize=true">  |
| RHOMBUS       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0002_diamond.svg?sanitize=true">      |
| SQUARE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0005_square.svg?sanitize=true">       |
| TEAR_DROP     | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0006_teardrop.svg?sanitize=true">     |
| TEAR_ALT      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0007_teardropUp.svg?sanitize=true">   |
| TRIANGLE      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0009_triangle.svg?sanitize=true">     |
| TRIANGLE_DOWN | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0010_triangleDown.svg?sanitize=true"> |
| VERTICAL_BAR  | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0004_rectangle.svg?sanitize=true">    |
| X             | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0011_x.svg?sanitize=true">            |

### Light

Used via `Carbon.helpers.SHAPES.LIGHT`

| Constant      | Rendered as                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIRCLE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0001_circle_light.svg?sanitize=true">       |
| CROSS         | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0003_plus_light.svg?sanitize=true">         |
| DIAMOND       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0008_thinDiamond_light.svg?sanitize=true">  |
| RHOMBUS       | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0002_diamond_light.svg?sanitize=true">      |
| SQUARE        | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0005_square_light.svg?sanitize=true">       |
| TEAR_DROP     | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0006_teardrop_light.svg?sanitize=true">     |
| TEAR_ALT      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0007_teardropUp_light.svg?sanitize=true">   |
| TRIANGLE      | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0009_triangle_light.svg?sanitize=true">     |
| TRIANGLE_DOWN | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0010_triangleDown_light.svg?sanitize=true"> |
| VERTICAL_BAR  | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0004_rectangle_light.svg?sanitize=true">    |
| X             | <img width="16px" height="16px" src="https://raw.githubusercontent.com/cerner/one-cerner-style-icons/master/src/icons/S_0011_x_light.svg?sanitize=true">            |

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
    ]
};
```

Resources on locale based tick formatting:

-   [Number formatting](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
-   [Datetime formatting](https://github.com/d3/d3-time-format/blob/master/README.md#timeFormatLocale)
