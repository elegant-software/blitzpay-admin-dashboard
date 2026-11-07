import { defaultPalette, paletteErrors } from './white-label.models';
describe('White-label color validation', () => {
  it('accepts both platform palettes', () => {
    expect(paletteErrors(defaultPalette(false))).toEqual([]);
    expect(paletteErrors(defaultPalette(true))).toEqual([]);
  });
  it('rejects unreadable text and invisible control borders', () => {
    expect(paletteErrors({...defaultPalette(false), onCard: '#FFFFFF'}).some(v => v.includes('onCard'))).toBeTrue();
    expect(paletteErrors({...defaultPalette(false), border: '#FFFFFF'}).some(v => v.includes('border'))).toBeTrue();
    expect(paletteErrors({...defaultPalette(false), card: 'red'}).some(v => v.includes('card'))).toBeTrue();
  });
});
