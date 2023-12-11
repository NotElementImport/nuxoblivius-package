import IValidate from "./index.js";

export default class ValidateNotEmpty extends IValidate {
    protected static messageText = "empty"
    public static behaviour(value?: any, ...args: any[]): boolean {
        if(typeof value !== 'undefined' && value != null) {
            if(typeof value == 'string') {
                return value.trim().length != 0
            }
            else if(typeof value == 'number') {
                return !Number.isNaN(value)
            }
            else if(typeof value == 'boolean') {
                return value
            }
            else if(typeof value == 'object') {
                return Object.keys(value).length != 0
            }
            else if(Array.isArray(value)) {
                return value.length != 0
            }
            return true
        }
        return false 
    }
}