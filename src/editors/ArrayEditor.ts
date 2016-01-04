/// <reference path="../../lib/jquery.d.ts"/>
/// <reference path="../../lib/underscore.d.ts"/>
import Globals = require("Globals");
import AbstractComponentEditor = require("AbstractComponentEditor");
import AbstractComponentContainerEditor = require("AbstractComponentContainerEditor");

class ArrayEditor extends AbstractComponentContainerEditor {

    rows: Array<AbstractComponentEditor>;
    itemInfo: Globals.ItemInfoMap;
    itemContainer: JQuery;

    constructor(options: Globals.ComponentEditorOptions) {
        super(options)
        this.itemInfo = {}
        this.rows = []
    }

    setValue(value?: any, initial?: any): AbstractComponentEditor {
        value = value || []
        if (!(_.isArray(value))) value = [value]
        var serialized = JSON.stringify(value)
        // if (serialized === this.serialized) return
        if (this.schema.minItems) {
            while (value.length < this.schema.minItems) {
                value.push(this.getItemInfo(value.length).default)
            }
        }
        if (this.getMax() && value.length > this.getMax()) {
            value = value.slice(0, this.getMax())
        }
        _.each(value, (val, i) => {
            if (this.rows[i]) {
                this.rows[i].setValue(val, initial)
            } else {
                this.addRow(val, initial)
            }
        })
        for (var j = value.length; j < this.rows.length; j++) {
            // self.destroyRow(self.rows[j])
            this.rows[j] = null
        }
        this.rows = this.rows.slice(0, value.length)
        // Set the active tab
        //var new_active_tab = null
        //Utilities.$each(self.rows, function(i, row) {
        //    if (row.tab === self.active_tab) {
        //        new_active_tab = row.tab
        //        return false
        //   }
        //})
        //if (!new_active_tab && self.rows.length) new_active_tab = self.rows[0].tab
        // self.active_tab = new_active_tab
        this.refreshValue(initial)
        //this.refreshTabs(true)
        //this.refreshTabs()
        this.fireOnChange(false, initial)
        return this
    }

    refreshValue(force?: boolean) {
        this.value = []
        _.each(this.rows, (editor, i) => {
            this.value[i] = editor.getValue()
        })
    }

    getMax(): number {
        if ((_.isArray(this.schema.items)) && this.schema.additionalItems === false) {
            return Math.min(this.schema.items.length, this.schema.maxItems || Infinity)
        }
        else {
            return this.schema.maxItems || Infinity
        }
    }

    getValue(): any {
        var result = super.getValue()
        for (var i in result) {
            if (result.hasOwnProperty(i)) {
                if (!result[i]) delete result[i]
            }
        }
        return result
    }

    onChildEditorChange(evt: any): void {
        this.refreshValue();
        //this.refreshTabs(true);
        super.onChildEditorChange(evt)
    }

    render(): void {
        this.itemContainer = $("<div class='item-container'>").appendTo(this.container)
        super.render()
    }

    postRender(): void {
        _.each(this.editors, function(editor, key) {
            editor.postRender()
        });
        super.postRender()
    }

    addRow(value?: any, initial?: any, mergeValue?: boolean) {
        var i = this.rows.length
        this.rows[i] = this.getElementEditor(i)
        if (value) {
            if (mergeValue === true) {
                var dest = this.rows[i].getValue()
                value = _.extend(dest, value)
            }
            this.rows[i].setValue(value, initial)
        } 
        //self.refreshTabs();
    }

    getElementEditor(i: number): AbstractComponentEditor {
        var item_info = this.getItemInfo(i)
        var schema = this.getItemSchema(i)
        //schema = this.jsoneditor.expandRefs(schema)
        schema.title = item_info.title + ' ' + (i + 1)
        var ret = this.editor.createEditor(schema, {
            editor: this.editor,
            schema: schema,
            path: this.path + '.' + i,
            parent: this
        })
        ret.preRender()
        var holder = $("<div>").appendTo(this.itemContainer)
        ret.setContainer(holder).addClass("array-item")
        ret.render()
        ret.postRender()
        this.getItemButtonPanel().appendTo(holder)
        return ret
    }

    getItemInfo(i: number): Globals.ItemInfo {
        var schema = this.getItemSchema(i)
        var stringified = JSON.stringify(schema)
        //schema = this.jsoneditor.expandRefs(schema);
        this.itemInfo[stringified] = {
            title: schema.title || "item",
            'default': schema.default,
            width: 12,
            childEditors: schema.properties || schema.items
        }
        return this.itemInfo[stringified]
    }

    getItemSchema(i: number): any {
        if (_.isArray(this.schema.items)) {
            if (i >= this.schema.items.length) {
                if (this.schema.additionalItems === true) {
                    return {}
                } else if (this.schema.additionalItems) {
                    return _.extend({}, this.schema.additionalItems)
                }
            } else {
                return _.extend({}, this.schema.items[i])
            }
        }
        else if (this.schema.items) {
            return _.extend({}, this.schema.items)
        } else {
            return {}
        }
    }

    getHeader(): JQuery {
        var div = super.getHeader()
        this.getButtonPanel().appendTo(div)
        return div
    }
    
    getButtonPanel(): JQuery {
        var div = $("<div class='button-container'>")
        $("<button type='button' class=''>Add</button>").appendTo(div)
        $("<button type='button' class=''>Delete Last</button>").appendTo(div)
        $("<button type='button' class=''>Delete All</button>").appendTo(div)
        return div
    }
    
    getItemButtonPanel(): JQuery {
        var div = $("<div style='float:left' class='item-button-container'>")
        $("<button type='button' class='' data-i='0'>Delete</button>").appendTo(div)
        $("<button type='button' class=''>Move down</button>").appendTo(div)
        $("<button type='button' class=''>Move up</button>").appendTo(div)
        return div
    }

    getContainerClass(): string {
        return "array-container"
    }

    destroy(): void {
        super.destroy()
    }
}
export = ArrayEditor;