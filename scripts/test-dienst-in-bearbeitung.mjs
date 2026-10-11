import assert from 'node:assert/strict';
import { isEmployeeDutyInProgress, removeEmployeeDutyFromDay } from '../src/dienst-in-bearbeitung.mjs';

const duty=(employeeId,run,start=480,extra={})=>({employeeId,employeeName:employeeId,run,start,end:start+60,vehicle:'KOM 1401',...extra});
const day={
 assignments:{
  A:[duty('A','10132F')],
  B:[duty('B','10132F',560,{reliefFrom:{employeeId:'A',employeeName:'A'}})],
  C:[duty('C','10405F')]
 },
 runInfo:{
  '10132F':{external:false,vehicle:{number:1401},drivers:['A','B']},
  '10405F':{external:false,vehicle:{number:1402},drivers:['C']}
 }
};
const first=removeEmployeeDutyFromDay(day,'A','A','admin','2026-10-11T10:00:00Z');
assert.equal(first.removedSegments,1);
assert.equal(isEmployeeDutyInProgress(day,'A'),true);
assert.equal(day.assignments.A,undefined);
assert.deepEqual(day.runInfo['10132F'].drivers,['B'],'Anderen Fahrer desselben Umlaufs behalten');
assert.equal(day.assignments.B[0].reliefFrom,undefined,'Verwaiste Ablösung entfernen');
assert.deepEqual(day.inProgress.A,{by:'admin',at:'2026-10-11T10:00:00Z'});
assert.throws(()=>removeEmployeeDutyFromDay(day,'A','A','admin'),/bereits in Bearbeitung/);

removeEmployeeDutyFromDay(day,'C','C','admin');
assert.equal(day.runInfo['10405F'],undefined,'Umlauf ohne Fahrer und ohne Fremdunternehmen entfernen');
assert.equal(day.assignments.B.length,1,'Fremde Zuweisungen dürfen nicht geändert werden');

const training={assignments:{T:[duty('T','11103',480,{trainingPassengers:['Azubi']})]},runInfo:{'11103':{external:false,drivers:['T']}}};
assert.throws(()=>removeEmployeeDutyFromDay(training,'T','T','admin'),/Azubi-Mitfahrt/);
assert.equal(training.assignments.T.length,1,'Bei blockierter Aktion nichts verändern');

const freshGeneratedDay={assignments:{A:[duty('A','10132F',500)]},runInfo:{'10132F':{external:false,drivers:['A']}}};
assert.equal(isEmployeeDutyInProgress(freshGeneratedDay,'A'),false,'Neue Tagesgenerierung löscht Marker mit dem ersetzten Tag');
console.log('Dienste in Bearbeitung: Entfernen, Status, Fahrzeug-Umlauf-Referenzen und Azubi-Schutz OK.');
