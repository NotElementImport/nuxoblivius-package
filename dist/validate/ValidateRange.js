import IValidate from "./index.js";
export default class ValidateRange extends IValidate {
    static messageText = "range";
    static behaviour(value, min = null, max = null) {
        if (value != null && typeof value == 'number') {
            if (min != null && value < min) {
                return false;
            }
            if (max != null && value > max) {
                return false;
            }
            return true;
        }
        return false;
    }
}
