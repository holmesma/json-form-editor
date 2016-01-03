/// <reference path="../lib/jquery.d.ts"/>

import Globals = require("Globals");
import Editor = require("Editor")

class AbstractComponentEditor {

    parent: AbstractComponentEditor;
    options: Globals.ComponentEditorOptions;
    editor: Editor;
    schema: any;
    path: string;
    key: string;
    container: JQuery;
    value: any;

    constructor(options: Globals.ComponentEditorOptions) {
        this.options = options
        this.parent = options.parent
        this.editor = options.editor
        this.schema = options.schema
        this.path = options.path
        this.key = this.path.split('.').pop()
    }

    refreshValue(): void { }

    preRender(): void {
        this.notify("preRender")
    }

    render(): void {

        var label = this.schema.title || this.key
        var header = label
        var description = this.schema.description || ""

        $("<div class='content-description'>").text(description).prependTo(this.container)
        $("<div class='content-label'>").text(label).prependTo(this.container)
        $("<div class='content-header'>").text(header).prependTo(this.container)
        this.notify("render")
    }

    postRender(): void {
        this.notify("postRender")
    }

    setValue(value: any, initial: boolean): AbstractComponentEditor {
        this.value = value
        return this
    }

    hasValueChanged(value: any): boolean {
        return this.value === value
    }

    getValue(): any {
        return this.value
    }

    change(evt: any) {
        if (this.parent) this.parent.onChildEditorChange(evt)
        else this.editor.onChange()
    }

    onChildEditorChange(evt: any) {
        this.onChange(evt)
    }

    fireOnChange(bubble: boolean, initial?: boolean) {
        var info = this.buildEventInfo(this)
        this.onChange({ bubble: bubble, source: this, type: (initial) ? "initial" : "change", info: info })
    }

    private buildEventInfo(editor: AbstractComponentEditor): Globals.EditorChangeEventInfo {
        var isArrayItem = false
        var p: any = editor.parent
        if (p && p.rows) isArrayItem = true
        return { key: editor.key, path: editor.path, isArrayItem: isArrayItem }
    }

    private onChange(evt: Globals.EditorChangeEvent) {
        var type = (evt.type === "change") ? "change" : "initialise"
        this.notify(type, evt)
        //if (this.watch_listener) this.watch_listener()
        if (evt.bubble) this.change(evt)
    }

    notify(events: string, evt?: any) {
        this.editor.notifyWatchers(events, this.path, evt)
    }

    setContainer(container: JQuery) {
        this.container = container
        if (this.schema.id) this.container.attr('data-schemaid', this.schema.id)
        this.container.attr('data-schematype', this.schema.type)
        this.container.attr('data-schemapath', this.path)
        this.container.addClass(this.getContainerClass())
    }

    getContainerClass(): string {
        return "content-container"
    }
    
    destroy(): void {
        this.container.empty()
    }
}
export = AbstractComponentEditor;