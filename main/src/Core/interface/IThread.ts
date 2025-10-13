export interface IThreadOptions {
  noThrow?: boolean;
}

export abstract class IThread {
  public runOnThread<T>(handle: () => T, options: IThreadOptions): T {
    var hasResposne = false,
      response: T;

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
                e instanceof Error ? e : new Error(`${e}`),
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
        this.onError(e instanceof Error ? e : new Error(`${e}`), () =>
          runEvent(count),
        );

        if (!hasResposne && !options.noThrow) {
          throw e;
        }
      }

      return response;
    };

    return runEvent() as any;
  }

  public onError(e: Error, retry: Function): unknown {
    return void 0;
  }
}
