import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const data=readFileSync(new URL('../src/ttdata.generated.js',import.meta.url),'utf8');
const schedule=JSON.parse(data.slice(data.indexOf('export const TT_SCHEDULE=')+25,data.indexOf(';\nexport const TT_ALIASES=')));
const aliases=JSON.parse(data.slice(data.indexOf('export const TT_ALIASES=')+24,data.lastIndexOf(';')));
const holiday=readFileSync(new URL('../src/nrw-feiertage.mjs',import.meta.url),'utf8');
const selector=readFileSync(new URL('../src/umlauf-auswahl.mjs',import.meta.url),'utf8');
const dayType=new Function(holiday.replace(/export /g,'')+';return nrwDayType')();
const selectDayRuns=new Function(selector.replace(/export /g,'')+';return selectDayRuns')();
const stripped=source.replace(/^import .*;\s*$/gm,'').replace('export default{','const workerDefault={');
const runtime=new Function('dayType','selectDayRuns','TT_SCHEDULE','TT_ALIASES',
 stripped+';return {DATA,buildDay,openOmsiDayPayload,openOmsiDepotDayPayloadV6425,openOmsiDayPayloadProjectedV6480,openOmsiDepotDayPayloadProjectedV6480}'
)(dayType,selectDayRuns,schedule,aliases);

for(const date of ['2026-10-12','2026-10-19','2026-10-24','2026-10-25']){
 const day=runtime.buildDay(new Date(date+'T12:00:00Z'),undefined,undefined,'projected-api-test');
 const plan={version:9,days:{[date]:day}};
 const sqls=[];
 const env={DB:{prepare(sql){
  sqls.push(sql);
  return {
   bind(){return this},
   async first(){
    if(sql.includes(' run_info FROM week_plans '))return{version:9,run_info:JSON.stringify(day.runInfo)};
    if(sql.includes(' day_json,'))return{version:9,day_json:JSON.stringify(day),root_preview:0};
    throw new Error('Unerwartete D1-SELECT-first Abfrage: '+sql);
   },
   async all(){
    if(sql.includes('FROM vehicles ORDER BY number'))return{results:[]};
    if(sql.includes('FROM depot_slots WHERE active=1'))return{results:[]};
    throw new Error('Unerwartete D1-SELECT-all Abfrage: '+sql);
   }
  };
 }}};
 const mk='2026-10-12';
 const expectedAi=runtime.openOmsiDayPayload(plan,date);
 const newAi=await runtime.openOmsiDayPayloadProjectedV6480(env,mk,date);
 const expectedDepot=await runtime.openOmsiDepotDayPayloadV6425(plan,date,env);
 const newDepot=await runtime.openOmsiDepotDayPayloadProjectedV6480(env,mk,date);
 assert.deepEqual(newAi,expectedAi,'KI-Ausgabe am '+date+' unverändert');
 assert.deepEqual(newDepot,expectedDepot,'Depot-Ausgabe am '+date+' unverändert');
 assert.ok(sqls.some(sql=>sql.includes(' run_info FROM week_plans ')),'Nur Umlaufinfo für KI lesen');
 assert.ok(sqls.some(sql=>sql.includes(' day_json,')),'Nur Tag für Depot lesen');
 assert.ok(sqls.every(sql=>!/\b(?:INSERT|UPDATE|DELETE)\b/i.test(sql)),'Lesen darf keine D1-Schreibvorgänge verursachen');
}
assert.ok(source.includes('payload=await openOmsiDayPayloadProjectedV6480(env,mk,date)'),'Live-KI nutzt Projektionsabruf');
assert.ok(source.includes('payload=await openOmsiDepotDayPayloadProjectedV6480(env,mk,date)'),'Depot nutzt Projektionsabruf');
assert.ok(source.includes('SELECT version FROM week_plans WHERE monday=?'),'Admin-Zusammenfassung lädt keine Wochen-JSON mehr');
console.log('Worker-1102-Regressionscheck: vier Fahrtage, identische KI-/Depotdaten, kein D1-Write beim Live-GET.');
