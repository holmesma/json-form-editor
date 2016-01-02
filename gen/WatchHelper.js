define(["require", "exports"], function (require, exports) {
    var WatchHelper = (function () {
        function WatchHelper(events) {
            this.events = events;
            this.events.push("*");
            this.watchlist = {};
        }
        WatchHelper.prototype.watch = function (events, path, callback) {
            var evts = this.normalizeEvents(events);
            path = this.normalizePath(path);
            path = evts + ":" + path;
            this.watchlist[path] = this.watchlist[path] || [];
            this.watchlist[path].push(callback);
            return this;
        };
        WatchHelper.prototype.watchAll = function (path, callback) {
            return this.watch("*", path, callback);
        };
        WatchHelper.prototype.unwatch = function (events, path, callback) {
            var evts = this.normalizeEvents(events);
            path = this.normalizePath(path);
            path = evts + ":" + path;
            if (this.watchlist[path]) {
                if (!callback) {
                    this.watchlist[path] = null;
                    return this;
                }
                var newlist = [];
                for (var i = 0; i < this.watchlist[path].length; i++) {
                    if (this.watchlist[path][i] === callback)
                        continue;
                    else
                        newlist.push(this.watchlist[path][i]);
                }
                this.watchlist[path] = newlist.length ? newlist : null;
            }
            return this;
        };
        WatchHelper.prototype.unwatchAll = function (path, callback) {
            return this.watch("*", path, callback);
        };
        WatchHelper.prototype.notifyWatchers = function (event, path, evt) {
            if (_.contains(this.events, event)) {
                var paths = this.findWatchPaths(event, path);
                for (var i = 0; i < paths.length; i++) {
                    var p = paths[i];
                    for (var j = 0; j < this.watchlist[p].length; j++) {
                        try {
                            this.watchlist[p][j](evt);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        };
        WatchHelper.prototype.findWatchPaths = function (event, path) {
            var result = [];
            var keys = _.keys(this.watchlist);
            for (var i = 0; i < keys.length; i++) {
                var wp = keys[i];
                var eventStr = wp.substring(0, wp.indexOf(":"));
                if (_.contains(eventStr.split(","), event)) {
                    var p = wp.substring(wp.indexOf(":") + 1, wp.length);
                    if (this.asterixfyPath(path) === this.asterixfyPath(p)) {
                        var pathSplit = path.split(".");
                        var wpathSplit = p.split(".");
                        var test = [];
                        for (var j = 0; j < wpathSplit.length; j++) {
                            var c = wpathSplit[j];
                            if (c === "*")
                                c = pathSplit[j];
                            test.push(c);
                        }
                        if (path === test.join(".")) {
                            result.push(eventStr + ":" + p);
                        }
                    }
                }
            }
            return result;
        };
        WatchHelper.prototype.normalizePath = function (path) {
            return path.replace(/\[\*\]/g, ".*").replace(/(\[[0-9]+\])/g, function (x) { return x.replace(/\[/, ".").replace(/\]/, ""); });
        };
        WatchHelper.prototype.asterixfyPath = function (path) {
            var p = path.replace(/(\.[0-9]+\.?)/g, ".*.");
            if (p.lastIndexOf(".") === (p.length - 1)) {
                p = p.substring(0, p.length - 1);
            }
            return p;
        };
        WatchHelper.prototype.normalizeEvents = function (events) {
            var result = "";
            var evts = events.replace(/ /g, '').split(",");
            if (_.contains(evts, "*")) {
                result = _.without(this.events, "*").join(",");
            }
            else {
                result = _.intersection(this.events, evts).join(",");
            }
            return result;
        };
        return WatchHelper;
    })();
    return WatchHelper;
});
