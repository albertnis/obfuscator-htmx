import { FormData } from "@cloudflare/workers-types";

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

type ValidationOutput =
  | {
      valid: true;
      langs: string[];
      text: string;
    }
  | { valid: false; errors: string[] };

export const validate = (data: FormData): ValidationOutput => {
  const errors: string[] = [];

  const text = data.get("text");
  if (text === null) {
    errors.push("Must provide text (none provided)");
  } else if (text.length > 200) {
    errors.push(
      `Text must be no more than 200 characters long (${text.length} characters provided)`
    );
  } else if (text.length < 1) {
    errors.push(
      `Text must at least 1 character long (${text.length} characters provided)`
    );
  }

  const langs = data.getAll("language");
  if (langs.length !== 4) {
    errors.push(`Must provide 4 languages (${langs.length} provided)`);
  }

  if (!langs.every((l): l is string => typeof l === "string")) {
    errors.push("All languages must be strings");
  } else {
    const invalidLangs = langs.filter((l) => !validLangs.includes(l));

    if (invalidLangs.length > 0) {
      errors.push(`Invalid languages provided (${invalidLangs.join(", ")})`);
    }
  }

  return errors.length === 0
    ? {
        valid: true,
        langs: langs as string[],
        text: text as string,
      }
    : {
        valid: false,
        errors,
      };
};
