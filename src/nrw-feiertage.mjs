// Gesetzliche Feiertage in Nordrhein-Westfalen nach § 2 Feiertagsgesetz NW.
// Quelle: https://recht.nrw.de/lrgv/gesetz/01012000-bekanntmachung-der-neufassung-des-gesetzes-ueber-die-sonn-und-feiertage/
// Rein lokal: keine Netzwerk-, Worker- oder Datenbankabfragen.
const NRW_FIXED_HOLIDAYS = ['01-01', '05-01', '10-03', '11-01', '12-25', '12-26'];
const HOLIDAY_DATES_BY_YEAR = new Map();

function isoDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

// Gregorianisches Osterdatum nach der Gauß-/Meeus-Jones-Butcher-Methode.
function easterSundayUTC(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return new Date(Date.UTC(year, Math.floor(n / 31) - 1, (n % 31) + 1, 12));
}

function holidayDatesForYear(year) {
  if (HOLIDAY_DATES_BY_YEAR.has(year)) return HOLIDAY_DATES_BY_YEAR.get(year);
  const dates = new Set(NRW_FIXED_HOLIDAYS.map(day => `${year}-${day}`));
  const easter = easterSundayUTC(year);
  // Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam.
  for (const delta of [-2, 1, 39, 50, 60]) {
    const day = new Date(easter);
    day.setUTCDate(day.getUTCDate() + delta);
    dates.add(isoDate(day));
  }
  HOLIDAY_DATES_BY_YEAR.set(year, dates);
  return dates;
}

export function isNrwPublicHoliday(date) {
  return holidayDatesForYear(date.getUTCFullYear()).has(isoDate(date));
}

// Gesetzlicher Feiertag hat Vorrang vor Samstag und Schulferien.
export function nrwDayType(date) {
  const weekday = date.getUTCDay();
  return weekday === 0 || isNrwPublicHoliday(date) ? 'SO' : weekday === 6 ? 'SA' : 'WK';
}
