/// <reference path="../lib/jquery.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var Events = (function () {
        function Events(flags) {
            this.callbacks = {};
            this.flags = flags;
        }
        Events.prototype.on = function (event, callback) {
            this.addEventCallback(event);
            this.callbacks[event].add(callback);
            return this;
        };
        Events.prototype.off = function (event, callback) {
            if (event && callback && this.callbacks[event]) {
                if (this.callbacks[event])
                    this.callbacks[event].remove(callback);
            }
            else if (event) {
                if (this.callbacks[event])
                    this.callbacks[event].empty();
            }
            else {
                _.each(this.callbacks, function (c, k, l) {
                    c.empty();
                });
            }
            return this;
        };
        Events.prototype.addEventCallback = function (event) {
            if (!this.callbacks[event]) {
                var flag = (this.flags) ? this.flags[event] : undefined;
                this.callbacks[event] = $.Callbacks(flag);
            }
        };
        Events.prototype.trigger = function (event, context) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (this.callbacks[event]) {
                this.callbacks[event].fireWith(context, args);
            }
            return this;
        };
        Events.prototype.destroy = function () {
            _.each(this.callbacks, function (c, k, l) {
                c.empty();
            });
            this.callbacks = undefined;
        };
        return Events;
    })();
    return Events;
});
