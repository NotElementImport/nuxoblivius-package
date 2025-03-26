type IContentType = 'text/html'|'application/xhtml+xml'|'application/xml'|'image/webp'|'image/*'|'*/*'

export interface IHeaderAttribute {
    'WWW-Authenticate': string
    'Authorization': string
    'Proxy-Authenticate': string
    'Proxy-Authorization': string

    'Age': number
    'Cache-Control': string
    'Clear-Site-Data': string
    'Expires': string

    'Last-Modified': string
    'ETag': string
    'If-Match': string
    'If-None-Match': string
    'If-Modified-Since': string
    'If-Unmodified-Since': string
    'Vary': string

    'Keep-Alive': string
    'Connection': 'keep-alive'|'close'

    'Accept': IContentType
    'Accept-Encoding': '*'|'gzip'|'compress'|'deflate'|'br'|'zstd'|'identity'
    'Accept-Language': string
    'Content-Type': string
}