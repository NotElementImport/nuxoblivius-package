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
var ValidateRange = /** @class */ (function (_super) {
    __extends(ValidateRange, _super);
    function ValidateRange() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidateRange.behaviour = function (value, min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        console.log(min, max);
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
    };
    ValidateRange.messageText = "range";
    return ValidateRange;
}(IValidate));
export default ValidateRange;
