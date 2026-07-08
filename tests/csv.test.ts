import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsv, escapeCsvCell } from '../app/lib/csv';

test('CSV escaping quotes delimiters and neutralizes spreadsheet formulas', () => {
  assert.equal(escapeCsvCell('Acme, "Korea"'), '"Acme, ""Korea"""');
  for (const value of ['=1+1', '+cmd', '-2+3', '@SUM(A1)', '  =HYPERLINK("x")']) {
    assert.equal(escapeCsvCell(value), `"'${value.replace(/"/g, '""')}"`);
  }
});

test('CSV output uses a UTF-8 BOM and CRLF rows', () => {
  assert.equal(buildCsv(['Name'], [['회사']]), '\uFEFF"Name"\r\n"회사"');
});
