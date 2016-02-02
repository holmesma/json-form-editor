var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "Defaults", "Events", "WatchHelper", "editors/ArrayEditor", "editors/ObjectEditor", "editors/StringEditor"], function (require, exports, Defaults, Events, WatchHelper, ArrayEditor, ObjectEditor, StringEditor) {
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor(options) {
            var _this = this;
            _super.call(this, { "editor:ready": "memory" });
            this.watchHelper = new WatchHelper(["preRender", "render", "postRender", "initialise", "change"]);
            this.addEventCallback("editor:ready");
            Defaults.editors["array"] = ArrayEditor;
            Defaults.editors["object"] = ObjectEditor;
            Defaults.editors["string"] = StringEditor;
            this.options = options;
            this.parentContainer = options.parent;
            this.parentContainer.addClass("editor-container");
            this.schema = options.schema;
            this.container = $("<div>");
            this.parentContainer.append(this.container);
            this.ready = false;
            this.initSchema().done(function (evt) {
                _this.root = _this.createEditor(_this.schema, {
                    editor: _this,
                    parent: null,
                    schema: _this.schema,
                    path: "root"
                });
                _this.root.preRender();
                _this.root.setContainer(_this.container);
                _this.root.render();
                _this.root.postRender();
                if (_this.options.startVal)
                    _this.root.setValue(_this.options.startVal, true);
                _this.ready = true;
                _this.trigger("editor:ready", _this, _this);
            }).fail(function (evt) {
                console.error("Failed to initialize");
            });
        }
        Editor.prototype.getValue = function () {
            if (!this.ready)
                throw "Editor not ready yet. Listen for 'ready' event before getting the value";
            return this.root.getValue();
        };
        Editor.prototype.setValue = function (value) {
            if (!this.ready)
                throw "Editor not ready yet. Listen for 'ready' event before setting the value";
            this.root.setValue(value, true);
            return this;
        };
        Editor.prototype.onChange = function () {
            if (!this.ready)
                return;
            this.trigger("editor:change", this, this);
            return this;
        };
        Editor.prototype.initSchema = function () {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        Editor.prototype.createEditor = function (schema, options) {
            var name = this.resolveEditor(schema);
            var clazz = Defaults.editors[name];
            options = _.extend({}, clazz.options || {}, options);
            return new clazz(options);
        };
        Editor.prototype.resolveEditor = function (schema) {
            return schema.type;
        };
        Editor.prototype.registerEditor = function (editor) {
            this.editors = this.editors || {};
            this.editors[editor.path] = editor;
            return this;
        };
        Editor.prototype.unregisterEditor = function (editor) {
            this.editors = this.editors || {};
            this.editors[editor.path] = null;
            return this;
        };
        Editor.prototype.getEditor = function (path) {
            if (!this.editors)
                return;
            return this.editors[path];
        };
        Editor.prototype.watch = function (events, path, callback) {
            return this.watchHelper.watch(events, path, callback);
        };
        Editor.prototype.watchAll = function (path, callback) {
            return this.watchHelper.watchAll(path, callback);
        };
        Editor.prototype.unwatch = function (events, path, callback) {
            return this.watchHelper.unwatch(events, path, callback);
        };
        Editor.prototype.unwatchAll = function (path, callback) {
            return this.watchHelper.unwatchAll(path, callback);
        };
        Editor.prototype.notifyWatchers = function (event, path, evt) {
            this.watchHelper.notifyWatchers(event, path, evt);
        };
        Editor.prototype.compileTemplate = function (template, name) {
            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };
            return function (context) {
                var t = _.template(template);
                return t(context);
            };
        };
        Editor.defaults = Defaults;
        return Editor;
    })(Events);
    return Editor;
});
