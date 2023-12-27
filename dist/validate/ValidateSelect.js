import IValidate from "./index.js";
export default class ValidateSelect extends IValidate {
    static messageText = "empty";
    static behaviour(value, ...args) {
        if (typeof value !== 'undefined' && value != null) {
            return value != -1;
        }
        return false;
    }
}
