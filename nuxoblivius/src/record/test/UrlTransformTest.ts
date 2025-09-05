import { test } from "node:test";
import * as assert from "node:assert";
import { DefaultUrlTransform } from "../infrastructure/urlTransform/DefaultUrlTransform.js";
import { PathParams } from "../domain/valueObject/PathParams.js";
import { QueryParams } from "../domain/valueObject/QueryParams.js";

test("record/intrastructure/urlTransform/DefaultUrlTransform: Behaviour", () => {
  const transformer = new DefaultUrlTransform();

  // One param
  const oneParam = transformer.transform(
    '/api/post/{id}', new PathParams({ id: 1 }), new QueryParams({})
  );

  assert.equal(oneParam, '/api/post/1');

  // Multiple params
  const multipleParam = transformer.transform(
    '/api/{version}/post/{id}', new PathParams({ id: 1, version: 'v1' }), new QueryParams({})
  );

  assert.equal(multipleParam, '/api/v1/post/1');

  // Query params
  const queryParam = transformer.transform(
    '/api/post', new PathParams({}), new QueryParams({ title: "something", user_id: () => 1, must_be_error: undefined })
  );

  assert.equal(queryParam, '/api/post?title=something&user_id=1');

  // With spread
  const unpackParam = transformer.transform(
    '/api/{version}/post/...', new PathParams({ '...': ['{id}'], id: 1, version: 'v1' }), new QueryParams({ message: "hello" })
  );

  assert.equal(unpackParam, '/api/v1/post/1?message=hello');

  // Connect query to exist query
  const connectedQuery = transformer.transform(
    '/api/post?slug=astana', new PathParams({}), new QueryParams({ message: "hello" })
  );

  assert.equal(connectedQuery, '/api/post?slug=astana&message=hello');

  // With origin
  const withOrigin = transformer.transform(
    'http://test.com/api/post/{id}', new PathParams({ id: 1 }), new QueryParams({ expand: ["comment", "author"] })
  );

  assert.equal(decodeURIComponent(withOrigin), 'http://test.com/api/post/1?expand=comment,author');
});
