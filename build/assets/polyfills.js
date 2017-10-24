(function() {
    "use strict";

    //object conversion errors
    var CANNOT_CNVT_TO_OBJ = "Cannot convert undefined or null to object";

    //Shorthand for object.defineProperty
    var objectDefineProperty = function(proto, keyValuePairArray) {
        for (var i = keyValuePairArray.length; i--;) {
            var key = keyValuePairArray[ i ][ 0 ];
            var val = keyValuePairArray[ i ][ 1 ];
            if (!proto[ key ]) {
                Object.defineProperty(proto, key, {
                    writeable: true,
                    configureable: true,
                    enumerable: false,
                    value: val
                });
            }
        }
    };
    //Static object polyfills
    (function() {
        var checkConvertible = function(obj) {
            if (typeof obj === "undefined" || obj === null) {
                throw new TypeError(CANNOT_CNVT_TO_OBJ);
            }
            return Object(obj);
        };
        var polylist = [
            /**
             * Copies all values of all enumerable properties from 1+ source objects to a target object.
             * @param {Object} target The target object to assign to
             * @param {...Object} The source objects
             * @returns {Object} the modified target object
             */
            [ "assign", function assign(target) { // .length of function is 2
                //create the new object which is to be returned from the target object
                var to = checkConvertible(target);
                //combine with each additional argument
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[ i ];
                    if (nextSource !== null && typeof nextSource !== "undefined") { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs in IE
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[ nextKey ] = nextSource[ nextKey ];
                            }
                        }
                    }
                }
                return to;
            } ],
            /**
             * Given any object, returns an array of the given object's own enumerable property values.
             * @param {Object} obj The object for which to retrieve the values.
             * @returns {Object[]} An array of values
             */
            [ "values", function values(obj) {
                obj = checkConvertible(obj);
                var vals = [];
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key) && Object.prototype.propertyIsEnumerable.call(obj, key)) {
                        vals.push(obj[ key ]);
                    }
                }
                return vals;
            } ]
        ];
        objectDefineProperty(Object, polylist);
    })();
})();
