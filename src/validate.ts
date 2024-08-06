import { FormData } from "@cloudflare/workers-types";
import type { Result } from "./types";

const validLangs = [
  "ar",
  "zh",
  "cs",
  "da",
  "nl",
  "en",
  "fi",
  "fr",
  "de",
  "he",
  "id",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "ru",
  "es",
  "sv",
  "tr",
];

export type ValidationError =
  | {
      code: "TEXT_MISSING";
    }
  | {
      code: "TEXT_TOO_SHORT";
      length: number;
    }
  | {
      code: "TEXT_TOO_LONG";
      length: number;
    }
  | {
      code: "LANGS_INCORRECT_LENGTH";
      length: number;
    }
  | {
      code: "LANGS_WRONG_TYPE";
    }
  | {
      code: "LANGS_INVALID";
      invalidLangs: string[];
    };

type ValidationOutput = {
  langs: string[];
  text: string;
};

export const validate = (
  data: URLSearchParams
): Result<ValidationOutput, ValidationError[]> => {
  const errors: ValidationError[] = [];

  const text = data.get("text");
  if (text === null) {
    errors.push({
      code: "TEXT_MISSING",
    });
  } else if (text.length > 200) {
    errors.push({
      code: "TEXT_TOO_LONG",
      length: text.length,
    });
  } else if (text.length < 1) {
    errors.push({
      code: "TEXT_TOO_SHORT",
      length: text.length,
    });
  }

  const langs = data.getAll("language");
  if (langs.length !== 4) {
    errors.push({
      code: "LANGS_INCORRECT_LENGTH",
      length: langs.length,
    });
    errors.push();
  }

  if (!langs.every((l): l is string => typeof l === "string")) {
    errors.push({
      code: "LANGS_WRONG_TYPE",
    });
  } else {
    const invalidLangs = langs.filter((l) => !validLangs.includes(l));

    if (invalidLangs.length > 0) {
      errors.push({
        code: "LANGS_INVALID",
        invalidLangs,
      });
      errors.push();
    }
  }

  return errors.length === 0
    ? {
        success: true,
        data: {
          langs: langs as string[],
          text: text as string,
        },
      }
    : {
        success: false,
        error: errors,
      };
};
