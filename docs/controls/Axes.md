# Axes

Any graph that inherits from `Graph` API will inherit the following `Axis` and `Tick` properties as well.

## JSON Properties

### Required

| Property Name | Expected | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| lowerLimit    | string   | Upper bound for the axis. This is inclusive                   |
| upperLimit    | string   | Lower bound for the axis. This is inclusive                   |
| label         | string   | Axis label value. Will not be rendered if nothing is provided |

**Note:**

-   y2 axis is mandatory if the **y2.show** is enabled
-   Ticks are mandatory for Bar graphs

### Optional

Each axis - X, Y and Y2 should have the following properties:

| Property Name | Expected | Default           | Description                       |
| ------------- | -------- | ----------------- | --------------------------------- |
| type          | string   | AXIS_TYPE.DEFAULT | Normal number value or time-based |
| show          | boolean  | true              | Toggle for showing the axis       |
| ticks         | object   | null              | Refer [Ticks](Ticks.md)           |
