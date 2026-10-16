const VALID_GROUPS = new Set(['STATIONS','VISUAL','WEATHER','RESOURCE','SCIENCE','GPS-OPS','GALILEO','STARLINK','ONEWEB','IRIDIUM-NEXT']);
function handler(type){
 return async function(req,res){
  if(req.method!=='GET'){res.statusCode=405; return res.end('Method not allowed');}
  const group=String(req.query?.group||'STATIONS').toUpperCase();
  if(!VALID_GROUPS.has(group)){res.statusCode=400;return res.end(JSON.stringify({error:'Invalid group'}));}
  const isOrbit=type==='orbits';
  const url=isOrbit ? `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(group)}&FORMAT=JSON` : `https://celestrak.org/satcat/records.php?GROUP=${encodeURIComponent(group)}&FORMAT=JSON&PAYLOADS=1&ONORBIT=1`;
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12500);
  try{
   const response=await fetch(url,{headers:{'Accept':'application/json','User-Agent':'OrbitEye/1.0 (+educational satellite visualization)'},signal:controller.signal,redirect:'error'});
   if(!response.ok) throw new Error(`CelesTrak returned HTTP ${response.status}`);
   const data=await response.json();
   if(!Array.isArray(data))throw new Error('Unexpected upstream catalog format');
   res.setHeader('Content-Type','application/json; charset=utf-8');
   res.setHeader('Cache-Control',`public, s-maxage=${isOrbit?7200:43200}, stale-while-revalidate=86400`);
   res.setHeader('X-Data-Source','CelesTrak');
   res.statusCode=200;return res.end(JSON.stringify({group,source:'CelesTrak',updatedAt:new Date().toISOString(),count:data.length,data}));
  }catch(err){
   res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
   res.statusCode=502;return res.end(JSON.stringify({error:'Upstream orbital catalog unavailable',detail:String(err.message||err).slice(0,180)}));
  }finally{clearTimeout(timeout);}
 }
}
module.exports={handler};