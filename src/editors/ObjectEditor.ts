/// <reference path="../../lib/jquery.d.ts"/>
/// <reference path="../../lib/underscore.d.ts"/>
import Globals = require("Globals");
import AbstractComponentEditor = require("AbstractComponentEditor");
import AbstractComponentContainerEditor = require("AbstractComponentContainerEditor");

class ObjectEditor extends AbstractComponentContainerEditor {

    editors: Globals.Editors;

    constructor(options: Globals.ComponentEditorOptions) {
        super(options)
    }

    setValue(value: any, init: boolean): AbstractComponentEditor {
        _.each(this.editors, function(editor, key) {
            editor.setValue(value[key], init)
        })
        this.refreshValue()
        this.fireOnChange(false, init)
        return this
    }

    getValue(): any {
        var result = super.getValue()
        for (var i in result) {
            if (result.hasOwnProperty(i)) {
                if (_.isUndefined(result[i])) delete result[i]
            }
        }
        return result
    }

    onChildEditorChange(evt: any): void {
        this.refreshValue()
        super.onChildEditorChange(evt)
    }

    refreshValue(): void {
        this.value = {}
        _.each(this.editors, (editor, key) => {
            this.value[key] = this.editors[key].getValue()
        })
    }

    preRender(): void {
        _.each(this.schema.properties, (idx: number, name: string) => {
            var schema = this.schema.properties[name]
            this.editors[name] = this.editor.createEditor(schema, {
                editor: this.editor,
                schema: schema,
                path: this.path + '.' + name,
                parent: this
            })
            this.editors[name].preRender()
        })
        super.preRender()
    }

    render(): void {
        var itemHolder = $("<div class='edit-container'>").appendTo(this.container)
        _.each(this.editors, (editor, key) => {
            var holder = $("<div>").appendTo(itemHolder)
            editor.setContainer(holder)
            editor.render()
        });
        super.render()
    }

    postRender(): void {
        _.each(this.editors, function(editor, key) {
            editor.postRender()
        });
        super.postRender()
    }

    getContainerClass(): string {
        return "object-container"
    }

    getDefault(): any {
        return _.extend({}, this.schema.default || {})
    }

    destroy(): void {
        super.destroy()
    }
}
export = ObjectEditor;