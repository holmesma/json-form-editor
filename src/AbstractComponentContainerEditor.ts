/// <reference path="../lib/jquery.d.ts"/>
/// <reference path="../lib/underscore.d.ts"/>
import Globals = require("Globals")
import AbstractComponentEditor = require("AbstractComponentEditor")

class AbstractComponentContainerEditor extends AbstractComponentEditor {

    editors: Globals.Editors;

    constructor(options: Globals.ComponentEditorOptions) {
        super(options)
        this.editors = {}

    }

    destroy(): void {
        _.each(this.editors, function(editor, idx) {
            editor.destroy()
        })
    }
}
export = AbstractComponentContainerEditor;