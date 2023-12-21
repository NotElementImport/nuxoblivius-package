import ValidateEmail from "../../validate/ValidateEmail.js";
import ValidateGreater from "../../validate/ValidateGreater.js";
import ValidateLess from "../../validate/ValidateLess.js";
import ValidateRange from "../../validate/ValidateRange.js";
import ValidateTelephone from "../../validate/ValidateTelephone.js";
import StateManager, { _instances } from "../StateManager/index.js";
import { ref } from 'vue';
export default class FormModel extends StateManager {
    _fields = {};
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
    get form() {
        return this._fields;
    }
    getValues() { }
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
                if (value.validate instanceof ValidateRange) {
                    if (value.options.min)
                        argv.push(value.options.min);
                    else
                        argv.push(null);
                    if (value.options.max)
                        argv.push(value.options.max);
                    else
                        argv.push(null);
                }
                else if (value.validate instanceof ValidateGreater) {
                    if (value.options.max)
                        argv.push(value.options.max);
                }
                else if (value.validate instanceof ValidateLess) {
                    if (value.options.min)
                        argv.push(value.options.min);
                }
                if (!value.validate.behaviour(value.value.value, ...argv)) {
                    result = false;
                }
            }
        }
        return result;
    }
    localValidate(name) {
        const data = this._fields[name];
        if (data.validate != null) {
            const argv = [];
            if (data.validate == ValidateRange) {
                if (data.options.min)
                    argv.push(data.options.min);
                else
                    argv.push(null);
                if (data.options.max)
                    argv.push(data.options.max);
                else
                    argv.push(null);
            }
            else if (data.validate == ValidateGreater) {
                if (data.options.max)
                    argv.push(data.options.max);
            }
            else if (data.validate == ValidateLess) {
                if (data.options.min)
                    argv.push(data.options.min);
            }
            if (data.validate.behaviour(data.value.value, ...argv)) {
                data.options.validateMessage.value = "";
            }
            else {
                data.options.validateMessage.value = data.validate.getMessage(...argv);
            }
        }
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
                    validate: null
                };
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                if (options.multiline) {
                    data.type = 'multiline';
                }
                return data;
            },
            email(title, options) {
                return {
                    type: 'email',
                    value: ref(""),
                    title: ref(title),
                    options: {
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: ValidateEmail
                };
            },
            tel(title, prefix = "+1") {
                return {
                    type: 'tel',
                    value: ref(""),
                    title: ref(""),
                    options: {
                        prefix: prefix,
                        validateMessage: ref("")
                    },
                    validate: ValidateTelephone
                };
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
                    validate: null
                };
                if (options.validate) {
                    data['validate'] = options.validate;
                }
                return data;
            },
            checkbox(title, validate) {
                const data = {
                    type: 'checkbox',
                    value: ref(false),
                    title: ref(title),
                    options: {
                        validateMessage: ref("")
                    },
                    validate: null
                };
                if (validate) {
                    data['validate'] = validate;
                }
                return data;
            },
            // select(title: string, )
        };
    }
}
