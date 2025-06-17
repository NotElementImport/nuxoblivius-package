import { test } from "node:test";
import * as assert from "node:assert";

import { CacheController } from "../interface/CacheController.js";
import { CacheRecord } from "../domain/valueObject/CacheRecord.js";
import { CacheQuery } from "../domain/valueObject/CacheQuery.js";

test("cache/interface/CacheController: Write", () => {
  const instance = new CacheController();

  instance.write(new CacheRecord({
    url: "/test"
  }));

  assert.equal(
    instance.count(), 1
  );
});

test("cache/interface/CacheController: Write Async", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test2",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test3"
    }))
  ]);

  assert.equal(
    instance.count(), 3
  );
});

test("cache/interface/CacheController: Read", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=en",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=ru"
    }))
  ]);

  const record = instance.read(new CacheQuery({
    query: /translate=ru/
  }));

  assert.equal(
    record?.getPath() ?? "", "/test1?expand=user,translate&translate=ru"
  );
});

test("cache/interface/CacheController: ReadAsync", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=en",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=ru"
    }))
  ]);

  const response: CacheRecord[] = await Promise.all([
    instance.readAsync(new CacheQuery({
      query: /translate=ru/
    })),
    instance.readAsync(new CacheQuery({
      query: /translate=en/
    }))
  ]);

  assert.equal(
    response[0]?.getPath() ?? "", "/test1?expand=user,translate&translate=ru"
  );

  assert.equal(
    response[1]?.getPath() ?? "", "/test1?expand=user,translate&translate=en"
  );
});

test("cache/interface/CacheController: ReadAll", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=en",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?expand=user,translate&translate=ru"
    }))
  ]);

  const records = instance.readAll(new CacheQuery({
    query: /expand=user,translate/
  }));

  assert.equal(
    records.length, 2
  );
});

test("cache/interface/CacheController: Complex Read", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1?page=1&translate=en",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?page=2&translate=en",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?page=1&translate=ru",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?page=1&translate=ru&short=true",
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1?page=1&translate=en&short=true",
    }))
  ]);

  const recordWithShort = instance.read(new CacheQuery({
    url: "/test1",
    query: CacheQuery.andRegExp(
      /short=true/, /translate=ru/
    )
  }));

  assert.equal(
    recordWithShort?.getPath() ?? "", "/test1?page=1&translate=ru&short=true"
  );

  const recordPage1En = instance.read(new CacheQuery({
    url: "/test1",
    query: CacheQuery.andRegExp(
      /page=1/, /translate=en/
    )
  }));

  assert.equal(
    recordPage1En?.getPath() ?? "", "/test1?page=1&translate=en"
  );
});

test("cache/interface/CacheController: Headers Read", async () => {
  const instance = new CacheController();

  await Promise.all([
    instance.writeAsync(new CacheRecord({
      url: "/test1",
      headers: {
        "Language": "ru"
      }
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
      headers: {
        "Language": "en",
        "Content-Type": "application/json",
      }
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
      headers: {
        "Content-Type": "application/json",
        "Language": "ru",
        "Cache": "84000",
      }
    })),
    instance.writeAsync(new CacheRecord({
      url: "/test1",
      headers: {
        "Content-Type": "application/xml",
        "Language": "en",
        "Cache": "84000",
      }
    })),
  ]);

  const instanceXmlEn = instance.read(new CacheQuery({
    headers: CacheQuery.andRegExp(
      /Content-Type: application\/xml/, /Language: en/
    )
  }));

  assert.equal(!!instanceXmlEn, true);

  const instanceXmlRu = instance.read(new CacheQuery({
    headers: CacheQuery.andRegExp(
      /Content-Type: application\/xml/, /Language: ru/
    )
  }));

  assert.equal(!!instanceXmlRu, false);
});

