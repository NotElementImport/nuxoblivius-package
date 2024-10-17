interface State<T> {
    value: T
    valid: boolean
    change(f: () => void): State<T>
}

interface Templater {
    mut<T>(value: T): State<T>
    scoped<T>(value: T): State<T>
}

type InlineStore<T> = { [P in keyof T]: T[P] extends State<any> ? T[P]['value'] : T[P] }

declare export function defineSingletone<T>(store: (t: Templater) => T, key: string|null = null): InlineStore<T>
declare export function defineSingletone<T>(store: { new(): T }, key: string|null = null): T

declare export function defineFactory<T, P>(store: (t: Templater, props: P) => T): (props: P) => InlineStore<T>
declare export function defineFactory<T, P>(store: { new(props: P): T }): (props: P) => T

const Circle = defineFactory(({ mut }, { radius }) => {
    radius = mut(radius ?? 16)

    return {
        radius
    }
})