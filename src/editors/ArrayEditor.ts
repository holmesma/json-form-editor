/// <reference path="../../lib/jquery.d.ts"/>
/// <reference path="../../lib/underscore.d.ts"/>
import Globals = require("Globals");
import AbstractComponentEditor = require("AbstractComponentEditor");
import AbstractComponentContainerEditor = require("AbstractComponentContainerEditor");

class ArrayEditor extends AbstractComponentContainerEditor {

    rows: Array<AbstractComponentEditor>;
    itemInfo: Globals.ItemInfoMap;
    itemContainer: JQuery;
    layout: any;

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
            this.destroyRow(this.rows[j])
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
        if (value.length > 0) {
            if (this.schema.format === 'table') {
                this.layoutTable()
            }
        }
        return this
    }

    layoutTable(): void {
        $(".array-item > .header-container", this.itemContainer).hide()
        $(".edit-container", this.itemContainer).each(function(idx, el) {
            //if (idx % 10 !== 0) {
                if (idx != 0) {
                //$(".header-container", el).hide()
            }
        })
        if (this.layout) {
            this.layout.isotope('destroy')
            this.layout = undefined
        }
        this.layout = $('.edit-container', this.itemContainer).isotope({
            layoutMode: 'fitRows'
        })


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

    addNewRow(value?: any, initial?: any, mergeValue?: boolean) {
        this.addRow(value, initial, mergeValue)
        //this.active_tab = this.rows[i].tab;
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

    deleteRow(i: number, change: boolean) {
        var value = this.value;
        var newval = [];
        _.each(value, (row: any, j: number) => {
            if (j === i) {
            } else {
                newval.push(row)
            }
        })
        this.setValue(newval, false)
        if (change) this.fireOnChange(true)
    }

    destroyRow(row: AbstractComponentEditor, hard?: boolean): void {
        var holder = row.container
        row.destroy()
        holder.remove()
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
        this.getItemButtonPanel(i).appendTo($(".edit-container", holder))
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
        var div = $("<div class='array-buttons'>")
        $("<button type='button' class=''>Add</button>").appendTo(div).on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addNewRow()
            this.refreshValue()
            this.fireOnChange(true)
            this.layoutTable()
        })
        $("<button type='button' class=''>Delete Last</button>").appendTo(div).on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            var rows = this.getValue()
            rows.pop()
            this.setValue(rows)
            this.fireOnChange(true)
        })
        $("<button type='button' class=''>Delete All</button>").appendTo(div).on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.setValue([])
            this.fireOnChange(true)
        })
        return div
    }

    getItemButtonPanel(i: number): JQuery {
        var div = $("<div style='height:100%;display:table;'>")
        var innerDiv = $("<div class='edit-item-buttons' style='display:table-cell;vertical-align:bottom;padding-bottom:1px'>").appendTo(div)
        var cxt = this
        $("<button type='button' class=''>Delete</button>").appendTo(innerDiv).attr("data-i", i).on("click", function(e) {
            e.preventDefault()
            e.stopPropagation()
            var i = parseInt(this.getAttribute('data-i'))
            cxt.deleteRow(i, true)
        })
        $("<button type='button' class=''>Move down</button>").appendTo(innerDiv).attr("data-i", i).on("click", function(e) {
            e.preventDefault()
            e.stopPropagation()
            var i = parseInt(this.getAttribute('data-i'))
            var rows = cxt.getValue()
            if (i >= rows.length - 1) return
            var tmp = rows[i + 1]
            rows[i + 1] = rows[i]
            rows[i] = tmp
            cxt.setValue(rows)
            cxt.fireOnChange(true)
        })
        $("<button type='button' class=''>Move up</button>").appendTo(innerDiv).attr("data-i", i).on("click", function(e) {
            e.preventDefault()
            e.stopPropagation()
            var i = parseInt(this.getAttribute('data-i'))
            if (i <= 0) return
            var rows = cxt.getValue()
            var tmp = rows[i - 1]
            rows[i - 1] = rows[i]
            rows[i] = tmp
            cxt.setValue(rows)
            cxt.fireOnChange(true)
        })
        return div
    }

    getContainerClass(): string {
        return "array-container"
    }

    getDefault(): any {
        return this.schema.default || []
    }

    destroy(): void {
        super.destroy()
    }
}
export = ArrayEditor;