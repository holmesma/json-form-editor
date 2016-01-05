/// <reference path="../../lib/jquery.d.ts"/>
/// <reference path="../../lib/underscore.d.ts"/>
import Globals = require("Globals");
import AbstractComponentEditor = require("AbstractComponentEditor");

class StringEditor extends AbstractComponentEditor {

    input: JQuery;

    constructor(options: Globals.ComponentEditorOptions) {
        super(options)
    }

    setValue(value: any, initial: boolean): AbstractComponentEditor {
        if (_.isUndefined(value)) value = ""
        var changed = this.hasValueChanged(value)
        super.setValue(value, initial)
        this.input.val(value)
        this.fireOnChange(changed, initial)
        return this
    }

    render(): void {
        this.input = $("<input type='text'></input>").appendTo(this.container)
        this.input.change(() => {
            this.value = this.input.val()
            this.fireOnChange(true)
        })
        super.render()
    }

    destroy(): void {
        super.destroy()
    }
}
export = StringEditor;