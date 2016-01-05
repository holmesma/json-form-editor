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
        this.getHeader().prependTo(this.container)
        this.notify("render")
    }

    postRender(): void {
        this.setValue(this.getDefault(), true)
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

    setContainer(container: JQuery): JQuery {
        this.container = container
        if (this.schema.id) this.container.attr('data-schemaid', this.schema.id)
        this.container.attr('data-schematype', this.schema.type)
        this.container.attr('data-schemapath', this.path)
        this.container.addClass(this.getContainerClass())
        return container
    }

    getHeader(): JQuery {
        var label = this.schema.title || this.key
        var header = label
        var description = this.schema.description || ""
        var div = $("<div class='header-container'>")
        $("<div class='header-description'>").text(description).appendTo(div)
        $("<div class='header-label'>").text(label).appendTo(div)
        return div
    }

    getContainerClass(): string {
        return "edit-item"
    }

    getDefault(): any {
        if (this.schema.hasOwnProperty("default")) return this.schema.default
        if (this.schema.enum) return this.schema.enum[0]
        var type = this.schema.type || this.schema.oneOf
        if (type && Array.isArray(type)) type = type[0]
        if (type && typeof type === "object") type = type.type
        if (type && Array.isArray(type)) type = type[0]
            if (type === "number") return 0.0
            if (type === "boolean") return false
            if (type === "integer") return 0
            if (type === "string") return ""
            if (type === "object") return {}
            if (type === "array") return []
        return null;
    }

    destroy(): void {
        this.container.empty()
    }
}
export = AbstractComponentEditor;