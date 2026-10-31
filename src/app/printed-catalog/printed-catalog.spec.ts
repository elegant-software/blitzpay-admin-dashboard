import { Product } from '../models/merchant-catalog.models';
import {
  CATEGORY_SHOWCASE_LIMIT,
  UNCATEGORISED_SECTION_TITLE,
  buildCategoryShowcase,
  buildFullCatalog
} from './printed-catalog';

let seq = 0;
function product(overrides: Partial<Product>): Product {
  seq += 1;
  return {
    productId: `p-${seq}`,
    merchantId: 'm-1',
    branchId: 'b-1',
    name: `Product ${seq}`,
    description: null,
    unitPrice: 1,
    imageUrl: null,
    active: true,
    status: 'ACTIVE',
    categoryId: null,
    categoryName: null,
    productCode: null,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    ...overrides
  };
}

const names = (items: Product[]) => items.map((p) => p.name);

describe('buildFullCatalog', () => {
  it('returns no sections for no products', () => {
    expect(buildFullCatalog([])).toEqual([]);
  });

  it('excludes inactive products', () => {
    const sections = buildFullCatalog([
      product({ name: 'Latte', categoryId: 'c1', categoryName: 'Coffee' }),
      product({ name: 'Mocha', categoryId: 'c1', categoryName: 'Coffee', active: false })
    ]);
    expect(names(sections[0].products)).toEqual(['Latte']);
  });

  it('groups by category alphabetically and sorts products by name within each group', () => {
    const sections = buildFullCatalog([
      product({ name: 'Latte', categoryId: 'c1', categoryName: 'Coffee' }),
      product({ name: 'Brownie', categoryId: 'c2', categoryName: 'Cakes' }),
      product({ name: 'Americano', categoryId: 'c1', categoryName: 'Coffee' }),
      product({ name: 'apple pie', categoryId: 'c2', categoryName: 'Cakes' })
    ]);
    expect(sections.map((s) => s.title)).toEqual(['Cakes', 'Coffee']);
    expect(names(sections[0].products)).toEqual(['apple pie', 'Brownie']);
    expect(names(sections[1].products)).toEqual(['Americano', 'Latte']);
  });

  it('puts uncategorised products in a final section', () => {
    const sections = buildFullCatalog([
      product({ name: 'Gift Card' }),
      product({ name: 'Latte', categoryId: 'c1', categoryName: 'Coffee' })
    ]);
    expect(sections.map((s) => s.title)).toEqual(['Coffee', UNCATEGORISED_SECTION_TITLE]);
    expect(names(sections[1].products)).toEqual(['Gift Card']);
  });

  it('drops a category whose products are all inactive', () => {
    const sections = buildFullCatalog([
      product({ name: 'Mocha', categoryId: 'c1', categoryName: 'Coffee', active: false })
    ]);
    expect(sections).toEqual([]);
  });
});

describe('buildCategoryShowcase', () => {
  it('returns no entries and no overflow for no products', () => {
    expect(buildCategoryShowcase([])).toEqual({ entries: [], hasMoreCategories: false });
  });

  it('picks the alphabetically first active product with an image as the representative', () => {
    const showcase = buildCategoryShowcase([
      product({ name: 'Latte', categoryId: 'c1', categoryName: 'Coffee', imageUrl: 'latte.jpg' }),
      product({ name: 'Americano', categoryId: 'c1', categoryName: 'Coffee' }),
      product({ name: 'Cappuccino', categoryId: 'c1', categoryName: 'Coffee', imageUrl: 'cap.jpg' }),
      product({ name: 'Affogato', categoryId: 'c1', categoryName: 'Coffee', imageUrl: 'aff.jpg', active: false })
    ]);
    expect(showcase.entries.length).toBe(1);
    expect(showcase.entries[0].categoryName).toBe('Coffee');
    expect(showcase.entries[0].representative.name).toBe('Cappuccino');
  });

  it('falls back to the alphabetically first active product when none has an image', () => {
    const showcase = buildCategoryShowcase([
      product({ name: 'Tea', categoryId: 'c1', categoryName: 'Drinks' }),
      product({ name: 'Juice', categoryId: 'c1', categoryName: 'Drinks' })
    ]);
    expect(showcase.entries[0].representative.name).toBe('Juice');
  });

  it('excludes uncategorised products', () => {
    const showcase = buildCategoryShowcase([product({ name: 'Gift Card', imageUrl: 'gift.jpg' })]);
    expect(showcase.entries).toEqual([]);
  });

  it('orders categories alphabetically and limits them, flagging the overflow', () => {
    const categories = ['H', 'B', 'G', 'A', 'F', 'C', 'E', 'D'];
    const showcase = buildCategoryShowcase(
      categories.map((c) => product({ name: `${c} item`, categoryId: c, categoryName: c }))
    );
    expect(CATEGORY_SHOWCASE_LIMIT).toBe(6);
    expect(showcase.entries.map((e) => e.categoryName)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(showcase.hasMoreCategories).toBeTrue();
  });

  it('does not flag overflow at exactly the limit', () => {
    const showcase = buildCategoryShowcase(
      ['A', 'B', 'C', 'D', 'E', 'F'].map((c) => product({ categoryId: c, categoryName: c }))
    );
    expect(showcase.entries.length).toBe(6);
    expect(showcase.hasMoreCategories).toBeFalse();
  });
});
