// Nur komplette, echte Fahrerdienste auf bisher nicht eingesetzte Bereitschaftskräfte
// verschieben: kein Tausch, kein verlorener Umlauf und keine zusätzliche DB-Tabelle.
export function handOverDutyToAvailableDriver(day,sourceId,staff,eligible){
 const old=day?.assignments?.[sourceId]||[];
 if(!old.length)return null;
 if(old.some(s=>s.trainingRide||s.trainingPassengers?.length||s.trainingPassengerNotes?.length))
  throw new Error("Dieser Dienst enthält eine Azubi-Mitfahrt. Bitte diese zuerst separat umplanen.");
 const forbidden=old.some(s=>s.manualVehicle||s.specialOperator||s.operator&&s.operator!=="ROGIS"||s.trainingRide);
 if(forbidden)throw new Error("Sonder- oder Fremdverkehre können nicht automatisch an andere Fahrer vergeben werden.");
 const person=(staff||[]).find(e=>e.id!==sourceId&&!(day.assignments?.[e.id]||[]).length&&!day.inProgress?.[e.id]&&eligible(e,old));
 if(!person)throw new Error("Kein verfügbarer Fahrer in Bereitschaft erfüllt alle Bedingungen. Der vorhandene Fahrdienst bleibt unverändert.");
 const relevant=new Set(old.map(s=>String(s.run||"")).filter(Boolean));
 const moved=old.map(s=>({...s,employeeId:person.id,employeeName:person.name,reliefFrom:null,reliefTo:null}));
 day.assignments[person.id]=moved;
 delete day.assignments[sourceId];
 for(const segs of Object.values(day.assignments))for(const seg of segs||[]){
  if(relevant.has(String(seg.run||""))){delete seg.reliefFrom;delete seg.reliefTo}
 }
 for(const run of relevant){
  const info=day.runInfo?.[run];if(!info)continue;
  const drivers=new Set();
  for(const segs of Object.values(day.assignments))for(const seg of segs||[])
   if(String(seg.run||"")===run&&!seg.trainingRide)drivers.add(String(seg.employeeName||""));
  info.drivers=[...drivers].filter(Boolean);
 }
 return{employeeId:person.id,employeeName:person.name,segmentsMoved:moved.length,runs:[...relevant]};
}
