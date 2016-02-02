class Util {

    static closest(elem: any, selector: string): JQuery {
        var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

        while (elem && elem !== document) {
            try {
                var f = matchesSelector.bind(elem);
                if (f(selector)) {
                    return $(elem);
                } else {
                    elem = elem.parentNode;
                }
            }
            catch (e) {
                return undefined;
            }
        }
        return undefined;
    }

    static $isplainobject(obj): boolean {
        // Not own constructor property must be Object
        if (obj.constructor &&
            !obj.hasOwnProperty('constructor') &&
            !obj.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for (key in obj) { }

        return key === undefined || obj.hasOwnProperty(key);
    }

    static $extend(destination, ...theSource: Array<any>): any {
        var source, i, property;
        for (i = 1; i < arguments.length; i++) {
            source = arguments[i];
            for (property in source) {
                if (!source.hasOwnProperty(property)) continue;
                if (source[property] && Util.$isplainobject(source[property])) {
                    if (!destination.hasOwnProperty(property)) destination[property] = {};
                    Util.$extend(destination[property], source[property]);
                }
                else {
                    destination[property] = source[property];
                }
            }
        }
        return destination;
    }
}

export = Util;

    
    
    
