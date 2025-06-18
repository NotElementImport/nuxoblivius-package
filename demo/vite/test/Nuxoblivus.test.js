"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var nuxoblivius_1 = require("nuxoblivius");
(0, vitest_1.describe)('Nuxoblivus', function () {
    (0, vitest_1.it)('Can created', function () {
        (0, nuxoblivius_1.defineNuxoblivius)();
    });
});
