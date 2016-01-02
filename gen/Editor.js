define(["require", "exports", "Defaults", "editors/ObjectEditor", "editors/StringEditor"], function (require, exports, Defaults, ObjectEditor, StringEditor) {
    var Editor = (function () {
        function Editor(options) {
            var _this = this;
            Defaults.editors["object"] = ObjectEditor;
            Defaults.editors["string"] = StringEditor;
            this.options = options;
            this.parentContainer = options.parent;
            this.schema = options.schema;
            this.container = $("<div>");
            this.parentContainer.append(this.container);
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
                if (_this.options.startval)
                    _this.root.setValue(_this.options.startval, true);
            }).fail(function (evt) {
                console.error("Failed to initialize");
            });
        }
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
        Editor.defaults = Defaults;
        return Editor;
    })();
    return Editor;
});
