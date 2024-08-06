import type { Ai } from "@cloudflare/workers-types";
import type { Result } from "./types";

export interface TextAndLanguage {
  language: string;
  text: string;
}

export type TranslationResults = TextAndLanguage[];

export type TranslateError =
  | {
      code: "TRANSLATE_TEXT_UNDEFINED";
    }
  | {
      code: "CF_AI_FAILED";
      originalError: unknown;
    };

export const translate =
  (cfAi: Ai) =>
  async (
    input: TextAndLanguage,
    destinationLanguage: string
  ): Promise<Result<TextAndLanguage, TranslateError>> => {
    if (input.language === destinationLanguage) {
      return {
        success: true,
        data: {
          language: destinationLanguage,
          text: input.text,
        },
      };
    }

    let result;
    try {
      result = await cfAi.run("@cf/meta/m2m100-1.2b", {
        text: input.text,
        source_lang: input.language,
        target_lang: destinationLanguage,
      });
    } catch (e) {
      return {
        success: false,
        error: {
          code: "CF_AI_FAILED",
          originalError: e,
        },
      };
    }

    const outputText = result.translated_text;

    if (!outputText) {
      return {
        success: false,
        error: {
          code: "TRANSLATE_TEXT_UNDEFINED",
        },
      };
    }

    return {
      success: true,
      data: {
        text: outputText,
        language: destinationLanguage,
      },
    };
  };
