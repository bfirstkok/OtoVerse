import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {getYouTubeId} from '../src/lib/media.js';
import {isDuplicate,key} from './mal-bulk-utils.mjs';
const require=createRequire(import.meta.url),root='C:/Users/bfirs/AppData/Roaming/npm/node_modules/firebase-tools';
const {configstore}=require(join(root,'lib/configstore.js')),{getAccessToken}=require(join(root,'lib/auth.js'));
const endpoint='https://firestore.googleapis.com/v1/projects/animequiz-8a93b/databases/(default)/documents';
const token=(await getAccessToken(configstore.get('tokens').refresh_token,[])).access_token;
async function request(path,body){const r=await fetch(endpoint+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.error?.message||r.status);return d;}
const dir='.firebase/mal-import';const docs=[];let next='';do{const d=await request('/animeSongs?pageSize=300'+(next?'&pageToken='+encodeURIComponent(next):''));docs.push(...(d.documents||[]));next=d.nextPageToken;}while(next);
writeFileSync(dir+'/content-audit-backup-'+Date.now()+'.json',JSON.stringify(docs));
const decode=v=>v.stringValue??(v.integerValue!==undefined?Number(v.integerValue):v.booleanValue??(v.arrayValue?(v.arrayValue.values||[]).map(decode):null));
const rows=docs.map(doc=>({doc,...Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}));
const videos=new Map();for(const file of readdirSync(dir).filter(x=>x.startsWith('youtube-v2-'))){try{const d=JSON.parse(readFileSync(join(dir,file),'utf8'));if(d?.id)videos.set(d.id,d);}catch{}}
const forbidden=/cover|remix|karaoke|music\s*box|instrumental|piano|orchestral|arrangement|オルゴール|歌ってみた|弾いてみた|sped up|slowed/i;
const issues=[],slots=new Map();let checked=0;const writes=[];
for(const row of rows){
 const id=row.doc.name.split('/').pop(),bulk=row.importSource==='MyAnimeList bulk';
 if(row.entryType==='metadata'){if(row.youtubeVideoId||row.songTitle)issues.push({id,title:row.title,kind:'metadata-with-song'});continue;}
 if(row.youtubeVideoId&&!/^[\w-]{11}$/.test(getYouTubeId(row.youtubeVideoId)))issues.push({id,title:row.title,kind:'invalid-video-id'});
 if(row.malId&&row.songTitle){const slot=row.malId+':'+row.songType+':'+row.songNumber;if(slots.has(slot))issues.push({id,title:row.title,kind:'duplicate-song-slot',other:slots.get(slot)});else slots.set(slot,id);}
 if(bulk){const source=join(dir,'mal-v2-'+row.malId+'.json');if(existsSync(source)){checked++;const {songs}=JSON.parse(readFileSync(source,'utf8'));if(!songs.some(s=>s.songType===row.songType&&Number(s.songNumber)===Number(row.songNumber)&&key(s.songTitle)===key(row.songTitle)))issues.push({id,title:row.title,kind:'theme-source-mismatch'});}}
 const video=videos.get(row.youtubeVideoId);
 if(row.isActive&&video&&forbidden.test(video.title)&&!forbidden.test(row.songTitle)){
  issues.push({id,title:row.title,kind:'arrangement-video',videoTitle:video.title,channel:video.channel,adminEdited:!!row.updatedAt});
  if(bulk&&!row.updatedAt)writes.push({update:{name:row.doc.name,fields:{youtubeVideoId:{stringValue:''},isActive:{booleanValue:false},videoReviewReason:{stringValue:'Catalog audit: non-original arrangement video; awaiting replacement'}}},updateMask:{fieldPaths:['youtubeVideoId','isActive','videoReviewReason']},currentDocument:{updateTime:row.doc.updateTime}});
 }
}
const legacy=rows.filter(r=>r.importSource!=='MyAnimeList bulk'),groups=new Map();for(const row of rows.filter(r=>r.importSource==='MyAnimeList bulk'))groups.set(row.malId,row);
for(const [malId,row] of groups){const path=join(dir,'mal-v2-'+malId+'.json');if(existsSync(path)){const {anime}=JSON.parse(readFileSync(path,'utf8'));if(isDuplicate(anime,legacy))issues.push({id:row.doc.name.split('/').pop(),title:row.animeTitle,kind:'possible-existing-anime-duplicate'});}}
if(process.argv.includes('--repair-videos'))for(let i=0;i<writes.length;i+=100)await request(':commit',{writes:writes.slice(i,i+100)});
const result={totalRecords:rows.length,importedAnime:groups.size,sourceCheckedSongs:checked,activeSongs:rows.filter(r=>r.isActive&&r.youtubeVideoId).length,issues,quarantined:process.argv.includes('--repair-videos')?writes.length:0};
writeFileSync(dir+'/content-audit-report.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,issues:issues.slice(0,30)},null,2));
