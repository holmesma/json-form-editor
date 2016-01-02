var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "AbstractComponentContainerEditor"], function (require, exports, AbstractComponentContainerEditor) {
    var ObjectEditor = (function (_super) {
        __extends(ObjectEditor, _super);
        function ObjectEditor(options) {
            _super.call(this, options);
        }
        ObjectEditor.prototype.setValue = function (value, init) {
            _super.prototype.setValue.call(this, value, init);
            _.each(this.editors, function (editor, key) {
                editor.setValue(value, init);
            });
            return this;
        };
        ObjectEditor.prototype.preRender = function () {
            var _this = this;
            _.each(this.schema.properties, function (idx, name) {
                var schema = _this.schema.properties[name];
                _this.editors[name] = _this.editor.createEditor(_this.schema, {
                    editor: _this.editor,
                    schema: schema,
                    path: _this.path + '.' + name,
                    parent: _this
                });
                _this.editors[name].preRender();
            });
        };
        ObjectEditor.prototype.render = function () {
            var _this = this;
            _.each(this.editors, function (editor, key) {
                var holder = $("<div>").appendTo(_this.container);
                editor.setContainer(holder);
                editor.render();
            });
        };
        ObjectEditor.prototype.postRender = function () {
            _.each(this.editors, function (editor, key) {
                editor.postRender();
            });
        };
        ObjectEditor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return ObjectEditor;
    })(AbstractComponentContainerEditor);
    return ObjectEditor;
});
