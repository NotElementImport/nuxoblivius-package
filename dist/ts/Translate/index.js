import { config } from '../config.js';
export const languageConfig = (value) => {
    Translate.loadConfig(value);
};
export default class Translate {
    static config;
    static listeners = [];
    static current = '';
    static loadConfig(config) {
        if (!('default' in config) || config.default == '')
            throw 'Translate config: default not set';
        else if (!('imports' in config) || Object.keys(config.imports).length == 0)
            throw 'Translate config: imports not set';
        else if (!('supports' in config) || Object.keys(config.supports).length == 0)
            throw 'Translate config: supports not set';
        else if (!('stateManager' in config) || Object.keys(config.stateManager).length == 0)
            throw 'Translate config: stateManager not set';
        globalThis['$tts'] = {
            config: {},
            listeners: [],
            current: ''
        };
        globalThis['$tts'].config = config;
        const instc = new config.stateManager.object();
        const object = instc.getParams(config.stateManager.field.split('.')[1]);
        globalThis['$tts'].current = object.get();
        object.subs.push(() => {
            globalThis['$tts'].current = object.get();
            globalThis['$tts'].listeners.forEach((uni) => {
                uni();
            });
        });
    }
    static _t(name, args) {
        let object = globalThis['$tts'].config.imports;
        let index = -1;
        for (const part of name) {
            index += 1;
            if (index == 1) {
                object = object[globalThis['$tts'].current];
            }
            if (part in object) {
                object = object[part];
            }
            else {
                throw `Translate: In imports not find part ${part}`;
            }
        }
        if (args.length > 0) {
            let text = object;
            let index = 0;
            for (const arg of args) {
                index += 1;
                text = text.replaceAll(`$${index}`, arg);
            }
            return text;
        }
        else {
            return object;
        }
    }
    static t(name, ...args) {
        const text = config.init('');
        const splitName = name.split('.');
        const translate = () => {
            config.set(text, this._t(splitName, args));
        };
        globalThis['$tts'].listeners.push(translate);
        translate();
        return config.get(text);
    }
    static c(name, ...args) {
        const text = config.init('');
        const splitName = name.split('.');
        const _pthis = this;
        let _args = args;
        const toolbox = {
            update() {
                config.set(text, _pthis._t(splitName, _args));
            },
            args(...args) {
                _args = args;
            }
        };
        Object.defineProperty(toolbox, 'value', {
            get() {
                return config.get(text);
            }
        });
        globalThis['$tts'].listeners.push(toolbox.update);
        toolbox.update();
        return toolbox;
    }
}
