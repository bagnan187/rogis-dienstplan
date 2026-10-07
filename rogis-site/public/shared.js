export const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const baseData=await fetch('/data.json').then(r=>r.json());
async function loadLineData(){
  try{
    const r=await fetch('/lines.json.gz',{cache:'no-cache'});
    if(!r.ok)throw new Error('Liniennetz nicht erreichbar');
    if(typeof DecompressionStream==='undefined')throw new Error('Browser unterstützt komprimierte Netzdaten nicht');
    const stream=r.body.pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }catch(e){
    console.warn('ROGIS Liniennetz: Fallback aktiv',e);
    return baseData.lines||[];
  }
}
export const data={...baseData,lines:await loadLineData()};
export const path=decodeURI(location.pathname).replace(/\/$/,'')||'/';
const P={bus:'M6 17h20V6q0-3-10-3T6 6zm0-8h20M10 3v6m12-6v6M8 17v4m16-4v4M10 13h1m10 0h1M5 25h22',network:'M6 6h14q6 0 6 6t-6 6H12q-6 0-6 6v2M6 3v6m6 6v6m14-12v6M3 26h6',ticket:'M4 7h24v6a3 3 0 0 0 0 6v6H4v-6a3 3 0 0 0 0-6zm16 0v4m0 4v2m0 4v4M9 11h6m-6 5h6m-6 5h3',service:'M4 17v-3a12 12 0 0 1 24 0v3M4 13h4v10H4zm20 0h4v10h-4zm0 10q0 5-8 5h-3',alert:'M16 3 30 27H2zm0 8v7m0 4v1',building:'M5 28V8l11-5 11 5v20M2 28h28M10 11h2m8 0h2m-12 5h2m8 0h2m-12 5h2m8 0h2m-8 7v-5h4v5',people:'M12 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8m10 1a3 3 0 1 1 0 6M3 27v-4q0-6 9-6t9 6v4m2-11q6 1 6 6v5',access:'M16 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4M5 10h22m-11 0v9m0-3-6 12m6-12 6 12',bag:'M7 10h18v19H7zm5 0V6a4 4 0 0 1 8 0v4M7 16h18',news:'M5 4h20v23H5zm4 5h12m-12 5h5v5H9zm9 0h3m-3 5h3M9 23h12m4-14h4v17q0 3-4 1',calendar:'M5 6h22v23H5zm0 7h22M10 3v6m12-6v6M10 18h2m8 0h2m-12 6h2m8 0h2',document:'M7 3h12l6 6v20H7zm12 0v6h6M11 14h10m-10 5h10m-10 5h6',swap:'M4 9h23l-5-5m5 5-5 5M28 23H5l5 5m-5-5 5-5',tools:'m6 3 5 5-3 3-5-5q-2 9 7 9l14 14 5-5-14-14Q15 2 6 3z',learn:'m2 11 14-8 14 8-14 8zm5 3v9q9 7 18 0v-9m5-3v13',lock:'M8 14h16v15H8zm3 0V8a5 5 0 0 1 10 0v6m-5 6v4',dashboard:'M4 4h10v10H4zm14 0h10v6H18zM4 18h10v10H4zm14-4h10v14H18z',menu:'M4 8h24M4 16h24M4 24h24',mail:'M3 7h26v20H3zm0 0 13 11L29 7',search:'M14 3a10 10 0 1 1 0 20 10 10 0 0 1 0-20m7 18 8 8'};
export const icon=n=>`<svg class="icon" aria-hidden="true" viewBox="0 0 32 32"><path d="${P[n]||P.document}"/></svg>`;
export const brand=`<span class="brand"><img src="/assets/rogis-logo.png" alt="ROGIS" width="600" height="95"></span>`;
export const btn=(u,t,c='button')=>`<a href="${u}" class="${c}">${t}</a>`;
export const photo=(n,alt,cls='')=>`<img class="${cls}" src="${data.photos?.[n]||''}" alt="${esc(alt)}" loading="lazy">`;
export const card=(u,t,b,i='bus')=>`<a href="${u}" class="card link">${icon(i)}<h3>${t}</h3><p>${b}</p><span class="textlink">Mehr erfahren</span></a>`;
export const page=(title,intro,body,cat='ROGIS')=>{document.title=`${title} · ROGIS`;return `<section class="pagehero"><div class="wrap"><div class="crumb"><a href="/">Startseite</a> / ${esc(cat)}</div><span class="eyebrow">${esc(cat)}</span><h1>${title}</h1><p>${intro}</p></div></section><div class="wrap pagebody">${body}</div>`};
export const header=()=>`<div class="topbar"><div class="wrap"><span>Regionale Omnibusgesellschaft im Städtedreieck</span><div class="toplinks"><a href="/barrierefreiheit/">Barrierefreiheit</a><a href="/mitarbeiter/">Mitarbeiterportal</a></div></div></div><header class="sitehead"><div class="wrap headrow"><a href="/" aria-label="ROGIS Startseite">${brand}</a><button class="menu" aria-expanded="false" aria-controls="navigation">${icon('menu')} Menü</button><nav id="navigation" class="navigation" aria-label="Hauptnavigation">${[['/fahrgaeste/','Fahrgäste'],['/service/','Service'],['/unternehmen/','Unternehmen'],['/karriere/','Karriere'],['/aktuelles/','Aktuelles'],['/kontakt/','Kontakt']].map(([u,t])=>`<a href="${u}">${t}</a>`).join('')}</nav>${btn('/fahrinfo/','Fahrinfo','button orange')}</div></header>`;
export const footer=()=>`<footer class="sitefooter"><div class="wrap"><div class="footgrid"><div><a href="/">${brand}</a><p>Wir verbinden das Städtedreieck.<br>Tag für Tag. Fahrt für Fahrt.</p></div><div><h3>Unterwegs</h3><a href="/fahrinfo/">Fahrinfo</a><a href="/linien/">Linien & Netz</a><a href="/tickets/">Tickets & Tarife</a><a href="/verkehrsmeldungen/">Verkehrsmeldungen</a></div><div><h3>ROGIS</h3><a href="/unternehmen/">Unternehmen</a><a href="/fuhrpark/">Fuhrpark</a><a href="/betriebshoefe/">Betriebshöfe</a><a href="/subunternehmer/">Subunternehmer</a><a href="/karriere/">Karriere</a></div><div><h3>Service</h3><a href="/fundsachen/">Fundsachen</a><a href="/barrierefreiheit/">Barrierefreiheit</a><a href="/kontakt/">Kontakt</a><a href="/presse/">Presse</a><a href="/mitarbeiter/">Mitarbeiterportal</a></div></div><div class="footerbottom"><span>© ${new Date().getFullYear()} ROGIS</span><div><a href="/impressum/">Impressum</a><a href="/datenschutz/">Datenschutz</a></div></div></div></footer>`;
export function publicForm(category='Kontakt'){return `<form class="public-form formcard"><h2>Schreiben Sie uns</h2><label>Anliegen<select name="category">${['Kontakt','Fundsache','Bewerbung','Barrierefreiheit','Presse','Tarifberatung'].map(x=>`<option ${x===category?'selected':''}>${x}</option>`).join('')}</select></label><div class="grid two"><label>Ihr Name<input name="name" required minlength="2" maxlength="100" autocomplete="name"></label><label>E-Mail<input name="email" type="email" required maxlength="254" autocomplete="email"></label></div><label>Ihre Nachricht<textarea name="body" required minlength="10" maxlength="5000"></textarea></label><label><input type="checkbox" required>Ich habe die <a class="textlink" href="/datenschutz/">Datenschutzhinweise</a> gelesen.</label><button>Nachricht senden</button><div class="feedback" role="status"></div></form>`}
export function wirePublic(){
  const menu=$('.menu');
  menu?.addEventListener('click',e=>{
    const n=$('#navigation'),open=n.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menu){
      menu.setAttribute('aria-expanded','false');
      $('#navigation')?.classList.remove('open');
    }
  });

  $$('.public-form').forEach(f=>f.addEventListener('submit',async e=>{
    e.preventDefault();
    const b=f.querySelector('button'),m=f.querySelector('.feedback');
    b.disabled=true;
    try{
      const r=await fetch('/api/public-request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});
      const j=await r.json();
      if(!r.ok)throw Error(j.error||'Anfrage konnte nicht gesendet werden.');
      f.reset();m.className='feedback';
      m.textContent=`Vielen Dank. Ihre Anfrage R-${String(j.id).padStart(5,'0')} wurde an Emil Breitbau weitergeleitet.`;
    }catch(x){m.className='feedback error';m.textContent=x.message}
    finally{b.disabled=false}
  }));

  const filterLines=()=>{
    if(!$('#lineq'))return;
    const q=$('#lineq').value.toLocaleLowerCase('de').trim();
    const type=$('#linetype')?.value||'all';
    let shown=0;
    $$('[data-line-card]').forEach(card=>{
      const hit=(!q||card.textContent.toLocaleLowerCase('de').includes(q))&&(type==='all'||card.dataset.kind===type);
      card.hidden=!hit;if(hit)shown++;
    });
    if($('#linecount'))$('#linecount').textContent=shown===1?'1 Linie gefunden':shown+' Linien gefunden';
  };
  $('#lineq')?.addEventListener('input',filterLines);
  $('#linetype')?.addEventListener('change',filterLines);
  filterLines();

  $$('[data-line-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('[data-line-card]'),panel=card?.querySelector('.line-expand');
    if(!card||!panel)return;
    const open=card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded',String(open));
    panel.style.maxHeight=open?panel.scrollHeight+'px':'0px';
  }));
  addEventListener('resize',()=>$$('[data-line-card].is-open .line-expand').forEach(p=>p.style.maxHeight=p.scrollHeight+'px'));

  $('#stopq')?.addEventListener('input',e=>{
    const q=e.target.value.toLocaleLowerCase('de');
    $$('#stops tr').forEach(x=>x.hidden=!x.textContent.toLocaleLowerCase('de').includes(q));
  });

  $$('details').forEach(d=>d.addEventListener('toggle',()=>{
    if(d.open){d.classList.remove('detail-pop');requestAnimationFrame(()=>d.classList.add('detail-pop'))}
  }));

  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(x=>{
      if(x.isIntersecting){x.target.classList.add('is-visible');io.unobserve(x.target)}
    }),{threshold:.08,rootMargin:'0px 0px -24px'});
    $$('.card,.line-overview,.editorial,.kpi,.info-line').forEach((el,i)=>{
      el.classList.add('reveal');el.style.setProperty('--reveal-delay',Math.min(i%6,5)*45+'ms');io.observe(el);
    });
  }
}
