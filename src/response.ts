import type { TranslateError, TranslationResults } from "./translate";
import type { ValidationError } from "./validate";

const buildValidationErrorMessage = (error: ValidationError): string => {
  switch (error.code) {
    case "TEXT_MISSING":
      return "Must provide text (none provided)";
    case "TEXT_TOO_SHORT":
      return `Text must at least 1 character long (${error.length} characters provided)`;
    case "TEXT_TOO_LONG":
      return `Text must be no more than 200 characters long (${error.length} characters provided)`;
    case "LANGS_INCORRECT_LENGTH":
      return `Must provide 4 languages (${error.length} provided)`;
    case "LANGS_WRONG_TYPE":
      return "All languages must be strings";
    case "LANGS_INVALID":
      return `Invalid languages provided (${error.invalidLangs.join(", ")})`;
  }
};

const validationErrorResponseTemplate = (
  errors: ValidationError[]
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Obfuscator</title>
  </head>
  <body>
    <div id="result">
      <p>The following validation errors were encountered:</p>
      <ul>
        ${errors.map((e) => `<li>${buildValidationErrorMessage(e)}</li>`)}
      </ul>
    </div>
    <a href="/">Do another Obfuscation</a>
  </body>
</html>
`;

export const buildValidationErrorResponse = (
  errors: ValidationError[]
): Response =>
  new Response(validationErrorResponseTemplate(errors), {
    status: 400,
    headers: {
      "Content-Type": "text/html",
    },
  });

const buildTranslationErrorMessage = (error: TranslateError): string => {
  switch (error.code) {
    case "CF_AI_FAILED":
      return "Translation failed. This site runs on the free tier of CloudFlare so may have been limited. Try again in a few minutes or tomorrow.";
    case "TRANSLATE_TEXT_UNDEFINED":
      return "Translation returned no text";
  }
};

const translationErrorResponseTemplate = (
  error: TranslateError
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Obfuscator</title>
  </head>
  <body>
    <div id="result">
      <p>${buildTranslationErrorMessage(error)}</p>
    </div>
    <a href="/">Do another Obfuscation</a>
  </body>
</html>
`;

export const buildTranslationErrorResponse = (error: TranslateError) =>
  new Response(translationErrorResponseTemplate(error), {
    status: 500,
    headers: {
      "Content-Type": "text/html",
    },
  });

const successTemplate = (rs: TranslationResults) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Obfuscator</title>
    </head>
    <body>
      <div id="result">
        <ol>
          <li>(${rs[0].language}) ${rs[0].text}</li>
          <li>(${rs[1].language}) ${rs[1].text}</li>
          <li>(${rs[2].language}) ${rs[2].text}</li>
          <li>(${rs[3].language}) ${rs[3].text}</li>
          <li><b>(${rs[4].language}) ${rs[4].text}</b></li>
        </ol>
      </div>
      <a href="/">Do another Obfuscation</a>
    </body>
  </html>
  `;

export const buildSuccessResponse = (results: TranslationResults) =>
  new Response(successTemplate(results), {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "max-age=3600",
    },
  });
