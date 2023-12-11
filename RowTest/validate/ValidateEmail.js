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
var ValidateEmail = /** @class */ (function (_super) {
    __extends(ValidateEmail, _super);
    function ValidateEmail() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateEmail.behaviour = function (value) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var regEx = /[\w]{1,}\@[\w]{1,}\.[\w]{1,}/gm;
        if (value) {
            return regEx.test(value);
        }
        return false;
    };
    ValidateEmail.messageText = "email";
    return ValidateEmail;
}(IValidate));
export default ValidateEmail;
