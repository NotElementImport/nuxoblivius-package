import IValidate from "./index.js";
export default class ValidateLess extends IValidate {
    static messageText = "less";
    static behaviour(value, max = 0) {
        if (value) {
            if (typeof value == 'string')
                value = value.length;
            else if (typeof value == 'object')
                value = Object.keys(value).length;
            else if (Array.isArray(value))
                value = value.length;
            if (max <= value) {
                return false;
            }
            return true;
        }
        return false;
    }
}
