// Einmalige, datumsabhängige Auswahl real vorhandener TTData-Umläufe.
// Kein künstliches Kürzen von Fahrten: Schulumläufe ohne gültige Ferienvariante
// werden in den Ferien ganz weggelassen.
const flags = run => run.flags || [];
const has = (run, flag) => flags(run).includes(flag);
const isSchoolLine = line => /^E\d+[A-Z]?$/i.test(String(line ?? '').trim());

export function containsSchoolTrips(run, timetable) {
  return (run.timeline || []).some(entry => isSchoolLine(entry?.[1])) ||
    (timetable?.x || []).some(trip => isSchoolLine(trip?.l));
}

export function selectDayRuns(runs, { dayType, friday = false, schoolHoliday = false }, getTimetable = () => null) {
  const groups = new Map();
  for (const run of runs) {
    if (run.dayType !== dayType) continue;
    if (!groups.has(run.runNum)) groups.set(run.runNum, []);
    groups.get(run.runNum).push(run);
  }

  const selected = [];
  for (const variants of groups.values()) {
    const normal = variants.filter(run => !has(run, 'F') && !has(run, 'FR'));
    const schoolFriday = variants.filter(run => has(run, 'FR') && !has(run, 'F'));
    const holidayWeekday = variants.filter(run => has(run, 'F') && !has(run, 'FR'));
    const holidayFriday = variants.filter(run => has(run, 'F') && has(run, 'FR'));

    if (dayType !== 'WK') {
      selected.push(normal[0] || variants[0]);
      continue;
    }
    if (!schoolHoliday) {
      const chosen = friday ? (schoolFriday[0] || normal[0]) : normal[0];
      if (chosen) selected.push(chosen);
      continue;
    }

    // Ferienfreitag: erst F+FR, danach F. Niemals Schulfreitag (nur FR)!
    // Andere Ferienwerktage: nur F oder ein unveränderter, schulfahrtenfreier Umlauf.
    const ordered = friday
      ? [...holidayFriday, ...holidayWeekday, ...normal]
      : [...holidayWeekday, ...normal];
    const chosen = ordered.find(run => !containsSchoolTrips(run, getTimetable(run)));
    if (chosen) selected.push(chosen);
  }
  return selected;
}
