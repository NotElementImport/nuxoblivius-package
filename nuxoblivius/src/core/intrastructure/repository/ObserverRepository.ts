import { IObservable, UnSubscribeEvent } from "../../domain/interface/IObservable.js";

export class ObserverRepository<T> implements IObservable {
  private watchers = new Set<(value: T) => void>();

  public watch(callback: (value: T) => void): UnSubscribeEvent {
    this.watchers.add(callback);
    return () => { this.unWatch(callback); };
  }

  public unWatch(callback: (value: T) => void): void {
    this.watchers.delete(callback);
  }

  public dispatch(value: T): void {
    for (const callback of this.watchers.values()) {
      callback(value);
    }
  }

  public cleanUp(): void {
    this.watchers.clear();
  }
}
