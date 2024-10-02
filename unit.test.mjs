import { queryToUrl } from './dist/ts/Utils.js'
import { Record, useSpread } from './index.js'

// Test: queryToUrl

const testObject = {
    data: [ 'my-val1', 'my-val2' ],
    page: () => 1
}

console.log(`queryToUrl: ${queryToUrl(testObject)}`)

// Test: compareTags

console.log(
    Record.compareTags({ test: '<>' }, { test: null }, { test: 'data' })
)

// Test: useSpread

const [ stringTest, arrayTest ] = await useSpread([
    async () => 'test',
    () => [ 'array-value' ]
])

console.log(stringTest, arrayTest)