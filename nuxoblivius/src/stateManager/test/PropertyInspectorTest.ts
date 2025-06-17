import { test } from "node:test";
import * as assert from "node:assert";
import { PropertyInspector } from "../infrastructure/inspector/PropertyInspector.js";
import { EProprtyType } from "../domain/enum/EPropertyType.js";

test("stateManager/intrastructure/inspector/PropertyInspector: Behaviour", () => {
  class Test {
    public basic1 = "";
    public basic2 = "";

    public get readonlyRef1() { return "" }
    public get readonlyRef2() { return "" }

    public get writableRef1() { return "" }
    public set writableRef1(v) { }

    public get writableRef2() { return "" }
    public set writableRef2(v) { }
  };

  var basicCount = 0;
  var readonlyCount = 0;
  var writeCount = 0;

  const inspector = new PropertyInspector();

  for (const meta of inspector.inspectAll(new Test())) {
    if (meta.isType(EProprtyType.DEFAULT)) {
      basicCount += 1;
    }
    else if (meta.isType(EProprtyType.WRITEBLE_COMPUTED)) {
      writeCount += 1;
    }
    else if (meta.isType(EProprtyType.READONLY_COMPUTED)) {
      readonlyCount += 1;
    }
  }

  assert.equal(basicCount, 2, "Basic count failed");
  assert.equal(writeCount, 2, "Writable count failed");
  assert.equal(readonlyCount, 2, "Readonly count failed");
});
