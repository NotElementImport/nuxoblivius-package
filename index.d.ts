import { Ref } from "vue"
import { Record, TemplateHandle, TemplateInit, TemplateResponse } from "./types.js"

interface State<T> {
    value: T
    valid: boolean
    change(f: () => void): State<T>
}

interface StateComputed<T> {
    readonly value: T
    valid: boolean
}

interface Templater {
    mut<T>(value: T): State<T>
    scoped<T>(value: T): State<T>
    computed<T>(followers: State<any>[], handler: () => T): StateComputed<T>
}

type IComputed<T> = [Symbol, (string|Ref<any>)[], () => T]
type InlineStore<T> = { [P in keyof T]: T[P] extends (State<any>|StateComputed<any>) ? T[P]['value'] : T[P] } & {
    unwatch(key: string): void,
    watch(handle: Function, key?: string): string
}

type ClassStore<T> = { [P in keyof T]: 
    T[P] extends IComputed<any> 
        ? ReturnType<T[P][2]> 
        : T[P] extends Ref<any> ? T[P]['value'] : T[P]
} & {
    unwatch(key: string): void,
    watch(handle: Function, key?: string): string
}

declare export function useRecord<T>(url: string, init?: T): Record<T, {id?: number}, {}>

declare export function toComputed<T>(followers: (string|Ref<any>)[], handler: () => T): IComputed<T> 

declare export function defineSingletone<T>(store: (t: Templater) => T, key: string|null = null): InlineStore<T>
declare export function defineSingletone<T>(store: { new(): T }, key: string|null = null): ClassStore<T>

declare export function defineFactory<T, P>(store: (t: Templater, props: P) => T): (props: P) => InlineStore<T>
declare export function defineFactory<T, P>(store: { new(props: P): T }): (props: P) => ClassStore<T>

declare export function useTemplate<T extends object|any[], K extends any>(init: TemplateInit<T>, raw: K): TemplateResponse<K>
declare export function defineTemplate<T extends any>(name: string, handle: TemplateHandle<T>, config?: { extends?: string }): TemplateResponse<T>