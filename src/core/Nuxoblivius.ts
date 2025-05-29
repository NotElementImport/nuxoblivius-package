import { GarbageService } from "./application/service/GarbageService.js";
import { IBackend } from "./domain/interface/IBackend.js";
import { IDefaults } from "./domain/interface/IDefaults.js";

export interface INuxobliviusConfig {
  backend: IBackend;
  garbage?: GarbageService;
  defaults?: IDefaults;
};

export class Nuxoblivius {
  private static instance: Nuxoblivius;
  public static getInstance(): Nuxoblivius {
    if (!this.instance)
      throw new Error("Nuxoblivius not init");

    return this.instance;
  }

  private readonly backend: IBackend;
  private readonly garbage: GarbageService;
  private readonly defaults: IDefaults;

  public constructor(config: INuxobliviusConfig) {
    this.backend = config.backend;
    this.garbage = config.garbage ?? new GarbageService();
    this.defaults = config.defaults ?? {};

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
