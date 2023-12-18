import { config } from '../index';
import { ref } from 'vue';
export default {
    install(app, options) {
        config.reactiveInstance = (value) => ref(value);
        config.reactiveGet = (object) => object.value;
        config.reactiveSet = (object, value) => { object.value = value; };
    }
};
