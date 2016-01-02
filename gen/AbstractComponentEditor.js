/// <reference path="../lib/jquery.d.ts"/>
define(["require", "exports"], function (require, exports) {
    var AbstractComponentEditor = (function () {
        function AbstractComponentEditor(options) {
            this.options = options;
            this.parent = options.parent;
            this.editor = options.editor;
            this.schema = options.schema;
            this.path = options.path;
        }
        AbstractComponentEditor.prototype.setValue = function (value, init) {
            this.value = value;
            return this;
        };
        AbstractComponentEditor.prototype.getValue = function () {
            return this.value;
        };
        AbstractComponentEditor.prototype.preRender = function () {
        };
        AbstractComponentEditor.prototype.render = function () {
        };
        AbstractComponentEditor.prototype.postRender = function () {
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
