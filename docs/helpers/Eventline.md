# Eventline

`Eventline` is a dotted line (by default) used to show an event occurring at a specific time.
Unlike `Dateline`, `Eventline` does not have an indicator and therefore is not interactable. Consumers is expected to define the use-case accordingly.

If Eventline is provided then the `value` property is mandatory.

When using Eventline with graph then `x axis type` must be **timeseries** it is mandatory.

-   [Eventline](#eventline)
    -   [JSON Properties](#json-properties)
        -   [Required](#required)
        -   [Optional](#optional)
-   [Pass Through](#pass-through)
    -   [JSON Properties](#json-properties-1)
        -   [Optional](#optional-1)
        -   [Click Pass Throughs](#click-Pass-Throughs)
    -   [Structure](#structure)

## JSON Properties

### Required

| Property Name | Expected         | Description                                 |
| ------------- | ---------------- | ------------------------------------------- |
| value         | string (ISO8601) | Position where eventline needs to be placed |
| color         | string (ISO8601) | color of the eventline                      |

### Optional

| Property Name | Expected | Default                    | Description                                       |
| ------------- | -------- | -------------------------- | ------------------------------------------------- |
| style         | object   | `{strokeDashArray: "2,2"}` | Any strokeDashArray value to add dash to the line |

# Pass Through

## JSON Properties

#### Optional

| Property Name    | Expected | Default | Description                                       |
| ---------------- | -------- | ------- | ------------------------------------------------- |
| clickPassThrough | object   | null    | Refer [Click Pass Throughs](#click-Pass-Throughs) |

#### Click Pass Throughs

Here is a truth table on how `clickPassThrough`s work-

-   If `clickPassThrough` is set to `true` we would be able to click the element beneath it. We also show cursor-pointer here, if bottom element is selectable.
-   If `clickPassThrough` is set to `false` the element doesn't interact upon mouse events.

## Structure

```javascript
"eventline": [
        {
            color: Carbon.helpers.COLORS.GREEN,
            style: {
                strokeDashArray: "4,4"
            },
            value: new Date(2016, 5, 1).toISOString()
        }
    ],
"clickPassThrough": {
    eventlines: false
}
```
