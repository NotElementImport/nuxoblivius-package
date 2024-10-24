import { defineSingletone, defineFactory, toComputed, useRecord } from './index.js'

const test = useRecord('/api/test')
    .query.set({ test: 10 })
    .query.add({ new: 'asdas' })

test.reset({
    query: 'dynamic'
})

console.log(test.toURL())