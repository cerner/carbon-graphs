# Panning

Panning is applied with timeline/custom button

-   [Panning](#panning)
    -   [Usage](#usage)
    -   [JSON Properties](#json-properties)
        -   [Root](#root)
            -   [Optional](#optional)
    -   [Constraints](#constraints)

## Usage

```javascript
var pan = {
    enabled: true
};
```

## JSON Properties

### Root

#### Optional

| Property Name | Expected | Default   | Description                        |
| ------------- | -------- | --------- | ---------------------------------- |
| enabled       | boolean  | undefined | Set to true when panning is needed |

## Constraints

-   If panning is not provided then enabled will be false.
