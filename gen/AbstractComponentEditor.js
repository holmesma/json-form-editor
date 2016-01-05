/// <reference path="../lib/jquery.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var AbstractComponentEditor = (function () {
        function AbstractComponentEditor(options) {
            this.options = options;
            this.parent = options.parent;
            this.editor = options.editor;
            this.schema = options.schema;
            this.path = options.path;
            this.key = this.path.split('.').pop();
        }
        AbstractComponentEditor.prototype.refreshValue = function () { };
        AbstractComponentEditor.prototype.preRender = function () {
            this.notify("preRender");
        };
        AbstractComponentEditor.prototype.render = function () {
            this.getHeader().prependTo(this.container);
            this.notify("render");
        };
        AbstractComponentEditor.prototype.postRender = function () {
            this.setValue(this.getDefault(), true);
            this.notify("postRender");
        };
        AbstractComponentEditor.prototype.setValue = function (value, initial) {
            this.value = value;
            return this;
        };
        AbstractComponentEditor.prototype.hasValueChanged = function (value) {
            return this.value === value;
        };
        AbstractComponentEditor.prototype.getValue = function () {
            return this.value;
        };
        AbstractComponentEditor.prototype.change = function (evt) {
            if (this.parent)
                this.parent.onChildEditorChange(evt);
            else
                this.editor.onChange();
        };
        AbstractComponentEditor.prototype.onChildEditorChange = function (evt) {
            this.onChange(evt);
        };
        AbstractComponentEditor.prototype.fireOnChange = function (bubble, initial) {
            var info = this.buildEventInfo(this);
            this.onChange({ bubble: bubble, source: this, type: (initial) ? "initial" : "change", info: info });
        };
        AbstractComponentEditor.prototype.buildEventInfo = function (editor) {
            var isArrayItem = false;
            var p = editor.parent;
            if (p && p.rows)
                isArrayItem = true;
            return { key: editor.key, path: editor.path, isArrayItem: isArrayItem };
        };
        AbstractComponentEditor.prototype.onChange = function (evt) {
            var type = (evt.type === "change") ? "change" : "initialise";
            this.notify(type, evt);
            if (evt.bubble)
                this.change(evt);
        };
        AbstractComponentEditor.prototype.notify = function (events, evt) {
            this.editor.notifyWatchers(events, this.path, evt);
        };
        AbstractComponentEditor.prototype.setContainer = function (container) {
            this.container = container;
            if (this.schema.id)
                this.container.attr('data-schemaid', this.schema.id);
            this.container.attr('data-schematype', this.schema.type);
            this.container.attr('data-schemapath', this.path);
            this.container.addClass(this.getContainerClass());
            return container;
        };
        AbstractComponentEditor.prototype.getHeader = function () {
            var label = this.schema.title || this.key;
            var header = label;
            var description = this.schema.description || "";
            var div = $("<div class='header-container'>");
            $("<div class='header-description'>").text(description).appendTo(div);
            $("<div class='header-label'>").text(label).appendTo(div);
            return div;
        };
        AbstractComponentEditor.prototype.getContainerClass = function () {
            return "edit-item";
        };
        AbstractComponentEditor.prototype.getDefault = function () {
            if (this.schema.hasOwnProperty("default"))
                return this.schema.default;
            if (this.schema.enum)
                return this.schema.enum[0];
            var type = this.schema.type || this.schema.oneOf;
            if (type && Array.isArray(type))
                type = type[0];
            if (type && typeof type === "object")
                type = type.type;
            if (type && Array.isArray(type))
                type = type[0];
            if (type === "number")
                return 0.0;
            if (type === "boolean")
                return false;
            if (type === "integer")
                return 0;
            if (type === "string")
                return "";
            if (type === "object")
                return {};
            if (type === "array")
                return [];
            return null;
        };
        AbstractComponentEditor.prototype.destroy = function () {
            this.container.empty();
        };
        return AbstractComponentEditor;
    })();
    return AbstractComponentEditor;
});
