// Selection rules for the Printed Catalog. Pure, front-end only for now — see ADR-0010.
import { Product } from '../models/merchant-catalog.models';

export const CATEGORY_SHOWCASE_LIMIT = 6;
export const UNCATEGORISED_SECTION_TITLE = 'Sonstiges';

export interface FullCatalogSection {
  title: string;
  products: Product[];
}

export interface CategoryShowcaseEntry {
  categoryName: string;
  representative: Product;
}

export interface CategoryShowcase {
  entries: CategoryShowcaseEntry[];
  hasMoreCategories: boolean;
}

export function buildFullCatalog(products: Product[]): FullCatalogSection[] {
  const { categorised, uncategorised } = groupActiveByCategory(products);
  const sections = categorised.map(([title, items]) => ({ title, products: items }));
  return uncategorised.length
    ? [...sections, { title: UNCATEGORISED_SECTION_TITLE, products: uncategorised }]
    : sections;
}

export function buildCategoryShowcase(products: Product[]): CategoryShowcase {
  const { categorised } = groupActiveByCategory(products);
  const entries = categorised
    .slice(0, CATEGORY_SHOWCASE_LIMIT)
    .map(([categoryName, items]) => ({
      categoryName,
      representative: items.find((p) => !!p.imageUrl) ?? items[0]
    }));
  return { entries, hasMoreCategories: categorised.length > CATEGORY_SHOWCASE_LIMIT };
}

const byText = (a: string, b: string) => a.localeCompare(b, 'de', { sensitivity: 'base' });

function groupActiveByCategory(products: Product[]) {
  const active = products.filter((p) => p.active).sort((a, b) => byText(a.name, b.name));
  const groups = new Map<string, Product[]>();
  const uncategorised: Product[] = [];
  for (const p of active) {
    const category = p.categoryName?.trim();
    if (!category) {
      uncategorised.push(p);
      continue;
    }
    groups.set(category, [...(groups.get(category) ?? []), p]);
  }
  const categorised = [...groups.entries()].sort(([a], [b]) => byText(a, b));
  return { categorised, uncategorised };
}
