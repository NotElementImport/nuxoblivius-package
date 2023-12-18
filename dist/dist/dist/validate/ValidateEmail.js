import IValidate from "./index.js";
export default class ValidateEmail extends IValidate {
    static messageText = "email";
    static behaviour(value, ...args) {
        let regEx = /[\w]{1,}\@[\w]{1,}\.[\w]{1,}/gm;
        if (value) {
            return regEx.test(value);
        }
        return false;
    }
}
