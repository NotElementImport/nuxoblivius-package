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
    new HttpResponse({ headers: toJsonResponse.headers, status: 200 }),
    toJsonResponse
  );

  assert.equal(toJson.isOk(), true, toJson.getData());
  assert.equal(toJson.hasData(), true, "Body not appear");
  // @ts-ignore
  assert.equal(toJson.getData()?.message, "hello");

  // UrlEncoded check
  const toUrlResponse = new Response("message=hello", {
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    status: 200,
  });
  const toUrl = await transformer.transform(
    new HttpResponse({ headers: toUrlResponse.headers, status: 200 }),
    toUrlResponse
  );

  assert.equal(toUrl.isOk(), true, toUrl.getData());
  assert.equal(toUrl.hasData(), true, "Body not appear");
  assert.equal(toUrl.getData<URLSearchParams>().get("message"), "hello");

  // Text
  const toTextResponse = new Response("test", {
    headers: new Headers({
      'Content-Type': 'text/plain'
    }),
    status: 200,
  });
  const toText = await transformer.transform(
    new HttpResponse({ headers: toTextResponse.headers, status: 200 }),
    toTextResponse
  );

  assert.equal(toText.isOk(), true, toText.getData());
  assert.equal(toText.hasData(), true, "Body not appear");
  assert.equal(toText.getData<string>(), "test");
});
