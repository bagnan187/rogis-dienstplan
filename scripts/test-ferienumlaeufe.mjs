import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectDayRuns, containsSchoolTrips } from '../src/umlauf-auswahl.mjs';

const source = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
const dataStart = source.indexOf('const DATA=') + 'const DATA='.length;
const dataEnd = source.indexOf(';\nconst ADMIN_NAMES', dataStart);
assert.ok(dataStart >= 'const DATA='.length && dataEnd > dataStart, 'Stammdaten gefunden');
const { runs } = JSON.parse(source.slice(dataStart, dataEnd));

const generated = readFileSync(new URL('../src/ttdata.generated.js', import.meta.url), 'utf8');
const tourStart = generated.indexOf('export const TT_SCHEDULE=') + 'export const TT_SCHEDULE='.length;
const tourEnd = generated.indexOf(';\nexport const TT_ALIASES=', tourStart);
const aliasStart = tourEnd + ';\nexport const TT_ALIASES='.length;
const aliasEnd = generated.lastIndexOf(';');
assert.ok(tourStart > 0 && tourEnd > tourStart && aliasEnd > aliasStart, 'TTData gefunden');
const tours = JSON.parse(generated.slice(tourStart, tourEnd));
const aliases = JSON.parse(generated.slice(aliasStart, aliasEnd));
const resolveTour = run => tours[run.dayType]?.[aliases[run.dayType]?.[run.run] || run.run] || null;
const choose = (weekday, holiday) => selectDayRuns(runs,{
  dayType: 'WK', friday: weekday === 5, schoolHoliday: holiday
},resolveTour);
const selected = (list, id) => list.find(run => run.runNum === id)?.run;

// Schulfreitag ist nicht Ferienfreitag!
assert.equal(selected(choose(5, false),'10132'), '10132 Fr');
assert.equal(selected(choose(5, true),'10132'), '10132F Fr');
assert.equal(selected(choose(1, true),'10132'), '10132F');
assert.equal(selected(choose(1, false),'10132'), '10132');

// Reine E-Schulbusumläufe entfallen in Ferien, während normale Ferienumläufe bleiben.
const holidayMon = choose(1, true), holidayFri = choose(5, true);
for (const day of [holidayMon, holidayFri]) {
  assert.ok(day.length > 90, 'Ferienplanung enthält reguläre Verkehre');
  assert.ok(!day.some(run => containsSchoolTrips(run, resolveTour(run))), 'Keine E-Schulfahrten während der Ferien');
  assert.equal(selected(day,'11109'), undefined);
  assert.equal(selected(day,'11104'), undefined);
  assert.equal(selected(day,'10405'), '10405F');
}
assert.ok(choose(1,false).some(run => containsSchoolTrips(run,resolveTour(run))), 'Schulverkehr bleibt an Schultagen verfügbar');
const holidayFriday = holidayFri.find(run => run.runNum === '10132');
assert.ok(holidayFriday.flags.includes('F') && holidayFriday.flags.includes('FR'));
const schoolFriday = choose(5, false).find(run => run.runNum === '10132');
assert.ok(!schoolFriday.flags.includes('F') && schoolFriday.flags.includes('FR'));

// Gegenprobe: Auch bei fehlerhaftem Alias (z.B. 12104F Fr) keine E-Fahrt einschleusen.
assert.equal(selected(holidayFri,'12104'), undefined);
console.log('Ferienumlauf-Test OK: Schul-/Ferienfreitag getrennt, keine E-Fahrten in Ferien, Normalverkehr bleibt erhalten.');
