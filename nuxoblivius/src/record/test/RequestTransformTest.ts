import { test } from "node:test";
import * as assert from "node:assert";
import { DefaultRequestTransform } from "../infrastructure/requestTransform/DefaultRequestTransform.js";

test("record/intrastructure/requestTransform/DefaultRequestTransform: Behaviour", () => {
  const transformer = new DefaultRequestTransform();

  const toJsonTest = transformer.transform({
    body: { message: "hello" } as any as BodyInit
  });

  assert.equal(
    toJsonTest.body, '{"message":"hello"}'
  );
  assert.equal(
    // @ts-ignore
    toJsonTest.headers?.get("Content-Type"), 'application/json'
  );

  const toUrlEncoded = transformer.transform({
    body: new URLSearchParams({ message: "hello" })
  });

  assert.equal(
    toUrlEncoded.body, 'message=hello'
  );
  assert.equal(
    // @ts-ignore
    toUrlEncoded.headers?.get("Content-Type"), 'application/x-www-form-urlencoded'
  );
});
