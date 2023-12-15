interface ITypeFilter {
    number(): any
    array(): any
    string(): any
    boolean(): any
    binary(): any
    notEmpty(): ITypeFilter
}
interface IToolboxArray {
    toggle(value: any, state?: boolean)
}

export declare class IFilter {
    protected static globalName: string
    /**
     * @virtual
     */
    protected  setup(): void
    /**
     * @virtual
     */
    protected resolve(value: any): boolean
    public static filter (path: string): {[name: string]: any}|any
    public static toolbox (): {[name: string]: any|IToolboxArray}
    public static ref (): string
    readonly protected get getValues(): {[name: string]: any}
    readonly public on(func: Function): void
    readonly protected createFilter(items: {[name: string]: any[]}): void
    readonly protected setDefault(map: {[name: string]: any}): void
    readonly protected setPrefix(start: string, end: string): IFilter
    readonly protected get type(): ITypeFilter
}

export default Filter as typeof IFilter
export const registerFilter: (name: string, filter: typeof IFilter) => void