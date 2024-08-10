import type { TranslateError, TranslationResults } from "./translate";
import { langs, type ValidationError } from "./validate";

const head = `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Obfuscator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Radio+Canada+Big:ital,wght@0,400..700;1,400..700&display=swap"
    rel="stylesheet"
  />
  <link rel="stylesheet" href="./style.css" />
</head>`;

const buildValidationErrorMessage = (error: ValidationError): string => {
  switch (error.code) {
    case "TEXT_MISSING":
      return "Must provide text (none provided)";
    case "TEXT_TOO_SHORT":
      return `Text must at least 1 character long (${error.length} characters provided)`;
    case "TEXT_TOO_LONG":
      return `Text must be no more than 100 characters long (${error.length} characters provided)`;
    case "LANGS_INCORRECT_LENGTH":
      return `Must provide 4 languages (${error.length} provided)`;
    case "LANGS_WRONG_TYPE":
      return "All languages must be strings";
    case "LANGS_INVALID":
      return `Invalid languages provided (${error.invalidLangs.join(", ")})`;
    case "SYNTHETIC_ERROR":
      return 'An error was deliberately triggered by providing input starting with "!!!error"';
  }
};

const validationErrorResponseTemplate = (
  errors: ValidationError[]
) => `<!DOCTYPE html>
<html lang="en">
  ${head}
  <body>
    <div id="result">
      <div class="result-content result-error">
        <details>
        <summary>A validation error occurred</summary>
        <p>The following validation errors were encountered:</p>
        <ul>
          ${errors.map((e) => `<li>${buildValidationErrorMessage(e)}</li>`)}
        </ul>
        </details>
      </div>
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
      return "Translation failed. This site runs on the free tier of CloudFlare Workers AI and is subject to rate limits and daily quotas. Try again in a few minutes. If that fails, try again in 24 hours.";
    case "TRANSLATE_TEXT_UNDEFINED":
      return "Translation returned no text";
  }
};

const translationErrorResponseTemplate = (
  error: TranslateError
) => `<!DOCTYPE html>
<html lang="en">
  ${head}
  <body>
    <div id="result">
      <div class="result-content result-error">
        <details>
          <summary>A translation error occurred</summary>
          <p>${buildTranslationErrorMessage(error)}</p>
        </details>
      </div>
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
    ${head}
    <body>
      <div id="result">
        <div class="result-content">
          <span class="result-label">The result:</span>
          <details>
            <summary>${rs[4].text}</summary>

            <ol>
              <li><span class="result-lang">${langs[rs[0].language]}</span> ${
  rs[0].text
}</li>
              <li><span class="result-lang">${langs[rs[1].language]}</span> ${
  rs[1].text
}</li>
              <li><span class="result-lang">${langs[rs[2].language]}</span> ${
  rs[2].text
}</li>
              <li><span class="result-lang">${langs[rs[3].language]}</span> ${
  rs[3].text
}</li>
              <li><b><span class="result-lang">${
                langs[rs[4].language]
              }</span> ${rs[4].text}</b></li>
            </ol>
          </details>
        </div>
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
