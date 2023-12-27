import { ILanguageConfig } from '../../translate/index.js'
import { config } from '../config.js';

export const languageConfig = (value: ILanguageConfig) => {
    (Translate as any).loadConfig(value)
}

export default class Translate {
    private static config: ILanguageConfig;
    private static listeners: Function[] = []
    private static current: string = ''

    private static loadConfig(config: ILanguageConfig) {
        if(!('default' in config) || config.default == '') throw 'Translate config: default not set'
        else if(!('imports' in config) || Object.keys(config.imports).length == 0) throw 'Translate config: imports not set'
        else if(!('supports' in config) || Object.keys(config.supports).length == 0) throw 'Translate config: supports not set'
        else if(!('stateManager' in config) || Object.keys(config.stateManager).length == 0) throw 'Translate config: stateManager not set';
        (globalThis as any)['$tts'] = {
            config: {},
            listeners: [],
            current: ''
        };

        (globalThis as any)['$tts'].config = config

        const instc = new (config.stateManager.object as any)()
        const object = instc.getParams(config.stateManager.field.split('.')[1]);
        (globalThis as any)['$tts'].current = object.get()
        object.subs.push(async () => {
            (globalThis as any)['$tts'].current = object.get();
            (globalThis as any)['$tts'].listeners.forEach((uni: Function) => {
                uni()
            })
        })
    }

    private static _t(name: string[], args: any[]) {
        let object = (globalThis as any)['$tts'].config.imports as any
        let index = -1
        for (const part of name) {
            index += 1
            if(index == 1) {
                object = object[(globalThis as any)['$tts'].current]
            }
            if(part in object) {
                object = object[part]
            }
            else return ''
        }
        if(args.length > 0) {
            let text = object as string
            let index = 0
            for (const arg of args) {
                index += 1
                text = text.replaceAll(`$${index}`, arg)
            }
            return text
        }
        else {
            return object
        }
    }

    public static t(name: string, ...args: any[]): string {
        const text = config.init('')

        const splitName = name.split('.')
        const translate = () => {
            config.set(text, this._t(splitName, args))
        }
        (globalThis as any)['$tts'].listeners.push(translate as never)
        translate()

        return config.get(text)
    }

    public static c(name: string, ...args: any[]): {update: ()=>void, value: string} {
        const text = config.init('')

        const splitName = name.split('.')
        const _pthis = this

        let _args = args

        const toolbox = {
            update() {
                config.set(text, _pthis._t(splitName, _args))
            },
            args(...args: any[]) {
                _args = args
            }
        }

        Object.defineProperty(toolbox, 'value', {
            get() {
                return config.get(text)
            }
        });

        (globalThis as any)['$tts'].listeners.push(toolbox.update as never)
        toolbox.update()

        return toolbox as any
    }
}
