export type UnSubscribeEvent = () => void;

export interface IObservable<T = unknown> {
  watch(callback: (value: T) => void): UnSubscribeEvent;
  unWatch(callback: (value: T) => void): void;
  dispatch(value: T): void;
  cleanUp(): void;
};
