import { Translation } from 'primeng/api';

export const ADMIN_PRIME_LOCALES: Readonly<Record<string, Translation>> = {
  de: {
    startsWith: 'Beginnt mit', contains: 'Enthält', notContains: 'Enthält nicht', endsWith: 'Endet mit',
    equals: 'Gleich', notEquals: 'Ungleich', noFilter: 'Kein Filter', clear: 'Zurücksetzen', apply: 'Anwenden',
    matchAll: 'Alle Bedingungen', matchAny: 'Eine Bedingung', addRule: 'Regel hinzufügen', removeRule: 'Regel entfernen',
    accept: 'Ja', reject: 'Nein', choose: 'Auswählen', upload: 'Hochladen', cancel: 'Abbrechen',
    emptyMessage: 'Keine Ergebnisse', emptyFilterMessage: 'Keine passenden Ergebnisse',
    searchMessage: '{0} Ergebnisse verfügbar', selectionMessage: '{0} Einträge gewählt',
    emptySelectionMessage: 'Keine Auswahl', emptySearchMessage: 'Keine Ergebnisse',
    dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
    dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'], dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    today: 'Heute', weekHeader: 'KW', firstDayOfWeek: 1,
    aria: {
      close: 'Schließen', previous: 'Zurück', next: 'Weiter', navigation: 'Navigation',
      selectAll: 'Alle auswählen', unselectAll: 'Auswahl aufheben',
      pageLabel: 'Seite {page}', firstPageLabel: 'Erste Seite', lastPageLabel: 'Letzte Seite',
      nextPageLabel: 'Nächste Seite', prevPageLabel: 'Vorherige Seite', previousPageLabel: 'Vorherige Seite',
      rowsPerPageLabel: 'Zeilen pro Seite', jumpToPageDropdownLabel: 'Seite wählen', jumpToPageInputLabel: 'Seitennummer eingeben',
      showFilterMenu: 'Filter öffnen', hideFilterMenu: 'Filter schließen', filterOperator: 'Filteroperator',
      filterConstraint: 'Filterbedingung', selectRow: 'Zeile wählen', unselectRow: 'Zeilenauswahl aufheben',
      expandRow: 'Zeile erweitern', collapseRow: 'Zeile einklappen',
    }
  },
  ar: {
    startsWith: 'يبدأ بـ', contains: 'يحتوي على', notContains: 'لا يحتوي على', endsWith: 'ينتهي بـ',
    equals: 'يساوي', notEquals: 'لا يساوي', noFilter: 'دون تصفية', clear: 'مسح', apply: 'تطبيق',
    matchAll: 'جميع الشروط', matchAny: 'أي شرط', addRule: 'إضافة شرط', removeRule: 'إزالة شرط',
    accept: 'نعم', reject: 'لا', choose: 'اختيار', upload: 'رفع', cancel: 'إلغاء',
    emptyMessage: 'لا توجد نتائج', emptyFilterMessage: 'لا توجد نتائج مطابقة',
    searchMessage: 'عدد النتائج المتاحة: {0}', selectionMessage: 'عدد العناصر المحددة: {0}',
    emptySelectionMessage: 'لم يتم تحديد عناصر', emptySearchMessage: 'لا توجد نتائج',
    dayNames: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
    dayNamesShort: ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'], dayNamesMin: ['ح','ن','ث','ر','خ','ج','س'],
    monthNames: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    monthNamesShort: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    today: 'اليوم', weekHeader: 'أسبوع', firstDayOfWeek: 6,
    aria: {
      close: 'إغلاق', previous: 'السابق', next: 'التالي', navigation: 'التنقل',
      selectAll: 'تحديد الكل', unselectAll: 'إلغاء تحديد الكل',
      pageLabel: 'الصفحة {page}', firstPageLabel: 'الصفحة الأولى', lastPageLabel: 'الصفحة الأخيرة',
      nextPageLabel: 'الصفحة التالية', prevPageLabel: 'الصفحة السابقة', previousPageLabel: 'الصفحة السابقة',
      rowsPerPageLabel: 'الصفوف لكل صفحة', jumpToPageDropdownLabel: 'اختيار الصفحة', jumpToPageInputLabel: 'إدخال رقم الصفحة',
      showFilterMenu: 'إظهار قائمة التصفية', hideFilterMenu: 'إخفاء قائمة التصفية', filterOperator: 'عامل التصفية',
      filterConstraint: 'شرط التصفية', selectRow: 'تحديد الصف', unselectRow: 'إلغاء تحديد الصف',
      expandRow: 'توسيع الصف', collapseRow: 'طي الصف',
    }
  }
};
