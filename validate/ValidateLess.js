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
var ValidateLess = /** @class */ (function (_super) {
    __extends(ValidateLess, _super);
    function ValidateLess() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateLess.behaviour = function (value, max) {
        if (max === void 0) { max = 0; }
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
    };
    ValidateLess.messageText = "less";
    return ValidateLess;
}(IValidate));
export default ValidateLess;
