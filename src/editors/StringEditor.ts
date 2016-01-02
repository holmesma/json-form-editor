/// <reference path="../../lib/jquery.d.ts"/>
/// <reference path="../../lib/underscore.d.ts"/>
import Globals = require("Globals");
import AbstractComponentEditor = require("AbstractComponentEditor");

class StringEditor extends AbstractComponentEditor {

    input: JQuery;

    constructor(options: Globals.ComponentEditorOptions) {
        super(options)
    }

    setValue(value: any, init: boolean): AbstractComponentEditor {
        super.setValue(value, init)
        this.input.val(value)
        return this
    }

    render(): void {
        this.input = $("<input type='text'></input>").appendTo(this.container)
        this.input.change(() => {

        })
    }

    destroy(): void {
        super.destroy()
    }
}
export = StringEditor;