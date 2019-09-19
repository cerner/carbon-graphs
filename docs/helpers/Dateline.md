# Dateline

If Dateline is provided then the `value` property is mandatory.

When using dateline with graph then `x axis type` must be **timeseries** it is mandatory.

-   [Dateline](#dateline)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
-   [Pass Through](#pass-through)
    -   [JSON Properties](#json-properties-1)
        -   [Optional](#optional-1)
        -   [Click Pass Throughs](#click-pass-throughs)
    -   [Structure](#structure)

## JSON Properties

### Required

| Property Name | Expected         | Description                                                                                                                              |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| value         | string (ISO8601) | Position where dateline needs to be placed                                                                                               |
| color         | string (ISO8601) | color of the dateline                                                                                                                    |
| shape         | string (ISO8601) | `Shape` of the indicator above dateline. Required field if `showDatelineIndicator` is set to true. Refer [a Shapes](../README.md#Shapes) |

### Optional

| Property Name         | Expected | Default   | Description                                                      |
| --------------------- | -------- | --------- | ---------------------------------------------------------------- |
| onClick               | Function | undefined | Any action that can be performed when clicking on the data point |
| showDatelineIndicator | boolean  | true      | Shows the indicator above dateline, this can be clicked          |
| label                 | object   | {}        | `display` property needs to be provided for label                |

# Pass Through

## JSON Properties

#### Optional

| Property Name    | Expected | Default | Description                                       |
| ---------------- | -------- | ------- | ------------------------------------------------- |
| clickPassThrough | object   | null    | Refer [Click Pass Throughs](#click-Pass-Throughs) |

#### Click Pass Throughs

Here is a truth table on how `clickPassThrough`s work in conjunction with `onClick`s -

-   If `clickPassThrough` is set to `true` and `onClick` function is provided, we honor the onClick functionality and show cursor-pointer on top of the element.
-   If `clickPassThrough` is set to `true` and `onClick` function is not provided, we would be able to click the element beneath it. We also show cursor-pointer here, if bottom element is selectable.
-   If `clickPassThrough` is set to `false` and `onClick` function is provided, we honor the onClick functionality and show cursor-pointer on top of the element.
-   If `clickPassThrough` is set to `false` and `onClick` function is not-provided, the element doesn't interact upon mouse events.

```javascript
clickPassThrough = {
    dateline: false
};
```

## Structure

```javascript
"dateline": [
        {
            showDatelineIndicator: true,
            label: {
                display: "Release A"
            },
            color: Carbon.helpers.COLORS.GREEN,
            shape: Carbon.helpers.SHAPES.DARK.TRIANGLE,
            onClick: (onCloseCB, payload) => {
                // onCloseCB needs to called by the consumer after popup is closed;
                // Payload is the dateline input object
            },
            value: new Date(2016, 5, 1).toISOString()
        }
    ],
"clickPassThrough": {
    datelines: false
}
```
