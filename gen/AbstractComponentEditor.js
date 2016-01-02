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
            this.notify("render");
        };
        AbstractComponentEditor.prototype.postRender = function () {
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
        };
        AbstractComponentEditor.prototype.destroy = function () {
            this.container.empty();
        };
        return AbstractComponentEditor;
    })();
    return AbstractComponentEditor;
});
