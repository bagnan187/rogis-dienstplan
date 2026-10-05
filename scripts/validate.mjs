import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const file = path.join(root, 'src', 'index.js');
const src = fs.readFileSync(file, 'utf8');

const required = [
  'savePlanVersion','nextEmployeeId','getNextPlanVersionV63','ensureWeek',
  'ensurePersonnelAutomation','syncFleetFromGoogle','regenerateSingleDay','buildDay','apprenticeWeekendOff','youthWorkWindowAllows','apprenticeOwnDrivingEligible'
];
const missing = required.filter(n => !new RegExp(`(?:async\\s+)?function\\s+${n}\\s*\\(`).test(src));
if (missing.length) {
  console.error('Fehlende Kernfunktionen:', missing.join(', '));
  process.exit(1);
}

const forbidden = [
  ['nextPlanVersion(', 'veralteter nextPlanVersion-Aufruf'],
  ['&&!segs.some(s=>s.trainingRide)', 'ungültiger segs-Bezug in Mentorfilter'],
];
for (const [needle, label] of forbidden) {
  if (src.includes(needle)) {
    console.error('Ungültiger Code gefunden:', label);
    process.exit(1);
  }
}


const requiredRules = [
  ['!apprenticeWeekendOff(e,d)', 'Azubis sind aus dem Wochenend-Fahrerpool ausgeschlossen'],
  ['youthWorkWindowAllows(az,m.segs,d)', 'U18-Begleitfahrten werden auf 06:00-22:00 begrenzt'],
  ['if(ay>=1&&ay<=3&&weekend0)', 'Alle Lehrjahre haben am Wochenende frei'],
];
for (const [needle, label] of requiredRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Ausbildungsregel:', label);
    process.exit(1);
  }
}

// Laufzeittest für den reinen Fahrplan-Generator. Damit werden ReferenceErrors
// in buildDay (z.B. versehentlich freie Variablen wie "segs") vor dem Deploy erkannt.
const tmp = path.join(root, 'src', '.validate-index.mjs');
try {
  fs.writeFileSync(tmp, src + '\nexport { buildDay };\n');
  const mod = await import(pathToFileURL(tmp).href + `?v=${Date.now()}`);
  for (const ds of ['2026-10-05','2026-10-06','2026-10-10','2026-10-11']) {
    const result = mod.buildDay(new Date(`${ds}T12:00:00Z`));
    if (!result || !result.assignments || typeof result.assignments !== 'object') {
      throw new Error(`buildDay(${ds}) liefert keinen gültigen Plan`);
    }
  }
} catch (e) {
  console.error('ROGIS Laufzeit-Smoke-Test fehlgeschlagen:', e?.stack || e);
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmp); } catch {}
}

console.log('ROGIS Validierung OK: Kernfunktionen + Fahrplan-Laufzeittest');
