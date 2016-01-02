var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "AbstractComponentEditor"], function (require, exports, AbstractComponentEditor) {
    var StringEditor = (function (_super) {
        __extends(StringEditor, _super);
        function StringEditor(options) {
            _super.call(this, options);
        }
        StringEditor.prototype.setValue = function (value, init) {
            _super.prototype.setValue.call(this, value, init);
            this.input.val(value);
            return this;
        };
        StringEditor.prototype.render = function () {
            this.input = $("<input type='text'></input>").appendTo(this.container);
            this.input.change(function () {
            });
        };
        StringEditor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return StringEditor;
    })(AbstractComponentEditor);
    return StringEditor;
});
