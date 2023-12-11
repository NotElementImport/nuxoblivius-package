import IValidate from "./index.js";

export default class ValidateTelephone extends IValidate {
    protected static messageText = "tel"
    public static behaviour(value?: string, ...args: any[]): boolean {
        let regEx = /\([0-9]*?\)\s?[0-9]{3}[\-\s][0-9]{2}[\s\-][0-9]{2}/gm
        if(value) {
            return regEx.test(value)
        }
        return false
    }
}