export function ref(obj, name) {
    return () => obj[name];
}
