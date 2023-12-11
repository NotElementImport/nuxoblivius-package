import IValidate from "./index.js";

export default class ValidateEmail extends IValidate {
    protected static messageText = "email"
    public static behaviour(value?: string, ...args: any[]): boolean {
        let regEx = /[\w]{1,}\@[\w]{1,}\.[\w]{1,}/gm
        if(value) {
            return regEx.test(value)
        }
        return false
    }
}