import Editor = require("Editor")
import AbstractComponentEditor = require("AbstractComponentEditor")

export interface CallbackMap {
    [key: string]: JQueryCallback;
}

export interface FlagMap {
    [key: string]: string;
}

export interface EditorChangeEvent {
    bubble: boolean;
    source: AbstractComponentEditor;
    type: string;
    info: EditorChangeEventInfo;
}

export interface EditorChangeEventInfo {
    key: string;
    path: string;
    isArrayItem: boolean;
}

export interface WatchList {
    [key: string]: Array<(evt: any) => void>;
}

export interface EditorOptions {
    parent: JQuery;
    schema?: any;
    startVal?: any;
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

export interface ItemInfoMap {
  [key: string]: ItemInfo;
}

export interface ItemInfo {
    title: string;
    'default': string;// guessed
    width: number;
    childEditors: Array<string>; // guessed
}

