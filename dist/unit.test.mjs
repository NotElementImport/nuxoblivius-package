import { queryToUrl } from './dist/ts/Utils.js';
// Test: queryToUrl
const testObject = {
    data: ['my-val1', 'my-val2'],
    page: () => 1
};
console.log(`queryToUrl: ${queryToUrl(testObject)}`);
