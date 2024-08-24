import { describe, it, expect } from "bun:test";
import { validate } from "./validate";

describe("validating text", () => {
  describe("when there is no text param", () => {
    const input = new URLSearchParams(
      "language=en&language=pl&language=es&language=fr"
    );

    it("outputs the relevant error", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "TEXT_MISSING" }],
      });
    });
  });

  describe("when the text is too long", () => {
    // 101 characters long
    const input = new URLSearchParams(
      "text=12859278694376849367453896753895738695738963578693576893576891535245473895743895743895437896374896731&language=en&language=pl&language=es&language=fr"
    );

    it("outputs the relevant error including the length", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "TEXT_TOO_LONG", length: 101 }],
      });
    });
  });

  describe("when the text is too short", () => {
    const input = new URLSearchParams(
      "text=&language=en&language=pl&language=es&language=fr"
    );

    it("outputs the relevant error including the length", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "TEXT_TOO_SHORT", length: 0 }],
      });
    });
  });

  describe("when the text starts with a specific substring", () => {
    const input = new URLSearchParams(
      "text=!!!errorTheRestHere&language=en&language=pl&language=es&language=fr"
    );

    it("outputs the a synthetic error for testing and demonstration purposes", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "SYNTHETIC_ERROR" }],
      });
    });
  });
});

describe("validating languages", () => {
  describe("when there are too many languages", () => {
    const input = new URLSearchParams(
      "text=input&language=en&language=pl&language=es&language=fr&language=it"
    );

    it("outputs the relevant error including the number of languages", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "LANGS_INCORRECT_LENGTH", length: 5 }],
      });
    });
  });

  describe("when there are too few languages", () => {
    const input = new URLSearchParams("text=input");

    it("outputs the relevant error including the number of languages", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "LANGS_INCORRECT_LENGTH", length: 0 }],
      });
    });
  });

  describe("when a language does not match a known language code", () => {
    const input = new URLSearchParams(
      "text=input&language=en&language=pl&language=es&language=xxxxxx"
    );

    it("outputs the relevant error including the invalid language code", () => {
      const output = validate(input);

      expect(output).toEqual({
        success: false,
        error: [{ code: "LANGS_INVALID", invalidLangs: ["xxxxxx"] }],
      });
    });
  });
});

describe("when multiple validation issues are present", () => {
  const input = new URLSearchParams(
    "text=&language=wowee&language=pl&language=xxxxxx"
  );

  it("includes them all in the response", () => {
    const output = validate(input);

    expect(output).toEqual({
      success: false,
      error: [
        { code: "TEXT_TOO_SHORT", length: 0 },
        { code: "LANGS_INCORRECT_LENGTH", length: 3 },
        { code: "LANGS_INVALID", invalidLangs: ["wowee", "xxxxxx"] },
      ],
    });
  });
});
