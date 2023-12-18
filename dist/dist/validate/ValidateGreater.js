import IValidate from "./index.js";
export default class ValidateGreater extends IValidate {
    static messageText = "greater";
    static behaviour(value, min = 0) {
        if (value) {
            if (typeof value == 'string')
                value = value.length;
            else if (typeof value == 'object')
                value = Object.keys(value).length;
            else if (Array.isArray(value))
                value = value.length;
            if (min >= value) {
                return false;
            }
            return true;
        }
        return false;
    }
}
