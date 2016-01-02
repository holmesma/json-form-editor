/// <reference path="../lib/jquery.d.ts"/>
/// <reference path="../lib/underscore.d.ts"/>
import Globals = require("Globals");
import Defaults = require("Defaults");
import AbstractComponentEditor = require("AbstractComponentEditor");
import ObjectEditor = require("editors/ObjectEditor");
import StringEditor = require("editors/StringEditor");

class Editor {

    static defaults: Defaults = Defaults;
    
    parentContainer: JQuery;
    container: JQuery;
    options: Globals.EditorOptions;
    schema: any;
    root: AbstractComponentEditor;

    constructor(options: Globals.EditorOptions) {
        Defaults.editors["object"] = ObjectEditor
        Defaults.editors["string"] = StringEditor    
        this.options = options
        this.parentContainer = options.parent
        this.schema = options.schema
        this.container = $("<div>")
        this.parentContainer.append(this.container)
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
            if (this.options.startval) this.root.setValue(this.options.startval, true)
        }).fail((evt) => {
            console.error("Failed to initialize")
        })
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
        return new clazz(options);
    }

    resolveEditor(schema: any): string {
        return schema.type
    }

}
export = Editor;