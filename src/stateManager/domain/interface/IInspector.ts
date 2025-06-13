export interface IInspector<T> {
  inspectAll(instance: object): Generator<T, void, unknown>;
};
