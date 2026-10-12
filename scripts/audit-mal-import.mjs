import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isDuplicate } from './mal-bulk-utils.mjs';
const require=createRequire(import.meta.url),root=process.env.FIREBASE_CLI_ROOT;
if(!root)throw new Error('FIREBASE_CLI_ROOT required');
const {configstore}=require(join(root,'lib/configstore.js')),{getAccessToken}=require(join(root,'lib/auth.js'));
const endpoint='https://firestore.googleapis.com/v1/projects/animequiz-8a93b/databases/(default)/documents';
async function request(path,body){const token=(await getAccessToken(configstore.get('tokens').refresh_token,[])).access_token;const response=await fetch(endpoint+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const data=await response.json();if(!response.ok)throw new Error('Firestore '+response.status);return data;}
const decode=x=>x.stringValue??x.timestampValue??(x.integerValue!==undefined?Number(x.integerValue):x.booleanValue??(x.arrayValue?(x.arrayValue.values||[]).map(decode):null));
const docs=[];let next='';do{const result=await request('/animeSongs?pageSize=300'+(next?'&pageToken='+encodeURIComponent(next):''));docs.push(...(result.documents||[]));next=result.nextPageToken;}while(next);
writeFileSync('.firebase/mal-import/audit-backup-'+Date.now()+'.json',JSON.stringify(docs));
const rows=docs.map(doc=>({doc,...Object.fromEntries(Object.entries(doc.fields).map(([k,v])=>[k,decode(v)]))}));
const legacy=rows.filter(row=>row.importSource!=='MyAnimeList bulk'),imported=rows.filter(row=>row.importSource==='MyAnimeList bulk');
const duplicates=[],metadata=[];const deleted=new Set();
for(const row of imported){
 const source='.firebase/mal-import/mal-v2-'+row.malId+'.json';if(!existsSync(source))continue;const {anime,songs}=JSON.parse(readFileSync(source,'utf8'));
 if(isDuplicate(anime,legacy) && !row.updatedAt){duplicates.push({delete:row.doc.name,currentDocument:{updateTime:row.doc.updateTime}});deleted.add(row.doc.name);}
 else if(!songs.length && !row.songTitle && !row.updatedAt && row.title!==anime.title)metadata.push({update:{name:row.doc.name,fields:{title:{stringValue:anime.title},songType:{stringValue:''},songNumber:{integerValue:'0'},importStatus:{stringValue:'metadata-only'}}},updateMask:{fieldPaths:['title','songType','songNumber','importStatus']},currentDocument:{updateTime:row.doc.updateTime}});
}
const repair=process.argv.includes('--repair');
if(repair){const writes=[...duplicates,...metadata];for(let i=0;i<writes.length;i+=300)await request(':commit',{writes:writes.slice(i,i+300)});}
const remaining=repair?imported.filter(row=>!deleted.has(row.doc.name)):imported;
const result={repair,legacySongs:legacy.length,importedAnime:new Set(remaining.map(row=>row.malId)).size,importedSongs:remaining.filter(row=>row.songTitle).length,playableSongs:remaining.filter(row=>row.isActive && row.youtubeVideoId).length,pendingSongs:remaining.filter(row=>row.songTitle && !row.youtubeVideoId).length,metadataOnly:remaining.filter(row=>!row.songTitle).length,thaiAnime:new Set(remaining.filter(row=>row.synopsisSource==='MyAnimeList · AI สรุปภาษาไทย').map(row=>row.malId)).size,duplicateRecords:duplicates.length,metadataCorrections:metadata.length};
writeFileSync('.firebase/mal-import/audit-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
writeFileSync('.firebase/mal-import/audit-duplicates.json',JSON.stringify(imported.filter(row=>deleted.has(row.doc.name)).map(row=>({id:row.doc.name.split('/').pop(),title:row.title})),null,2));
