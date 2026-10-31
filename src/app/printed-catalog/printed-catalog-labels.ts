// Fixed text printed on a Printed Catalog, in the Catalog Language it is rendered in.

export interface PrintedCatalogLabels {
  uncategorised: string;
  scanToOrder: string;
  discoverOnline: string;
  moreOnline: string;
}

const LABELS: Record<string, PrintedCatalogLabels> = {
  de: {
    uncategorised: 'Sonstiges',
    scanToOrder: 'Scannen & bestellen',
    discoverOnline: 'Entdecke unser Angebot im Online-Katalog.',
    moreOnline: 'Mehr im Online-Katalog – einfach scannen.',
  },
  en: {
    uncategorised: 'Other',
    scanToOrder: 'Scan & order',
    discoverOnline: 'Discover our range in the online catalog.',
    moreOnline: 'More in the online catalog – just scan.',
  },
  fr: {
    uncategorised: 'Autres',
    scanToOrder: 'Scanner & commander',
    discoverOnline: 'Découvrez notre offre dans le catalogue en ligne.',
    moreOnline: 'Plus de choix dans le catalogue en ligne – il suffit de scanner.',
  },
  it: {
    uncategorised: 'Altro',
    scanToOrder: 'Scansiona e ordina',
    discoverOnline: 'Scopri la nostra offerta nel catalogo online.',
    moreOnline: 'Di più nel catalogo online – basta scansionare.',
  },
  es: {
    uncategorised: 'Otros',
    scanToOrder: 'Escanea y pide',
    discoverOnline: 'Descubre nuestra oferta en el catálogo online.',
    moreOnline: 'Más en el catálogo online: solo tienes que escanear.',
  },
  nl: {
    uncategorised: 'Overig',
    scanToOrder: 'Scan & bestel',
    discoverOnline: 'Ontdek ons aanbod in de online catalogus.',
    moreOnline: 'Meer in de online catalogus – gewoon scannen.',
  },
  pl: {
    uncategorised: 'Inne',
    scanToOrder: 'Zeskanuj i zamów',
    discoverOnline: 'Poznaj naszą ofertę w katalogu online.',
    moreOnline: 'Więcej w katalogu online – wystarczy zeskanować.',
  },
  tr: {
    uncategorised: 'Diğer',
    scanToOrder: 'Tara ve sipariş ver',
    discoverOnline: 'Ürünlerimizi çevrimiçi katalogda keşfedin.',
    moreOnline: 'Daha fazlası çevrimiçi katalogda – sadece tarayın.',
  },
  ar: {
    uncategorised: 'أخرى',
    scanToOrder: 'امسح واطلب',
    discoverOnline: 'اكتشف تشكيلتنا في الكتالوج الإلكتروني.',
    moreOnline: 'المزيد في الكتالوج الإلكتروني – فقط امسح الرمز.',
  },
};

/** German without a known language (the pre-International Menu behaviour); English for languages without labels. */
export function printedCatalogLabels(language: string | null | undefined): PrintedCatalogLabels {
  if (!language) return LABELS['de'];
  return LABELS[language] ?? LABELS['en'];
}
