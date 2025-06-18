"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="vitest" />
var vite_1 = require("vite");
var plugin_vue_1 = require("@vitejs/plugin-vue");
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts'
    },
    plugins: [(0, plugin_vue_1.default)()],
});
