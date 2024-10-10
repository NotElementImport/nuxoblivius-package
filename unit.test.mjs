import { defineStore } from './index.js'
import { deleteDump } from './dist/index.js'
import { settings } from './dist/config.js'
import { Record } from './index.js'

// Tooling :

let isFail = false
const check = async (name, handle) => {
    try {
        await handle()
        console.log(` ✅ Pass : ${name}`)
        console.log('')
    }
    catch (e) {
        console.log(` ❌ Fail : ${name}, Cause : ${e}`)
        console.log('')
        isFail = true
    }
}

// Test :

console.log(' 🧩 Unit Testing: package Nuxoblivius')
console.log('')

await check('Defining store / Basic values', _ => {
    class Store {
        testString  = 'string'
        testNumber  = 1
        testBoolean = true
        testObject  = {}
        testArray   = []
    }
    
    let store;
    try { store = defineStore(Store) }
    catch (e) { throw `Store cannot be defined` }

    if(store.testString != 'string')
        throw `Test string, return ${store.testString}`
    else if(store.testNumber != 1)
        throw `Test number, return ${store.testNumber}`
    else if(store.testBoolean != true)
        throw `Test boolean, return ${store.testBoolean}`
    else if(JSON.stringify(store.testObject) != JSON.stringify({}))
        throw `Test object, return ${JSON.stringify(store.testObject)}`
    else if(JSON.stringify(store.testArray) != JSON.stringify([]))
        throw `Test array, return ${JSON.stringify(store.testArray)}`
})

await check('Defining store / Encapsulation', _ => {
    class Store {
        _testString = 'test string'
         testString
    }
    
    let store;
    try { store = defineStore(Store) }
    catch (e) { throw `Store cannot be defined` }

    if(store.testString != 'test string')
        throw `Test string, return ${store.testString}`
})

await check('Defining store / Custom Setter', _ => {
    class Store {
        _test = 'empty'
        set test(date) {
            this._test = `${date.getFullYear()}`
        }
    }
    
    let store;
    try { store = defineStore(Store) }
    catch (e) { throw `Store cannot be defined` }

    store.test = new Date('2020-01-01 00:00:00')

    if(store.test != '2020')
        throw `Test string, return ${store.test}`
})

await check('Defining store / SSR Cleaning', _ => {
    class Store {
        // Basic reactive prop
        test1 = 'start-value'

        // Encapsulation
        _test2 = 'start-value'
         test2

        setValue2(val) {
            this._test2 = val
        }

        // Custom setter
        _test3 = 'start-value'
        set test3(val) {
            return this._test3 = val
        }
    }
    
    let store;
    try { store = defineStore(Store) }
    catch (e) { throw `Store cannot be defined` }

    store.test1 = 'another-value'
    store.setValue2('another-value')
    store.test3 = 'another-value'

    if(store.test1 != 'another-value')
        throw `Test value 1, step change value, return ${store.test1}`
    if(store.test2 != 'another-value')
        throw `Test value 2, step change value, return ${store.test2}`
    if(store.test3 != 'another-value')
        throw `Test value 3, step change value, return ${store.test3}`

    deleteDump()

    if(store.test1 != 'start-value')
        throw `Test value 1, step clear data, return ${store.test1}`
    if(store.test2 != 'start-value')
        throw `Test value 2, step clear data, return ${store.test2}`
    if(store.test3 != 'start-value')
        throw `Test value 3, step clear data, return ${store.test3}`
})

await check('Record / Creating', _ => {
    try { Record.new('/api/test') }
    catch (e) { throw `Record cannot be created` }
})

await check('Record / URL Reader', _ => {
    let record;
    try { record = Record.new('/api/test?q=My title&id=10') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.query.q != 'My title')
        throw `URL Reader, param q, returns ${record.params.query.q}`
    if(record.params.query.id != 10)
        throw `URL Reader, param id, returns ${record.params.query.id}`
})

await check('Record / URL Path Interpolation', _ => {
    settings.router({
        path: '/test',
        params: { id: 32 },
        query: { q: 'test', id: 32 }
    })

    // By default from path param

    let record;
    try { record = Record.new('/api/test/[id]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test/{id}')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.path.id != 32)
        throw `URL Reader, path param id, returns ${record.params.path.id}`

    // From Path param [exactly]

    try { record = Record.new('/api/test/[path.id]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test/{id}')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.path.id != 32)
        throw `URL Reader, path param id, returns ${record.params.path.id}`

    // From Query
    
    try { record = Record.new('/api/test/[query.q]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test/{q}')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.path.q != 'test')
        throw `URL Reader, path param id, returns ${record.params.path.q}`
})

await check('Record / URL Query Interpolation', _ => {
    settings.router({
        path: '/test',
        params: { id: 32 },
        query: { q: 'test', id: 32 }
    })

    // By default from query

    let record;
    try { record = Record.new('/api/test?q=[q]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.query.q != 'test')
        throw `URL Reader, Query 'q', returns ${record.params.query.q}`

    // From query [exactly]

    try { record = Record.new('/api/test?q=[query.q]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.query.q != 'test')
        throw `URL Reader, Query 'q', returns ${record.params.query.q}`

    // From path param
    
    try { record = Record.new('/api/test?q=[path.id]') }
    catch (e) { throw `Record cannot be created` }

    if(record._url != '/api/test')
        throw `URL Reader, path url, returns ${record._url}`
    if(record.params.query.q != 32)
        throw `URL Reader, Query 'q', returns ${record.params.query.q}`
})

await check('Record / SSR cleaning', _ => {
    class Store {
        test = Record.new("/api/test")
    }

    let store;
    try { store = defineStore(Store) }
    catch (e) { throw `Store cannot be defined` }

    store.test.response = { 'test': 'test' }
    store.test.query({ 'test': 'test' })

    if(JSON.stringify(store.test.response) != JSON.stringify({ 'test': 'test' }))
        throw `Test Record, return ${JSON.stringify(store.test.response)}`
    else if(JSON.stringify(store.test._query) != JSON.stringify({ 'test': 'test' }))
        throw `Test Record Query, return ${JSON.stringify(store.test._query)}`

    deleteDump()

    if(store.test.response != null)
        throw `After clear: Test Record, return ${JSON.stringify(store.test.response)}`
    else if(JSON.stringify(store.test._query) != JSON.stringify({}))
        throw `After clear: Test Record Query, return ${JSON.stringify(store.test._query)}`
})

console.log(isFail ? ' ❌ Unit Testing: FAILED' : ' ✅ Unit Testing: OK')
console.log('')