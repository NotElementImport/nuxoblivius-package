import Record1 from './dist/Record.js'
import { settings, callPattern, extendsPattern, setDefaultHeader, setDefaultAuth, setRequestFailure } from './dist/config.js'
import { spread, lazySpread } from './dist/Utils.js'

export const SetDefaultHeader = setDefaultHeader
export const SetDefaultAuth = setDefaultAuth
export const SetRequestFailure = setRequestFailure
export const ExtendsPattern = extendsPattern
export const CallPattern = callPattern
export const RegisterTemplate = settings.template
export const useSpread = spread
export const useLazySpread = lazySpread
export const Record = Record1
export * from './dist/index.js'
export class IStore {}
export { toRefRaw } from './dist/Utils.js'