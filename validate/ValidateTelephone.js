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
var ValidateTelephone = /** @class */ (function (_super) {
    __extends(ValidateTelephone, _super);
    function ValidateTelephone() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateTelephone.behaviour = function (value) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var regEx = /\([0-9]*?\)\s?[0-9]{3}[\-\s][0-9]{2}[\s\-][0-9]{2}/gm;
        if (value) {
            return regEx.test(value);
        }
        return false;
    };
    ValidateTelephone.messageText = "tel";
    return ValidateTelephone;
}(IValidate));
export default ValidateTelephone;
