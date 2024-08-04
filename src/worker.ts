import { Request } from "@cloudflare/workers-types";
import type { TextAndLanguage } from "./types";
import { translate } from "./translate";
import { validate } from "./validate";

type Results = [
  TextAndLanguage,
  TextAndLanguage,
  TextAndLanguage,
  TextAndLanguage,
  TextAndLanguage
];

const template400 = (errors: string[]) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Obfuscator</title>
  </head>
  <body>
    <ul>
      ${errors.map((e) => `<li>${e}</li>`)}
    </ul>
    <a href="/">Do another Obfuscation</a>
  </body>
</html>
`;

const template200 = (rs: Results) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Obfuscator</title>
  </head>
  <body>
    <div id="results">
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

const fetch = async (req: Request, env: any): Promise<Response> => {
  const url = new URL(req.url);

  // POST /obfuscation
  if (url.pathname.startsWith("/obfuscation") && req.method === "POST") {
    const data = await req.formData();

    const validation = validate(data);

    if (!validation.valid) {
      return new Response(template400(validation.errors), {
        status: 400,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    const { langs, text } = validation;

    langs.push(langs[0]);

    const results: TextAndLanguage[] = [
      {
        language: langs[0],
        text,
      },
    ];

    for (let i = 1; i <= langs.length; i++) {
      const source: TextAndLanguage = results[i - 1];
      const destLang = langs[i];

      const dest = await translate(source, destLang);

      results[i] = dest;
    }

    const html = template200(results as Results);

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return env.ASSETS.fetch(req);
};

export const worker = {
  fetch,
};
