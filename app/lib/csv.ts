const FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

export function escapeCsvCell(value: unknown): string {
  let text = value == null ? '' : String(value);

  // Excel and other spreadsheet apps may execute cells beginning with these
  // characters as formulas. Prefixing an apostrophe keeps exported AI/user
  // content as inert text when the CSV is opened.
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  return `\uFEFF${[headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')}`;
}
