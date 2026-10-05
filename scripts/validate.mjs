import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const file = path.join(root, 'src', 'index.js');
const src = fs.readFileSync(file, 'utf8');

const required = [
  'savePlanVersion','nextEmployeeId','getNextPlanVersionV63','ensureWeek',
  'ensurePersonnelAutomation','ensureRandomStaffEvents','syncFleetFromGoogle','regenerateSingleDay','regenerateEmployeeDayInPlan','swapEmployeeDutyForDay','buildDay','apprenticeWeekendOff','youthWorkWindowAllows','apprenticeOwnDrivingEligible'
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


const absenceRules = [
  ['random-sick-events:', 'aktuelle, tagesbezogene Krankmeldungen'],
  ['requested_date>?', 'alte zukünftige Zufalls-Krankmeldungen werden bereinigt'],
  ["'Krankmeldung'", 'zufällige Krankmeldungen'],
  ["'Urlaubswunsch'", 'zufällige Urlaubswünsche'],
  ['/api/admin/vacation-request/', 'Admin-Genehmigung für Urlaubszeiträume'],
  ['/api/admin/sick-notices/read-all', 'Sammelbutton für Krankmeldungen'],
  ['/api/admin/vacation-requests/approve-all', 'Sammelgenehmigung für Urlaubsanträge'],
  ['hash(az.id+dk+"ride-v642")%5!==0', '2. Lehrjahr fährt weiterhin vereinzelt mit'],
  ['if(rideCount>=2)break', 'Begleitfahrten bleiben pro Tag begrenzt'],
];
for (const [needle, label] of absenceRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Abwesenheits-/Azubi-Regel:', label);
    process.exit(1);
  }
}

const weekendRules = [
  ['if(weekend)return{status:"Frei",dutyType:"Frei"', 'am Wochenende arbeitet außerhalb des Fahrdiensts niemand regulär'],
  ['emp.name==="Emil Breitbau"||emp.name==="Tim Neumann"', 'Emil/Tim bleiben Sonderfall für Wochenend-Fahrdienst'],
];
for (const [needle, label] of weekendRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Wochenendregel:', label);
    process.exit(1);
  }
}

const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
if (!html.includes("replace(/'/g,'%27')")) {
  console.error('Fehlender UI-Fix: Fahrzeugmodelle mit Apostroph (z.B. Lion\'s City) müssen anklickbar bleiben');
  process.exit(1);
}


const individualDayRules = [
  ['/api/admin/generate-employee-day', 'API für einzelne Person + einzelnen Tag'],
  ['employee-day', 'eigener Planversionsmodus für Einzelperson/Tag'],
  ['übrige sechs Tage unverändert', 'restliche Woche bleibt bei Einzelperson/Tag unverändert'],
];
for (const [needle, label] of individualDayRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Einzelperson-Tagesregel:', label);
    process.exit(1);
  }
}

const specialRules = [
  ['run.tl?"Neumann Reisen":"Breitbau Tours"', 'TL/GR Betreiberzuordnung'],
  ['Wagen manuell nachtragen', 'Sonderumläufe ohne ROGIS-KOM'],
  ['preferredOperator=emp.name==="Tim Neumann"?"Neumann Reisen":"Breitbau Tours"', 'TL/GR bevorzugen den jeweiligen Leiter; nur Emil/Tim werden geprüft'],
  ['isSpecialRunSegment', 'Schutz der TL/GR-Umläufe bei Einzel-Neugenerierung'],
];
for (const [needle, label] of specialRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Sonderumlauf-Regel:', label);
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
    for (const segs of Object.values(result.assignments)) for (const seg of segs || []) {
      if (seg.tl || seg.gr) {
        if (!['Emil Breitbau','Tim Neumann'].includes(seg.employeeName)) throw new Error(`Sonderumlauf ${seg.run} an unzulässige Person ${seg.employeeName}`);
        if (seg.tl && seg.operator !== 'Neumann Reisen') throw new Error(`TL ${seg.run} falscher Betreiber`);
        if (seg.gr && seg.operator !== 'Breitbau Tours') throw new Error(`GR ${seg.run} falscher Betreiber`);
        if (seg.vehicle !== 'Wagen manuell nachtragen') throw new Error(`Sonderumlauf ${seg.run} hat unerlaubtes ROGIS-Fahrzeug`);
      }
    }
  }
} catch (e) {
  console.error('ROGIS Laufzeit-Smoke-Test fehlgeschlagen:', e?.stack || e);
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmp); } catch {}
}

console.log('ROGIS Validierung OK: Kernfunktionen + Fahrplan-Laufzeittest');
