import { Nuxoblivius } from "../../../core/Nuxoblivius.js";
import { SingletonBuilder } from "./SingletonBuilder.js"

export class TemporalSingletonBuilder extends SingletonBuilder {
  protected override getParentInstance(store: new (...args: any) => any) {
    var isCreatingParent = !this.hasParent();
    var response = super.getParentInstance(store);

    if (isCreatingParent) {
      Nuxoblivius.getInstance().getBackend().onUnMounted(() => {
        this.clearParent();
      });
    }

    return response;
  }
}
