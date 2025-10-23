export type ThreadOutput = void | unknown;

export interface IThreadOptions {
  noThrow?: boolean;
}

export interface IErrorInfo {
  error: Error;
  isRetry: boolean;
  isLastRetry: boolean;
}

export abstract class IThread {
  protected toErrorInfo(error: Error | unknown, retryCount: number): IErrorInfo {
    return {
      error: error instanceof Error ? error : new Error(`${error}`),
      isRetry: retryCount > 0,
      isLastRetry: retryCount == 9
    }
  }

  public runOnThread<T>(handle: () => T, options: IThreadOptions): T {
    var hasResposne = false, response: T;

    const runEvent = (count: number = 0) => {
      if (count === 10) {
        throw new Error("Thread recursion");
      }

      try {
        const tempResponse = handle();

        if (tempResponse instanceof Promise) {
          return new Promise(async (resolve, reject) => {
            try {
              response = await tempResponse;
              hasResposne = true;
            } catch (e) {
              await this.onError(
                this.toErrorInfo(e, count),
                () => runEvent(count),
              );

              if (!hasResposne && !options.noThrow) {
                reject(e);
              }
            }

            resolve(response);
          });
        }

        response = tempResponse;
        hasResposne = true;
      } catch (e) {
        this.onError(
          this.toErrorInfo(e, count),
          () => runEvent(count),
        );

        if (!hasResposne && !options.noThrow) {
          throw e;
        }
      }

      return response;
    };

    return runEvent() as T;
  }

  public onError(e: IErrorInfo, retry: Function): ThreadOutput {
    return void 0;
  }
}

export class ThreadMultiple extends IThread {
  public constructor(private _threadList: IThread[]) {
    super();
  }

  public onError(e: IErrorInfo, retry: Function): ThreadOutput {
    var canRunRetry = false;

    for (const subThread of this._threadList) {
      subThread.onError(e, () => canRunRetry = true);
    }

    return canRunRetry ? retry() : void 0;
  }
}
