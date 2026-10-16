import {test} from 'node:test';import {strict as assert} from 'node:assert';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {handler}=require('../lib/shared.js');
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(v){this.body=v;return this;}}}
test('blocks unauthorized group names before upstream calls',async()=>{const r=res();await handler('orbits')({method:'GET',query:{group:'../../secret'}},r);assert.equal(r.statusCode,400);});
test('blocks non-GET',async()=>{const r=res();await handler('catalog')({method:'POST',query:{group:'stations'}},r);assert.equal(r.statusCode,405);});
test('GP proxy sets two-hour CDN cache and uses OMM JSON',async()=>{
 const old=global.fetch,paths=[];global.fetch=async(url)=>{paths.push(url);return {ok:true,json:async()=>[{NORAD_CAT_ID:25544}]}};
 try{const r=res();await handler('orbits')({method:'GET',query:{group:'stations'}},r);assert.equal(r.statusCode,200);assert.match(r.headers['Cache-Control'],/s-maxage=7200/);assert.match(paths[0],/FORMAT=JSON/);assert.equal(JSON.parse(r.body).count,1);}finally{global.fetch=old;}
});
test('SATCAT proxy sets twelve-hour cache',async()=>{
 const old=global.fetch;global.fetch=async()=>({ok:true,json:async()=>[]});try{const r=res();await handler('catalog')({method:'GET',query:{group:'weather'}},r);assert.equal(r.statusCode,200);assert.match(r.headers['Cache-Control'],/s-maxage=43200/)}finally{global.fetch=old;}
});