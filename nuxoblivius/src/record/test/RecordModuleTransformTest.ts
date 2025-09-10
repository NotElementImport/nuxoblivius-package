import { test } from "node:test";
import * as assert from "node:assert";

import { PaginationRecordModule } from "../infrastructure/recordModule/PaginationRecordModule.js";
import { CacheRecordModule } from "../infrastructure/recordModule/CacheRecordModule.js";
import { PageType } from "../../pagination/infrastructure/paginationType/PageType.js";
import { QueryParams } from "../domain/valueObject/QueryParams.js";
import { PathParams } from "../domain/valueObject/PathParams.js";
import { HttpResponse } from "../domain/valueObject/HttpResponse.js";

test("record/intrastructure/recordModule/PaginationRecordModule: Behaviour", () => {
  const paginator = new PageType();
  const recordModule = new PaginationRecordModule({
    paginator,
    updateMeta: (paginator, ctx) => {
      const currentPage = ctx.response.getValueFromTransfer(
        "page",
        paginator.getCurrent()
      );

      const perPage = ctx.response.getValueFromTransfer(
        "perPage",
        paginator.getMeta().perPage
      );

      const lastPage = ctx.response.getValueFromTransfer(
        "lastPage",
        paginator.getMeta().lastPage
      );

      paginator.setMeta({
        page: currentPage,
        perPage: perPage,
        lastPage: lastPage
      }, { noEmit: true });
    },
    pageName: "page"
  });

  // Check before request
  const requestQueryParams = new QueryParams({});

  recordModule.onSetup();
  recordModule.beforeRequest({
    headers: new Headers(), // Request headers
    options: { method: "GET" },
    queryParams: requestQueryParams,
    pathParams: new PathParams({}),
    url: "/test/url"
  });

  assert.equal(
    requestQueryParams.get("page"), 1
  );

  // Check after request
  recordModule.afterRequest({
    headers: new Headers({}), // Response headers
    options: { method: "GET" },
    pathParams: new PathParams({}),
    queryParams: requestQueryParams,
    response: new HttpResponse({
      headers: new Headers({}),
      status: 200,
      dataTransfer: {
        page: 2,
        perPage: 15,
        lastPage: 6,
      }
    }),
    url: "/test/url"
  });

  const {
    page: paginatorPage,
    perPage: paginatorPerPage,
    lastPage: paginatorLastPage,
  } = paginator.getMeta();

  assert.equal(
    paginatorPage, 2
  );

  assert.equal(
    paginator.getCurrent(), 2
  );

  assert.equal(
    paginatorPerPage, 15
  );

  assert.equal(
    paginatorLastPage, 6
  );

  // Check clean
  recordModule.onClean();

  assert.equal(
    paginator.getCurrent(),
    1
  );
});

test("record/intrastructure/recordModule/CacheRecordModule: Behaviour", () => {
  const recordModule = new CacheRecordModule({});

  // Check before request:
  recordModule.onSetup();

  const requestPathParams = new PathParams({});
  const requestQueryParams = new QueryParams({});
  const requestUrl = "/api/test";
  const requestOptions = {
    method: "GET",
    headers: new Headers({
      'Cached': "True",
    })
  };

  const responseBefore = recordModule.beforeRequest({
    headers: requestOptions.headers,
    options: requestOptions,
    pathParams: requestPathParams,
    queryParams: requestQueryParams,
    url: requestUrl
  });

  assert.equal(typeof responseBefore, "undefined");

  // Check after request:
  recordModule.afterRequest({
    headers: new Headers(),
    options: requestOptions,
    pathParams: requestPathParams,
    queryParams: requestQueryParams,
    url: requestUrl,
    response: new HttpResponse({
      headers: new Headers(),
      status: 200,
      body: "Message",
      dataTransfer: {}
    })
  });

  const responseAfter = recordModule.beforeRequest({
    headers: requestOptions.headers,
    options: requestOptions,
    pathParams: requestPathParams,
    queryParams: requestQueryParams,
    url: requestUrl
  });

  assert.equal(responseAfter instanceof HttpResponse, true);
  // @ts-ignore
  assert.equal(responseAfter.getData(), "Message");

  // Check clean:
  recordModule.onClean();

  const responseClean = recordModule.beforeRequest({
    headers: requestOptions.headers,
    options: requestOptions,
    pathParams: requestPathParams,
    queryParams: requestQueryParams,
    url: requestUrl
  });

  assert.equal(typeof responseClean, "undefined");
});
