import { IState, IStateApi, IStateApiMany, IStateApiOne, IStateApiPagiMany } from "./ts/interfaces";

declare class IStateManager<K extends IStateManager> {
    protected static globalName: string
    constructor(name: string)
    protected _isServer: boolean
    public getParams(name: string): {[name: string] : any}
    protected manage(): void
    protected name(): void
    public static set(variable: keyof K, value: any): void
    public static ref(variable: string): string
    public static get(ariable: keyof K): string
    public static manager<T extends IStateManager>(name: string): T
}

interface IFormField {
    text(title: string, options: {multiline?: boolean, placeholder?: string, maxLength?: number, validate?: IValidate}): object
    email(title: string, options: {placeholder?: string}): object
    tel(title: string, prefix?: string): object
    number(title: string, options: {max?: number, min?: number, validate?: IValidate}): object
    checkbox(title: string, validate?: IValidate): object
}

declare class IFormModel extends IStateManager {
    protected createForm(description: {[key: string]: any}): void
    public get formData(): FormData
    public get form(): {[name: string]: {[key: string]: any}}
    public setValues(data: {[name: string]: any}|IStateApiOne<any>): void
    public setValues(data: {[name: string]: any}|IStateApiOne<any>): void
    public validate(): boolean
    public localValidate(name: string): void
    protected get field(): IFormField
}

declare export const state: <T>(value: []|{}|T) => IState<T>
declare export default m as typeof IStateManager
declare export const FormModel: typeof IFormModel 

declare export const setCustomCookie: (func: Function) => void
declare export const setCustomRouter: (func: Function) => void
declare export const setCustomFetch: (func: Function) => void