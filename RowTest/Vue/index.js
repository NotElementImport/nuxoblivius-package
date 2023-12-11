import { config } from '../index';
import { ref } from 'vue';
export default {
    install: function (app, options) {
        config.reactiveInstance = function (value) { return ref(value); };
        config.reactiveGet = function (object) { return object.value; };
        config.reactiveSet = function (object, value) { object.value = value; };
    }
};
