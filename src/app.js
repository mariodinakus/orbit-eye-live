import { GROUPS, GROUP_LIMITS, downsample, detectMission, inferOperator, resolveOwner, documentedSwath, greatCircleCircle, formatCoords, epochAgeHours, orbitPeriod } from './utils.mjs';
import * as sat from 'https://cdn.jsdelivr.net/npm/satellite.js@6.0.2/+esm';

const $ = id => document.getElementById(id);
const COLOURS = {selected:'#8ce4c6',default:'#6cbbdf',weather:'#79aef1',stations:'#ffc98a',resource:'#9ee0b7',science:'#c6aaf2',demo:'#ffbc84'};
const FEATURED_GROUPS = ['stations','weather','resource','science','gps-ops','galileo','iridium-NEXT'];
const DEFAULT_GLOBE = [16.5,17.0];
const maplibre = () => window.maplibregl;
const langCache = (()=>{try{return localStorage.getItem('orbit-eye-lang')||'el'}catch{return 'el'}})();
const state = {lang:langCache,group:'featured',raw:[],positions:[],selectedId:null,sort:'altitude',query:'',globe:null,surface:null,map2d:null,groundMarker:null,follow:true,view:'3d',layer:'imagery',lastGlobeFollow:0,lastMapFollow:0,lastOrbitDraw:0,lastListDraw:0,activeDatasets:[],demo:false,loading:false,refreshClock:null,hasLoaded:false};
const tr = {
 el:{liveTracking:'ΖΩΝΤΑΝΗ ΠΑΡΑΚΟΛΟΥΘΗΣΗ ΤΡΟΧΙΩΝ',missionControl:'ΚΕΝΤΡΟ ΕΛΕΓΧΟΥ',explore:'ΕΞΕΡΕΥΝΗΣΗ ΔΟΡΥΦΟΡΙΚΩΝ ΔΙΚΤΥΩΝ',satelliteExplorer:'Εξερευνητής δορυφόρων',collections:'ΚΑΤΗΓΟΡΙΕΣ',featured:'Όλες οι αποστολές',stations:'Διαστημικοί σταθμοί',weather:'Μετεωρολογικοί',earthObs:'Παρατήρηση Γης',science:'Επιστημονικοί',trackedObjects:'ΔΟΡΥΦΟΡΟΙ ΣΤΗ ΛΙΣΤΑ',altitude:'ΥΨΟΜΕΤΡΟ',orbitEngine:'ΥΠΟΛΟΓΙΣΜΟΣ ΤΡΟΧΙΑΣ SGP4',realtimeEnvironment:'ΔΟΡΥΦΟΡΙΚΗ ΚΙΝΗΣΗ ΣΕ ΠΡΑΓΜΑΤΙΚΟ ΧΡΟΝΟ',earthInMotion:'Η Γη σε κίνηση<span class="heading-period">.</span>',earthDesc:'Δες τις τροχιές να εξελίσσονται πάνω από τον πλανήτη, δευτερόλεπτο προς δευτερόλεπτο.',trackingNow:'ΕΜΦΑΝΙΖΟΝΤΑΙ',satellites:'ΔΟΡΥΦΟΡΟΙ',altitudeSelected:'ΥΨΟΣ ΕΠΙΛΟΓΗΣ',resetView:'↺ ΕΠΑΝΑΦΟΡΑ',follow:'◎ ΑΚΟΛΟΥΘΙΑ',selectedOrbit:'Επιλεγμένη τροχιά',fleet:'Δορυφόροι',subsatellite:'Κάθετο σημείο',lookDown:'ΚΟΙΤΑΖΟΝΤΑΣ ΠΡΟΣ ΤΗ ΓΗ',satelliteEye:'ΔΟΡΥΦΟΡΙΚΟ ΜΑΤΙ',groundTrack:'● ΖΩΝΤΑΝΗ ΘΕΣΗ',satelliteMap:'ΔΟΡΥΦΟΡΙΚΟΣ',nasaImagery:'NASA ΕΙΚΟΝΕΣ',nightMap:'ΣΚΟΤΕΙΝΟΣ',truthTitle:'Τι βλέπω πραγματικά;',truthCopy:'Τρέχουσα υπολογισμένη θέση πάνω από δορυφορικό χάρτη, ΟΧΙ ζωντανή κάμερα. Η κάλυψη αισθητήρα εμφανίζεται μόνο όταν τεκμηριώνεται.',viewLiveFeeds:'LIVE ΠΗΓΕΣ ↗',objectDetails:'ΣΤΟΙΧΕΙΑ ΔΟΡΥΦΟΡΟΥ',currentlyTracked:'ΕΠΙΛΕΓΜΕΝΟΣ ΔΟΡΥΦΟΡΟΣ',positionComputed:'ΥΠΟΛΟΓΙΣΜΕΝΗ ΤΡΟΧΙΑ',altitudeLabel:'ΥΨΟΣ',speedLabel:'ΤΡΟΧΙΑΚΗ ΤΑΧΥΤΗΤΑ',inclination:'ΚΛΙΣΗ ΤΡΟΧΙΑΣ',orbitalPeriod:'ΠΕΡΙΟΔΟΣ',ownership:'ΧΩΡΑ & ΑΠΟΣΤΟΛΗ',ownerCountry:'Χώρα / φορέας',operator:'Εταιρεία / οργανισμός',mission:'Τύπος αποστολής',launch:'Εκτόξευση',earthView:'ΠΑΡΑΤΗΡΗΣΗ ΓΗΣ',latitude:'Γεωγραφικό πλάτος',longitude:'Γεωγραφικό μήκος',imagingSwath:'Γνωστό πλάτος σάρωσης',source:'ΤΡΟΧΙΑΚΑ ΔΕΔΟΜΕΝΑ',satcatSource:'Πηγή ιδιοκτησίας',sourceNote:'Οι θέσεις υπολογίζονται με SGP4, δεν προέρχονται από ζωντανό GPS. Παλιά τροχιακά δεδομένα μειώνουν την ακρίβεια.',actualFeeds:'ΠΡΑΓΜΑΤΙΚΕΣ ΖΩΝΤΑΝΕΣ ΕΙΚΟΝΕΣ',lockTarget:'ΚΕΝΤΡΑΡΙΣΜΑ ΣΤΟΝ ΔΟΡΥΦΟΡΟ',disclaimer:'Εκπαιδευτική χρήση · Όχι για πλοήγηση ή αποφυγή συγκρούσεων',understandingTitle:'Πώς λειτουργεί η ζωντανή απεικόνιση',verifiedVideo:'ΠΡΑΓΜΑΤΙΚΕΣ ΠΗΓΕΣ ΕΙΚΟΝΑΣ',liveVideoTitle:'Αληθινή θέα από το διάστημα',issFeedCaution:'Η NASA μπορεί να δείξει μαγνητοσκοπημένο υλικό αν δεν υπάρχει σήμα. Το βίντεο δεν συγχρονίζεται με τη χαρτογραφημένη τροχιά.',meteosatCaution:'Πραγματικές εικόνες μετεωρολογικού δορυφόρου περίπου ανά 10 λεπτά και καθυστέρηση επεξεργασίας — όχι συνεχής κάμερα.'},
 en:{liveTracking:'LIVE ORBITAL TRACKING',missionControl:'MISSION CONTROL',explore:'EXPLORE THE CONSTELLATIONS',satelliteExplorer:'Satellite explorer',collections:'COLLECTIONS',featured:'Discovery mix',stations:'Space stations',weather:'Weather satellites',earthObs:'Earth observation',science:'Scientific missions',trackedObjects:'TRACKED OBJECTS',altitude:'ALTITUDE',orbitEngine:'SGP4 ORBIT ENGINE',realtimeEnvironment:'REAL-TIME ORBITAL ENVIRONMENT',earthInMotion:'Earth, in motion<span class="heading-period">.</span>',earthDesc:'Watch spacecraft move above our planet, second by second.',trackingNow:'TRACKING NOW',satellites:'SATELLITES',altitudeSelected:'SELECTED ALTITUDE',resetView:'↺ RESET VIEW',follow:'◎ FOLLOW',selectedOrbit:'Selected orbit',fleet:'Satellite fleet',subsatellite:'Sub-satellite point',lookDown:'LOOKING DOWN FROM ORBIT',satelliteEye:'SATELLITE EYE',groundTrack:'● LIVE POSITION',satelliteMap:'SATELLITE MAP',nasaImagery:'NASA IMAGERY',nightMap:'DARK MAP',truthTitle:'What am I actually seeing?',truthCopy:'Continuously computed position over satellite imagery, NOT a live camera from this spacecraft. Sensor coverage appears only if documented.',viewLiveFeeds:'LIVE FEEDS ↗',objectDetails:'OBJECT INTELLIGENCE',currentlyTracked:'CURRENTLY TRACKED',positionComputed:'ORBIT POSITION COMPUTED',altitudeLabel:'ALTITUDE',speedLabel:'ORBITAL SPEED',inclination:'INCLINATION',orbitalPeriod:'ORBIT PERIOD',ownership:'OWNERSHIP & MISSION',ownerCountry:'Owner / country',operator:'Operator / company',mission:'Mission type',launch:'Launch date',earthView:'EARTH OBSERVATION',latitude:'Latitude',longitude:'Longitude',imagingSwath:'Documented imaging swath',source:'ORBITAL ELEMENTS',satcatSource:'Catalog ownership',sourceNote:'Positions are SGP4 predictions, not live GPS telemetry. Old orbital elements reduce accuracy.',actualFeeds:'REAL LIVE EARTH FEEDS',lockTarget:'LOCK ON TARGET',disclaimer:'Educational tracking · Not for navigation or collision avoidance',understandingTitle:'Understanding the live view',verifiedVideo:'PUBLIC VIDEO & SATELLITE IMAGE SOURCES',liveVideoTitle:'Actual views from space',issFeedCaution:'NASA may show recorded footage when live signal is unavailable. Video is not synchronized with computed ground track.',meteosatCaution:'Actual weather-satellite imagery is refreshed roughly every 10 minutes with processing delay — not a continuous camera.'}
};
const T=(greek,english)=>state.lang==='el'?greek:english;
const setText=(id,value)=>{const node=$(id);if(node)node.textContent=value==null?'—':String(value)};
const fmt=(value,digits=0)=>Number.isFinite(value)?value.toLocaleString(state.lang==='el'?'el-GR':'en-US',{maximumFractionDigits:digits,minimumFractionDigits:digits}):'—';
function toast(message){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add('hidden'),5000);}
function updateI18n(){document.documentElement.lang=state.lang;for(const [key,value] of Object.entries(tr[state.lang])){document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el=>{if(key==='earthInMotion')el.innerHTML=value;else el.textContent=value;});}setText('langButton',state.lang==='el'?'EN':'ΕΛ');$('satSearch').placeholder=T('Όνομα δορυφόρου ή NORAD ID','Satellite name or NORAD ID');try{localStorage.setItem('orbit-eye-lang',state.lang)}catch{};setInfoText();if(state.positions.length)renderDetails();}
function setInfoText(){const blocks= state.lang==='el'?[['Ζωντανή θέση ≠ ζωντανή κάμερα','Μετατρέπουμε τροχιακά στοιχεία OMM του CelesTrak σε τρέχουσα προβλεπόμενη θέση με το μαθηματικό μοντέλο SGP4. Η απεικόνιση ενημερώνεται κάθε δευτερόλεπτο αλλά δεν είναι απευθείας τηλεμετρία.'],['Satellite Eye','Ο κάτω χάρτης δείχνει εικόνα υποβάθρου γύρω από το σημείο της Γης ακριβώς κάτω από τον επιλεγμένο δορυφόρο. Οι εικόνες Esri δεν είναι live. Το NASA VIIRS έχει ημερομηνία λήψης και συνήθως υστέρηση.'],['Ποιο ακριβώς έδαφος βλέπει;','Για Sentinel-2 και Landsat 8/9 εμφανίζουμε τεκμηριωμένο ονομαστικό πλάτος σάρωσης. Η ενδεικτική κυκλική επισήμανση δεν είναι πραγματικό γεωμετρικό περίγραμμα αισθητήρα. Για άλλους δεν υποθέτουμε ότι φωτογραφίζουν τη Γη.'],['Χώρα και εταιρεία','Η χώρα προέρχεται από το πεδίο OWNER του SATCAT. Για γνωστά δίκτυα, η εταιρεία εκτιμάται από το όνομα και επισημαίνεται ως μη ανεξάρτητα επαληθευμένη. Η χώρα εκτόξευσης δεν ταυτίζεται πάντα με τον ιδιοκτήτη.'],['Όρια ακρίβειας και ανανέωση','Τα τροχιακά δεδομένα ανανεώνονται το πολύ κάθε δύο ώρες σύμφωνα με την πολιτική CelesTrak. Το ύψος των εικονιδίων στη σφαίρα μεγεθύνεται οπτικά. Η θέση μπορεί να αποκλίνει όταν το epoch είναι παλιό.']]:[['Live position ≠ live camera','CelesTrak orbital OMM elements are propagated to a current predicted position via SGP4. The view updates every second but is not direct onboard GPS telemetry.'],['Satellite Eye','The lower map shows satellite basemap imagery around the point directly under the selected spacecraft. Esri imagery is not live. NASA VIIRS imagery is date-stamped and normally delayed.'],['What ground does a satellite actually see?','Only Sentinel-2 and Landsat 8/9 show documented nominal sensor swath widths. Circular highlight is illustrative, not the exact optical footprint. Other objects are not assumed to be Earth cameras.'],['Owner and company','Owner codes are from CelesTrak SATCAT. Known operators may be inferred from satellite names and labeled as such. Launch country and owner are not interchangeable.'],['Accuracy and data refresh','Orbital data is cached for at least two hours under CelesTrak policy. Dot altitude on globe is visually exaggerated. Old element epochs degrade positional precision.']];$('infoBody').innerHTML=blocks.map(([title,body])=>`<div class="info-block"><strong>${title}</strong><p>${body}</p></div>`).join('');}
function normalizeEpoch(iso){return iso?(String(iso).endsWith('Z')||/[+-]\d\d:?\d\d$/.test(iso)?String(iso):`${iso}Z`):null;}
function groupNames(group){return group==='featured'?FEATURED_GROUPS:[group];}
function cacheKey(type,g){return `orbit-eye:v2:${type}:${g}`;}
async function getDataset(type,group){
 const key=cacheKey(type,group),ttl=type==='orbits'?7200000:43200000;
 try{const hit=JSON.parse(localStorage.getItem(key));if(hit && Date.now()-hit.time<ttl && Array.isArray(hit.data))return hit.data;}catch{}
 let data;
 // In production Vercel API handles upstream CORS and CDN-level 2h/12h cache.
 try{
  const response=await fetch(`/api/${type}?group=${encodeURIComponent(group)}`,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const body=await response.json(); if(!Array.isArray(body.data))throw new Error('Invalid response');data=body.data;
 }catch(error){
  if(location.hostname!=='localhost' && location.protocol!=='file:')throw error;
  const path=type==='orbits'?`NORAD/elements/gp.php?GROUP=${encodeURIComponent(group.toUpperCase())}&FORMAT=JSON`:`satcat/records.php?GROUP=${encodeURIComponent(group.toUpperCase())}&FORMAT=JSON&PAYLOADS=1&ONORBIT=1`;
  const response=await fetch(`https://celestrak.org/${path}`,{signal:AbortSignal.timeout(16000)});
  if(!response.ok)throw new Error(`CelesTrak HTTP ${response.status}`);
  data=await response.json(); if(!Array.isArray(data))throw new Error('Invalid CelesTrak data');
 }
 try{localStorage.setItem(key,JSON.stringify({time:Date.now(),data}));}catch{}
 return data;
}
function prepareSatellite(row,meta,group){
 try{
  if(!row.NORAD_CAT_ID||!row.EPOCH)return null;
  const orbit=sat.json2satrec(row);const name=String(row.OBJECT_NAME||`NORAD ${row.NORAD_CAT_ID}`),id=String(row.NORAD_CAT_ID);
  return {id,name,group,orbit,epoch:normalizeEpoch(row.EPOCH),objectId:row.OBJECT_ID||meta?.OBJECT_ID||'',ownerCode:meta?.OWNER||'',launch:meta?.LAUNCH_DATE||'',operator:inferOperator(name),mission:detectMission(name,group),swath:documentedSwath(name),meanMotion:Number(row.MEAN_MOTION)||0,inclination:Number(row.INCLINATION)||0,lat:0,lng:0,altKm:0,speed:0,valid:false};
 }catch{return null;}
}
async function loadGroup(group,job){
 const datasets=groupNames(group);
 const outcomes=await Promise.allSettled(datasets.map(async g=>{
  const rows=await getDataset('orbits',g);
  let meta=[];try{meta=await getDataset('catalog',g)}catch{} // Orbit tracking continues without metadata; never invent owner.
  return {g,rows,meta};
 }));
 if(job!==state.refreshClock)return;
 const good=outcomes.filter(o=>o.status==='fulfilled').map(o=>o.value);
 if(!good.length){throw new Error('No orbit data available for the selected collection');}
 const seen=new Set();const satellites=[];let fetched=0;
 for(const {g,rows,meta} of good){
  fetched+=rows.length;
  const mapping=new Map(meta.map(m=>[String(m.NORAD_CAT_ID),m]));
  const limits=group==='featured'?{stations:30,weather:75,resource:80,science:45,'gps-ops':45,galileo:45,'iridium-NEXT':35}:{};
  const slice=downsample(rows,limits[g]??GROUP_LIMITS[group]??330);
  for(const row of slice){const id=String(row.NORAD_CAT_ID);if(seen.has(id))continue;seen.add(id);
   const obj=prepareSatellite(row,mapping.get(id),g); if(obj)satellites.push(obj);
  }
 }
 state.raw=satellites;state.activeDatasets=good.map(v=>v.g);state.demo=false;state.fetchedTotal=fetched;
 const persisted=state.selectedId&&state.raw.find(s=>s.id===state.selectedId);
 state.selectedId=persisted?persisted.id:(state.raw.find(s=>/ISS \(/i.test(s.name))||state.raw[0])?.id||null;
 state.hasLoaded=true;state.loading=false;tick(true);
 setText('dataStatus',`CELESTRAK · ${state.activeDatasets.length} ${state.lang==='el'?'ΟΜΑΔΕΣ':'FEEDS'}`);
 setText('ticker',T(`Συνδεδεμένα δεδομένα CelesTrak · ${fmt(fetched)} καταχωρίσεις λήφθηκαν · Απεικόνιση ${fmt(satellites.length)} δορυφόρων · Δεν πρόκειται για live κάμερες`,`CelesTrak data connected · ${fmt(fetched)} catalog entries fetched · Rendering ${fmt(satellites.length)} satellites · Ground view is not a live camera`));
 setText('sourceAge',T(`OMM · ανανέωση δεδομένων ≥2 ώρες · ${good.length} κατηγορίες`,`OMM · cache refresh ≥2 hours · ${good.length} categories`));
 if(good.length<datasets.length)toast(T('Ορισμένες κατηγορίες δεν φορτώθηκαν. Εμφανίζονται οι διαθέσιμες.','Some categories could not load; showing available feeds.'));
}
function useDemo(){
 const names=['DEMO · LOW EARTH 01','DEMO · LOW EARTH 02','DEMO · POLAR 03','DEMO · WEATHER 04','DEMO · EQUATORIAL 05','DEMO · SCIENCE 06'];
 state.raw=names.map((name,i)=>({name,id:`DEMO-${i}`,group:'demo',epoch:null,objectId:'SIMULATION ONLY',ownerCode:'',launch:'',operator:'No real satellite data',mission:'Illustrative orbit',swath:null,meanMotion:12+i*.5,inclination:35+i*9,altKm:380+i*90,speed:7.5,valid:true,demo:true,phase:i*1.047,lat:0,lng:0}));
 state.selectedId=state.raw[0].id;state.demo=true;state.loading=false;state.fetchedTotal=0;tick(true);
 setText('dataStatus','DEMO · NOT LIVE');setText('ticker',T('ΛΕΙΤΟΥΡΓΙΑ ΕΠΙΔΕΙΞΗΣΗΣ — τα δεδομένα CelesTrak δεν είναι διαθέσιμα · Οι θέσεις είναι συνθετικές και ΟΧΙ πραγματικές','DEMO MODE — CelesTrak data is unavailable · Positions are synthetic, NOT real-world tracking'));
 setText('sourceAge',T('Μη διαθέσιμα ζωντανά τροχιακά δεδομένα','Live orbit data unavailable'));
 toast(T('Η σύνδεση απέτυχε. Προβάλλεται σαφώς επισημασμένη προσομοίωση.','Connection failed. Explicitly labeled simulation is being displayed.'));
}
async function switchGroup(group){
 if(!GROUPS.includes(group)||state.loading)return;
 state.group=group;state.loading=true;const token=Symbol(group);state.refreshClock=token;
 document.querySelectorAll('.collection').forEach(b=>b.classList.toggle('active',b.dataset.group===group));
 setText('dataStatus','SYNCING');setText('satList',T('Φόρτωση τροχιών από CelesTrak…','Loading orbital elements from CelesTrak…'));
 try{await loadGroup(group,token)}catch(err){console.warn('Orbit catalog:',err);useDemo();}
}
function posFor(obj,now){
 if(obj.demo){const seconds=now.getTime()/1000,phase=seconds*.0015+obj.phase;const lat=obj.inclination*Math.sin(phase);const lng=((seconds*.15+obj.phase*110)%360)-180;return {lat,lng,altKm:obj.altKm,speed:7.4};}
 try{
  const result=sat.propagate(obj.orbit,now);
  if(!result || !result.position || !result.velocity)return null;
  const p=result.position,v=result.velocity,gmst=sat.gstime(now),geo=sat.eciToGeodetic(p,gmst);
  const lat=sat.degreesLat(geo.latitude),lng=sat.degreesLong(geo.longitude),altKm=geo.height;
  if(![lat,lng,altKm].every(Number.isFinite)||altKm< -1)return null;
  return {lat,lng,altKm,speed:Math.hypot(v.x,v.y,v.z)};
 }catch{return null;}
}
function visAlt(km){return Math.max(.025,Math.min(.41,.036+Math.log1p(Math.max(0,km)/450)*.105));}
function getSelected(){return state.positions.find(p=>p.id===state.selectedId)||null;}
function updatePositionList(now){const arr=[];for(const o of state.raw){const p=posFor(o,now);if(!p)continue;Object.assign(o,p,{valid:true});arr.push(o);}state.positions=arr;}
function tick(force=false){
 if(state.raw.length===0)return;
 const now=new Date();updatePositionList(now);
 const s=getSelected();
 setText('liveCount',fmt(state.positions.length));setText('totalCount',fmt(state.positions.length));setText('globeAltitude',s?fmt(s.altKm):'—');
 if(s){renderDetails();moveSurface(s,force);if(state.view==='2d')update2DPositions(force);}
 if(state.globe){const points=state.positions.map(p=>({...p,visAltitude:visAlt(p.altKm)}));state.globe.pointsData(points);
  if(s){state.globe.ringsData([{lat:s.lat,lng:s.lng}]);if(force||Date.now()-state.lastOrbitDraw>20000){drawGlobeOrbit(s);state.lastOrbitDraw=Date.now();}}
  if(state.follow&&s&&(force||Date.now()-state.lastGlobeFollow>5000)&&state.view==='3d'){
   state.globe.pointOfView({lat:s.lat,lng:s.lng,altitude:2.12},force?1000:4600);state.lastGlobeFollow=Date.now();
  }
 }
 if(force||Date.now()-state.lastListDraw>4500){renderList();state.lastListDraw=Date.now();}
}
function orbitCoordinates(s,range=1){
 const period=orbitPeriod(s.meanMotion)||95,now=Date.now(),points=[];
 for(let i=0;i<=90;i++){
  const ts=now+(i/90-.5)*period*60000*range;
  const p=posFor(s,new Date(ts));if(p)points.push({lat:p.lat,lng:p.lng,alt:visAlt(p.altKm)});
 }return points;
}
function drawGlobeOrbit(s){if(!state.globe)return;state.globe.pathsData([{id:s.id,coords:orbitCoordinates(s)}]);}
function renderList(){
 const items=state.positions.filter(s=>s.name.toLowerCase().includes(state.query)||s.id.includes(state.query));
 items.sort(state.sort==='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>a.altKm-b.altKm);
 setText('resultCount',fmt(items.length));setText('collectionCount',String(GROUPS.length).padStart(2,'0'));
 const view=items.slice(0,180);
 const fragment=document.createDocumentFragment();
 for(const s of view){
  const item=document.createElement('button');item.className='sat-item'+(s.id===state.selectedId?' active':'');item.type='button';item.dataset.id=s.id;
  const icon=document.createElement('span');icon.className='sat-item-icon';icon.textContent=s.group==='stations'?'✦':s.group==='weather'?'◉':s.group==='resource'?'▤':s.group==='gps-ops'?'⌾':'◇';
  const main=document.createElement('span');main.className='sat-item-main';const title=document.createElement('strong');title.textContent=s.name;const sub=document.createElement('small');sub.textContent=`#${s.id} · ${s.mission}`;main.append(title,sub);
  const alt=document.createElement('span');alt.className='sat-item-alt';alt.textContent=`${fmt(s.altKm)} km`;
  item.append(icon,main,alt);item.addEventListener('click',()=>selectSatellite(s.id,true));fragment.append(item);
 }
 $('satList').replaceChildren(fragment);
 if(!items.length)$('satList').innerHTML=`<div class="empty-state">${T('Δεν βρέθηκαν δορυφόροι. Δοκίμασε άλλο όνομα ή κατηγορία.','No satellites match your search. Try another name or collection.')}</div>`;
}
function dateFmt(iso){if(!iso)return '—';const d=new Date(iso);return Number.isNaN(d.getTime())?iso:d.toLocaleDateString(state.lang==='el'?'el-GR':'en-GB',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});}
function renderDetails(){
 const s=getSelected();if(!s)return;
 const age=epochAgeHours(s.epoch);
 setText('detailName',s.name);setText('detailNorad',s.id);setText('detailIntl',s.objectId||'—');
 setText('altDetail',fmt(s.altKm));setText('speedDetail',fmt(s.speed,2));setText('incDetail',fmt(s.inclination,1)+'°');setText('periodDetail',fmt(orbitPeriod(s.meanMotion),1));
 setText('detailOwner',s.demo?T('Προσομοίωση','Simulation'):resolveOwner(s.ownerCode,s.name));setText('detailOperator',s.operator);setText('detailMission',s.mission);setText('detailLaunch',dateFmt(s.launch));
 setText('detailLat',fmt(s.lat,3)+'°');setText('detailLon',fmt(s.lng,3)+'°');setText('detailSwath',s.swath?`${fmt(s.swath)} km`:'—');
 setText('detailEpoch',s.epoch?new Date(s.epoch).toLocaleString(state.lang==='el'?'el-GR':'en-GB',{timeZone:'UTC'})+' UTC':'—');
 setText('detailProvenance',s.ownerCode?`SATCAT · ${s.ownerCode}`:T('Χωρίς επιβεβαίωση','Not verified'));
 setText('dataAgeShort',s.demo?'DEMO':age===null?'NO EPOCH':`${Math.max(0,age).toFixed(1)}h OLD`);
 setText('satType',s.mission.toUpperCase().slice(0,20));
 setText('coverageTitle',s.swath?T(`Γνωστή σάρωση ${s.swath} km`,`Documented swath ${s.swath} km`):T('Το σημείο ακριβώς από κάτω','Directly beneath spacecraft'));
 setText('coverageDescription',s.swath?T('Ενδεικτικός κύκλος στο χάρτη. Όχι ακριβές οπτικό αποτύπωμα.','Illustrative map circle, not the exact camera footprint.'):T('Χωρίς επιβεβαιωμένο οπτικό πεδίο αισθητήρα. Δεν υποθέτουμε ότι καταγράφει εικόνα.','No verified sensor field of view; Earth imagery is not assumed.'));
 if(age!==null && age>96){document.querySelector('.status-strip')?.classList.add('stale');}else document.querySelector('.status-strip')?.classList.remove('stale');
}
function selectSatellite(id,center=true){const hit=state.positions.find(s=>s.id===id);if(!hit)return;state.selectedId=id;if(center)state.follow=true;$('followBtn').classList.toggle('active',state.follow);state.lastOrbitDraw=0;state.lastGlobeFollow=0;state.lastMapFollow=0;tick(true);}
function makeRasterStyle(layer){
 if(layer==='dark')return {version:8,sources:{base:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png','https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO'}},layers:[{id:'raster',type:'raster',source:'base'}]};
 if(layer==='nasa'){
  // An explicit acquisition date avoids implying that this is live. Previous day used as a first available candidate.
  const d=new Date(Date.now()-2*86400000).toISOString().slice(0,10);state.nasaDate=d;
  return {version:8,sources:{base:{type:'raster',tiles:[`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`],tileSize:256,maxzoom:9,attribution:`NASA GIBS · VIIRS/SNPP · ${d}`}},layers:[{id:'raster',type:'raster',source:'base'}]};
 }
 return {version:8,sources:{base:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:17,attribution:'Tiles © Esri · Earthstar Geographics · Maxar and contributors'}},layers:[{id:'raster',type:'raster',source:'base'}]};
}
const EMPTY_FC={type:'FeatureCollection',features:[]};
function selectedOutline(s){
 if(!s || !s.swath)return EMPTY_FC;
 const coords=greatCircleCircle(s.lng,s.lat,s.swath/2,70);
 if(Math.max(...coords.map(p=>p[0]))-Math.min(...coords.map(p=>p[0]))>270)return EMPTY_FC;
 return {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[coords]}}]};
}
function initGeoLayers(map){
 if(!map || !map.isStyleLoaded())return;
 if(!map.getSource('footprint'))map.addSource('footprint',{type:'geojson',data:EMPTY_FC});
 if(!map.getLayer('footprint-fill'))map.addLayer({id:'footprint-fill',type:'fill',source:'footprint',paint:{'fill-color':'#8ce4c6','fill-opacity':.13}});
 if(!map.getLayer('footprint-outline'))map.addLayer({id:'footprint-outline',type:'line',source:'footprint',paint:{'line-color':'#96f6c7','line-width':1.8,'line-dasharray':[2,2]}});
 const s=getSelected();if(s)map.getSource('footprint').setData(selectedOutline(s));
}
function initSurface(){if(!maplibre())return;const s=getSelected();state.surface=new (maplibre().Map)({container:'surfaceMap',style:makeRasterStyle('imagery'),center:s?[s.lng,s.lat]:[22.9,38.1],zoom:4,minZoom:1,maxZoom:16,attributionControl:true});
 state.surface.on('load',()=>{initGeoLayers(state.surface);if(s)moveSurface(s,true);});
 state.surface.on('style.load',()=>initGeoLayers(state.surface));
 state.surface.on('dragstart',()=>setFollow(false));
 const el=document.createElement('div');el.className='map-track-label';el.title='Computed ground point';
 state.groundMarker=new (maplibre().Marker)({element:el,anchor:'center'}).setLngLat(s?[s.lng,s.lat]:[22.9,38.1]).addTo(state.surface);
}
function moveSurface(s,force=false){
 if(!s)return;setText('groundCoordinates',formatCoords(s.lat,s.lng));setText('surfacePlace',T('Σημείο Γης κάτω από ','Ground point below ')+s.name);
 if(state.layer==='nasa')setText('imageAttribution',`NASA GIBS VIIRS ${state.nasaDate} · ${T('Όχι ζωντανή εικόνα','Not live imagery')}`);
 else if(state.layer==='dark')setText('imageAttribution','© OpenStreetMap / CARTO · '+T('Χάρτης, όχι κάμερα','Map, not camera'));
 else setText('imageAttribution',T('Δορυφορική χαρτογράφηση Esri · Όχι live κάμερα','Esri satellite imagery · Not a live camera'));
 if(!state.surface)return;
 state.groundMarker?.setLngLat([s.lng,s.lat]);
 if(state.surface.getSource('footprint'))state.surface.getSource('footprint').setData(selectedOutline(s));
 if(state.follow&&(force||Date.now()-state.lastMapFollow>2700)){
  state.surface.easeTo({center:[s.lng,s.lat],duration:force?700:2200,essential:true});state.lastMapFollow=Date.now();
 }
}
function chooseLayer(layer){if(!['imagery','nasa','dark'].includes(layer))return;state.layer=layer;document.querySelectorAll('[data-layer]').forEach(el=>el.classList.toggle('active',el.dataset.layer===layer));if(state.surface){state.surface.setStyle(makeRasterStyle(layer));}if(layer==='nasa')toast(T('NASA VIIRS: επιλεγμένη ημερομηνία λήψης με υστέρηση. Δεν είναι εικόνα αυτής της στιγμής.','NASA VIIRS: dated imagery with acquisition delay, not a live view.'));const s=getSelected();if(s)moveSurface(s,true);}
function initGlobe(){
 if(!window.Globe){toast(T('Αδυναμία φόρτωσης 3D βιβλιοθήκης. Χρησιμοποίησε τον 2D χάρτη.','3D globe library failed to load. Try the 2D map.'));return;}
 try{
  const host=$('globe');state.globe=new window.Globe(host,{animateIn:true})
   .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
   .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
   .backgroundColor('rgba(0,0,0,0)')
   .showAtmosphere(true).atmosphereColor('#6f9ec5').atmosphereAltitude(.12)
   .pointsData([]).pointLat('lat').pointLng('lng').pointAltitude('visAltitude')
   .pointColor(d=>d.id===state.selectedId?COLOURS.selected:COLOURS[d.group]||COLOURS.default)
   .pointRadius(d=>d.id===state.selectedId?.27:.15).pointResolution(7)
   .pointLabel(d=>`<div style="font:12px sans-serif;background:#0c1e2de8;padding:8px 11px;border:1px solid #72cbb2;border-radius:7px;color:#e8faf4"><b>${safeText(d.name)}</b><br>NORAD ${safeText(d.id)} · ${fmt(d.altKm)} km</div>`)
   .onPointClick(d=>selectSatellite(d.id,true))
   .pathsData([]).pathPoints('coords').pathPointLat('lat').pathPointLng('lng').pathPointAlt('alt')
   .pathColor(()=>COLOURS.selected).pathStroke(.75).pathResolution(2)
   .ringsData([]).ringLat('lat').ringLng('lng').ringColor(()=>[COLOURS.selected,'#77cbbb77']).ringMaxRadius(2.4).ringPropagationSpeed(.7).ringRepeatPeriod(1350);
  state.globe.pointOfView({lat:DEFAULT_GLOBE[0],lng:DEFAULT_GLOBE[1],altitude:2.45},0);
  const controls=state.globe.controls();controls.autoRotate=false;controls.enableDamping=true;controls.dampingFactor=.08;controls.enableZoom=true;
  const resize=()=>{const rect=host.getBoundingClientRect();if(state.globe&&rect.width>0&&rect.height>0){state.globe.width(rect.width).height(rect.height)}};
  new ResizeObserver(resize).observe(host);resize();
 }catch(e){console.error('Globe error',e);toast('3D engine unavailable');}
}
function safeText(x){return String(x).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));}
function geojsonPositions(){return {type:'FeatureCollection',features:state.positions.map(s=>({type:'Feature',properties:{id:s.id,name:s.name,selected:s.id===state.selectedId},geometry:{type:'Point',coordinates:[s.lng,s.lat]}}))};}
function initialize2D(){
 if(state.map2d||!maplibre())return;
 state.map2d=new (maplibre().Map)({container:'main2d',style:makeRasterStyle('dark'),center:[0,15],zoom:1.4,attributionControl:true});
 state.map2d.on('load',()=>{
  const m=state.map2d;m.addSource('orbiting',{type:'geojson',data:geojsonPositions()});
  m.addLayer({id:'orbiting-glow',type:'circle',source:'orbiting',paint:{'circle-radius':['case',['get','selected'],11,5],'circle-color':'#83dbc2','circle-opacity':.17}});
  m.addLayer({id:'orbiting-dots',type:'circle',source:'orbiting',paint:{'circle-radius':['case',['get','selected'],6,3],'circle-color':['case',['get','selected'],'#98efd0','#67bbe1'],'circle-stroke-width':.8,'circle-stroke-color':'#e5f8ff'}});
  m.on('click','orbiting-dots',e=>{if(e.features?.[0])selectSatellite(e.features[0].properties.id,true)});
  m.on('mouseenter','orbiting-dots',()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave','orbiting-dots',()=>m.getCanvas().style.cursor='');
  update2DPositions(true);
 });
 state.map2d.on('dragstart',()=>setFollow(false));
}
function update2DPositions(force=false){if(!state.map2d)return;const m=state.map2d;const source=m.getSource('orbiting');if(source)source.setData(geojsonPositions());const s=getSelected();if(s&&state.follow&&(force||Date.now()-state.lastMapFollow>2500)){m.easeTo({center:[s.lng,s.lat],zoom:Math.max(m.getZoom(),2.25),duration:force?500:1600});}}
function switchView(mode){state.view=mode;const twod=mode==='2d';$('globe3dBtn').classList.toggle('active',!twod);$('map2dBtn').classList.toggle('active',twod);$('main2d').classList.toggle('hidden',!twod);
 if(twod){initialize2D();setTimeout(()=>{state.map2d?.resize();update2DPositions(true)},80)}else{state.globe?.pointOfView({lat:getSelected()?.lat||0,lng:getSelected()?.lng||0,altitude:2.1},750)};
}
function setFollow(value){state.follow=value;$('followBtn').classList.toggle('active',value);if(value)tick(true);}
function bindEvents(){
 document.querySelectorAll('.collection').forEach(btn=>btn.addEventListener('click',()=>switchGroup(btn.dataset.group)));
 $('satSearch').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();renderList();});
 document.querySelectorAll('.sort-choice').forEach(btn=>btn.addEventListener('click',()=>{state.sort=btn.dataset.sort;document.querySelectorAll('.sort-choice').forEach(x=>x.classList.toggle('active',x===btn));renderList();}));
 $('globe3dBtn').addEventListener('click',()=>switchView('3d'));$('map2dBtn').addEventListener('click',()=>switchView('2d'));
 $('resetView').addEventListener('click',()=>{setFollow(false);state.globe?.pointOfView({lat:16,lng:17,altitude:2.45},900);if(state.map2d)state.map2d.easeTo({center:[0,12],zoom:1.4,duration:800});});
 $('followBtn').addEventListener('click',()=>setFollow(!state.follow));$('followSatBtn').addEventListener('click',()=>setFollow(true));
 document.querySelectorAll('[data-layer]').forEach(el=>el.addEventListener('click',()=>chooseLayer(el.dataset.layer)));
 $('langButton').addEventListener('click',()=>{state.lang=state.lang==='el'?'en':'el';updateI18n();renderList();});
 $('helpButton').addEventListener('click',()=>openModal('infoModal'));
 $('cameraJump').addEventListener('click',()=>openModal('feedModal'));$('feedsButton').addEventListener('click',()=>openModal('feedModal'));
 document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>closeModal(el.dataset.close)));
 document.querySelectorAll('.modal-backdrop').forEach(el=>el.addEventListener('click',event=>{if(event.target===el)closeModal(el.id)}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.modal-backdrop').forEach(el=>closeModal(el.id));if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();$('satSearch').focus();}});
}
function openModal(id){$(id)?.classList.remove('hidden')};function closeModal(id){$(id)?.classList.add('hidden');if(id==='feedModal'){const iframe=$('feedModal').querySelector('iframe');if(iframe)iframe.src=iframe.src;}}
function start(){updateI18n();bindEvents();initGlobe();initSurface();switchGroup('featured');
 setInterval(()=>{setText('utcTime',new Date().toISOString().slice(11,19)+' UTC');},1000);setText('utcTime',new Date().toISOString().slice(11,19)+' UTC');
 setInterval(()=>{if(state.positions.length)tick(false)},1000);
 // CelesTrak elements change on ~2h cadence; do not hammer upstream on every orbit animation frame.
 setInterval(()=>{if(!state.loading)switchGroup(state.group)},7200000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();