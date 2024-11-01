import { reactive } from 'vue'
import { useRecord } from './index.js'

const outerQuery = reactive({
    person: 'Test Tet'
})

const test = useRecord('/api/test', [])
    .rules.only('on-idle')
    .query.set({ select: 'id,title,price' })
    .query.add(outerQuery, { as: 'reference' })
    .rules.define(($, { query }) => {})
    .headers.set({ 'content-type': 'application/json' })

console.table(test.headers.entries())