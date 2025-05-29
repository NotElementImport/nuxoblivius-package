import { GarbageService } from "./application/service/GarbageService.js";

export interface INuxobliviusConfig {
  backend: unknown;
  garbage?: GarbageService;
  defaults?: unknown;
};

export class Nuxoblivius {
  private static instance: Nuxoblivius;
  public static getInstance(): Nuxoblivius {
    if (!this.instance)
      throw new Error("Nuxoblivius not init");

    return this.instance;
  }

  private readonly backend: unknown;
  private readonly garbage: GarbageService;
  private readonly defaults: unknown;

  public constructor(config: INuxobliviusConfig) {
    this.backend = config.backend;
    this.garbage = config.garbage ?? new GarbageService();
    this.defaults = config.defaults ?? null;

    Nuxoblivius.instance = this;
  }

  public getBackend(): typeof this.backend {
    return this.backend;
  }

  public getGarbage(): typeof this.garbage {
    return this.garbage;
  }

  public getDefaults(): typeof this.defaults {
    return this.defaults;
  }
};
