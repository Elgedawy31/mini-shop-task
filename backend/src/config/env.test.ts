import { describe, expect, test } from "bun:test";

describe("CORS origin parsing", () => {
  test("splits comma-separated origins", () => {
    const raw = "http://localhost:5000, http://localhost:8081";
    const origins = raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    expect(origins).toEqual(["http://localhost:5000", "http://localhost:8081"]);
  });
});
