import SM from ".";

export function ref<T extends SM>(obj:T, name: keyof T) {
    return () => obj[name]
}