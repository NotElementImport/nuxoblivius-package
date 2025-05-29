import { test } from "node:test";
import * as assert from "node:assert";
import { StoreService } from "../application/service/StoreService.js";

test("stateManager/application/service/StoreService: Init", () => {
  assert.equal(new StoreService(class { }) instanceof StoreService, true);
});

class UserStore {
  public firstName: string;
  public lastName: string;
}

test("stateManager/application/service/StoreService: Singleton", () => {
  const store = new StoreService(UserStore);
  const instance = 

});
