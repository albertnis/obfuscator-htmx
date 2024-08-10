import { Request } from "@cloudflare/workers-types";
import {
  translate,
  type TextAndLanguage,
  type TranslationResults,
} from "./translate";
import { validate } from "./validate";
import {
  buildSuccessResponse,
  buildTranslationErrorResponse,
  buildValidationErrorResponse,
} from "./response";
import { escapeUnsafeHtml } from "./escape";

const fetch = async (req: Request, env: any): Promise<Response> => {
  const url = new URL(req.url);

  // GET /obfuscation
  if (url.pathname.startsWith("/obfuscation") && req.method === "GET") {
    const data = url.searchParams;

    const validation = validate(data);

    if (!validation.success) {
      return buildValidationErrorResponse(validation.error);
    }

    const { langs, text } = validation.data;

    langs.push(langs[0]);

    const results: TranslationResults = [
      {
        language: langs[0],
        text,
      },
    ];

    const translateAi = translate(env.AI);

    for (let i = 1; i < langs.length; i++) {
      const source: TextAndLanguage = results[i - 1];
      const destLang = langs[i];

      const result = await translateAi(source, destLang);

      if (result.success) {
        results[i] = result.data;
      } else {
        return buildTranslationErrorResponse(result.error);
      }
    }

    const sanitisedResults: TranslationResults = results.map(
      ({ text, ...rest }) => ({ text: escapeUnsafeHtml(text), ...rest })
    );

    return buildSuccessResponse(sanitisedResults);
  }

  return env.ASSETS.fetch(req);
};

export const worker = {
  fetch,
};
