export const EARTH_RADIUS_KM = 6371;
export const GROUPS = ['featured','stations','weather','resource','science','gps-ops','galileo','starlink','oneweb','iridium-NEXT'];
export const GROUP_LIMITS = {featured:340,stations:150,weather:350,resource:350,science:300,'gps-ops':140,galileo:120,starlink:440,oneweb:390,'iridium-NEXT':140};
export const COUNTRIES = {
 'US':'United States','PRC':'China','CIS':'Russia / CIS','RU':'Russia','UK':'United Kingdom','FR':'France','GER':'Germany','DE':'Germany','JPN':'Japan','IND':'India','CA':'Canada','ESA':'European Space Agency','EUTE':'Eutelsat','EUME':'EUMETSAT','EU':'European Union','IT':'Italy','ITA':'Italy','AUS':'Australia','BRAZ':'Brazil','SPN':'Spain','SP':'Spain','KOR':'South Korea','SKOR':'South Korea','NKOR':'North Korea','ARGN':'Argentina','NETH':'Netherlands','SWED':'Sweden','NOR':'Norway','DEN':'Denmark','POL':'Poland','UAE':'United Arab Emirates','ISR':'Israel','TURK':'Türkiye','TUR':'Türkiye','NZ':'New Zealand','LUXE':'Luxembourg','LUX':'Luxembourg','SES':'SES','IM':'Inmarsat','ORB':'Orbcomm','IRID':'Iridium Communications','O3B':'O3b Networks','GLOB':'Globalstar','AB':'Arabsat','CHBZ':'China / Brazil','ISS':'International partnership','UNK':'Unknown','TBD':'Unknown','MEX':'Mexico','SAFR':'South Africa','SAUD':'Saudi Arabia','EGYP':'Egypt','PAKI':'Pakistan','IDN':'Indonesia','THAI':'Thailand','VIET':'Vietnam','IRAN':'Iran','UKR':'Ukraine','GREC':'Greece','BEL':'Belgium','FIN':'Finland','CZCH':'Czech Republic','SWZ':'Switzerland','SWI':'Switzerland'
};
export function inferOperator(name='') {
 const n=String(name).toUpperCase();
 if (/STARLINK/.test(n)) return 'SpaceX · Starlink (name-derived)';
 if (/ONEWEB/.test(n)) return 'Eutelsat OneWeb (name-derived)';
 if (/IRIDIUM/.test(n)) return 'Iridium Communications (name-derived)';
 if (/KUIPER/.test(n)) return 'Amazon / Project Kuiper (name-derived)';
 if (/ISS \(|^ISS$|ZARYA|ZVEZDA/.test(n)) return 'ISS international partners';
 if (/SENTINEL/.test(n)) return 'ESA / Copernicus (name-derived)';
 if (/LANDSAT/.test(n)) return 'USGS / NASA (name-derived)';
 if (/GOES/.test(n)) return 'NOAA (name-derived)';
 if (/METEOSAT|MTG-|MSG-/.test(n)) return 'EUMETSAT (name-derived)';
 if (/HIMAWARI/.test(n)) return 'JMA (name-derived)';
 if (/FENGYUN|FY-\d/.test(n)) return 'CMA (name-derived)';
 if (/NOAA/.test(n)) return 'NOAA (name-derived)';
 if (/TERRA|AQUA|AURA|SUOMI|JPSS/.test(n)) return 'NASA / NOAA (name-derived)';
 if (/GALILEO/.test(n)) return 'EU / EUSPA (name-derived)';
 if (/NAVSTAR|GPS/.test(n)) return 'US Space Force (name-derived)';
 if (/COSMOS|KOSMOS/.test(n)) return 'Unverified operator';
 return 'Not independently verified';
}
export function detectMission(name='',group='') {
 const n=String(name).toUpperCase();
 if (/ISS|TIANGONG|CSS|ZARYA|ZVEZDA/.test(n)||group==='stations') return 'Space station';
 if (/STARLINK|ONEWEB|IRIDIUM|KUIPER|GLOBALSTAR|ORBCOMM/.test(n)) return 'Communications';
 if (/LANDSAT|SENTINEL|WORLDVIEW|PLEIADES|PLANET|SKYSAT|SPOT-/.test(n)) return 'Earth observation';
 if (/GOES|NOAA|METEOSAT|HIMAWARI|FENGYUN|JPSS|METOP/.test(n)||group==='weather') return 'Meteorology';
 if (/GPS|NAVSTAR|GALILEO|GLONASS|BEIDOU/.test(n)||group==='gps-ops'||group==='galileo') return 'Navigation';
 if (group==='resource') return 'Earth observation / environmental';
 if (group==='science') return 'Science';
 return 'Satellite / unspecified';
}
export function documentedSwath(name='') {
 const n=String(name).toUpperCase();
 if (/SENTINEL-2[ABCD]/.test(n)) return 290;
 if (/LANDSAT [89]|LANDSAT-[89]/.test(n)) return 185;
 return null;
}
export function resolveOwner(code, name='') {
 const raw=String(code||'').trim().toUpperCase();
 if (COUNTRIES[raw]) return COUNTRIES[raw];
 if (raw) return `${raw} (SATCAT code)`;
 const n=String(name).toUpperCase();
 if (/ISS/.test(n)) return 'International partnership (inferred)';
 if (/STARLINK/.test(n)) return 'United States (inferred)';
 if (/ONEWEB/.test(n)) return 'United Kingdom (inferred)';
 return 'Not available';
}
export function downsample(input,max){
 if(!Array.isArray(input)||input.length<=max) return Array.isArray(input)?input:[];
 return Array.from({length:max},(_,i)=>input[Math.floor((i+0.5)*input.length/max)]);
}
export function greatCircleCircle(lng, lat, radiusKm, segments=64) {
 const d=radiusKm/EARTH_RADIUS_KM;
 const a=lat*Math.PI/180,b=lng*Math.PI/180;
 return Array.from({length:segments+1},(_,i)=>{
  const t=2*Math.PI*i/segments;
  const aa=Math.asin(Math.max(-1,Math.min(1,Math.sin(a)*Math.cos(d)+Math.cos(a)*Math.sin(d)*Math.cos(t))));
  const bb=b+Math.atan2(Math.sin(t)*Math.sin(d)*Math.cos(a),Math.cos(d)-Math.sin(a)*Math.sin(aa));
  let x=bb*180/Math.PI; while(x>180)x-=360;while(x< -180)x+=360;
  return [x,aa*180/Math.PI];
 });
}
export function getHorizonRadius(altKm) {
 return EARTH_RADIUS_KM*Math.acos(EARTH_RADIUS_KM/(EARTH_RADIUS_KM+Math.max(0,altKm)));
}
export function formatCoords(lat,lon){ return `${Math.abs(lat).toFixed(2)}°${lat>=0?'N':'S'} · ${Math.abs(lon).toFixed(2)}°${lon>=0?'E':'W'}`; }
export function epochAgeHours(epoch){return epoch ? (Date.now()-new Date(epoch).getTime())/36e5 : null;}
export function orbitPeriod(meanMotion){return meanMotion>0?1440/meanMotion:null;}