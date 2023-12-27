import IValidate from "./index.js";

export default class ValidateSelect extends IValidate {
    protected static messageText = "empty"
    public static behaviour(value?: any, ...args: any[]): boolean {
        if(typeof value !== 'undefined' && value != null) {
            return value != -1
        }
        return false 
    }
}