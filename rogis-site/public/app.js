import {path,$,esc,btn,header,footer,wirePublic} from './shared.js';
import {publicRoute} from './public.js';
import {login,portal} from './portal.js';
try{
 if(path==='/mitarbeiter/login')login();
 else if(path.startsWith('/mitarbeiter'))await portal();
 else{$('#app').innerHTML=header()+`<main id="main">${publicRoute()}</main>`+footer();wirePublic()}
}catch(e){$('#app').innerHTML=`<main class="wrap pagebody"><h1>Die Seite konnte nicht geladen werden.</h1><p>${esc(e.message)}</p>${btn('/','Zur Startseite')}</main>`}