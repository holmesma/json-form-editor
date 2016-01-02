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
        super.setValue(value, init)
        _.each(this.editors, function(editor, key) {
            editor.setValue(value[key], init)
        })
        return this
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
        _.each(this.editors, (editor, key) => {
            var holder = $("<div>").appendTo(this.container)
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

    destroy(): void {
        super.destroy()
    }
}
export = ObjectEditor;