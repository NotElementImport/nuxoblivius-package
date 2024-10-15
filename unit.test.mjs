import { defineStore } from './index.js'
import { deleteDump, forgetAllStores } from './dist/index.js'
import { queryToUrl, urlPathParams } from './dist/Utils.js'
import { settings } from './dist/config.js'
import { Record } from './index.js'
import { ref } from 'vue'

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

const speedRun = async (name, handle) => {
    try {
        const start = performance.now()
        await handle()
        const diff = performance.now() - start;
        
        if(diff > 1000) {
            console.log(` 🕒 ${name} : 🟦 s  -> ${(diff * (1 / 1000)).toPrecision(2)} `)
            console.log('')
        }
        else if(diff > 60000) {
            console.log(` 🕒 ${name} : 🟪 m  -> ${(diff * (1 / 1000) * (1 / 60)).toPrecision(2)} `)
            console.log('')
        }
        else {
            console.log(` 🕒 ${name} : 🟩 ms -> ${(diff).toPrecision(2)} `)
            console.log('')
        }
    }
    catch (e) {
        console.log(` ❌ Speed Fail : ${name}, Cause : ${e}`)
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

await check('Record / SSR Cleaning', _ => {
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

await check('Record / Query', _ => {
    let record;
    try { record = Record.new('/api/test') }
    catch (e) { throw `Record cannot be created` }

    const testRef = ref('vue-ref-value')

    record.query({
        testRef,
        dyn: () => 'dyn-value',
        static: 'static-value'
    })

    if(record.params.query.testRef != 'vue-ref-value')
        throw `Query 'testRef', return ${record.params.query.testRef}`
    else if(record.params.query.dyn != 'dyn-value')
        throw `Query 'dyn', return ${record.params.query.dyn}`
    else if(record.params.query.static != 'static-value')
        throw `Query 'static', return ${record.params.query.static}`

    const queryStr = queryToUrl(record.compileQuery())

    if(queryStr != '?testRef=vue-ref-value&dyn=dyn-value&static=static-value')
        throw `Query compile error, return ${queryStr}`
})

await check('Record / Path Params', _ => {
    let record;
    try { record = Record.new('/api/test/{id}') }
    catch (e) { throw `Record cannot be created` }

    // Vue Ref

    const testRef = ref('vue-ref-value')
    record.pathParam('id', testRef)

    if(record.params.path.id != 'vue-ref-value')
        throw `Path param {id}: 'testRef', return ${record.params.path.id}`

    if(urlPathParams(record._url, record._pathParams) != '/api/test/vue-ref-value')
        throw `Render [vue ref] path param {id}: return ${urlPathParams(record._url, record._pathParams)}`

    // Dyn

    record.pathParam('id', () => 'dyn-value')

    if(record.params.path.id != 'dyn-value')
        throw `Path param {id}: 'Dyn function', return ${record.params.path.id}`

    if(urlPathParams(record._url, record._pathParams) != '/api/test/dyn-value')
        throw `Render [dyn] path param {id}: return ${urlPathParams(record._url, record._pathParams)}`

    // Static

    record.pathParam('id', 'static-value')

    if(record.params.path.id != 'static-value')
        throw `Path param {id}: 'Static value', return ${record.params.path.id}`

    if(urlPathParams(record._url, record._pathParams) != '/api/test/static-value')
        throw `Render [static] path param {id}: return ${urlPathParams(record._url, record._pathParams)}`
})

forgetAllStores()

await speedRun('Store / Complining', _ => {
    class Person {
        firstName = ''
        lastName  = ''
        surName   = ''

        _age = 0
        age

        set data(v) {
            this.firstName = v
        }
    }

    defineStore(Person)
})

await speedRun('Store / SSR Cleaning', _ => {
    class Person {
        firstName = ''
        lastName  = ''
        surName   = ''

        _age = 0
        age

        set data(v) {
            this.firstName = v
        }
    }

    const store = defineStore(Person)

    store.firstName = 'asd'
    store.lastName = 'sad'
    store.surName = 'sad'

    deleteDump()
})

console.log(isFail ? ' ❌ Unit Testing: FAILED' : ' ✅ Unit Testing: OK')
console.log('')