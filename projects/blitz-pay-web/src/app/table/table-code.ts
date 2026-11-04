/** Table Codes use this alphabet: no 0/O, 1/I or L, so a code read aloud or typed from a sticker is unambiguous. */
export const TABLE_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const TABLE_CODE_LENGTH = 6;

const TABLE_CODE = new RegExp(`^[${TABLE_CODE_ALPHABET}]{${TABLE_CODE_LENGTH}}$`);

/**
 * Turns what a guest typed or pasted into a Table Code, or null when it cannot be one.
 * Accepts the bare code in any case, with spaces or dashes ("ab3-k7q"), or a whole Table Link (".../t/AB3K7Q").
 */
export function parseTableCode(input: string | null | undefined): string | null {
  if (!input) return null;
  let value = input.trim();
  const link = /\/t\/([^/?#\s]+)/i.exec(value);
  if (link) value = link[1];
  try {
    value = decodeURIComponent(value);
  } catch { /* keep the raw value; it simply fails validation below */ }
  const code = value.replace(/[\s-]/g, '').toUpperCase();
  return TABLE_CODE.test(code) ? code : null;
}
