var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "AbstractComponentEditor"], function (require, exports, AbstractComponentEditor) {
    var AbstractComponentContainerEditor = (function (_super) {
        __extends(AbstractComponentContainerEditor, _super);
        function AbstractComponentContainerEditor(options) {
            _super.call(this, options);
            this.editors = {};
        }
        AbstractComponentContainerEditor.prototype.destroy = function () {
            _.each(this.editors, function (editor, idx) {
                editor.destroy();
            });
        };
        return AbstractComponentContainerEditor;
    })(AbstractComponentEditor);
    return AbstractComponentContainerEditor;
});
