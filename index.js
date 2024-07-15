import Record1 from './dist/ts/Record.js'
import Storage1 from './dist/ts/Storage.js'
import { settings, callPattern, extendsPattern } from './dist/ts/config.js'

export const ExtendsPattern = extendsPattern
export const CallPattern = callPattern
export const RegisterTemplate = settings.template
export const Record = Record1
export const Storage = Storage1
export * from './dist/ts/index.js'
export class IStore {}