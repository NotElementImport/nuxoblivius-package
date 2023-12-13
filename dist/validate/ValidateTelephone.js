import IValidate from "./index.js";
export default class ValidateTelephone extends IValidate {
    static messageText = "tel";
    static behaviour(value, ...args) {
        let regEx = /\([0-9]*?\)\s?[0-9]{3}[\-\s][0-9]{2}[\s\-][0-9]{2}/gm;
        if (value) {
            return regEx.test(value);
        }
        return false;
    }
}
