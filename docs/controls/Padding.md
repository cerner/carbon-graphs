# Padding

Padding applied to all graph types

**WARNING:**
Use of padding property is strictly use-case specific. Flags such as `showLabel` and `axis.x.show` and `axis.y.show` needs to be set appropriately by the consumer if padding is employed.

-   [Padding](#padding)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Required](#required)
    -   [Constraints](#constraints)
    -   [Default Padding](#default-padding)

## JSON Properties

### Root

#### Required

| Property Name | Expected | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `top`         | number   | Padding that needs to be added on the top    |
| `bottom`      | number   | Padding that needs to be added on the bottom |
| `left`        | number   | Padding that needs to be added on the left   |
| `right`       | number   | Padding that needs to be added on the right  |

## Constraints

-   For some graphs like Gantt, if top padding is not properly padded, the custom dateline indicators might get cut-off.
-   Axes Labels can appear within the graph if not padded properly.
-   Axes ticks and text might get cut-off when the padding being used is too low than the default padding values.
-   Using negative values for padding is allowed, doing so, it shifts graph content more towards the padded side.

## Default Padding

-   Internally, graphs use the following padding properties.

```javascript
var padding = {
    top: 10,
    bottom: 5,
    left: 30,
    right: 50
};
```
