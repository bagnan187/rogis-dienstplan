import assert from 'node:assert/strict';
import { isNrwPublicHoliday, nrwDayType } from '../src/nrw-feiertage.mjs';

const utc = value => new Date(`${value}T12:00:00.000Z`);
const expected = {
  2026: ['2026-01-01','2026-04-03','2026-04-06','2026-05-01','2026-05-14','2026-05-25','2026-06-04','2026-10-03','2026-11-01','2026-12-25','2026-12-26'],
  2027: ['2027-01-01','2027-03-26','2027-03-29','2027-05-01','2027-05-06','2027-05-17','2027-05-27','2027-10-03','2027-11-01','2027-12-25','2027-12-26']
};

for (const [year, dates] of Object.entries(expected)) {
  const actual = [];
  for (let date = utc(`${year}-01-01`); date.getUTCFullYear() === Number(year); date.setUTCDate(date.getUTCDate() + 1)) {
    if (isNrwPublicHoliday(date)) actual.push(date.toISOString().slice(0, 10));
  }
  assert.deepEqual(actual, dates, `NRW-Feiertage ${year}`);
}
for (const date of [...expected[2026], ...expected[2027]]) {
  assert.equal(nrwDayType(utc(date)), 'SO', `Sonn-/Feiertagsumlauf: ${date}`);
}
for (const [date, expectedType] of Object.entries({
  '2026-10-08':'WK', '2026-10-17':'SA', '2026-10-18':'SO', '2026-10-19':'WK',
  '2026-10-31':'SA', '2026-12-24':'WK', '2026-12-31':'WK', '2026-02-16':'WK',
  '2028-01-01':'SO', '2028-01-02':'SO', '2028-01-03':'WK'
})) {
  assert.equal(nrwDayType(utc(date)), expectedType, `Kalendertyp: ${date}`);
}
console.log('NRW-Feiertage: 2026/2027 vollständig; Sonn-/Feiertag, Samstag und Werktag korrekt.');
