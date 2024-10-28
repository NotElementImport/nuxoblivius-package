import { defineSingletone, defineTemplate, useRecord } from './index.js'

defineTemplate('ant-select', (raw) => {
    const tryGetLabel = raw => {
        if(raw.title)
            return raw.title
        else if(raw.label)
            return raw.label
        else if(raw.name)
            return raw.name
        else
            return raw.id
    }

    if(Array.isArray(raw))
        return {
            response: raw.map((item) => ({ label: tryGetLabel(item), value: item.id }))
        }
})

defineTemplate('as-object', (raw) => {
    const tryGetLabel = raw => {
        if(raw.title)
            return raw.title
        else if(raw.label)
            return raw.label
        else if(raw.name)
            return raw.name
        else
            return raw.id
    }

    if(Array.isArray(raw))
        return {
            response: Object.fromEntries(raw.map((item) => [ tryGetLabel(item), item.value ]))
        }
})

class Products {
    product = useRecord('https://dummyjson.com/products', [])
        .query.set({ limit: 3, select: 'id,title,price', test: () => 'asdsa' })
        .pagination.use('query.skip', { step: 3, start: 0 })
        .template(
            raw => ({ response: raw.products }),
            'ant-select',
            'as-object'
        )
}

const products = defineSingletone(Products)

console.table(products.product.query.toObject())