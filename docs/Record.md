# Record

Record - Request Handler for Vue / Nuxt with `caching`, `borrow`, `dynamic params` possibilities

Basic creation:
```ts
const request = Record.new('/api/link') 
```

Record support 5 methods `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

```ts
request.get()    // GET

request.post()   // POST

request.put()    // PUT

request.delete() // DELETE

request.patch()  // PATCH
```

There are also methods of customisation:

```ts
// Search params
request.query({ 'param': 'test' })
// /api/link?param=test

// Path params
request.pathParam('test', 'value')
// /api/link/{test} => /api/link/value

// Header param
request.header('Content-Type', 'application/json')

// Body
request.body({ 'message': 'simple json' })
request.body(new FormData())

// Authorization
request.auth(Record.Bearer('token'))
request.auth(Record.Basic('login', 'password'))

// Response Type Blob
request.isBlob()
```

Example request:

```ts
const request = Record.new('/api/news')
    .query({ page: 1 })
    .header('Accept-Language', 'en-US')

const response = await request.get()
/**
 * URL : /api/news?page=1
 * Headers : Accept-Language: en-US
 * 
 * Response Body:
 * [{ "title": "New #1", "content": "..." }]
 */
```