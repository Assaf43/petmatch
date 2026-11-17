/** Every UI string. Components never contain Hebrew literals; later tasks add keys here. */
export const he = {
  app: {
    name: 'PetMatch',
  },
  nav: {
    findMatch: 'מצאו התאמה',
  },
  home: {
    title: 'מצאו את האוכל המתאים לכלב שלכם',
  },
  form: {
    title: 'פרטי הכלב',
    name: 'שם הכלב',
    age: 'גיל בשנים',
    breedSize: 'גודל גזע',
    allergies: 'אלרגיות (נציג רק מזון ללא המרכיבים שסימנתם)',
    preferredProteins: 'חלבונים מועדפים',
    grainFree: 'מזון ללא דגנים',
    submit: 'מצאו התאמות',
    errors: {
      name: 'נא להזין שם באורך של עד 40 תווים',
      age: 'נא להזין גיל בין 0 ל-30',
      breedSize: 'נא לבחור גודל גזע',
    },
  },
  breedSize: {
    small: 'קטן (עד 10 ק"ג)',
    medium: 'בינוני (11–25 ק"ג)',
    large: 'גדול (מעל 25 ק"ג)',
  },
  // "Without X" rather than just "X", so these labels never collide with the protein labels below.
  allergen: {
    chicken: 'ללא עוף',
    beef: 'ללא בקר',
    lamb: 'ללא כבש',
    fish: 'ללא דגים',
    turkey: 'ללא הודו',
    duck: 'ללא ברווז',
    egg: 'ללא ביצים',
    dairy: 'ללא מוצרי חלב',
    wheat: 'ללא חיטה',
    corn: 'ללא תירס',
    soy: 'ללא סויה',
  },
  protein: {
    chicken: 'עוף',
    beef: 'בקר',
    lamb: 'כבש',
    fish: 'דגים',
    turkey: 'הודו',
    duck: 'ברווז',
    other: 'אחר',
  },
  grainFree: {
    yes: 'כן, רק ללא דגנים',
    noPreference: 'ללא העדפה',
  },
  // Plain allergen names, used inside sentences (the checkbox labels above say "without X").
  allergenName: {
    chicken: 'עוף',
    beef: 'בקר',
    lamb: 'כבש',
    fish: 'דגים',
    turkey: 'הודו',
    duck: 'ברווז',
    egg: 'ביצים',
    dairy: 'מוצרי חלב',
    wheat: 'חיטה',
    corn: 'תירס',
    soy: 'סויה',
  },
  reason: {
    LIFE_STAGE_MATCH: 'מתאים לשלב החיים של הכלב',
    LIFE_STAGE_MISMATCH: 'לא מיועד לשלב החיים של הכלב',
    BREED_SIZE_MATCH: 'מתאים לגודל הגזע',
    BREED_SIZE_MISMATCH: 'לא מיועד לגודל הגזע',
    PROTEIN_PREFERRED: 'החלבון העיקרי הוא מהחלבונים המועדפים',
    PROTEIN_NOT_PREFERRED: 'החלבון העיקרי אינו מהחלבונים המועדפים',
    GRAIN_FREE_MATCH: 'ללא דגנים, כפי שביקשתם',
    GRAIN_FREE_MISMATCH: 'מכיל דגנים',
  },
  exclusion: {
    SPECIES_MISMATCH: 'מיועד למין אחר',
    CONTAINS_ALLERGEN: (allergenNames: string) => `מכיל: ${allergenNames}`,
  },
  results: {
    title: (petName: string) => `ההתאמות של ${petName}`,
    empty: 'לא נמצאו מזונות מתאימים. אפשר לערוך את הפרופיל, למשל להסיר אחת מהאלרגיות.',
    buy: 'איפה לקנות',
    matchLabel: 'התאמה',
    edit: 'עריכת הפרופיל',
    excluded: (count: number) => `${count} מזונות הוצאו מהרשימה`,
    showExcluded: 'הצגה',
    hideExcluded: 'הסתרה',
  },
  loading: 'מחפשים את ההתאמות הטובות ביותר…',
  error: {
    message: 'לא הצלחנו לטעון את ההתאמות. ייתכן שהשרת מתעורר, נסו שוב בעוד רגע.',
    retry: 'ניסיון חוזר',
    edit: 'חזרה לעריכת הפרופיל',
  },
  disclaimer: 'המידע באתר אינו ייעוץ וטרינרי. לשאלות על מצבים רפואיים יש להתייעץ עם וטרינר.',
};

export type Strings = typeof he;
