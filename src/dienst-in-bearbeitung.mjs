// Reiner Plan-JSON-Eingriff: kein neuer D1-Tabellen- oder Cron-Bedarf.
// Eine entfernte Personenzuweisung ist bis zur Tages-Neugenerierung in Bearbeitung.
export function isEmployeeDutyInProgress(day, employeeId) {
  return !!day?.inProgress?.[employeeId] && !(day?.assignments?.[employeeId] || []).length;
}

export function removeEmployeeDutyFromDay(day, employeeId, name, by, at = new Date().toISOString()) {
  if (!day?.assignments) throw new Error('Kein generierter Dienstplan für diesen Tag vorhanden.');
  const original = day.assignments[employeeId] || [];
  if (!original.length) {
    if (isEmployeeDutyInProgress(day, employeeId)) throw new Error('Dieser Dienst ist bereits in Bearbeitung.');
    throw new Error('Diese Person hat an diesem Tag keinen generierten Fahrdienst zum Entfernen.');
  }
  if (original.some(s => s.trainingRide || s.trainingPassengers?.length || s.trainingPassengerNotes?.length)) {
    throw new Error('Dienste mit Azubi-Mitfahrt können nicht einzeln entfernt werden. Bitte den gesamten Tag neu generieren.');
  }
  const affectedRuns = new Set(original.map(s => String(s.run || '')).filter(Boolean));
  delete day.assignments[employeeId];
  day.inProgress = { ...(day.inProgress || {}), [employeeId]: { by, at } };
  for (const segments of Object.values(day.assignments)) {
    for (const segment of segments || []) {
      if (String(segment.reliefFrom?.employeeId || '') === String(employeeId)) delete segment.reliefFrom;
      if (String(segment.reliefTo?.employeeId || '') === String(employeeId)) delete segment.reliefTo;
    }
  }
  for (const runName of affectedRuns) {
    const drivers = new Set();
    for (const segments of Object.values(day.assignments)) {
      for (const seg of segments || []) {
        if (String(seg.run || '') === runName && !seg.trainingRide) drivers.add(seg.employeeName || '');
      }
    }
    const info = day.runInfo?.[runName];
    if (!info) continue;
    if (!drivers.size && !info.external) delete day.runInfo[runName];
    else info.drivers = [...drivers].filter(Boolean);
  }
  return { affectedRuns: [...affectedRuns], removedSegments: original.length, name };
}
