import ValidateEmail from "../../../validate/ValidateEmail.js"
import ValidateGreater from "../../../validate/ValidateGreater.js"
import ValidateLess from "../../../validate/ValidateLess.js"
import ValidateRange from "../../../validate/ValidateRange.js"
import ValidateTelephone from "../../../validate/ValidateTelephone.js"
import IValidate from "../../../validate/index.js"
import StateManager, { _instances } from "../StateManager/index.js"
import { IStateApiOne } from "../interfaces.js"
import { ref } from 'vue'

export default class FormModel extends StateManager {
    private _fields: {[key: string]: any} = {}

    protected createForm(description: {[key: string]: any}) {
        if(this._isServer) {
            this._fields = description
        }
        else {
            const context = _instances.get(this.name()) as FormModel
            Object.defineProperty(this, '_fields', {
                get() {
                    return context._fields
                },
            })
        }
    }

    public get formData() {
        const form = new FormData()
        for(const [key, value] of Object.entries(this._fields)) {
            form.append(key, value.value.value)
        }
        return form
    }

    public get form() {
        return this._fields
    } 

    public getValues() {}

    public setValues(data: {[name: string]: any}|IStateApiOne<any>) {
        if('value' in data) {

        }
        else {
            for (const [key, value] of Object.entries(data)) {
                this._fields[key].value.value = value
            }
        }
    }

    public validate(): boolean {
        let result = true
        for (const [key, value] of Object.entries(this._fields)) {
            if(value.validate != null) {
                const argv: any[] = []
                if(value.validate instanceof ValidateRange) {
                    if(value.options.min) argv.push(value.options.min);
                    else argv.push(null);
                    if(value.options.max) argv.push(value.options.max);
                    else argv.push(null);
                }
                else if(value.validate instanceof ValidateGreater) {
                    if(value.options.max) argv.push(value.options.max);
                }
                else if(value.validate instanceof ValidateLess) {
                    if(value.options.min) argv.push(value.options.min);
                }
                if(!value.validate.behaviour(value.value.value, ...argv)) {
                    result = false
                }
            }
        }
        return result
    }

    public localValidate(name: string) {
        const data = this._fields[name]
        if(data.validate != null) {
            const argv: any[] = []
            if(data.validate == ValidateRange) {
                if(data.options.min) argv.push(data.options.min);
                else argv.push(null);
                if(data.options.max) argv.push(data.options.max);
                else argv.push(null);
            }
            else if(data.validate == ValidateGreater) {
                if(data.options.max) argv.push(data.options.max);
            }
            else if(data.validate == ValidateLess) {
                if(data.options.min) argv.push(data.options.min);
            }
            if(data.validate.behaviour(data.value.value, ...argv)) {
                data.options.validateMessage.value = ""
            }
            else {
                data.options.validateMessage.value = data.validate.getMessage(...argv)
            }
        }
    }

    protected get field() {
        return {
            text(title: string, options: {multiline?: boolean, placeholder?: string, maxLength?: number, validate?: IValidate}) {
                const data = {
                    type: 'basic',
                    value: ref(""),
                    title: title,
                    options: { 
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: null as any
                }

                if(options.validate) {
                    data['validate'] = options.validate
                }
                if(options.multiline) {
                    data.type = 'multiline'
                }

                return data
            },
            email(title: string, options: {placeholder?: string}) {
                return {
                    type: 'email',
                    value: ref(""),
                    title: title,
                    options: { 
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: ValidateEmail
                }
            },
            tel(title: string, prefix: string = "+1") {
                return {
                    type: 'tel',
                    value: ref(""),
                    title: title,
                    options: { 
                        prefix: prefix,
                        validateMessage: ref("")
                    },
                    validate: ValidateTelephone
                }
            },
            number(title: string, options: {max?: number, min?: number, validate?: IValidate}) {
                const data = {
                    type: 'number',
                    value: ref(0),
                    title: title,
                    options: { 
                        ...options,
                        validateMessage: ref("")
                    },
                    validate: null as any
                }

                if(options.validate) {
                    data['validate'] = options.validate
                }

                return data
            },
            checkbox(title: string, validate?: IValidate) {
                const data = {
                    type: 'checkbox',
                    value: ref(false),
                    title: title,
                    options: { 
                        validateMessage: ref("")
                    },
                    validate: null as any
                }

                if(validate) {
                    data['validate'] = validate
                }

                return data
            }
        }
    }
}