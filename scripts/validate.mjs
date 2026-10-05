import fs from 'node:fs';
const file = new URL('../src/index.js', import.meta.url);
const src = fs.readFileSync(file, 'utf8');
const required = ['savePlanVersion','nextEmployeeId','getNextPlanVersionV63','ensureWeek','ensurePersonnelAutomation','syncFleetFromGoogle','regenerateSingleDay'];
const missing = required.filter(n => !new RegExp(`(?:async\\s+)?function\\s+${n}\\s*\\(`).test(src));
if (missing.length) {
  console.error('Fehlende Kernfunktionen:', missing.join(', '));
  process.exit(1);
}
for (const legacy of ['nextPlanVersion(']) {
  if (src.includes(legacy)) {
    console.error('Veralteter Funktionsaufruf gefunden:', legacy);
    process.exit(1);
  }
}
console.log('ROGIS Validierung OK:', required.join(', '));
