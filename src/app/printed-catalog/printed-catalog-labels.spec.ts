import { printedCatalogLabels } from './printed-catalog-labels';

describe('printedCatalogLabels', () => {
  it('keeps the German labels for German', () => {
    expect(printedCatalogLabels('de').scanToOrder).toBe('Scannen & bestellen');
    expect(printedCatalogLabels('de').uncategorised).toBe('Sonstiges');
  });

  it('localises labels for supported languages', () => {
    expect(printedCatalogLabels('en').uncategorised).toBe('Other');
    expect(printedCatalogLabels('fr').scanToOrder).toBe('Scanner & commander');
  });

  it('falls back to English for languages without printed labels', () => {
    expect(printedCatalogLabels('ja')).toEqual(printedCatalogLabels('en'));
  });

  it('uses German when no language is known', () => {
    expect(printedCatalogLabels(undefined)).toEqual(printedCatalogLabels('de'));
  });
});
