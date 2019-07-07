# Shape

A Shape is a nested svg within Carbon graph. We use OCS SVGs for default Carbon Shapes mentioned [here](../README.md/#shapes).
Consumer has the option to provide a custom shape if needed (more information below).

-   [Shape](#shape)
    -   [Exposed functions](#exposed-functions)
    -   [Shape JSON structure](#shape-json-structure)
        -   [JSON input for a single path icon](#json-input-for-a-single-path-icon)
        -   [JSON input for a multiple path icon](#json-input-for-a-multiple-path-icon)
        -   [JSON input properties](#json-input-properties)
            -   [Path](#path)
            -   [Options](#options)
    -   [Shape SVG Properties](#shape-svg-properties)
    -   [Usage](#usage)

## Exposed functions

Carbon exposes the following functions for consumers' benefit:

-   `shape`:(Function) - Returns a new SVG shape instance with attributes provided in the JSON
-   `defaultSVGProps`:(Function) - Returns an Object containing default properties for an SVG which can be applied on a `shape`

## Shape JSON structure

Shape instances can be created by providing a `JSON` as an input and calling upon the exposed `shape` function.

### JSON input for a single path icon

```json
{
    "path": {
        "d": "M24,0l24,24L24,48L0,24L24,0z"
    },
    "options": {
        "x": -6,
        "y": -6,
        "scale": 0.25
    }
}
```

### JSON input for a multiple path icon

```json
{
    "path": [
        {
            "id": "triangle_1_",
            "fill": "#E50000",
            "d": "M1.2,45c-1.1,0-1.6-0.8-1-1.7L23,3.7c0.5-1,1.4-1,2,0l22.8,39.6c0.5,1,0.1,1.7-1,1.7H1.2z"
        },
        {
            "id": "exclamation",
            "fill": "#FFFFFF",
            "d": "M21.5,36.7h5V42h-5V36.7z M21.5,14h5v17.3h-5V14z"
        }
    ],
    "options": {
        "x": -6,
        "y": -6,
        "scale": 0.25
    }
}
```

### JSON input properties

#### Path

| Property Name | Expected | Description                                          |
| ------------- | -------- | ---------------------------------------------------- |
| d             | string   | Path data for svg                                    |
| class         | string   | Class of the path                                    |
| fill          | string   | Color fill for the path. Represents a Hex Color Code |
| id            | string   | ID for the path                                      |

#### Options

X and Y co-ordinates are relative values with respect to the center of the svg.
When an svg is created, the starting point of that svg is at top-left corner, since we want to use the icon in graph centrally aligned,
we would need to move the svg top and left pointing to the center.

| Property Name | Expected | Description                       |
| ------------- | -------- | --------------------------------- |
| x             | number   | X position relative to the center |
| y             | number   | Y position relative to the center |
| scale         | number   | Scale/size of the icon            |

## Shape SVG Properties

Consumers need to provide svg properties to generate an SVG icon using `shape`.

| Property Name  | Expected | Description                                                                                       |
| -------------- | -------- | ------------------------------------------------------------------------------------------------- |
| svgClassNames  | string   | Classname for svg                                                                                 |
| svgStyles      | string   | Styles for svg                                                                                    |
| transformFn    | Function | Transform function for the path(s) within svg. Used to position the svg within consumer container |
| onClickFn      | Function | Callback function called when clicked on the icon                                                 |
| a11yAttributes | Object   | Aria attributes to be set within svg                                                              |

## Usage

```javascript
Carbon.tools
    .shape(/* JSON object provided here */)
    .getShapeElement(Carbon.tools.defaultSVGProps()); // Consumers can provide their own SVG properties object
```
