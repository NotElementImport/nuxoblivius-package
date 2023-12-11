var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import IValidate from "./index.js";
var ValidateNotEmpty = /** @class */ (function (_super) {
    __extends(ValidateNotEmpty, _super);
    function ValidateNotEmpty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateNotEmpty.behaviour = function (value) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof value !== 'undefined' && value != null) {
            if (typeof value == 'string') {
                return value.trim().length != 0;
            }
            else if (typeof value == 'number') {
                return !Number.isNaN(value);
            }
            else if (typeof value == 'boolean') {
                return value;
            }
            else if (typeof value == 'object') {
                return Object.keys(value).length != 0;
            }
            else if (Array.isArray(value)) {
                return value.length != 0;
            }
            return true;
        }
        return false;
    };
    ValidateNotEmpty.messageText = "empty";
    return ValidateNotEmpty;
}(IValidate));
export default ValidateNotEmpty;
