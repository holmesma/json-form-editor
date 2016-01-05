var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "AbstractComponentContainerEditor"], function (require, exports, AbstractComponentContainerEditor) {
    var ArrayEditor = (function (_super) {
        __extends(ArrayEditor, _super);
        function ArrayEditor(options) {
            _super.call(this, options);
            this.itemInfo = {};
            this.rows = [];
        }
        ArrayEditor.prototype.setValue = function (value, initial) {
            var _this = this;
            value = value || [];
            if (!(_.isArray(value)))
                value = [value];
            var serialized = JSON.stringify(value);
            if (this.schema.minItems) {
                while (value.length < this.schema.minItems) {
                    value.push(this.getItemInfo(value.length).default);
                }
            }
            if (this.getMax() && value.length > this.getMax()) {
                value = value.slice(0, this.getMax());
            }
            _.each(value, function (val, i) {
                if (_this.rows[i]) {
                    _this.rows[i].setValue(val, initial);
                }
                else {
                    _this.addRow(val, initial);
                }
            });
            for (var j = value.length; j < this.rows.length; j++) {
                this.destroyRow(this.rows[j]);
                this.rows[j] = null;
            }
            this.rows = this.rows.slice(0, value.length);
            this.refreshValue(initial);
            this.fireOnChange(false, initial);
            if (this.layout) {
                this.layout.isotope('layout');
            }
            else {
                if (this.schema.format === 'table') {
                    this.layout = $('.edit-container', this.itemContainer).isotope({
                        layoutMode: 'fitRows'
                    });
                }
            }
            return this;
        };
        ArrayEditor.prototype.refreshValue = function (force) {
            var _this = this;
            this.value = [];
            _.each(this.rows, function (editor, i) {
                _this.value[i] = editor.getValue();
            });
        };
        ArrayEditor.prototype.getMax = function () {
            if ((_.isArray(this.schema.items)) && this.schema.additionalItems === false) {
                return Math.min(this.schema.items.length, this.schema.maxItems || Infinity);
            }
            else {
                return this.schema.maxItems || Infinity;
            }
        };
        ArrayEditor.prototype.getValue = function () {
            var result = _super.prototype.getValue.call(this);
            for (var i in result) {
                if (result.hasOwnProperty(i)) {
                    if (!result[i])
                        delete result[i];
                }
            }
            return result;
        };
        ArrayEditor.prototype.onChildEditorChange = function (evt) {
            this.refreshValue();
            _super.prototype.onChildEditorChange.call(this, evt);
        };
        ArrayEditor.prototype.render = function () {
            this.itemContainer = $("<div class='item-container'>").appendTo(this.container);
            _super.prototype.render.call(this);
        };
        ArrayEditor.prototype.addNewRow = function (value, initial, mergeValue) {
            this.addRow(value, initial, mergeValue);
        };
        ArrayEditor.prototype.addRow = function (value, initial, mergeValue) {
            var i = this.rows.length;
            this.rows[i] = this.getElementEditor(i);
            if (value) {
                if (mergeValue === true) {
                    var dest = this.rows[i].getValue();
                    value = _.extend(dest, value);
                }
                this.rows[i].setValue(value, initial);
            }
        };
        ArrayEditor.prototype.deleteRow = function (i, change) {
            var value = this.value;
            var newval = [];
            _.each(value, function (row, j) {
                if (j === i) {
                }
                else {
                    newval.push(row);
                }
            });
            this.setValue(newval, false);
            if (change)
                this.fireOnChange(true);
        };
        ArrayEditor.prototype.destroyRow = function (row, hard) {
            var holder = row.container;
            row.destroy();
            holder.remove();
        };
        ArrayEditor.prototype.getElementEditor = function (i) {
            var item_info = this.getItemInfo(i);
            var schema = this.getItemSchema(i);
            schema.title = item_info.title + ' ' + (i + 1);
            var ret = this.editor.createEditor(schema, {
                editor: this.editor,
                schema: schema,
                path: this.path + '.' + i,
                parent: this
            });
            ret.preRender();
            var holder = $("<div>").appendTo(this.itemContainer);
            ret.setContainer(holder).addClass("array-item");
            ret.render();
            ret.postRender();
            this.getItemButtonPanel(i).appendTo($(".edit-container", holder));
            return ret;
        };
        ArrayEditor.prototype.getItemInfo = function (i) {
            var schema = this.getItemSchema(i);
            var stringified = JSON.stringify(schema);
            this.itemInfo[stringified] = {
                title: schema.title || "item",
                'default': schema.default,
                width: 12,
                childEditors: schema.properties || schema.items
            };
            return this.itemInfo[stringified];
        };
        ArrayEditor.prototype.getItemSchema = function (i) {
            if (_.isArray(this.schema.items)) {
                if (i >= this.schema.items.length) {
                    if (this.schema.additionalItems === true) {
                        return {};
                    }
                    else if (this.schema.additionalItems) {
                        return _.extend({}, this.schema.additionalItems);
                    }
                }
                else {
                    return _.extend({}, this.schema.items[i]);
                }
            }
            else if (this.schema.items) {
                return _.extend({}, this.schema.items);
            }
            else {
                return {};
            }
        };
        ArrayEditor.prototype.getHeader = function () {
            var div = _super.prototype.getHeader.call(this);
            this.getButtonPanel().appendTo(div);
            return div;
        };
        ArrayEditor.prototype.getButtonPanel = function () {
            var _this = this;
            var div = $("<div class='array-buttons'>");
            $("<button type='button' class=''>Add</button>").appendTo(div).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.addNewRow();
                _this.refreshValue();
                _this.fireOnChange(true);
            });
            $("<button type='button' class=''>Delete Last</button>").appendTo(div).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var rows = _this.getValue();
                rows.pop();
                _this.setValue(rows);
                _this.fireOnChange(true);
            });
            $("<button type='button' class=''>Delete All</button>").appendTo(div).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.setValue([]);
                _this.fireOnChange(true);
            });
            return div;
        };
        ArrayEditor.prototype.getItemButtonPanel = function (i) {
            var div = $("<div style='height:100%;display:table;'>");
            var innerDiv = $("<div class='edit-item-buttons' style='display:table-cell;vertical-align:bottom;padding-bottom:1px'>").appendTo(div);
            var cxt = this;
            $("<button type='button' class=''>Delete</button>").appendTo(innerDiv).attr("data-i", i).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var i = parseInt(this.getAttribute('data-i'));
                cxt.deleteRow(i, true);
            });
            $("<button type='button' class=''>Move down</button>").appendTo(innerDiv).attr("data-i", i).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var i = parseInt(this.getAttribute('data-i'));
                var rows = cxt.getValue();
                if (i >= rows.length - 1)
                    return;
                var tmp = rows[i + 1];
                rows[i + 1] = rows[i];
                rows[i] = tmp;
                cxt.setValue(rows);
                cxt.fireOnChange(true);
            });
            $("<button type='button' class=''>Move up</button>").appendTo(innerDiv).attr("data-i", i).on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var i = parseInt(this.getAttribute('data-i'));
                if (i <= 0)
                    return;
                var rows = cxt.getValue();
                var tmp = rows[i - 1];
                rows[i - 1] = rows[i];
                rows[i] = tmp;
                cxt.setValue(rows);
                cxt.fireOnChange(true);
            });
            return div;
        };
        ArrayEditor.prototype.getContainerClass = function () {
            return "array-container";
        };
        ArrayEditor.prototype.getDefault = function () {
            return this.schema.default || [];
        };
        ArrayEditor.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return ArrayEditor;
    })(AbstractComponentContainerEditor);
    return ArrayEditor;
});
