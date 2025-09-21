import Record1, { tryAbortAllRequest as tAAR } from './dist/Record.js'
import { settings } from './dist/config.js'

export {
  callPattern as CallPattern,
  extendsPattern as ExtendsPattern,
  setDefaultHeader as SetDefaultHeader,
  setDefaultAuth as SetDefaultAuth,
  setRequestFailure as SetRequestFailure
} from './dist/config.js'

export {
  spread as useSpread,
  lazySpread as useLazySpread
} from './dist/Utils.js'
export const tryAbortAllRequest = tAAR

export const RegisterTemplate = settings.template

export const Record = Record1

export * from './dist/index.js'

export class IStore { }

export { toRefRaw } from './dist/Utils.js'
