import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
const start=src.indexOf('const DATA=')+'const DATA='.length;
const end=src.indexOf(';\nconst ADMIN_NAMES',start);
assert.ok(end>start,'Mitarbeiter-Stammdaten vorhanden');
const data=JSON.parse(src.slice(start,end));
const employees=data.employees;

assert.equal(employees.length,698,'ROGIS soll 698 feste Mitarbeiter enthalten');
assert.equal(data.meta.staffCount,698,'Personalzahl im Metadata stimmt');
assert.equal(new Set(employees.map(e=>e.id)).size,employees.length,'Personalnummern bleiben eindeutig');
assert.equal(new Set(employees.map(e=>e.name)).size,employees.length,'Mitarbeiternamen bleiben eindeutig');

const byArea={};
const byRole={};
for(const employee of employees){
  byArea[employee.bereich]=(byArea[employee.bereich]||0)+1;
  byRole[employee.position]=(byRole[employee.position]||0)+1;
}
assert.equal(Object.keys(byArea).length,15,'Alle Betriebsbereiche bleiben vertreten');
assert.equal(Object.keys(byRole).length,39,'Alle Stellenprofile bleiben vertreten');
assert.equal(byArea.Fahrdienst,480,'480 Personen im Fahrdienst');
assert.equal(byArea['Werkstatt / Technik'],70,'70 Personen Werkstatt und Technik');
assert.equal(byArea['Leitstelle / Verkehrssteuerung'],20);
assert.equal(byArea.Disposition,10);
assert.equal(byArea.Reinigung,24);
assert.equal(byArea.Hofdienst,20);
assert.equal(byRole.Busfahrer,420,'420 Busfahrer inklusive fester Sonderpersonalakten');
assert.equal(byRole['Reservefahrer / Springer'],38,'38 Springer und Reservefahrer');
assert.equal(byRole['Teamkoordinator Fahrdienst'],12);
assert.equal(byRole['Fahrtrainer / Einweiser'],10);
for(const name of ['Emil Breitbau','Tim Neumann','Jason Neuda','Louis Lichtmaschine','Robert Edward Davis','Mehmet Ötegen','Andreas Neubaum','Oliver Schesch','Patric Gehen']){
  assert.equal(employees.filter(e=>e.name===name).length,1,name+' bleibt einmal vorhanden');
}
assert.equal(employees.find(e=>e.name==='Louis Lichtmaschine').id,'R-L001');
assert.equal(employees.find(e=>e.name==='Mehmet Ötegen').id,'R-MO-0001');
assert.equal(employees.find(e=>e.name==='Robert Edward Davis').id,'R-1591','Alte Personalnummern nicht neu vergeben');
assert.ok(src.includes('if(!emp)return json({error:"Mitarbeiterkonto ist nicht mehr vorhanden."},403)'),'Entfernte Konten dürfen keine Anmeldung erhalten');

console.log('ROGIS-Personalbestand: 698 Mitarbeiter, 480 Fahrdienst, 15 Bereiche, 39 Funktionen, Schutzpersonen/IDs OK.');
