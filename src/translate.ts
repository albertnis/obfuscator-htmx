import type { TextAndLanguage } from "./types";

export const translate = async (
  input: TextAndLanguage,
  destinationLanguage: string
): Promise<TextAndLanguage> => {
  if (input.language === destinationLanguage) {
    return {
      language: destinationLanguage,
      text: input.text,
    };
  }

  return {
    text: "translated",
    language: destinationLanguage,
  };
};
