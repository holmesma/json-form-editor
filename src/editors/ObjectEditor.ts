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
            editor.setValue(value, init)
        });
        return this
    }

    preRender(): void {
        _.each(this.schema.properties, (idx: number, name: string) => {
            var schema = this.schema.properties[name]
            this.editors[name] = this.editor.createEditor(this.schema, {
                editor: this.editor,
                schema: schema,
                path: this.path + '.' + name,
                parent: this
            })
            this.editors[name].preRender()
        })
    }

    render(): void {
        _.each(this.editors, (editor, key) => {
            var holder = $("<div>").appendTo(this.container)
            editor.setContainer(holder)
            editor.render()
        });
    }

    postRender(): void {
        _.each(this.editors, function(editor, key) {
            editor.postRender()
        });
    }

    destroy(): void {
        super.destroy()
    }
}
export = ObjectEditor;