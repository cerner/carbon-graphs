# Gantt

A native gantt chart using d3 based on standard design patterns.

-   [Gantt](#gantt)
    -   [Usage](#usage)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Required](#required)
            -   [Optional](#optional)
        -   [Axis](#axis)
            -   [Required](#required-1)
            -   [Optional](#optional-1)
        -   [Pass Through](#pass-through)
        -   [Tracks](#tracks)
            -   [Required](#required-2)
            -   [Optional](#optional-2)
        -   [Dimension](#dimension)
            -   [Required](#required-3)
            -   [Optional](#optional-3)
        -   [Track Label](#track-label)
            -   [Required](#required-4)
            -   [Optional](#optional-4)
        -   [Tasks](#tasks)
            -   [Required](#required-5)
            -   [Optional](#optional-5)
            -   [Conditionally Required](#conditionally-required)
        -   [Activities](#activities)
            -   [Required](#required-6)
            -   [Optional](#optional-6)
        -   [Events](#events)
            -   [Required](#required-7)
            -   [Optional](#optional-7)
            -   [Conditionally Required](#conditionally-required-1)
        -   [Actions](#actions)
            -   [Required](#required-8)
            -   [Conditionally Required](#conditionally-required-2)
        -   [Action Legend](#action-legend)
            -   [Required](#required-9)
            -   [Optional](#optional-8)
        -   [Layering](#layering)
        -   [Constraints](#constraints)
    -   [Structure](#structure)

## Usage

```javascript
var ganttInstance = Carbon.api.gantt(/* Add "input" JSON, shown below for example */);
ganttInstance.loadContent(/* Add "data" JSON, shown below for example */);
```

For loading multiple data-sets, you can load as additional content:

```javascript
var ganttInstance = Carbon.api.gantt(/* Add "input" JSON, shown below for example */);
ganttInstance.loadContent(/* Add "dataArray" JSON, shown below for example */);
```

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                                                                                                            |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| bindTo        | string   | DOM id to bind the graph into                                                                                          |
| axis          | object   | Refer [Axis](#axis)                                                                                                    |
| tracks        | []object | Refer [Data](#tracks). This is _not_ an actual object property rather this is provided as a parameter to `loadContent` |

#### Optional

| Property Name    | Expected | Default                                        | Description                                                                          |
| ---------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| bindLegendTo     | string   | null                                           | If DOM id provided, binds legend into that container (Example: `"#legendContainer"`) |
| locale           | object   | LOCALE.en_US                                   | Locale object for X-Axis tick values                                                 |
| throttle         | number   | (1000/60) => time in ms                        | Delay between resize of a browser window                                             |
| dateline         | array    | []                                             | Refer [Dateline](../helpers/Dateline.md)                                             |
| actionLegend     | array    | []                                             | Refer [Action Legend](#action-legend)                                                |
| showActionLegend | boolean  | true                                           | Toggle to show graph legend                                                          |
| padding          | object   | `{ top: 10, bottom: 5, left: 100, right: 50 }` | Refer [Padding](Padding.md)                                                          |
| clickPassThrough | object   | null                                           | Refer [Pass Through](#Pass-Through)                                                  |

### Axis

#### Required

| Property Name | Expected         | Description                                 |
| ------------- | ---------------- | ------------------------------------------- |
| lowerLimit    | string (ISO8601) | Upper bound for the axis. This is inclusive |
| upperLimit    | string (ISO8601) | Lower bound for the axis. This is inclusive |

#### Optional

X (Timeseries) axis should have the following properties:

| Property Name | Expected | Default | Description                        |
| ------------- | -------- | ------- | ---------------------------------- |
| show          | boolean  | true    | Toggle for showing the axis        |
| ticks         | object   | null    | Refer [Ticks](../helpers/Ticks.md) |
| rangeRounding | boolean  | true    | Toggle for range rounding          |

Y Axis should have the following properties:

| Property Name | Expected | Default | Description                 |
| ------------- | -------- | ------- | --------------------------- |
| show          | boolean  | true    | Toggle for showing the axis |

**Note:**

-   `rangeRounding` property extends the domain so that it starts and ends on nice round values. This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value

### Pass Through

Here is a `truth table` on how `clickPassThrough`s work in conjunction with `onClick`s -

-   If `clickPassThrough` is set to `true` and `onClick` function is provided, we honor the onClick functionality and show cursor-pointer on top of the element.
-   If `clickPassThrough` is set to `true` and `onClick` function is not provided, we would be able to click the element beneath it. We also show cursor-pointer here, if bottom element is selectable.
-   If `clickPassThrough` is set to `false` and `onClick` function is provided, we honor the onClick functionality and show cursor-pointer on top of the element.
-   If `clickPassThrough` is set to `false` and `onClick` function is not-provided, the element doesn't interact upon mouse events.

```javascript
clickPassThrough = {
    tasks: false,
    activities: false,
    events: false,
    actions: false,
    dateline: false
};
```

### Tracks

#### Required

| Property Name | Expected | Description                              |
| ------------- | -------- | ---------------------------------------- |
| key           | string   | Unique `id` which represents the content |
| trackLabel    | object   | Refer [Track Label](#track-label)        |

#### Optional

| Property Name | Expected | Default   | Description                                             |
| ------------- | -------- | --------- | ------------------------------------------------------- |
| loadAtIndex   | number   | null      | Index where the track needs to be loaded.               |
| onClick       | Function | undefined | Any action that can be performed when clicking on track |
| dimension     | object   | {}        | Refer [Dimension](#dimension)                           |
| tasks         | array    | []        | Refer [Tasks](#tasks)                                   |
| activities    | array    | []        | Refer [Activities](#activities)                         |
| actions       | array    | []        | Refer [Actions](#actions)                               |

### Dimension

#### Required

`N/A`

#### Optional

| Property Name | Expected | Default | Description                                 |
| ------------- | -------- | ------- | ------------------------------------------- |
| trackHeight   | number   | 41 (px) | Sets the height for the gantt track content |

### Track Label

#### Required

| Property Name | Expected | Description                                     |
| ------------- | -------- | ----------------------------------------------- |
| display       | number   | Track Label which forms the Gantt chart content |

#### Optional

| Property Name | Expected | Default   | Description                                                       |
| ------------- | -------- | --------- | ----------------------------------------------------------------- |
| onClick       | Function | undefined | Any action that can be performed when clicking on the track label |

### Tasks

A Task is a `foreground-bar` along the track. This represents a unit of work.

-   A `task` needs a start and end date.
-   If start date is not provided, a `duration` needs to be provided
-   If end date is not provided, a `duration` needs to be provided
-   Providing a `percentage` transforms a `bar` into a Percentage Bar
-   If start and end date are same then a fixed width `chunk` is created

A task can be styled as follows:

-   A `bar` can be `Hollow`
-   A `bar` can be `Dotted`
-   A `bar` can be `Hashed`

#### Required

| Property Name | Expected         | Description                         |
| ------------- | ---------------- | ----------------------------------- |
| key           | string           | Unique id which represents the task |
| startDate     | string (ISO8601) | Task start date or `duration`       |
| endDate       | string (ISO8601) | Task end date or `duration`         |

#### Optional

| Property Name | Expected | Default                                            | Description                                                                                    |
| ------------- | -------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| duration      | Function | undefined                                          | Function that returns a number that is relative to start or end date                           |
| color         | string   | COLORS.BLUE                                        | Color for the bar                                                                              |
| label         | object   | {}                                                 | `display` property needs to be provided for label                                              |
| percentage    | number   | null                                               | Transforms `bar` into Percentage bar and fill the bar with color opted for in `color` property |
| style         | object   | `{isDotted: true, isHollow: true, isHashed: true}` | Styling for `bar`                                                                              |

#### Conditionally Required

If clickPassThrough.tasks is provided, onClick parameter would be required for any non-pass through operations.

| Property Name | Expected | Default   | Description                                                |
| ------------- | -------- | --------- | ---------------------------------------------------------- |
| onClick       | Function | undefined | Any action that can be performed when clicking on the task |

### Activities

An Activity is a `background-bar` along the track. This represents the overall background process which may encapsulate one or more tasks.

-   A `activity` needs a start and end date.
-   A `activity` will not be selectable.
-   If start date is not provided, a `duration` needs to be provided
-   If end date is not provided, a `duration` needs to be provided
-   If start and end date are same then a fixed width `chunk` is created
-   Start and End date does not encapsulate the underlying tasks.

An activity can be styled as follows:

-   A `bar` can be `Hashed`

#### Required

| Property Name | Expected         | Description                         |
| ------------- | ---------------- | ----------------------------------- |
| key           | string           | Unique id which represents the task |
| startDate     | string (ISO8601) | Task start date or `duration`       |
| endDate       | string (ISO8601) | Task end date or `duration`         |

#### Optional

| Property Name | Expected | Default            | Description                                                          |
| ------------- | -------- | ------------------ | -------------------------------------------------------------------- |
| duration      | Function | undefined          | Function that returns a number that is relative to start or end date |
| color         | string   | COLORS.BLUE        | Color for the bar                                                    |
| label         | object   | {}                 | `display` property needs to be provided for label                    |
| style         | object   | `{isHashed: true}` | Styling for `bar`                                                    |

### Events

#### Required

| Property Name | Expected | Description                                                                |
| ------------- | -------- | -------------------------------------------------------------------------- |
| key           | string   | Unique id which represents the actions within the tracks                   |
| values        | array    | List of string(ISO8601) where a data point `event` needs to be placed      |
| shape         | object   | svg represented as json, which got transpiled from `@cerner/svg-to-carbon` |

#### Optional

| Property Name | Expected | Default     | Description                  |
| ------------- | -------- | ----------- | ---------------------------- |
| label         | object   | {}          | To address a group of events |
| color         | string   | COLORS.BLUE | color of the data point      |

#### Conditionally Required

If clickPassThrough.events is provided, onClick parameter would be required for any non-pass through operations.

| Property Name | Expected | Default   | Description                                                     |
| ------------- | -------- | --------- | --------------------------------------------------------------- |
| onClick       | Function | undefined | Any event that can be performed when clicking on the data point |

### Actions

#### Required

| Property Name | Expected | Description                                                             |
| ------------- | -------- | ----------------------------------------------------------------------- |
| key           | string   | Unique id which needs to be same as `key` in `actionLegend`             |
| values        | array    | List of string (ISO8601) where a data point `action` needs to be placed |

#### Conditionally Required

If clickPassThrough.actions is provided, onClick parameter would be required for any non-pass through operations.

| Property Name | Expected | Default   | Description                                                      |
| ------------- | -------- | --------- | ---------------------------------------------------------------- |
| onClick       | Function | undefined | Any action that can be performed when clicking on the data point |

### Action Legend

Loads the legend for `actions`.

-   Hovering over the legend item will blur other actions within the graph.
-   Clicking on the legend item will remove the action from the graph.

#### Required

| Property Name | Expected | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| key           | string   | Unique id which represents the actions within the tracks |

#### Optional

| Property Name | Expected | Default            | Description                                                                        |
| ------------- | -------- | ------------------ | ---------------------------------------------------------------------------------- |
| label         | object   | {}                 | `display` property: Display value for the data-set which the data points belong to |
| color         | string   | COLORS.BLACK       | Color for the data point `action`                                                  |
| shape         | string   | SHAPES.DARK.CIRCLE | Shape for representing the data points                                             |

### Layering

Here is a list of how layering will be followed inside `Gantt`. Layering here follows the order from `bottom` to `top`.

-   `Activities`
-   `Tasks`
-   `Events`
-   `Actions`

### Constraints

-   If ganttContent's `loadAtIndex` is below 0, we throw an error.
-   If ganttContent's `loadAtIndex` is equal to trackLength or exceeds trackLength, we insert at the end.
-   If ganttContent's `loadAtIndex` is in between 0 and trackLength, we insert in between.

## Structure

```javascript
var input = {
    bindTo: id,
    axis: {
        x: {
            show: true,
            lowerLimit: new Date(2018, 1, 1, 12).toISOString(),
            upperLimit: new Date(2019, 1, 1, 12).toISOString()
        }
    },
    clickPassThrough: {
        tasks: false,
        activities: false,
        events: false,
        actions: false,
        datelines: false
    },
    actionLegend: [
        {
            key: "uid_action_1",
            label: {
                display: "Action A"
            }
        },
        {
            key: "uid_action_2",
            label: {
                display: "Action B"
            },
            shape: Carbon.helpers.SHAPES.DARK.TRIANGLE,
            color: Carbon.helpers.COLORS.GREEN
        }
    ],
    dateline: [
        {
            showDatelineIndicator: true,
            label: {
                display: "Release A"
            },
            color: "#d3d4d5",
            shape: Carbon.helpers.SHAPES.DARK.TRIANGLE,
            onClick: (onCloseCB, payload) => {
                // onCloseCB needs to called by the consumer after popup is closed;
                // Payload is the dateline input object
            },
            value: new Date(2018, 5, 1).toISOString()
        }
    ],
    showActionLegend: true
};
var ganttInstance = Carbon.api.gantt(input);
```

Data can be provided one at a time within loadContent or as an array

```javascript
var caretUp = {
    path: {
        id: "caretUp",
        d: "M0,36l24-24l24,24H0z"
    },
    options: {
        x: -7,
        y: -7,
        scale: 0.3
    }
};

var data = {
    key: "track 1",
    trackLabel: {
        display: "Project A",
        onClick: (label) => {}
    },
    tasks: [
        {
            key: "task1",
            label: {
                display: "Story A"
            },
            onClick: (onCloseCB, key, index, value) => {},
            startDate: new Date(2018, 1, 1).toISOString(),
            endDate: new Date(2018, 1, 10).toISOString()
        }
    ],
    actions: [
        {
            key: "uid_action_1",
            onClick: (onCloseCB, key, index, value) => {},
            values: [
                new Date(2018, 2, 1, 6, 15).toISOString(),
                new Date(2018, 3, 1, 6, 15).toISOString(),
                new Date(2018, 4, 1, 6, 15).toISOString()
            ]
        }
    ],
    events: [
        {
            key: "uid_event_1",
            label: {
                display: "Defect A"
            },
            onClick: loadPopup,
            shape: caretUp,
            color: Carbon.helpers.COLORS.GREEN,
            values: [new Date(2018, 4, 30).toISOString()]
        }
    ]
};
ganttInstance.loadContent(data);

var dataArray = [
    {
        key: "track 1",
        trackLabel: {
            display: "Project A",
            onClick: (label) => {}
        },
        tasks: [],
        actions: [],
        events: []
    },
    {
        key: "track 2",
        trackLabel: {
            display: "Project B",
            onClick: (label) => {}
        },
        tasks: [],
        actions: [],
        events: []
    }
];
ganttInstance.loadContent(dataArray);
```
