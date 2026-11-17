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
    prompt: 'מלאו את פרטי הכלב כדי לראות את ההתאמות',
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
};

export type Strings = typeof he;
