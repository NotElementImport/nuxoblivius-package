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
var ValidateGreater = /** @class */ (function (_super) {
    __extends(ValidateGreater, _super);
    function ValidateGreater() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateGreater.behaviour = function (value, min) {
        if (min === void 0) { min = 0; }
        if (value) {
            if (typeof value == 'string')
                value = value.length;
            else if (typeof value == 'object')
                value = Object.keys(value).length;
            else if (Array.isArray(value))
                value = value.length;
            if (min >= value) {
                return false;
            }
            return true;
        }
        return false;
    };
    ValidateGreater.messageText = "greater";
    return ValidateGreater;
}(IValidate));
export default ValidateGreater;
