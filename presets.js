export const useCached = (tags = []) => {
    return $ => {
        const condition = {}
        for (const itemName of tags) {
            $.createTag(itemName, 'full')
            condition[itemName.split(':').pop()] = '*'
        }

        $.swapMethod('lazy').borrowFrom(
            condition,
            () => [{}],
            () => {
                const cachedCondition = {}
                for (const itemName of tags) {
                    const [where, name] = itemName.split(':')
                    cachedCondition[name] = $.params[where]?.[name] ?? null
                }

                return $.cached(cachedCondition)
            }
        )
    }
};