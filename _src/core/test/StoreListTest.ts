import { test } from "node:test";
import * as assert from "node:assert";
import { StoreListService } from "../application/service/StoreListService.js";

test("core/application/service/StoreListService: Init", () => {
  const storeList = new StoreListService();
  assert.equal(storeList instanceof StoreListService, true);
});

class EmptyTestStore { }

test("core/application/service/StoreListService: Register", () => {
  const storeList = new StoreListService();

  storeList.register(EmptyTestStore, new EmptyTestStore());

  assert.equal(
    storeList.get(EmptyTestStore) === storeList.get(EmptyTestStore), true
  );

  assert.equal(
    storeList.get(EmptyTestStore) instanceof EmptyTestStore, true
  );
});

test("core/application/service/StoreListService: Delete", () => {
  const storeList = new StoreListService();

  storeList.register(EmptyTestStore, new EmptyTestStore());

  assert.equal(
    storeList.get(EmptyTestStore) instanceof EmptyTestStore, true
  );

  storeList.delete(EmptyTestStore);

  assert.throws(() => {
    storeList.get(EmptyTestStore);
  }, "Store List, must except error, because Store doesn't exist");
});
