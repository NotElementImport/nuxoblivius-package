import defineNuxoblivius, { getNuxoblivius, waitEventLoop } from "@nuxoblivius_builds/core";
import { Request, Response, NextFunction } from "express";
import { ExpressBackend, ExpressController } from "./ExpressBackend.js";
import { IContainer } from "@nuxoblivius_builds/core/Core/Container/Interface";

interface NuxobliviusExpressOptions {
  beforeRequest: (req: Request, di: IContainer) => void | Promise<void>;
};

export function useNuxoblivius(options: Partial<NuxobliviusExpressOptions> = {}) {
  const ctrl = new ExpressController();

  defineNuxoblivius({
    backend: new ExpressBackend(ctrl)
  });

  return async function (req: Request, res: Response, next: NextFunction) {
    const instance = getNuxoblivius();
    options.beforeRequest?.(req, instance.getDI());
    next();
    ctrl.unLoad();
  }
}


type SecondPart = () => (void | Promise<void>);
type EventLoopHandle = (req: Request, res: Response) => SecondPart;

export class HttpError extends Error {
  constructor(msg: string, private readonly code: number = 500) {
    super(msg);
  }

  public getCode(): number {
    return this.code;
  }
}

export class DomainError extends HttpError {
  constructor(msg: string) {
    super(msg, 400);
  }
}

export class InternalError extends HttpError {
  constructor(msg: string) {
    super(msg, 500);
  }
}

export class ForbiddenError extends HttpError {
  constructor(msg: string) {
    super(msg, 403);
  }
}

export function defineHandle(handle: EventLoopHandle) {
  return async (req: Request, res: Response) => {
    try {
      const secondPart = await handle(req, res);
      await waitEventLoop();
      await secondPart();
    }
    catch (e) {
      const actualError = e instanceof Error ? e : new Error(`${e}`);

      res.status(actualError instanceof HttpError ? actualError.getCode() : 500)
        .json({ message: actualError.message });
    }
  };
}
