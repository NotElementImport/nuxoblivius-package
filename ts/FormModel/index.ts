import ValidateEmail from "../../validate/ValidateEmail.js"
import ValidateGreater from "../../validate/ValidateGreater.js"
import ValidateLess from "../../validate/ValidateLess.js"
import ValidateSelect from "../../validate/ValidateSelect.js"
import ValidateRange from "../../validate/ValidateRange.js"
import ValidateTelephone from "../../validate/ValidateTelephone.js"
import IValidate from "../../validate/index.js"
import StateManager, { _instances } from "../StateManager/index.js"
import { IStateApiOne } from "../interfaces.js"
import { Ref, ref } from 'vue'
import Translate from "../Translate/index.js"

export default class FormModel extends StateManager {
    private _fields: {[key: string]: any} = {}
    private _isValidate: Ref<boolean> = ref(false)

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

    public get json() {
        const result = {} as any
        for(const [key, value] of Object.entries(this._fields)) {
            result[key] = value.value.value
        }
        return result
    }

    public get form() {
        return this._fields
    } 

    public get isValidate() {
        return this._isValidate.value
    }

    public getValues() {
        const data: {[name: string]: any} = {}
        for(const [key, value] of Object.entries(this._fields)) {
            data[key] = value.value.value
        }
        return data
    }

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
                if(value.validate == ValidateRange || value.validate instanceof ValidateRange) {
                    if(value.options.min) argv.push(value.options.min);
                    else argv.push(null);
                    if(value.options.max) argv.push(value.options.max);
                    else argv.push(null);
                }
                else if(value.validate == ValidateGreater || value.validate instanceof ValidateGreater) {
                    if(value.options.max) argv.push(value.options.max);
                }
                else if(value.validate == ValidateLess || value.validate instanceof ValidateLess) {
                    if(value.options.min) argv.push(value.options.min);
                }
                if(!value.validate.behaviour(value.value.value, ...argv)) {
                    console.error(`field had error, ${value.title.value}`)
                    value.options.validateMessage.value = value.validate.getMessage(...argv)
                    result = false
                }
            }
        }
        this._isValidate.value = result
        return result
    }

    private silentValidate(): boolean {
        let result = true
        for (const [key, value] of Object.entries(this._fields)) {
            if(value.validate != null) {
                const argv: any[] = []
                if(value.validate == ValidateRange || value.validate instanceof ValidateRange) {
                    if(value.options.min) argv.push(value.options.min);
                    else argv.push(null);
                    if(value.options.max) argv.push(value.options.max);
                    else argv.push(null);
                }
                else if(value.validate == ValidateGreater || value.validate instanceof ValidateGreater) {
                    if(value.options.max) argv.push(value.options.max);
                }
                else if(value.validate == ValidateLess || value.validate instanceof ValidateLess) {
                    if(value.options.min) argv.push(value.options.min);
                }
                if(!value.validate.behaviour(value.value.value, ...argv)) {
                    // console.error(`field had error, ${value.title.value}`)
                    // value.options.validateMessage.value = value.validate.getMessage(...argv)
                    result = false
                    break;
                }
            }
        }
        return result
    }

    public localValidate(name: string) {
        const data = this._fields[name]
        if(data.validate != null) {
            const argv: any[] = []
            // console.log(data.validate == ValidateRange)
            if(data.validate == ValidateRange || data.validate instanceof ValidateRange) {
                if(data.options.min) argv.push(data.options.min);
                else argv.push(null);
                if(data.options.max) argv.push(data.options.max);
                else argv.push(null);
            }
            else if(data.validate == ValidateGreater || data.validate instanceof ValidateGreater) {
                if(data.options.max) argv.push(data.options.max);
            }
            else if(data.validate == ValidateLess || data.validate instanceof ValidateLess) {
                if(data.options.min) argv.push(data.options.min);
            }
            // console.log(argv)
            if(data.validate.behaviour(data.value.value, ...argv)) {
                data.options.validateMessage.value = ""
                if(data.remote) {
                    data.remote.toggle(true)
                }
            }
            else {
                if(data.remote) {
                    data.remote.toggle(false)
                }
                if(data.options.customMessage && data.options.customMessage != null) {
                    if(data.options.customMessage[0] != '.') {
                        data.options.validateMessage.value = data.options.customMessage
                    }
                }
                else {
                    data.options.validateMessage.value = data.validate.getMessage(...argv)
                }
            }
        }

        this._isValidate.value = this.silentValidate()
    }

    protected get field() {
        return {
            text(title: string, options: {multiline?: boolean, placeholder?: string, maxLength?: number, validate?: IValidate, customMessage?: string}) {                
                const data = {
                    type: 'basic',
                    value: ref(""),
                    title: ref(title),
                    options: { 
                        ...options,
                        validateMessage: ref("")
                    },
                    remote: null,
                    validate: null as any
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }

                if(options.validate) {
                    data['validate'] = options.validate
                }
                if(options.multiline) {
                    data.type = 'multiline'
                }

                return data
            },
            email(title: string, options: {placeholder?: string, customMessage?: string}) {
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
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }

                return data
            },
            tel(title: string, prefix: string = "+1", customMessage: string|null = null) {
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
                }

                if(customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }
                
                if(customMessage) {
                    data.options.customMessage = customMessage as any
                }

                data.title = Translate.smartTranslate(title) as any || data.title

                return data
            },
            number(title: string, options: {max?: number, min?: number, validate?: IValidate, customMessage?: string}) {
                const data = {
                    type: 'number',
                    value: ref(0),
                    title: ref(title),
                    options: { 
                        ...options,
                        validateMessage: ref("")
                    },
                    remote: null,
                    validate: null as any
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(options.customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(options.customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }

                if(options.validate) {
                    data['validate'] = options.validate
                }

                return data
            },
            checkbox(title: string, validate?: IValidate, customMessage: string|null = null) {
                const data = {
                    type: 'checkbox',
                    value: ref(false),
                    title: ref(title),
                    options: { 
                        validateMessage: ref(""),
                        customMessage: null
                    },
                    remote: null,
                    validate: null as any
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }

                if(customMessage) {
                    data.options.customMessage = customMessage as any
                }

                if(validate) {
                    data['validate'] = validate
                }

                return data
            },
            select(title: string, content: {name?: string, value?: any, title?: string}[], validate?:IValidate, customMessage: string|null = null) {
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
                    validate: null as any
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }

                if(customMessage) {
                    data.options.customMessage = customMessage as any
                }

                if(validate) {
                    data['validate'] = validate
                }

                return data
            },
            api(title: string, modelItem: string, fields: string[], notEmpty: boolean = false, customMessage: string|null = null) {
                const splitData = modelItem.split('.')
                const model = (StateManager.manager(splitData[0]) as any)[splitData[1]]

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
                    validate: null as any
                }
                data.title = Translate.smartTranslate(title) as any || data.title

                if(customMessage) {
                    data.options.validateMessage = Translate.openSmartTranslate(customMessage, [], (remote) => {
                        data.remote = remote
                    }) || data.options.validateMessage
                }
                
                if(customMessage) {
                    data.options.customMessage = customMessage as any
                }

                if(notEmpty) {
                    data['validate'] = ValidateSelect
                }

                return data
            },
            
        }
    }
}