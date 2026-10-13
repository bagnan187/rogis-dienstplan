import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handOverDutyToAvailableDriver } from '../src/manuelle-dienstvergabe.mjs';

const seg=(id,name,run,vehicle='KOM 1401')=>({employeeId:id,employeeName:name,run,vehicle,operator:'ROGIS',start:480,end:720});
const staff=[
 {id:'A',name:'Ausgangsfahrer'},
 {id:'B',name:'Bereitschaft B'},
 {id:'C',name:'Urlaub C'},
 {id:'D',name:'Bereitschaft D'}
];
const makeDay=()=>({
 assignments:{
  A:[seg('A','Ausgangsfahrer','10132F'),seg('A','Ausgangsfahrer','10133F')],
  X:[{...seg('X','Anderer Fahrer','10132F'),start:730,end:930,reliefFrom:{employeeId:'A'}}]
 },
 runInfo:{
  '10132F':{drivers:['Ausgangsfahrer','Anderer Fahrer'],vehicle:{number:1401}},
  '10133F':{drivers:['Ausgangsfahrer'],vehicle:{number:1401}}
 }
});
const day=makeDay();
const original=structuredClone(day.assignments.A);
const result=handOverDutyToAvailableDriver(day,'A',staff,e=>e.id==='B');
assert.equal(result.employeeId,'B');
assert.equal(result.segmentsMoved,2);
assert.equal(day.assignments.A,undefined,'Kein alter Fahrerdienst verbleibt beim manuell bearbeiteten Mitarbeiter');
assert.deepEqual(day.assignments.B.map(s=>[s.run,s.vehicle,s.start,s.end]),original.map(s=>[s.run,s.vehicle,s.start,s.end]),'Dienstkarte bleibt unverändert');
assert.deepEqual([...day.runInfo['10132F'].drivers].sort(),['Anderer Fahrer','Bereitschaft B'].sort());
assert.equal(day.assignments.X[0].reliefFrom,undefined,'Alte Fahrerwechselreferenz entfernt');
assert.equal(day.assignments.X.length,1,'Keine bestehenden Fremddienste getauscht');
assert.equal(Object.keys(day.assignments).length,2,'Gleiche Anzahl besetzter Stellen');

const noDriver=makeDay(),snapshot=JSON.stringify(noDriver);
assert.throws(()=>handOverDutyToAvailableDriver(noDriver,'A',staff,()=>false),/Kein verfügbarer Fahrer/);
assert.equal(JSON.stringify(noDriver),snapshot,'Bei fehlender Vertretung keine Änderung');

for(const blocked of [{trainingRide:true},{trainingPassengers:['Azubi']},{trainingPassengerNotes:['Begleitfahrt']},{operator:'Breitbau Tours'},{manualVehicle:true}]){
 const x=makeDay();Object.assign(x.assignments.A[0],blocked);
 assert.throws(()=>handOverDutyToAvailableDriver(x,'A',staff,()=>true),/Azubi-Mitfahrt|Sonder- oder Fremdverkehre/);
 assert.equal(x.assignments.A[0].employeeId,'A');
}
const empty={assignments:{A:[]}};
assert.equal(handOverDutyToAvailableDriver(empty,'A',staff,()=>true),null,'Andere manuelle Dienste brauchen keinen Fahrerdiensttransfer');

const backend=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
assert.ok(backend.includes('p==="/api/admin/manual-duty"'));
assert.ok(backend.includes('return availability.status==="Bereitschaft"'));
assert.ok(backend.includes('await env.DB.batch(['),'Plan/Override müssen gemeinsam gespeichert werden');
assert.ok(ui.includes('id="edKind" maxlength="80"'),'Freie Texteingabe statt Dropdown');
assert.ok(!ui.includes('<select id="edKind"'),'Dienstart darf keine vorgegebene Auswahl enthalten');
assert.ok(ui.includes('id="edNote" rows="6"'));
assert.ok(ui.includes("'/api/admin/manual-duty'"),'Website nutzt echte Neuvergabe');
console.log('Manuelle Dienste: echte Neuvergabe ohne Tausch, Original-Fahrt unverändert, freie Eingaben und Schutzfälle OK.');
