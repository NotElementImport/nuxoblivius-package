import { instruction, karg_exist, urlParamDecode } from './utillits.js';
export const preProcces = (url, options) => {
    return instruction(1, [url, options]);
};
export const renderProcces = (object, name, logic) => {
    const instructions = logic._inst;
    const _root = {
        url: {
            path: '',
            startQuery: {},
            query: {}
        },
        startOptions: {}
    };
    const builder = {
        start(...args) {
            // Step 1
            const [url, query] = urlParamDecode(args[0]);
            _root.url.path = url;
            _root.url.startQuery = query;
            // Step 2 if set
            if (karg_exist(args, 1)) {
                _root.startOptions = args[1];
            }
        },
        one() {
        },
        many() {
        }
    };
    for (const model of instructions) {
        const name = model[0];
        const kargs = model[1];
        if (name in builder) {
            builder[name](...kargs);
        }
        else {
            console.warn(`In builder not exist command "${name}"`);
        }
    }
};
