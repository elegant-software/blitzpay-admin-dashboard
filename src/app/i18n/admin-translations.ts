import { PAGE_TRANSLATIONS } from './page-translations';

/** English source strings are the fallback for any untranslated interface text. */
export const ADMIN_TRANSLATIONS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  en: {
    'Diese Filiale hat keine aktiven Produkte – es gibt nichts zu drucken.': 'This branch has no active products to print.'
  },
  de: {
    ...Object.fromEntries(PAGE_TRANSLATIONS.map(([source, german]) => [source, german])),
    'Admin Panel': 'Verwaltung', 'Workspace': 'Arbeitsbereich', 'Dashboard': 'Dashboard',
    'Operations': 'Betrieb', 'Merchants': 'Händler', 'Appointments': 'Termine', 'Orders': 'Bestellungen',
    'User Management': 'Benutzerverwaltung', 'Finance': 'Finanzen', 'Settlements': 'Abrechnungen',
    'Main navigation': 'Hauptnavigation', 'Primary': 'Hauptbereich', 'Close navigation': 'Navigation schließen',
    'Toggle navigation': 'Navigation umschalten', 'Expand sidebar': 'Seitenleiste ausklappen',
    'Collapse sidebar': 'Seitenleiste einklappen', 'Log out': 'Abmelden',
    'Switch to dark mode': 'Dunklen Modus aktivieren', 'Switch to light mode': 'Hellen Modus aktivieren',
    'Internal operations dashboard': 'Internes Verwaltungsdashboard', 'ZackPay Admin Panel': 'ZackPay Verwaltung',
    'Language': 'Sprache', 'Loading languages…': 'Sprachen werden geladen…', 'Retry': 'Erneut versuchen',
    'No interface languages are available. English is being used.': 'Keine Oberflächensprachen verfügbar. Englisch wird verwendet.',
    'Could not load languages. English is being used.': 'Sprachen konnten nicht geladen werden. Englisch wird verwendet.'
  },
  ar: {
    ...Object.fromEntries(PAGE_TRANSLATIONS.map(([source, , arabic]) => [source, arabic])),
    'Admin Panel': 'لوحة الإدارة', 'Workspace': 'مساحة العمل', 'Dashboard': 'لوحة التحكم',
    'Operations': 'العمليات', 'Merchants': 'التجار', 'Appointments': 'المواعيد', 'Orders': 'الطلبات',
    'User Management': 'إدارة المستخدمين', 'Finance': 'الشؤون المالية', 'Settlements': 'التسويات',
    'Main navigation': 'التنقل الرئيسي', 'Primary': 'القائمة الرئيسية', 'Close navigation': 'إغلاق القائمة',
    'Toggle navigation': 'تبديل القائمة', 'Expand sidebar': 'توسيع الشريط الجانبي',
    'Collapse sidebar': 'طي الشريط الجانبي', 'Log out': 'تسجيل الخروج',
    'Switch to dark mode': 'التبديل إلى الوضع الداكن', 'Switch to light mode': 'التبديل إلى الوضع الفاتح',
    'Internal operations dashboard': 'لوحة العمليات الداخلية', 'ZackPay Admin Panel': 'لوحة إدارة ZackPay',
    'Language': 'اللغة', 'Loading languages…': 'جارٍ تحميل اللغات…', 'Retry': 'إعادة المحاولة',
    'No interface languages are available. English is being used.': 'لا توجد لغات متاحة للواجهة. يتم استخدام الإنجليزية.',
    'Could not load languages. English is being used.': 'تعذّر تحميل اللغات. يتم استخدام الإنجليزية.'
  }
};
