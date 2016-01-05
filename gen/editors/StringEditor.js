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
        StringEditor.prototype.setValue = function (value, initial) {
            if (!value)
                value = "";
            var changed = this.hasValueChanged(value);
            _super.prototype.setValue.call(this, value, initial);
            this.input.val(value);
            this.fireOnChange(changed, initial);
            return this;
        };
        StringEditor.prototype.render = function () {
            var _this = this;
            this.input = $("<input type='text'></input>").appendTo(this.container);
            this.input.change(function () {
                _this.value = _this.input.val();
                _this.fireOnChange(true);
            });
            _super.prototype.render.call(this);
        };
        StringEditor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return StringEditor;
    })(AbstractComponentEditor);
    return StringEditor;
});
