import { defineSingletone, defineTemplate, useRecord } from './index.js'

defineTemplate('unpack-product', (raw) => {
    if(raw.products)
        return {
            response: raw.products
        }
})

defineTemplate('ant-select', (raw) => {
    if(Array.isArray(raw))
        return {
            response: raw.map((item) => ({ label: item.title, value: item.id }))
        }
})

const product = useRecord('https://dummyjson.com/products', [])
    .query.set({ limit: 3, select: 'id,title,price' })
    .get()
    .useTemplate('unpack-product')
    .useTemplate('ant-select')
    .lazy

console.log(product)