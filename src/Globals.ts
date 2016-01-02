import Editor = require("Editor")
import AbstractComponentEditor = require("AbstractComponentEditor")

export interface EditorOptions {
    parent: JQuery;
    schema?: any;
    startval?: any;
}

export interface ComponentEditorOptions {
    editor: Editor;
    parent: AbstractComponentEditor;
    schema: any;
    path?: string;
}

export interface Editors {
    [key: string]: AbstractComponentEditor;
}

export interface EditorFactory {
    [key: string]: { new (options: ComponentEditorOptions): AbstractComponentEditor; };
}


