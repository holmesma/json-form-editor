/// <reference path="../lib/jquery.d.ts"/>

import Globals = require("Globals");

class Events {

    callbacks: Globals.CallbackMap;
    flags: Globals.FlagMap;

    constructor(flags?: Globals.FlagMap) {
        this.callbacks = {}
        this.flags = flags
    }

    public on(event: string, callback: (evt: any) => void): Events {
        this.addEventCallback(event)
        this.callbacks[event].add(callback)
        return this
    }

    public off(event?: string, callback?: (evt: any) => void): Events {
        if (event && callback && this.callbacks[event]) {
            if (this.callbacks[event]) this.callbacks[event].remove(callback)
        } else if (event) {
            if (this.callbacks[event]) this.callbacks[event].empty()
        } else {
            _.each(this.callbacks, function(c: JQueryCallback, k: string, l: Globals.CallbackMap) {
                c.empty()
            })
        }
        return this
    }

    protected addEventCallback(event: string): void {
        if (!this.callbacks[event]) {
            var flag = (this.flags) ? this.flags[event] : undefined
            this.callbacks[event] = $.Callbacks(flag)
        }
    }

    protected trigger(event: string, context?: any, ...args: any[]): Events {
        if (this.callbacks[event]) {
            this.callbacks[event].fireWith(context, args)
        }
        return this
    }

    protected destroy() {
        _.each(this.callbacks, function(c: JQueryCallback, k: string, l: Globals.CallbackMap) {
            c.empty()
        })
        this.callbacks = undefined
    }
}

export = Events;