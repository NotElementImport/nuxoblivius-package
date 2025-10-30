import { expect, test } from "vitest";
import { SerializeBridge } from "../../main/src/Serialize/bridges/SerializeBridge.js";
import { TransferBox } from "../../main/src/Serialize/boxes/TransferBox.js";

test("Check: Work", () => {
  const box = new TransferBox(new SerializeBridge());

  box.set("number", 10);

  expect(box.get("number")).toBe(10);
});

test("Check: encode", async () => {
  const box = new TransferBox(new SerializeBridge());

  box.set("number", 10);

  const boxEncoded = await box.encode();

  expect(boxEncoded.number._value).toBe(10);
});

test("Check: decode", () => {
  const box = new TransferBox(new SerializeBridge());

  box.decode({
    number: {
      _type: "_*",
      _value: 10
    }
  });

  expect(box.get("number")).toBe(10);
});
