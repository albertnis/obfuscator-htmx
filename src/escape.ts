/**
 * @param unsafeHtml HTML possibly containing unsafe characters like `<` and `>`
 * @returns HTML with such characters replaced by corresponding character codes
 */
export const escapeUnsafeHtml = (unsafeHtml: string) =>
  unsafeHtml
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
