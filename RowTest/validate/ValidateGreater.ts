import IValidate from "./index.js";

export default class ValidateGreater extends IValidate {
    protected static messageText = "greater"
    public static behaviour(value?: any, min: number = 0): boolean {
        if(value) {
            if(typeof value == 'string') value = value.length
            else if(typeof value == 'object') value = Object.keys(value).length
            else if(Array.isArray(value)) value = value.length

            if(min >= value) {
                return false
            }
            return true
        }
        return false
    }
}