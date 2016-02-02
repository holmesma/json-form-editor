define(["require", "exports"], function (require, exports) {
    var Util = (function () {
        function Util() {
        }
        Util.closest = function (elem, selector) {
            var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
            while (elem && elem !== document) {
                try {
                    var f = matchesSelector.bind(elem);
                    if (f(selector)) {
                        return $(elem);
                    }
                    else {
                        elem = elem.parentNode;
                    }
                }
                catch (e) {
                    return undefined;
                }
            }
            return undefined;
        };
        Util.$isplainobject = function (obj) {
            if (obj.constructor &&
                !obj.hasOwnProperty('constructor') &&
                !obj.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
                return false;
            }
            var key;
            for (key in obj) { }
            return key === undefined || obj.hasOwnProperty(key);
        };
        Util.$extend = function (destination) {
            var theSource = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                theSource[_i - 1] = arguments[_i];
            }
            var source, i, property;
            for (i = 1; i < arguments.length; i++) {
                source = arguments[i];
                for (property in source) {
                    if (!source.hasOwnProperty(property))
                        continue;
                    if (source[property] && Util.$isplainobject(source[property])) {
                        if (!destination.hasOwnProperty(property))
                            destination[property] = {};
                        Util.$extend(destination[property], source[property]);
                    }
                    else {
                        destination[property] = source[property];
                    }
                }
            }
            return destination;
        };
        return Util;
    })();
    return Util;
});
