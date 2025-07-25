import { test } from "node:test";
import * as assert from "node:assert";
import { DefaultResponseTransform } from "../infrastructure/responseTransform/DefaultResponseTransform.js";
import { HttpResponse } from "../domain/valueObject/HttpResponse.js";

test("record/intrastructure/responseTransform/DefaultResponseTransform: Behaviour", async () => {
  const transformer = new DefaultResponseTransform();

  // Json check
  const toJsonResponse = new Response('{"message":"hello"}', {
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    status: 200,
  });

  const toJson = await transformer.transform(
    new HttpResponse("http://test.com/api/test", toJsonResponse.headers, undefined, 200, true),
    toJsonResponse
  );

  assert.equal(toJson.hasError(), false, toJson.getError());
  assert.equal(toJson.hasBody(), true, "Body not appear");
  // @ts-ignore
  assert.equal(toJson.getBody()?.message, "hello");

  // UrlEncoded check
  const toUrlResponse = new Response("message=hello", {
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    status: 200,
  });
  const toUrl = await transformer.transform(
    new HttpResponse("http://test.com/api/test", toUrlResponse.headers, undefined, 200, true),
    toUrlResponse
  );

  assert.equal(toUrl.hasError(), false, toUrl.getError());
  assert.equal(toUrl.hasBody(), true, "Body not appear");
  const urlBody: URLSearchParams = toUrl.getBody();
  assert.equal(urlBody.get("message"), "hello");

  // Blob basic
  const toBlobResponse = new Response("test", {
    headers: new Headers({
      'Content-Type': 'application/test'
    }),
    status: 200,
  });
  const toBlobBasic = await transformer.transform(
    new HttpResponse("http://test.com/api/test", toBlobResponse.headers, undefined, 200, true),
    toBlobResponse
  );

  assert.equal(toBlobBasic.hasError(), false, toBlobBasic.getError());
  assert.equal(toBlobBasic.hasBody(), true, "Body not appear");
  assert.equal(toBlobBasic.getBody() instanceof Blob, true);

  // Text
  const toTextResponse = new Response("test", {
    headers: new Headers({
      'Content-Type': 'text/plain'
    }),
    status: 200,
  });
  const toText = await transformer.transform(
    new HttpResponse("http://test.com/api/test", toTextResponse.headers, undefined, 200, true),
    toTextResponse
  );

  assert.equal(toText.hasError(), false, toText.getError());
  assert.equal(toText.hasBody(), true, "Body not appear");
  assert.equal(toText.getBody(), "test");
});
