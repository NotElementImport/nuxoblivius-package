var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import ValidateMessage from "./ValidateMessages.js";
var IValidate = /** @class */ (function () {
    function IValidate() {
    }
    IValidate.getMessageText = function () { return "email"; };
    IValidate.getMessage = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        return ValidateMessage.message.apply(ValidateMessage, __spreadArray([this.messageText], fields, false));
    };
    IValidate.behaviour = function (value) {
        if (value === void 0) { value = null; }
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return true;
    };
    IValidate.messageText = "email";
    return IValidate;
}());
export default IValidate;
