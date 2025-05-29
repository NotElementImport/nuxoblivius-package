type WatchHandle<T> = (value: T) => void;
type UnWatchHandle = () => void;

export class Watchers<T> {
  private list = new Set<WatchHandle<T>>();

  public dispatch(value: T) {
    this.list.forEach((callback) => {
      callback(value);
    });
  }

  public watch(callback: WatchHandle<T>): UnWatchHandle {
    this.list.add(callback);
    return () => this.unWatch(callback);
  }

  public unWatch(callback: WatchHandle<T>): void {
    this.list.delete(callback);
  }

  public clear(): void {
    this.list.clear();
  }
};
