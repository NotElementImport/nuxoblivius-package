import { IBackendController } from "../backend/domain/interfaces/IBackendController.js";
import { ContainerService } from "./application/service/ContainerService.js";
import { GarbageService } from "./application/service/GarbageService.js";
import { StoreListService } from "./application/service/StoreListService.js";

export class Nox {
  private static instance: Nox;

  public static getInstance(): Nox {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  public readonly container: ContainerService;
  public readonly storeContainer: StoreListService;
  public readonly garbage: GarbageService;

  private backend?: IBackendController;

  protected constructor() {
    this.container = new ContainerService();
    this.storeContainer = this.container.inject(StoreListService);
    this.garbage = this.container.inject(GarbageService);
  }

  public setBackend(backend: IBackendController) {
    this.backend = backend;
  }

  public getBackend(): IBackendController {
    if (!this.backend) {
      throw new Error("Backend not found. Please init backend");
    }

    return this.backend;
  }
};
