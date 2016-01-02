/// <reference path="../lib/jquery.d.ts"/>

import Globals = require("Globals");
import Editor = require("Editor")

class AbstractComponentEditor {

    parent: AbstractComponentEditor;
    options: Globals.ComponentEditorOptions;
    editor: Editor;
    schema: any;
    path: string;
    container: JQuery;
    value: any;

    constructor(options: Globals.ComponentEditorOptions) {
        this.options = options
        this.parent = options.parent
        this.editor = options.editor
        this.schema = options.schema
        this.path = options.path
    }

    setValue(value: any, init: boolean): AbstractComponentEditor {
        this.value = value
        return this
    }

    getValue(): any {
        return this.value
    }
    
    preRender(): void {

    }

    render(): void {

    }

    postRender(): void {

    }

    setContainer(container: JQuery) {
        this.container = container;
        if (this.schema.id) this.container.attr('data-schemaid', this.schema.id);
        this.container.attr('data-schematype', this.schema.type)
        this.container.attr('data-schemapath', this.path)
    }

    destroy(): void {
        this.container.empty()
    }
}
export = AbstractComponentEditor;