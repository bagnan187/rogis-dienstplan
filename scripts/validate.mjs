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
if (!html.includes('Der aktuell vorhandene Dienst ist bereits eingetragen') || !html.includes('<option>Fahrdienst</option>')) {
  console.error('Fehlender UI-Fix: Bearbeiten muss den vorhandenen Dienst vorbefüllen');
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
  ['Breitbau Tours · LP-Haarwiehe', 'Standort Breitbau Tours'],
  ['Neumann Reisen · Zweiberg', 'Standorte Neumann Reisen'],
];
for (const [needle, label] of specialRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Sonderumlauf-Regel:', label);
    process.exit(1);
  }
}


const vacationReserveRules = [
  ['const ANNUAL_VACATION_DAYS=30', '30 Urlaubstage pro Kalenderjahr'],
  ['vacationCapacityForRange', 'Urlaubsgrenze wird vor Genehmigung geprüft'],
  ['reserveAcceptedIds', 'Reserve wird zentral begrenzt'],
  ['if(overlapping<2)accepted.push(c)', 'maximal zwei gleichzeitig überlappende Reservekräfte je Ort'],
  ['reserveOverrideConflict', 'auch manuelle Reserve-Einträge werden gegen die Grenze geprüft'],
];
for (const [needle, label] of vacationReserveRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Urlaubs-/Reserveregel:', label);
    process.exit(1);
  }
}


const vehicleOverviewRules = [
  ['vehicleDayRows', 'Backend für tagesbezogene Wageneinsatz-Übersicht'],
  ['/api/admin/vehicle-day', 'API für Wageneinsätze nach Tag'],
  ['seg.trainingRide', 'Azubi-Mitfahrten werden nicht als eigener Fahrer des Wagens gezählt'],
  ['Wagen manuell nachtragen', 'manuell nachzutragende Fremdwagen werden nicht als ROGIS-Wagen gezählt'],
  ['byVehicle=new Map()', 'Wageneinsätze werden je Wagen zusammengefasst'],
  ['row.runs=[...new Set(row.runs)]', 'Umläufe werden je Wagen dedupliziert'],
  ['used:false,runs:[],drivers:[]', 'nicht eingesetzte Wagen bleiben in der Übersicht'],
];
for (const [needle, label] of vehicleOverviewRules) {
  if (!src.includes(needle)) {
    console.error('Fehlende Wageneinsatz-Regel:', label);
    process.exit(1);
  }
}
const publicHtml = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
for (const [needle, label] of [
  ['data-tab="vehicles"', 'Wageneinsatz-Tab'],
  ['id="vehicleDaySelect"', 'Tagesauswahl für Wageneinsatz'],
  ['loadVehicleOverview', 'Frontend-Ladefunktion für Wageneinsatz'],
  ['if(!r.used)', 'nicht eingesetzte Wagen werden separat dargestellt'],
  ['Fahrer / Fahrerwechsel', 'Fahrerwechsel werden unter einer Wagennummer gebündelt'],
]) {
  if (!publicHtml.includes(needle)) {
    console.error('Fehlende Wageneinsatz-Oberfläche:', label);
    process.exit(1);
  }
}

// Laufzeittest für den reinen Fahrplan-Generator. Damit werden ReferenceErrors
// in buildDay (z.B. versehentlich freie Variablen wie "segs") vor dem Deploy erkannt.
const tmp = path.join(root, 'src', '.validate-index.mjs');
try {
  fs.writeFileSync(tmp, src + '\nexport { buildDay, statusForEmployee, DATA, DEFAULT_GENERATION_SETTINGS };\n');
  const mod = await import(pathToFileURL(tmp).href + `?v=${Date.now()}`);
  for (const ds of ['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11']) {
    const result = mod.buildDay(new Date(`${ds}T12:00:00Z`));
    if (!result || !result.assignments || typeof result.assignments !== 'object') {
      throw new Error(`buildDay(${ds}) liefert keinen gültigen Plan`);
    }
    const dd = new Date(`${ds}T12:00:00Z`);
    const reserve = mod.DATA.employees.map(emp => ({emp, st: mod.statusForEmployee(emp, dd, result, mod.DEFAULT_GENERATION_SETTINGS)})).filter(x => x.st.status === 'Reserve');
    for (const loc of new Set(reserve.map(x => x.st.depot))) {
      for (let minute=0; minute<1440; minute+=15) {
        const active = reserve.filter(x => {
          if (x.st.depot !== loc) return false;
          const [a,b] = String(x.st.serviceTime||'').split('-');
          const toMin = z => { const m=String(z||'').match(/^(\d{2}):(\d{2})$/); return m ? Number(m[1])*60+Number(m[2]) : -1; };
          let start=toMin(a), end=toMin(b); if(end<=start)end+=1440;
          return start<=minute && minute<end;
        });
        if (active.length > 2) throw new Error(`Am ${ds} sind in ${loc} um ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')} ${active.length} Reservekräfte gleichzeitig eingeteilt (>2)`);
      }
    }
    for (const segs of Object.values(result.assignments)) {
      if (segs?.length) {
        const ordered = [...segs].sort((a,b)=>a.start-b.start);
        const dutyStart = ordered[0].start;
        const dutyEnd = Math.max(...ordered.map(x=>x.end));
        const dutySpan = dutyEnd - dutyStart;
        if (dutySpan > 840) throw new Error(`Dienst von ${ordered[0].employeeName} am ${ds} ist ${dutySpan} Minuten lang (> 14 h)`);
        for (const seg of ordered) if (seg.end-seg.start > 570) throw new Error(`Fahrblock ${seg.run} von ${seg.employeeName} ist ${seg.end-seg.start} Minuten lang (> 9:30 h)`);
        if (dutySpan > 600) {
          const hasSplit = ordered.slice(1).some((x,i)=>x.start-ordered[i].end>=120);
          if (!hasSplit) throw new Error(`Dienst von ${ordered[0].employeeName} am ${ds} ist länger als 10 h, aber kein echter Teildienst`);
        }
      }
      for (const seg of segs || []) {
      if (seg.tl || seg.gr) {
        if (!['Emil Breitbau','Tim Neumann'].includes(seg.employeeName)) throw new Error(`Sonderumlauf ${seg.run} an unzulässige Person ${seg.employeeName}`);
        if (seg.tl && seg.operator !== 'Neumann Reisen') throw new Error(`TL ${seg.run} falscher Betreiber`);
        if (seg.gr && seg.operator !== 'Breitbau Tours') throw new Error(`GR ${seg.run} falscher Betreiber`);
        if (seg.vehicle !== 'Wagen manuell nachtragen') throw new Error(`Sonderumlauf ${seg.run} hat unerlaubtes ROGIS-Fahrzeug`);
        if (seg.tl && !String(seg.runDepot||'').startsWith('Neumann Reisen · ')) throw new Error(`TL ${seg.run} hat falschen Standort ${seg.runDepot}`);
        if (seg.gr && seg.runDepot !== 'Breitbau Tours · LP-Haarwiehe') throw new Error(`GR ${seg.run} hat falschen Standort ${seg.runDepot}`);
      }
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
