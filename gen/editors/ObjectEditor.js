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
            _.each(this.editors, function (editor, key) {
                editor.setValue(value[key], init);
            });
            this.refreshValue();
            this.fireOnChange(false, init);
            return this;
        };
        ObjectEditor.prototype.getValue = function () {
            var result = _super.prototype.getValue.call(this);
            for (var i in result) {
                if (result.hasOwnProperty(i)) {
                    if (_.isUndefined(result[i]))
                        delete result[i];
                }
            }
            return result;
        };
        ObjectEditor.prototype.onChildEditorChange = function (evt) {
            this.refreshValue();
            _super.prototype.onChildEditorChange.call(this, evt);
        };
        ObjectEditor.prototype.refreshValue = function () {
            var _this = this;
            this.value = {};
            _.each(this.editors, function (editor, key) {
                _this.value[key] = _this.editors[key].getValue();
            });
        };
        ObjectEditor.prototype.preRender = function () {
            var _this = this;
            _.each(this.schema.properties, function (idx, name) {
                var schema = _this.schema.properties[name];
                _this.editors[name] = _this.editor.createEditor(schema, {
                    editor: _this.editor,
                    schema: schema,
                    path: _this.path + '.' + name,
                    parent: _this
                });
                _this.editors[name].preRender();
            });
            _super.prototype.preRender.call(this);
        };
        ObjectEditor.prototype.render = function () {
            var itemHolder = $("<div class='edit-container'>").appendTo(this.container);
            _.each(this.editors, function (editor, key) {
                var holder = $("<div>").appendTo(itemHolder);
                editor.setContainer(holder);
                editor.render();
            });
            _super.prototype.render.call(this);
        };
        ObjectEditor.prototype.postRender = function () {
            _.each(this.editors, function (editor, key) {
                editor.postRender();
            });
            _super.prototype.postRender.call(this);
        };
        ObjectEditor.prototype.getContainerClass = function () {
            return "object-container";
        };
        ObjectEditor.prototype.getDefault = function () {
            return _.extend({}, this.schema.default || {});
        };
        ObjectEditor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return ObjectEditor;
    })(AbstractComponentContainerEditor);
    return ObjectEditor;
});
