"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test_utils_1 = require("@vue/test-utils");
// Патч Vue 3 внутреннего $ инстанса
test_utils_1.config.global.mocks = {
    devtoolsRawSetupState: {},
};
