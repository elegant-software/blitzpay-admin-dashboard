import { parseTableCode } from './table-code';

describe('parseTableCode', () => {
  it('accepts a code exactly as printed', () => {
    expect(parseTableCode('AB3K7Q')).toBe('AB3K7Q');
  });

  it('ignores case, surrounding space, inner spaces and dashes', () => {
    expect(parseTableCode('  ab3-k7q ')).toBe('AB3K7Q');
    expect(parseTableCode('ab3 k7q')).toBe('AB3K7Q');
  });

  it('takes the code out of a pasted Table Link', () => {
    expect(parseTableCode('https://storefront.example/t/ab3k7q')).toBe('AB3K7Q');
    expect(parseTableCode('/t/AB3K7Q?utm=nfc#top')).toBe('AB3K7Q');
  });

  it('rejects the wrong length', () => {
    expect(parseTableCode('AB3K7')).toBeNull();
    expect(parseTableCode('AB3K7QX')).toBeNull();
  });

  it('rejects characters a Table Code never contains (0, O, 1, I, L)', () => {
    expect(parseTableCode('AB0K7Q')).toBeNull();
    expect(parseTableCode('ABOK7Q')).toBeNull();
    expect(parseTableCode('AB1K7Q')).toBeNull();
    expect(parseTableCode('ABIK7Q')).toBeNull();
    expect(parseTableCode('ABLK7Q')).toBeNull();
  });

  it('rejects empty input and other links', () => {
    expect(parseTableCode('')).toBeNull();
    expect(parseTableCode(null)).toBeNull();
    expect(parseTableCode('https://storefront.example/m/merchant/b/branch')).toBeNull();
  });
});
