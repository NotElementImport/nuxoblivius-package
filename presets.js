import { Record } from "./index.js";

const semiEmptyArray = [{}]

export const useArrayRemesh = (sizeTag, config = {}) => {
    return $ => {
        $.createTag(sizeTag, 'full');
        const [whereTag, nameTag] = sizeTag.split(':')

        const checkKeys = (keys) => {
            const currentValue = $.params[whereTag][nameTag];
            if (typeof currentValue === 'undefined' || currentValue == null) {
                return false;
            }

            if (!(nameTag in keys)) {
                return false;
            }

            const valueNameTag = keys[nameTag];
            if (valueNameTag <= currentValue) {
                return false;
            }

            for (const tag of (config.withTags ?? [])) {
                const [where, nameTag] = tag.split(':');
                if (!keys[nameTag]) return false;
                if (keys[nameTag] != $.params[where][nameTag]) return false;
            }

            return true;
        }

        $.swapMethod('lazy').borrowFrom(
            () => true,
            () => semiEmptyArray,
            (...args) => {
                if (config.pageTag) {
                    const workValue = config.pageTag.value ?? 1;
                    if (config.pageTag.tag == 'auto') {
                        if ($._variables.currentPage != workValue) {
                            return undefined;
                        }
                    }
                    else {
                        const [where, tag] = config.pageTag.tag.split(":");
                        if ($.params[where][tag] != workValue) {
                            return undefined;
                        }
                    }
                }

                for (const [keys, response] of $._allCachedResponse.entries()) {
                    if (checkKeys(keys)) {
                        const currentValue = $.params[whereTag][nameTag];
                        return response.slice(0, currentValue);
                    }
                }
                return undefined;
            }
        );
    }
};

export const useCached = (tags = [], { strict, breakRule } = {}) => {
    return $ => {
        const condition = {}
        for (const itemName of tags) {
            $.createTag(itemName, 'full')
            condition[itemName.split(':').pop()] = '*'
        }

        $.swapMethod('lazy').borrowFrom(
            (strict ?? true) ? condition : () => true,
            () => semiEmptyArray,
            (...args) => {
                if (breakRule && breakRule({ path: $.params.path, query: $.params.query }))
                    return

                const cachedCondition = {}
                for (const itemName of tags) {
                    const [where, name] = itemName.split(':')

                    // Pagination
                    if ($._pagination.where == where && $._pagination.param == name)
                        cachedCondition[name] = $._variables.currentPage
                    else // Path params / Search params
                        cachedCondition[name] = $.params[where]?.[name] ?? null
                }

                return $.cached(cachedCondition)
            }
        )
    }
};
