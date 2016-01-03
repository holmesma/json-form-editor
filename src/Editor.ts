/// <reference path="../lib/jquery.d.ts"/>
/// <reference path="../lib/underscore.d.ts"/>
import Globals = require("Globals");
import Defaults = require("Defaults");
import Events = require("Events");
import WatchHelper = require("WatchHelper");
import AbstractComponentEditor = require("AbstractComponentEditor");
import ObjectEditor = require("editors/ObjectEditor");
import StringEditor = require("editors/StringEditor");

class Editor extends Events {

    static defaults: Defaults = Defaults;

    parentContainer: JQuery;
    container: JQuery;
    options: Globals.EditorOptions;
    watchHelper: WatchHelper;
    schema: any;
    root: AbstractComponentEditor;
    ready: boolean;

    constructor(options: Globals.EditorOptions) {
        super({ "editor:ready": "memory" })
        this.watchHelper = new WatchHelper(["preRender", "render", "postRender", "initialise", "change"])
        this.addEventCallback("editor:ready")
        Defaults.editors["object"] = ObjectEditor
        Defaults.editors["string"] = StringEditor
        this.options = options
        this.parentContainer = options.parent
        this.parentContainer.addClass("editor-container")
        this.schema = options.schema
        this.container = $("<div>")
        this.parentContainer.append(this.container)
        this.ready = false
        this.initSchema().done((evt) => {
            this.root = this.createEditor(this.schema, {
                editor: this,
                parent: null,
                schema: this.schema,
                path: "root"
            })
            this.root.preRender()
            this.root.setContainer(this.container)
            this.root.render()
            this.root.postRender()
            if (this.options.startVal) this.root.setValue(this.options.startVal, true)
            this.ready = true
            this.trigger("editor:ready", this, this)
        }).fail((evt) => {
            console.error("Failed to initialize")
        })
    }

    getValue(): any {
        if (!this.ready) throw "Editor not ready yet. Listen for 'ready' event before getting the value"
        return this.root.getValue()
    }

    setValue(value: any): Editor {
        if (!this.ready) throw "Editor not ready yet. Listen for 'ready' event before setting the value"
        this.root.setValue(value, true)
        return this
    }

    onChange(): Editor {
        if (!this.ready) return
        this.trigger("editor:change", this, this)
        return this
    }

    initSchema(): JQueryPromise<any> {
        var deferred = $.Deferred()
        deferred.resolve()
        return deferred.promise()
    }

    createEditor(schema: any, options: Globals.ComponentEditorOptions): AbstractComponentEditor {
        var name = this.resolveEditor(schema)
        var clazz: any = Defaults.editors[name]
        options = _.extend({}, clazz.options || {}, options)
        return new clazz(options)
    }

    resolveEditor(schema: any): string {
        return schema.type
    }

    watch(events: string, path: string, callback: () => void): WatchHelper {
        return this.watchHelper.watch(events, path, callback)
    }

    watchAll(path: string, callback: () => void): WatchHelper {
        return this.watchHelper.watchAll(path, callback)
    }

    unwatch(events: string, path: string, callback?: () => void): WatchHelper {
        return this.watchHelper.unwatch(events, path, callback)
    }

    unwatchAll(path: string, callback?: () => void): WatchHelper {
        return this.watchHelper.unwatchAll(path, callback)
    }

    notifyWatchers(event: string, path: string, evt: any): void {
        this.watchHelper.notifyWatchers(event, path, evt)
    }


}
export = Editor;