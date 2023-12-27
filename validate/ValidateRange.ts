import IValidate from "./index.js";

export default class ValidateRange extends IValidate {
    protected static messageText = "range"
    public static behaviour(value?: number, min: number|null = null, max: number|null = null): boolean {
        if(value != null && typeof value == 'number') {
            if(min != null && value < min) {
               return false 
            }
            if(max != null && value > max) {
                return false
            }
            return true
        }
        return false
    }
}