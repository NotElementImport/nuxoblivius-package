import { test } from "node:test";
import * as assert from "node:assert";
import { DefaultUrlTransform } from "../infrastructure/urlTransform/DefaultUrlTransform.js";
import { PathParams } from "../domain/valueObject/PathParams.js";

test("record/intrastructure/urlTransform/DefaultUrlTransform: Behaviour", () => {
  const transformer = new DefaultUrlTransform();

  // One param
  const oneParam = transformer.transform(
    '/api/post/{id}', new PathParams({ id: 1 })
  );

  assert.equal(oneParam, '/api/post/1');

  // Multiple params
  const multipleParam = transformer.transform(
    '/api/{version}/post/{id}', new PathParams({ id: 1, version: 'v1' })
  );

  assert.equal(multipleParam, '/api/v1/post/1');

  // With spread
  const unpackParam = transformer.transform(
    '/api/{version}/post/...', new PathParams({ '...': ['{id}'], id: 1, version: 'v1' })
  );

  assert.equal(unpackParam, '/api/v1/post/1');
});
