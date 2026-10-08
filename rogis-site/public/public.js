import {data,path,esc,icon,btn,photo,card,page,publicForm} from './shared.js';
function home(){
  const hero=(data.hero||[]).length?data.hero:[{number:'1602',eyebrow:'Zuhause im Städtedreieck',title:['Dein Alltag.','Deine Wege.','Unsere Busse.'],copy:'ROGIS verbindet das Städtedreieck.',cta:'Jetzt Fahrt planen',href:'/fahrinfo/'}];
  const slides=hero.map((x,i)=>`<figure class="hero-slide ${i===0?'is-active':''}" data-hero-slide="${i}"><img src="${data.photos?.[x.number]||''}" alt="ROGIS-Wagen ${esc(x.number)}" ${i===0?'fetchpriority="high"':'loading="lazy"'}><figcaption>Wagen ${esc(x.number)}</figcaption></figure>`).join('');
  const dots=hero.map((x,i)=>`<button type="button" class="hero-dot ${i===0?'is-active':''}" data-hero-dot="${i}" aria-label="Motiv ${i+1}: Wagen ${esc(x.number)}"></button>`).join('');
  const first=hero[0];
  return `<section class="hero dynamic-hero" data-hero>
    <div class="hero-copy">
      <div class="hero-copy-inner" data-hero-copy>
        <span class="eyebrow" id="hero-eyebrow">${esc(first.eyebrow)}</span>
        <h1 id="hero-title">${esc(first.title[0])}<br>${esc(first.title[1])}<br><em>${esc(first.title[2])}</em></h1>
        <p id="hero-text">${esc(first.copy)}</p>
        <div class="actionrow hero-actions"><a id="hero-cta" class="button white" href="${first.href}">${esc(first.cta)}</a><a class="button white-outline" href="/linien/">Linien & Netz</a></div>
      </div>
      <div class="hero-facts" aria-label="ROGIS auf einen Blick">
        <div><strong>3</strong><span>Citaro 2 LE</span></div>
        <div><strong>${data.lines.length}</strong><span>Linien im Netz</span></div>
        <div><strong>3</strong><span>Betriebshöfe</span></div>
      </div>
    </div>
    <div class="hero-picture dynamic">
      <div class="hero-slides">${slides}</div>
      <div class="hero-controls">
        <button type="button" class="hero-arrow" data-hero-prev aria-label="Vorheriges Motiv">‹</button>
        <div class="hero-dots">${dots}</div>
        <button type="button" class="hero-arrow" data-hero-next aria-label="Nächstes Motiv">›</button>
      </div>
    </div>
  </section>
  <nav class="wrap quickbar" aria-label="Schnelleinstieg">
    <a href="/fahrinfo/">${icon('network')}Fahrt planen</a>
    <a href="/linien/">${icon('bus')}Linien & Netz</a>
    <a href="/tickets/">${icon('ticket')}Tickets & Tarife</a>
    <a href="/verkehrsmeldungen/">${icon('alert')}Verkehrsmeldungen</a>
  </nav>
  <section class="section">
    <div class="wrap">
      <div class="sectionhead"><div><span class="eyebrow">Gut unterwegs</span><h2>Was heute wichtig ist.</h2></div><a class="textlink" href="/service/">Zum Fahrgastservice</a></div>
      <div class="grid three">
        ${card('/linien/','Endpunkte, Zwischenziele, kompletter Verlauf.','Unsere Linienübersicht zeigt erst die wichtigen Punkte – und klappt bei Bedarf bis zur letzten Haltestelle auf.','network')}
        ${card('/barrierefreiheit/','Mobilität für alle.','Praktische Hinweise für eine möglichst selbstständige Fahrt mit ROGIS.','access')}
        ${card('/fundsachen/','Etwas liegen gelassen?','Verlust melden, ohne sich durch allgemeine Kontaktwege suchen zu müssen.','bag')}
      </div>
    </div>
  </section>
  <section class="section soft">
    <div class="wrap feature-split">
      <div class="feature-photo"><img src="${data.photos?.['1726']||data.photos?.['1601']||''}" alt="ROGIS-Wagen 1726 im Einsatz" loading="lazy"><span class="feature-label">Im Einsatz · Wagen 1726</span></div>
      <div class="feature-copy"><span class="eyebrow">ROGIS in Bewegung</span><h2>Kein Einheitsbild.<br>Ein Fuhrpark mit Charakter.</h2><p>Auf der Straße begegnen Ihnen unterschiedliche aktive Baureihen. Die drei Citaro 2 LE 1601, 1602 und 1603 bilden dabei nur einen Teil des Fahrzeugbildes.</p><div class="actionrow">${btn('/fuhrpark/','Fuhrpark entdecken','button orange')}${btn('/unternehmen/','Unternehmen','button outline')}</div></div>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="sectionhead"><div><span class="eyebrow">Drei Perspektiven</span><h2>ROGIS ist mehr als die nächste Abfahrt.</h2></div></div>
      <div class="mosaic">
        <a class="mosaic-card large" href="/unternehmen/"><img src="${data.photos?.['1516']||''}" alt="ROGIS-Wagen 1516" loading="lazy"><span><small>Unternehmen</small><strong>Mobilität entsteht hinter den Kulissen.</strong></span></a>
        <a class="mosaic-card" href="/haltestellen/"><img src="${data.photos?.['1602']||''}" alt="ROGIS-Wagen 1602" loading="lazy"><span><small>Orientierung</small><strong>Neue Namen. Vertraute Wege.</strong></span></a>
        <a class="mosaic-card" href="/karriere/"><img src="${data.photos?.['1603']||''}" alt="ROGIS-Fahrschulbus 1603" loading="lazy"><span><small>ROGIS Akademie</small><strong>Ausbildung beginnt im echten Betrieb.</strong></span></a>
      </div>
    </div>
  </section>
  <section class="section dark-section">
    <div class="wrap moving-copy">
      <span class="eyebrow">Städtedreieck verbunden</span>
      <h2>Einsteigen, umsteigen, weiterkommen.</h2>
      <p>Fahrinfo, Liniennetz und Service greifen zusammen – ohne dass jede Seite gleich aussieht oder dieselben Formulare wiederholt.</p>
      <div class="actionrow">${btn('/fahrinfo/','Fahrinfo öffnen','button white')}${btn('/service/','Service ansehen','button white-outline')}</div>
    </div>
  </section>`;
}
function uniquePatterns(line){
  const seen=new Set();
  return (line.patterns||[]).filter(p=>{
    const stops=(p.stops||[]).filter(Boolean);
    if(stops.length<2)return false;
    const key=stops.join('\u0001');
    if(seen.has(key))return false;
    seen.add(key);p.stops=stops;return true;
  }).sort((x,y)=>y.stops.length-x.stops.length);
}
function lineKind(n){return /^NE/i.test(n)?'night':/^(R|SB|CE)/i.test(n)?'regional':/^E/i.test(n)?'extra':'day'}
function importantStops(stops){
  const inner=stops.slice(1,-1);if(!inner.length)return[];
  const priority=/Hbf|Hauptbahnhof|ZOB|Bahnhof|\bBf\b|Rathaus|Marktpl|Stadthalle|Fachhochschule|Kurhaus|ZUM|Spryndorf S|Kreuzing Bf|Hochtann/i;
  const preferred=inner.filter(x=>priority.test(x));
  const pool=preferred.length>=3?preferred:inner;
  const picks=[];
  for(const f of [.25,.5,.75]){
    const x=pool[Math.min(pool.length-1,Math.round((pool.length-1)*f))];
    if(x&&!picks.includes(x))picks.push(x);
  }
  for(const x of pool)if(picks.length<3&&!picks.includes(x))picks.push(x);
  return picks.slice(0,3).sort((x,y)=>inner.indexOf(x)-inner.indexOf(y));
}
function lineModel(line){
  const variants=uniquePatterns(line);
  if(!variants.length){
    const d=line.destinations||[],stops=d.length>1?[d[0],...d.slice(1,-1),d.at(-1)]:d;
    return{variants:stops.length?[{destination:stops.at(-1),stops}]:[],directions:stops.length?[{destination:stops.at(-1),stops}]:[],start:stops[0]||'',end:stops.at(-1)||'',via:importantStops(stops)};
  }
  const primary=variants[0],start=primary.stops[0],end=primary.stops.at(-1);
  let reverse=variants.find((p,i)=>i&&p.stops[0]===end&&p.stops.at(-1)===start);
  if(!reverse)reverse=variants.find((p,i)=>i&&p.stops.at(-1)===start);
  if(!reverse)reverse=variants[1];
  return{variants,directions:[primary,reverse].filter((x,i,a)=>x&&a.indexOf(x)===i),start,end,via:importantStops(primary.stops)};
}
function routeTimeline(p,n){
  return `<section class="route-direction"><div class="route-direction-head"><span class="linebadge">${esc(n)}</span><div><small>Richtung</small><h3>${esc(p.destination||p.stops.at(-1))}</h3></div></div><ol class="timeline route-timeline">${p.stops.map((x,i)=>`<li class="${i===0||i===p.stops.length-1?'terminus':''}"><span>${esc(x)}</span></li>`).join('')}</ol></section>`;
}
function lineOverview(line){
  const m=lineModel(line),variantCount=m.variants.length;
  const via=m.via.length?`<span class="line-via">über ${m.via.map(esc).join(' · ')}</span>`:'';
  return `<article class="line-overview" data-line-card data-number="${esc(line.number)}" data-kind="${lineKind(line.number)}"><button class="line-overview-trigger" type="button" data-line-toggle aria-expanded="false"><span class="linebadge large">${esc(line.number)}</span><span class="line-overview-copy"><strong>${esc(m.start)} <span class="route-arrow">↔</span> ${esc(m.end)}</strong>${via}</span><span class="line-overview-meta">${variantCount} ${variantCount===1?'Fahrtverlauf':'Streckenvarianten'}</span><span class="line-chevron" aria-hidden="true"></span></button><div class="line-expand"><div class="line-expand-inner"><div class="route-grid">${m.directions.map(p=>routeTimeline(p,line.number)).join('')}</div>${variantCount>m.directions.length?`<div class="route-more"><span>${variantCount-m.directions.length} weitere Streckenvarianten vorhanden.</span><a class="textlink" href="/linien/${encodeURIComponent(line.number)}/">Alle Varianten der Linie ${esc(line.number)} anzeigen</a></div>`:''}<div class="route-actions">${btn(data.fahrinfo,'Fahrt in der Fahrinfo planen','button orange')}<a class="button outline" href="/linien/${encodeURIComponent(line.number)}/">Linienseite öffnen</a></div></div></div></article>`;
}
function lines(){return page('Linien & Netz','Endhaltestellen, wichtige Punkte und der komplette Fahrtverlauf – direkt in der Übersicht.',`<div class="filters line-filters"><label>Linie oder Haltestelle suchen<input id="lineq" type="search" placeholder="Zum Beispiel 26 oder Kurhaus/Theater"></label><label>Netz<select id="linetype"><option value="all">Alle Linien</option><option value="day">Tageslinien</option><option value="night">Nachtlinien</option><option value="regional">Regional- & Schnellbus</option><option value="extra">Einsatzwagen</option></select></label></div><p id="linecount" class="muted line-count"></p><div id="linelist" class="line-list">${data.lines.map(lineOverview).join('')}</div>`,'Fahrgäste')}
function stopNames(){const rows=Object.entries(data.renames).sort((a,b)=>a[1].localeCompare(b[1],'de'));return page('Haltestellennamen','Nachschlagen, wie eine bisherige Haltestelle heute heißt.',`<div class="filters"><label>Name suchen<input id="stopq" type="search" placeholder="Alter oder neuer Haltestellenname"></label></div><div class="tablewrap"><table><thead><tr><th>Bisheriger Name</th><th>Aktueller Name</th></tr></thead><tbody id="stops">${rows.map(([o,n])=>`<tr><td>${esc(o)}</td><td><strong>${esc(n)}</strong></td></tr>`).join('')}</tbody></table></div>`,'Fahrgäste')}
function fleet(){const f=data.fleetSummary;return page('Unser Fuhrpark',`${f.current} Fahrzeuge gehören aktuell zum ROGIS-Bestand.`, `<div class="statrow"><div><strong>${f.regularService}</strong><span>regulär im Betrieb</span></div><div><strong>${f.training}</strong><span>Fahrschulbus</span></div><div><strong>${f.pendingDelivery}</strong><span>noch nicht ausgeliefert</span></div><div><strong>${f.plannedTotal}</strong><span>Fahrzeuge gelistet</span></div></div><section class="section"><div class="sectionhead"><div><span class="eyebrow">Einblicke</span><h2>Fahrzeuge mit Bildmaterial.</h2></div></div><div class="grid fleet-grid">${[['1601','Mercedes-Benz Citaro C2 LE','Linienverkehr'],['1602','Mercedes-Benz Citaro C2 LE','Linienverkehr'],['1603','Mercedes-Benz Citaro C2 LE','Fahrschule']].map(([n,m,u])=>`<a class="card imagecard link" href="/fuhrpark/${n}/">${photo(n,'ROGIS-Wagen '+n)}<div class="cardbody"><div class="fleetmeta"><h3>Wagen ${n}</h3><span class="badge">${n==='1603'?'Fahrschulbus':'Im Betrieb'}</span></div><p>${m} · ${u}</p></div></a>`).join('')}</div><p class="muted small">Fahrzeuge ohne veröffentlichtes Bildmaterial gehören selbstverständlich ebenfalls zum Bestand. Grundlage der Bestandszahlen ist die ROGIS Fuhrparkliste.</p></section>`,'Unternehmen')}
export function publicRoute(){
 if(path==='/')return home();
 if(path==='/fahrgaeste')return page('Für Fahrgäste','Alles Wichtige für Ihre Fahrt mit ROGIS.',`<div class="grid three">${card('/fahrinfo/','Fahrinfo','Verbindungen und Abfahrten suchen.','network')}${card('/linien/','Linien & Netz','Linien und Ziele entdecken.','bus')}${card('/tickets/','Tickets & Tarife','Informationen rund um Ihre Fahrt.','ticket')}${card('/verkehrsmeldungen/','Verkehrsmeldungen','Aktuelle Hinweise für unterwegs.','alert')}${card('/barrierefreiheit/','Barrierefreiheit','Unterwegs mit Rollstuhl, Rollator oder Kinderwagen.','access')}${card('/haltestellen/','Haltestellennamen','Umbenennungen schnell nachschlagen.','search')}</div>`,'Fahrgäste');
 if(path==='/fahrinfo')return page('Fahrinfo','Planen Sie Ihre Verbindung und prüfen Sie Abfahrten.',`<div class="split"><div><h2>Ihre Fahrt im Blick.</h2><p>Die ROGIS Fahrinfo bündelt Verbindungssuche, Abfahrten und Live-Informationen.</p>${btn(data.fahrinfo,'ROGIS Fahrinfo öffnen','button orange')}</div><aside class="card">${icon('network')}<h3>Direkt zur Fahrinfo</h3><p>Die Fahrinfo wird als eigenes Kundensystem betrieben und öffnet sich separat.</p></aside></div>`,'Fahrgäste');
 if(path==='/linien')return lines();
 if(path.startsWith('/linien/')){const n=path.split('/')[2],l=data.lines.find(x=>x.number===n);if(l){const m=lineModel(l);return page(`Linie ${esc(n)}`,`${esc(m.start)} ↔ ${esc(m.end)} · alle bekannten Fahrtverläufe und Zwischenhalte.`,`<section class="line-detail-intro"><div><span class="linebadge xl">${esc(n)}</span><h2>${esc(m.start)} <span class="route-arrow">↔</span> ${esc(m.end)}</h2>${m.via.length?`<p class="muted">Wichtige Punkte: ${m.via.map(esc).join(' · ')}</p>`:''}</div><div class="actionrow">${btn(data.fahrinfo,'Fahrt mit Linie '+esc(n)+' planen','button orange')}${btn('/linien/','Zur Linienübersicht','button outline')}</div></section><div class="details route-details">${m.variants.map((p,i)=>`<details ${i===0?'open':''}><summary><span class="linebadge">${esc(n)}</span><span><small>Fahrtverlauf</small><strong>${esc(p.stops[0])} — ${esc(p.stops.at(-1))}</strong></span><span class="detail-chevron" aria-hidden="true"></span></summary><div class="detail-content">${routeTimeline(p,n)}</div></details>`).join('')}</div>`,'Linien & Netz')}}
 if(path==='/tickets')return page('Tickets & Tarife','Gut vorbereitet unterwegs.',`<div class="grid three">${card('/tickets/beratung/','Tarifberatung','Schildern Sie uns Ihre Strecke und Ihren Fahrtwunsch.','ticket')}${card('/fahrinfo/','Verbindung planen','Zuerst die passende Verbindung finden.','network')}${card('/kontakt/','Persönliche Frage','Unser Kundenservice hilft weiter.','service')}</div><section class="section content-narrow"><h2>Vor der Fahrt</h2><div class="details"><details><summary>Welche Fahrkarte passt?</summary><p>Für konkrete Tariffragen können Sie die Tarifberatung nutzen. Geben Sie Start, Ziel, Anzahl der Fahrten und mitfahrende Personen an.</p></details><details><summary>Gruppen und regelmäßige Fahrten</summary><p>Für Gruppen oder regelmäßig wiederkehrende Fahrten prüfen wir gemeinsam die passende Lösung.</p></details></div></section>`,'Fahrgäste');
 if(path==='/tickets/beratung')return page('Tarifberatung','Mit den richtigen Angaben kommen Sie schnell zur passenden Auskunft.',`<div class="grid three"><article class="card">${icon('ticket')}<h3>Start und Ziel</h3><p>Notieren Sie Ihre gewünschte Strecke und den Reisetag.</p></article><article class="card">${icon('people')}<h3>Wer fährt mit?</h3><p>Anzahl der Reisenden und regelmäßige Fahrten können für die Tarifwahl wichtig sein.</p></article><article class="card">${icon('calendar')}<h3>Wie oft?</h3><p>Einzelfahrt, mehrere Wege am Tag oder regelmäßige Nutzung – diese Angabe hilft bei der Einordnung.</p></article></div><section class="section content-narrow"><h2>Eine konkrete Tariffrage?</h2><p>Nutzen Sie den zentralen Kontaktbereich und wählen Sie dort als Anliegen „Tarifberatung“. So bleibt das eigentliche Formular an einer Stelle.</p><div class="actionrow">${btn('/kontakt/','Tariffrage stellen','button orange')}${btn('/tickets/','Zurück zu Tickets & Tarife','button outline')}</div></section>`,'Tickets & Tarife');
 if(path==='/service')return page('Service','Wir sind für Sie da.',`<div class="grid three">${card('/fundsachen/','Fundsachen','Etwas im Bus vergessen?','bag')}${card('/barrierefreiheit/','Barrierefreiheit','Informationen für Ihre Fahrt.','access')}${card('/kontakt/','Kontakt','Fragen, Lob, Kritik oder Anregungen.','service')}</div>`,'Fahrgäste');
 if(path==='/verkehrsmeldungen')return page('Verkehrsmeldungen','Hinweise für Ihre Fahrt im Städtedreieck.',`<div class="empty"><strong>Derzeit keine veröffentlichten Verkehrsmeldungen.</strong><p>Prüfen Sie vor Fahrtbeginn zusätzlich die ROGIS Fahrinfo.</p></div><div class="actionrow">${btn(data.fahrinfo,'Fahrinfo öffnen','button orange')}</div>`,'Fahrgäste');
 if(path==='/unternehmen')return page('Wir sind ROGIS.','Regionale Omnibusgesellschaft im Städtedreieck.',`<div class="split"><div><div class="orange-rule"></div><h2>In der Region.<br>Für die Region.</h2><p>Fahrdienst, Leitstelle, Disposition, Werkstatt, Hofdienst und Ausbildung arbeiten täglich zusammen, damit das Städtedreieck mobil bleibt.</p><div class="statrow"><div><strong>3</strong><span>Betriebshöfe</span></div><div><strong>${data.fleetSummary.current}</strong><span>Fahrzeuge aktuell</span></div><div><strong>${data.fleetSummary.plannedTotal}</strong><span>Fahrzeuge gelistet</span></div></div></div>${photo('1601','ROGIS-Wagen 1601','detailphoto')}</div><div class="grid three">${card('/fuhrpark/','Unser Fuhrpark','Busse für Stadt- und Regionalverkehr.','bus')}${card('/betriebshoefe/','Unsere Standorte','Mitte, Spryndorf und Hechem.','building')}${card('/subunternehmer/','Subunternehmer','Verkehrsleistungen im Auftrag der ROGIS.','people')}</div>`,'Unternehmen');
 if(path==='/fuhrpark')return fleet();
 if(/^\/fuhrpark\/(1601|1602|1603)$/.test(path)){const n=path.split('/')[2];return page(`Wagen ${n}`,n==='1603'?'Fahrschulbus der ROGIS Akademie.':'Aktiver Linienwagen im ROGIS-Fuhrpark.',`${photo(n,'ROGIS-Wagen '+n,'detailphoto')}<div class="card"><span class="badge">${n==='1603'?'Fahrschulbus':'Im Betrieb'}</span><h2>Mercedes-Benz Citaro C2 LE</h2><p>Baujahr 2016 · ${n==='1603'?'Einsatz ausschließlich für Ausbildung und Fahrschule; keine reguläre Linien- oder Reserve-Disposition.':'Aktiv im Linienverkehr.'}</p></div>`,'Fuhrpark')}
 if(path==='/betriebshoefe')return page('Unsere Betriebshöfe','Drei Standorte tragen den täglichen Betrieb.',`<div class="grid three">${data.depots.map((x,i)=>`<article class="card">${icon('building')}<span class="tag">Betriebshof ${i+1}</span><h2>${esc(x)}</h2><p>${x==='Mitte'?'Zentrale betriebliche Funktionen, Leitstelle und Werkstatt.':x==='Spryndorf'?'Standort in Laupendahl-Spryndorf für den Stadt- und Regionalverkehr.':'Regionaler Standort für das östliche Bedienungsgebiet.'}</p></article>`).join('')}</div>`,'Unternehmen');
 if(path==='/karriere')return page('Karriere bei ROGIS','Gemeinsam bewegen wir das Städtedreieck.',`<div class="grid three">${card('/kontakt/?karriere=fahrdienst','Fahrdienst','Menschen sicher und zuverlässig ans Ziel bringen.','bus')}${card('/kontakt/?karriere=technik','Werkstatt & Technik','Fahrzeuge prüfen, warten und instand halten.','tools')}${card('/kontakt/?karriere=ausbildung','Ausbildung','Mit der ROGIS Akademie ins Berufsleben starten.','learn')}</div><section class="section"><div class="editorial">${photo('1603','ROGIS-Fahrschulbus 1603')}<div><span class="eyebrow">ROGIS Akademie</span><h2>Ausbildung mit Praxis.</h2><p>Ausbildungsleiter Robert Edward Davis begleitet die betriebliche Ausbildung. Wagen 1603 steht der Fahrschule zur Verfügung.</p>${btn('/kontakt/?karriere=ausbildung','Interesse senden','button orange')}</div></div></section>`,'Karriere');
 if(path==='/aktuelles')return page('Aktuelles','Nachrichten aus dem Unternehmen und dem Betrieb.',`<div class="grid three"><article class="card"><span class="tag">Fuhrpark</span><h2>Elektrifizierung wird fortgesetzt</h2><p>Weitere 54 MAN Electric New Lion’s City sind laut aktueller Fuhrparkliste noch nicht ausgeliefert.</p></article><article class="card"><span class="tag">Ausbildung</span><h2>ROGIS Akademie</h2><p>Ausbildung, Unterweisungen und Fahrschule sind fest im Unternehmen verankert.</p></article><article class="card"><span class="tag">Service</span><h2>Haltestellennamen aktuell</h2><p>Das Haltestellenverzeichnis führt die aktuellen Bezeichnungen und frühere Namen zusammen.</p></article></div>`,'Aktuelles');
 if(path==='/presse')return page('Presse','Informationen und Materialien für Medien.',`<div class="split"><div><span class="eyebrow">Presse & Medien</span><h2>Informationen aus erster Hand.</h2><p>Für redaktionelle Anfragen nennen Sie bitte Medium, Thema und gewünschten Rückmeldetermin. Bildanfragen sollten zusätzlich den vorgesehenen Verwendungszweck enthalten.</p><div class="grid two compact-grid"><article class="card">${icon('building')}<h3>Unternehmensporträt</h3><p>Struktur, Betriebshöfe und Einblicke in ROGIS.</p><a class="textlink" href="/unternehmen/">Unternehmen ansehen</a></article><article class="card">${icon('news')}<h3>Aktuelle Themen</h3><p>Neuigkeiten aus Betrieb, Ausbildung und Fuhrpark.</p><a class="textlink" href="/aktuelles/">Aktuelles ansehen</a></article></div></div><aside class="card aside-card">${icon('mail')}<span class="tag">Pressekontakt</span><h3>Anfrage einreichen</h3><p>Medienanfragen laufen über unseren zentralen Kontaktbereich. Das hält Rückfragen und Unterlagen an einer Stelle zusammen.</p>${btn('/kontakt/','Zum Kontaktbereich','button orange')}</aside></div>`,'Unternehmen');
 if(path==='/barrierefreiheit')return page('Barrierefrei unterwegs','Mobilität soll für möglichst viele Menschen selbstständig nutzbar sein.',`<div class="grid three"><article class="card">${icon('access')}<h3>Ein- und Ausstieg</h3><p>Bitte nutzen Sie gekennzeichnete Türen und sprechen Sie unser Fahrpersonal bei Unterstützungsbedarf an.</p></article><article class="card">${icon('bus')}<h3>Fahrzeuge</h3><p>Informationen zu Ihrer konkreten Fahrt erhalten Sie über die Fahrinfo oder den Kundenservice.</p></article><article class="card">${icon('service')}<h3>Unterstützung</h3><p>Barrieren oder Verbesserungsmöglichkeiten können direkt gemeldet werden.</p>${btn('/kontakt/','Barriere melden','button outline')}</article></div>`,'Service');
 if(path==='/fundsachen')return page('Fundsachen','Etwas im Bus vergessen?',`<div class="split"><div><h2>Verlust melden</h2><p>Beschreiben Sie Gegenstand, Linie, Datum, Uhrzeit und möglichst Wagennummer oder Fahrtrichtung.</p>${publicForm('Fundsache')}</div><aside class="card">${icon('bag')}<h3>So hilft Ihre Beschreibung</h3><p>Je genauer die Angaben, desto leichter kann ein Fund zugeordnet werden.</p></aside></div>`,'Service');
 if(path==='/kontakt')return page('Kontakt','Ihr direkter Draht zu ROGIS.',`<div class="split"><div>${publicForm('Kontakt')}</div><aside class="contact-aside"><article class="card">${icon('service')}<h3>Damit wir schneller helfen können</h3><p>Bei Rückmeldungen zu einer Fahrt helfen Linie, Datum, Uhrzeit, Fahrtrichtung und – sofern bekannt – die Wagennummer.</p></article><article class="card">${icon('building')}<h3>ROGIS</h3><p>${esc(data.company.street)}<br>${esc(data.company.city)}<br>Telefon ${esc(data.company.phone)}</p></article><article class="card mini-links"><h3>Direkter zum Ziel</h3><a class="textlink" href="/fundsachen/">Fundsache melden</a><a class="textlink" href="/tickets/beratung/">Tarifberatung vorbereiten</a><a class="textlink" href="/barrierefreiheit/">Barrierefreiheit</a></article></aside></div>`,'Service');
 if(path==='/subunternehmer')return page('Unsere Subunternehmer','Verkehrsleistungen im Auftrag der ROGIS.',`<div class="grid two"><article class="card"><span class="tag">Subunternehmer</span><h2>Neumann Reisen</h2><p>Führt beauftragte Verkehrsleistungen im ROGIS-Netz durch. ROGIS bleibt Auftraggeber und zentraler Ansprechpartner für Fahrgäste.</p></article><article class="card"><span class="tag">Subunternehmer</span><h2>Breitbau Tours</h2><p>Führt beauftragte Verkehrsleistungen im ROGIS-Netz durch. Fahrgastinformationen und Kundenkontakt laufen über ROGIS.</p></article></div>`,'Unternehmen');
 if(path==='/haltestellen')return stopNames();
 if(path==='/impressum')return page('Impressum','Angaben zum Anbieter.',`<div class="content-narrow"><h2>${esc(data.company.name)}</h2><p>${esc(data.company.street)}<br>${esc(data.company.city)}</p><p>Geschäftsführer: ${esc(data.company.director)}<br>${esc(data.company.register)}</p><p>Telefon: ${esc(data.company.phone)}</p></div>`,'Rechtliches');
 if(path==='/datenschutz')return page('Datenschutz','Hinweise zur Verarbeitung von Daten auf dieser Website.',`<div class="content-narrow"><h2>Kontakt- und Portaldaten</h2><p>Angaben aus Kontaktformularen werden zur Bearbeitung Ihres Anliegens im ROGIS-System gespeichert und intern an die zuständige Stelle weitergegeben. Mitarbeiterdaten im internen Portal werden ausschließlich zur Bereitstellung der jeweiligen Funktionen verarbeitet.</p><h2>Sitzungen</h2><p>Das Mitarbeiterportal verwendet ein technisch notwendiges, sicheres Sitzungscookie. Es dient ausschließlich der Anmeldung und Berechtigungsprüfung.</p></div>`,'Rechtliches');
 return page('Seite nicht gefunden','Die gewünschte Seite ist nicht verfügbar.',btn('/','Zur Startseite'),'ROGIS');
}