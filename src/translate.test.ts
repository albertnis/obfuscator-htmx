import type { Ai, AiTranslationOutput } from "@cloudflare/workers-types";
import { mock, afterEach, describe, it, expect } from "bun:test";
import { translate, type TextAndLanguage } from "./translate";
import type { Language } from "./validate";

describe("when the input language is the same as the destination language", () => {
  const mockAi: Ai = {
    run: mock(),
  };

  const input: TextAndLanguage = {
    language: "cs",
    text: "Input",
  };

  const destinationLanguage: Language = "cs";

  it("uses the input text directly as the output text", async () => {
    const output = await translate(mockAi)(input, destinationLanguage);

    expect(output).toEqual({
      success: true,
      data: {
        text: "Input",
        language: "cs",
      },
    });
  });

  it("does not call CloudFlare Workers AI", async () => {
    await translate(mockAi)(input, destinationLanguage);

    expect(mockAi.run).not.toBeCalled();
  });
});

describe("when CloudFlare Workers AI encounters an error when performing the translation", () => {
  const error = new Error("Error");
  const mockAi: Ai = {
    run: mock(async () => {
      throw error;
    }),
  };

  const input: TextAndLanguage = {
    language: "cs",
    text: "Input",
  };

  const destinationLanguage: Language = "en";

  it("returns an object indicating the nature of the failure with the original error", async () => {
    const output = await translate(mockAi)(input, destinationLanguage);

    expect(output).toEqual({
      success: false,
      error: {
        code: "CF_AI_FAILED",
        originalError: error,
      },
    });
  });
});

describe("when CloudFlare Workers AI returns no translated text", () => {
  const error = new Error("Error");
  const mockAi: Ai = {
    run: mock(
      async () =>
        ({
          translated_text: undefined,
        } satisfies AiTranslationOutput as any)
    ),
  };

  const input: TextAndLanguage = {
    language: "cs",
    text: "Input",
  };

  const destinationLanguage: Language = "en";

  it("returns an object indicating the nature of the failure", async () => {
    const output = await translate(mockAi)(input, destinationLanguage);

    expect(output).toEqual({
      success: false,
      error: {
        code: "TRANSLATE_TEXT_UNDEFINED",
      },
    });
  });
});

describe("when CloudFlare Workers AI returns translated text", () => {
  const mockAi: Ai = {
    run: mock(
      async () =>
        ({
          translated_text: "Output",
        } satisfies AiTranslationOutput as any)
    ),
  };

  const input: TextAndLanguage = {
    language: "cs",
    text: "Input",
  };

  const destinationLanguage: Language = "en";

  it("returns the translated text in the output", async () => {
    const output = await translate(mockAi)(input, destinationLanguage);

    expect(output).toEqual({
      success: true,
      data: {
        text: "Output",
        language: "en",
      },
    });
  });
});
