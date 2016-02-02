/// <reference path="../lib/jquery.d.ts"/>
import Util = require("Util")
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
    watchListener: () => void;
    watched: Globals.Watched;
    watchedValues: Globals.Watched;
    headerTemplate: (...data: any[]) => string;
    templateEngineName: string;
    headerText: string;
    header: JQuery;

    constructor(options: Globals.ComponentEditorOptions) {
        this.options = options
        this.parent = options.parent
        this.editor = options.editor
        this.schema = options.schema
        this.path = options.path
        this.key = this.path.split('.').pop()
        this.templateEngineName = "underscore"
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
        this.setupWatchListeners()
        this.setValue(this.getDefault(), true)
        this.notify("postRender")
        this.editor.registerEditor(this)
        this.onWatchedFieldChange()
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
        if (this.watchListener) this.watchListener()
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
        this.container.addClass(this.getContainerClass()).css("padding-left", "20px")
        return container
    }

    getHeader(): JQuery {
        var label = this.schema.title || this.key
        var header = label
        var description = this.schema.description || ""
        var div = $("<div class='header-container'>")
        $("<div class='header-description'>").text(description).appendTo(div)
        this.header = $("<div class='header-label'>").text(label)
        this.header.appendTo(div)
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

    setupWatchListeners() {
        this.watched = { items: {} }
        if (this.schema.vars) this.schema.watch = this.schema.vars
        this.watchedValues = { items: {} };
        this.watchListener = () => {
            if (this.refreshWatchedFieldValues()) {
                this.onWatchedFieldChange()
            }
        }

        if (this.schema.hasOwnProperty('watch')) {
            var pathParts = []
            for (var name in this.schema.watch) {
                if (!this.schema.watch.hasOwnProperty(name)) continue
                var path = this.schema.watch[name]
                if (Array.isArray(path)) {
                    pathParts = [path[0]].concat(path[1].split('.'))
                } else {
                    pathParts = path.split('.')
                    if (!Util.closest(this.container, '[data-schemaid="' + pathParts[0] + '"]')) pathParts.unshift('#')
                }
                var first = pathParts.shift()
                if (first === '#') first = this.editor.schema.id || 'root'
                var root = Util.closest(this.container, '[data-schemaid="' + first + '"]')
                if (!root) throw "Could not find ancestor node with id " + first
                var adjustedPath = root.attr('data-schemapath') + '.' + pathParts.join('.')
                this.editor.watch("*", adjustedPath, this.watchListener)
                this.watched.items[name] = adjustedPath
            }
        }

        // Dynamic header
        if (this.schema.headerTemplate) {
            this.headerTemplate = this.editor.compileTemplate(this.schema.headerTemplate, this.templateEngineName)
        }
    }

    refreshWatchedFieldValues() {
        if (!this.watchedValues.items) return;
        var watched: Globals.Watched = { items: {} };
        var changed = false;
        var self = this;
        if (this.watched.items) {
            for (var name in this.watched.items) {
                if (!this.watched.items.hasOwnProperty(name)) continue
                var editor = this.editor.getEditor(this.watched.items[name])
                var val = (editor) ? editor.getValue() : null
                if (self.watchedValues.items[name] !== val) changed = true
                watched.items[name] = val
            }
        }
        watched.self = this.getValue()
        if (this.watchedValues.self !== watched.self) changed = true
        this.watchedValues = watched
        return changed
    }

    onWatchedFieldChange() {
        var vars:any = {}
        if (this.headerTemplate) {
            var wfv = this.getWatchedFieldValues()
            vars = _.extend({
                key: this.key,
                i: this.key,
                i0: parseInt(this.key),
                i1: parseInt(this.key) + 1,
                title: this.getTitle(),
                self: wfv.self
            },wfv.items)
            var headerText = this.headerTemplate(vars)
            if (headerText !== this.headerText) {
                this.headerText = headerText
                this.updateHeaderText()
                // var we = new EditorWrapper(new JSONEditorWrapper(this.jsoneditor), this)
                //this.notify({ bubble: false, source: we, type: "change", info: this.buildEventInfo(this) });
                //this.fireChangeHeaderEvent();
            }
        }
        //if (this.link_watchers.length) {
        //    vars = this.getWatchedFieldValues();
        //    for (var i = 0; i < this.link_watchers.length; i++) {
        //        this.link_watchers[i](vars);
        //  }
        //}
    }

    getWatchedFieldValues(): Globals.Watched {
        return this.watchedValues
    }

    getTitle(): string {
        return this.schema.title || this.key
    }

    updateHeaderText() {
        if (this.header) {
            this.header.text(this.getHeaderText())
        }
    }

    getHeaderText(title_only?: boolean): string {
        if (this.headerText) return this.headerText
        else if (title_only) return this.schema.title
        else return this.getTitle()
    }

    destroy(): void {
        this.editor.unregisterEditor(this)
        this.container.empty()
    }
}
export = AbstractComponentEditor;