define(["require", "exports", "Util"], function (require, exports, Util) {
    var AbstractComponentEditor = (function () {
        function AbstractComponentEditor(options) {
            this.options = options;
            this.parent = options.parent;
            this.editor = options.editor;
            this.schema = options.schema;
            this.path = options.path;
            this.key = this.path.split('.').pop();
            this.templateEngineName = "underscore";
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
            this.setupWatchListeners();
            this.setValue(this.getDefault(), true);
            this.notify("postRender");
            this.editor.registerEditor(this);
            this.onWatchedFieldChange();
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
            if (this.watchListener)
                this.watchListener();
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
            this.container.addClass(this.getContainerClass()).css("padding-left", "20px");
            return container;
        };
        AbstractComponentEditor.prototype.getHeader = function () {
            var label = this.schema.title || this.key;
            var header = label;
            var description = this.schema.description || "";
            var div = $("<div class='header-container'>");
            $("<div class='header-description'>").text(description).appendTo(div);
            this.header = $("<div class='header-label'>").text(label);
            this.header.appendTo(div);
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
        AbstractComponentEditor.prototype.setupWatchListeners = function () {
            var _this = this;
            this.watched = { items: {} };
            if (this.schema.vars)
                this.schema.watch = this.schema.vars;
            this.watchedValues = { items: {} };
            this.watchListener = function () {
                if (_this.refreshWatchedFieldValues()) {
                    _this.onWatchedFieldChange();
                }
            };
            if (this.schema.hasOwnProperty('watch')) {
                var pathParts = [];
                for (var name in this.schema.watch) {
                    if (!this.schema.watch.hasOwnProperty(name))
                        continue;
                    var path = this.schema.watch[name];
                    if (Array.isArray(path)) {
                        pathParts = [path[0]].concat(path[1].split('.'));
                    }
                    else {
                        pathParts = path.split('.');
                        if (!Util.closest(this.container, '[data-schemaid="' + pathParts[0] + '"]'))
                            pathParts.unshift('#');
                    }
                    var first = pathParts.shift();
                    if (first === '#')
                        first = this.editor.schema.id || 'root';
                    var root = Util.closest(this.container, '[data-schemaid="' + first + '"]');
                    if (!root)
                        throw "Could not find ancestor node with id " + first;
                    var adjustedPath = root.attr('data-schemapath') + '.' + pathParts.join('.');
                    this.editor.watch("*", adjustedPath, this.watchListener);
                    this.watched.items[name] = adjustedPath;
                }
            }
            if (this.schema.headerTemplate) {
                this.headerTemplate = this.editor.compileTemplate(this.schema.headerTemplate, this.templateEngineName);
            }
        };
        AbstractComponentEditor.prototype.refreshWatchedFieldValues = function () {
            if (!this.watchedValues.items)
                return;
            var watched = { items: {} };
            var changed = false;
            var self = this;
            if (this.watched.items) {
                for (var name in this.watched.items) {
                    if (!this.watched.items.hasOwnProperty(name))
                        continue;
                    var editor = this.editor.getEditor(this.watched.items[name]);
                    var val = (editor) ? editor.getValue() : null;
                    if (self.watchedValues.items[name] !== val)
                        changed = true;
                    watched.items[name] = val;
                }
            }
            watched.self = this.getValue();
            if (this.watchedValues.self !== watched.self)
                changed = true;
            this.watchedValues = watched;
            return changed;
        };
        AbstractComponentEditor.prototype.onWatchedFieldChange = function () {
            var vars = {};
            if (this.headerTemplate) {
                var wfv = this.getWatchedFieldValues();
                vars = _.extend({
                    key: this.key,
                    i: this.key,
                    i0: parseInt(this.key),
                    i1: parseInt(this.key) + 1,
                    title: this.getTitle(),
                    self: wfv.self
                }, wfv.items);
                var headerText = this.headerTemplate(vars);
                if (headerText !== this.headerText) {
                    this.headerText = headerText;
                    this.updateHeaderText();
                }
            }
        };
        AbstractComponentEditor.prototype.getWatchedFieldValues = function () {
            return this.watchedValues;
        };
        AbstractComponentEditor.prototype.getTitle = function () {
            return this.schema.title || this.key;
        };
        AbstractComponentEditor.prototype.updateHeaderText = function () {
            if (this.header) {
                this.header.text(this.getHeaderText());
            }
        };
        AbstractComponentEditor.prototype.getHeaderText = function (title_only) {
            if (this.headerText)
                return this.headerText;
            else if (title_only)
                return this.schema.title;
            else
                return this.getTitle();
        };
        AbstractComponentEditor.prototype.destroy = function () {
            this.editor.unregisterEditor(this);
            this.container.empty();
        };
        return AbstractComponentEditor;
    })();
    return AbstractComponentEditor;
});
