import ValidateEmail from "../../validate/ValidateEmail.js";
import ValidateGreater from "../../validate/ValidateGreater.js";
import ValidateLess from "../../validate/ValidateLess.js";
import ValidateSelect from "../../validate/ValidateSelect.js";
import ValidateRange from "../../validate/ValidateRange.js";
import ValidateTelephone from "../../validate/ValidateTelephone.js";
import StateManager, { _instances } from "../StateManager/index.js";
import { ref } from 'vue';
import Translate from "../Translate/index.js";
export default class FormModel extends StateManager {
    _fields = {};
    _isValidate = ref(false);
    createForm(description) {
        if (this._isServer) {
            this._fields = description;
        }
        else {
            const context = _instances.get(this.name());
            Object.defineProperty(this, '_fields', {
                get() {
                    return context._fields;
                },
            });
        }
    }
    get formData() {
        const form = new FormData();
        for (const [key, value] of Object.entries(this._fields)) {
            form.append(key, value.value.value);
        }
        return form;
    }
    get json() {
        const result = {};
        for (const [key, value] of Object.entries(this._fields)) {
            result[key] = value.value.value;
        }
        return result;
    }
    get form() {
        return this._fields;
    }
    get isValidate() {
        return this._isValidate.value;
    }
    getValues() {
        const data = {};
        for (const [key, value] of Object.entries(this._fields)) {
            data[key] = value.value.value;
        }
        return data;
    }
    setValues(data) {
        if ('value' in data) {
        }
        else {
            for (const [key, value] of Object.entries(data)) {
                this._fields[key].value.value = value;
            }
        }
    }
    validate() {
        let result = true;
        for (const [key, value] of Object.entries(this._fields)) {
            if (value.validate != null) {
                const argv = [];
                if (value.validate == ValidateRange || value.validate instanceof ValidateRange) {
                    if (value.options.min)
                        argv.push(value.options.min);
                    else
                        argv.push(null);
                    if (value.options.max)
                        argv.push(value.options.max);
                    else
                        argv.push(null);
                }
                else if (value.validate == ValidateGreater || value.validate instanceof ValidateGreater) {
                    if (value.options.max)
                        argv.push(value.options.max);
                }
                else if (value.validate == ValidateLess || value.validate instanceof ValidateLess) {
                    if (value.options.min)
                        argv.push(value.options.min);
                }
                if (!value.validate.behaviour(value.value.value, ...argv)) {
                    //console.error(`field had error, ${value.title.value}`)
                    value.options.validateMessage.value = value.validate.getMessage(...argv);
                    result = false;
                }
            }
        }
        this._isValidate.value = result;
        return result;
    }
    silentValidate() {
        let result = true;
        for (const [key, value] of Object.entries(this._fields)) {
            if (value.validate != null) {
                const argv = [];
                if (value.validate == ValidateRange || value.validate instanceof ValidateRange) {
                    if (value.options.min)
                        argv.push(value.options.min);
                    else
                        argv.push(null);
                    if (value.options.max)
                        argv.push(value.options.max);
                    else
                        argv.push(null);
                }
                else if (value.validate == ValidateGreater || value.validate instanceof ValidateGreater) {
                    if (value.options.max)
                        argv.push(value.options.max);
                }
                else if (value.validate == ValidateLess || value.validate instanceof ValidateLess) {
                    if (value.options.min)
                        argv.push(value.options.min);
                }
                if (!value.validate.behaviour(value.value.value, ...argv)) {
                    // console.error(`field had error, ${value.title.value}`)
                    // value.options.validateMessage.value = value.validate.getMessage(...argv)
                    result = false;
                    break;
                }
            }
        }
        return result;
    }
    localValidate(name) {
        const data = this._fields[name];
        if (data.validate != null) {
            const argv = [];
            // console.log(data.validate == ValidateRange)
            if (data.validate == ValidateRange || data.validate instanceof ValidateRange) {
                if (data.options.min)
                    argv.push(data.options.min);
                else
                    argv.push(null);
                if (data.options.max)
                    argv.push(data.options.max);
                else
                    argv.push(null);
            }
            else if (data.validate == ValidateGreater || data.validate instanceof ValidateGreater) {
                if (data.options.max)
                    argv.push(data.options.max);
            }
            else if (data.validate == ValidateLess || data.validate instanceof ValidateLess) {
                if (data.options.min)
                    argv.push(data.options.min);
            }
            // console.log(argv)
            if (data.validate.behaviour(data.value.value, ...argv)) {
                data.options.validateMessage.value = "";
                if (data.remote) {
                    data.remote.toggle(true);
                }
            }
            else {
                if (data.remote) {
                    data.remote.toggle(false);
                }
                if (data.options.customMessage && data.options.customMessage != null) {
                    if (data.options.customMessage[0] != '.') {
                        data.options.validateMessage.value = data.options.customMessage;
                    }
                }
                else {
                    data.options.validateMessage.value = data.validate.getMessage(...argv);
                }
            }
        }
        this._isValidate.value = this.silentValidate();
    }
    get field() {
        return {
            text(title, options) {
                const data = {
                    type: 'basic',
                    value: ref(""),
                    title: ref(title),
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    remote: null,
                    validate: null
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                if (options.multiline) {
                    data.type = 'multiline';
                }
                return data;
            },
            email(title, options) {
                const data = {
                    type: 'email',
                    value: ref(""),
                    title: ref(title),
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    remote: null,
                    validate: ValidateEmail
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                return data;
            },
            tel(title, prefix = "+1", customMessage = null) {
                const data = {
                    type: 'tel',
                    value: ref(""),
                    title: ref(title),
                    options: {
                        prefix: prefix,
                        validateMessage: ref(""),
                        customMessage: null
                    },
                    remote: null,
                    validate: ValidateTelephone
                };
                if (customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (customMessage) {
                    data.options.customMessage = customMessage;
                }
                data.title = Translate.smartTranslate(title) || data.title;
                return data;
            },
            number(title, options) {
                const data = {
                    type: 'number',
                    value: ref(0),
                    title: ref(title),
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    remote: null,
                    validate: null
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                return data;
            },
            checkbox(title, validate, customMessage = null) {
                const data = {
                    type: 'checkbox',
                    value: ref(false),
                    title: ref(title),
                    options: {
                        validateMessage: ref(""),
                        customMessage: null
                    },
                    remote: null,
                    validate: null
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (customMessage) {
                    data.options.customMessage = customMessage;
                }
                if (validate) {
                    data['validate'] = validate;
                }
                return data;
            },
            select(title, content, validate, customMessage = null) {
                const data = {
                    type: 'select',
                    content: ref(content),
                    value: ref(0),
                    title: ref(title),
                    options: {
                        validateMessage: ref(""),
                        customMessage: null
                    },
                    remote: null,
                    validate: null
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (customMessage) {
                    data.options.customMessage = customMessage;
                }
                if (validate) {
                    data['validate'] = validate;
                }
                return data;
            },
            api(title, modelItem, fields, notEmpty = false, customMessage = null) {
                const splitData = modelItem.split('.');
                const model = StateManager.manager(splitData[0])[splitData[1]];
                const data = {
                    type: 'api',
                    content: ref(model),
                    fields: fields,
                    value: ref(-1),
                    title: ref(title),
                    options: {
                        validateMessage: ref(""),
                        customMessage: null
                    },
                    remote: null,
                    validate: null
                };
                data.title = Translate.smartTranslate(title) || data.title;
                if (customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote;
                    }) || data.options.validateMessage;
                }
                if (customMessage) {
                    data.options.customMessage = customMessage;
                }
                if (notEmpty) {
                    data['validate'] = ValidateSelect;
                }
                return data;
            },
        };
    }
}
