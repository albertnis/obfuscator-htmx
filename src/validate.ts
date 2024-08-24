import { FormData } from "@cloudflare/workers-types";
import type { Result } from "./types";

export const langs = {
  ar: "Arabic",
  zh: "Chinese",
  cs: "Czech",
  da: "Danish",
  nl: "Dutch",
  en: "English",
  fi: "Finnish",
  fr: "French",
  de: "German",
  he: "Hebrew",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  pl: "Polish",
  pt: "Portuguese",
  ru: "Russian",
  es: "Spanish",
  sv: "Swedish",
  tr: "Turkish",
};

export type Language = keyof typeof langs;

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
    }
  | {
      code: "SYNTHETIC_ERROR";
    };

type ValidationOutput = {
  langs: Language[];
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
  } else if (text.length > 100) {
    errors.push({
      code: "TEXT_TOO_LONG",
      length: text.length,
    });
  } else if (text.length < 1) {
    errors.push({
      code: "TEXT_TOO_SHORT",
      length: text.length,
    });
  } else if (text.startsWith("!!!error")) {
    errors.push({
      code: "SYNTHETIC_ERROR",
    });
  }

  const providedLangs = data.getAll("language");
  if (providedLangs.length !== 4) {
    errors.push({
      code: "LANGS_INCORRECT_LENGTH",
      length: providedLangs.length,
    });
    errors.push();
  }

  if (!providedLangs.every((l): l is string => typeof l === "string")) {
    errors.push({
      code: "LANGS_WRONG_TYPE",
    });
  } else {
    const invalidLangs = providedLangs.filter(
      (l) => !Object.keys(langs).includes(l)
    );

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
          langs: providedLangs as Language[],
          text: text as string,
        },
      }
    : {
        success: false,
        error: errors,
      };
};
