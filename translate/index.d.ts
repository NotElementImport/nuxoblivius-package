import { IStateManager } from ".."

export declare interface ILanguageConfig {
    /**
     * Default language on start site
     */
    default: string
    /**
     * Supports language in project \
     * Example:
     * ```ts
     * {
     *    supports: {
     *       // long : short
     *       'en-US': 'en',
     *    }
     * }
     * ```
     */
    supports: {[lang: string]: string}
    /**
     * Object of file *.js \
     * Example:
     * 
     * app.js file
     * ```js
     * export default {
     *    'en': {
     *       helloWorld: 'Hello world!',
     *       textBuilder: 'This is number $1 not range between $2 and $3'
     *    },
     * }
     * ```
     * 
     * config
     * ```ts
     * import app from '../translate/app.js'
     * {
     *    default: 'en',
     *    supports: {
     *       'en-US': 'en',
     *    },
     *    imports: {
     *       app,
     *    },
     * }
     * ```
     */
    imports: {},
    /**
     * State manager. Listen value from field in Object. \
     * This field is current value of language. Value is short version
     * 
     * Example:
     * 
     * lang.ts
     * ```ts
     * export default class Language extends SM<Language> {
     *      public current = state<string>('en')
     *          .keep('currentLang', Infinity)
     *          .one()
     * 
     *      constructor() {
     *          super('lang')
     *      }
     * }
     * ```
     * config
     * ```ts
     * import Lang from '@/store/Language'
     * {
     *    ...
     *    stateManager: {
     *       object: Lang,
     *       field: 'current'
     *    }
     * }
     * ```
     */
    stateManager: {
        object: IStateManager<any>,
        field: string 
    }
}