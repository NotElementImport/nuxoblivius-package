import { Record } from "./index.js";

const semiEmptyArray = [{}]

export const useArrayRemesh = (sizeTag, config = {}) => {
    return $ => {
        if(config.cacheTag)
            $.createTag(sizeTag, config.cacheAccess ?? 'full')

        const [whereTag, nameTag] = sizeTag.split(':')

        const condition = config.condition ?? { }
        
        if(!config.condition) {
            if(config.cacheTag)
                condition[nameTag] = '*'

            if($._paginationEnabled && (config.pageCheck ?? true))
                condition[$._pagination.param] = config.page ?? '*'
        }

        const disableCondition = config.exclude

        $.rule({ notExist: null }, () => {})
        
        $.defaultRule($$ => {
            $$.enableBorrow(true);
        })

        $.swapMethod('lazy').borrowFrom(
            condition,
            () => semiEmptyArray,
            (...args) => {
                if(disableCondition) {
                    if(Record.compareTags(disableCondition, $._lastRequestTags))
                        return
                }
                const cacheCondition = Object.fromEntries(Object.entries(config.cache ?? {}).map(v => [v[0], v[1]() ]))

                if(config.cacheTag)
                    cacheCondition[nameTag] = +$.params[whereTag][nameTag]

                if($._paginationEnabled && (config.pageCheck ?? true))
                    cacheCondition[$._pagination.param] = config.page ?? ($.params[$._pagination.where][$._pagination.param] ?? $._variables.currentPage)

                const result = $.cached(cacheCondition)
                const size   = +$.params[whereTag][nameTag]

                if(!Array.isArray(result)) return

                if(size < result.length) {
                    $.onlyOnEmpty();
                    return result.slice(0, size)
                }
                else if(size > result.length) {
                    $.enableBorrow(false);
                }
            }
        )
    }
};

export const useCached = (tags = []) => {
    return $ => {
        const condition = {}
        for (const itemName of tags) {
            $.createTag(itemName, 'full')
            condition[itemName.split(':').pop()] = '*'
        }

        $.swapMethod('lazy').borrowFrom(
            condition,
            () => semiEmptyArray,
            (...args) => {
                const cachedCondition = {}
                for (const itemName of tags) {
                    const [where, name] = itemName.split(':')

                    // Pagination
                    if($._pagination.where == where && $._pagination.param == name)
                        cachedCondition[name] = $._variables.currentPage
                    else // Path params / Search params
                        cachedCondition[name] = $.params[where]?.[name] ?? null
                }

                return $.cached(cachedCondition)
            }
        )
    }
};