import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {malDraft} from '../src/lib/myAnimeList.js';
import {songStatus} from '../src/lib/catalogOrganization.js';
const require=createRequire(import.meta.url),root=process.env.FIREBASE_CLI_ROOT;
if(!root)throw Error('FIREBASE_CLI_ROOT required');
const {configstore}=require(join(root,'lib/configstore.js')),{getAccessToken}=require(join(root,'lib/auth.js'));
const token=(await getAccessToken(configstore.get('tokens').refresh_token,[])).access_token;
const endpoint='https://firestore.googleapis.com/v1/projects/animequiz-8a93b/databases/(default)/documents';
async function request(path,body){const r=await fetch(endpoint+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.error?.message||r.status);return d;}
const backupArg=process.argv.find(arg=>arg.startsWith('--backup='));
if(backupArg&&process.argv.includes('--apply'))throw Error('Offline backups are for planning only; apply must read current server data');
const docs=[];let next='';
if(backupArg)docs.push(...JSON.parse(readFileSync(backupArg.slice(9),'utf8')));
else do{const d=await request('/animeSongs?pageSize=300'+(next?'&pageToken='+encodeURIComponent(next):''));docs.push(...(d.documents||[]));next=d.nextPageToken;}while(next);
const stamp=Date.now();writeFileSync('.firebase/mal-import/organization-backup-'+stamp+'.json',JSON.stringify(docs));
const decode=v=>v.stringValue??(v.integerValue!==undefined?Number(v.integerValue):v.booleanValue??(v.arrayValue?(v.arrayValue.values||[]).map(decode):null));
const encode=v=>typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(v)}:Array.isArray(v)?{arrayValue:{values:v.map(encode)}}:{stringValue:String(v)};
const writes=[],report={backup:stamp,total:docs.length,preservedManual:0,organized:0,renamed:0,genreCorrections:0,specialThemeAssignments:0,ready:0,pending:0,review:0,issues:[]};
for(const doc of docs){const row=Object.fromEntries(Object.entries(doc.fields).map(([k,v])=>[k,decode(v)]));const status=songStatus(row);if(status)report[status]++;
 if(row.importSource!=='MyAnimeList bulk')continue;if(row.updatedAt){report.preservedManual++;continue;}
 const file='.firebase/mal-import/mal-v2-'+row.malId+'.json';if(!existsSync(file)){report.issues.push({id:doc.name.split('/').pop(),reason:'missing source'});continue;}
 const {anime,songs}=JSON.parse(readFileSync(file,'utf8')),draft=malDraft(anime);const sourceTitles=[anime.title,anime.title_english,...(anime.title_synonyms||[])].filter(Boolean);
 const season=sourceTitles.map(t=>t.match(/\bseason\s*(\d+)\b/i)?.[1]||t.match(/\b(\d+)(?:st|nd|rd|th)\s+season\b/i)?.[1]).find(Boolean);
 const year=Number(draft.year)||row.year;let title=anime.title;
 if(String(row.animeTitle).includes(' — ภาค'))title=row.animeTitle;else if(season)title+=` — ภาค ${season}${year?' ('+year+')':''}`;else if(year)title+=` (${year})`;
 const metadata=row.entryType==='metadata';const values={animeTitle:title,title:title+(metadata?'':` (${row.songType}${row.songNumber})`),altTitles:[...new Set([...(row.altTitles||[]),row.animeTitle,anime.title,...draft.altTitles.split('\n')].filter(Boolean))],acceptedAnswers:[...new Set([...(row.acceptedAnswers||[]),row.animeTitle,anime.title,title].filter(Boolean))],entryType:metadata?'metadata':'song',catalogOrganizedAt:new Date().toISOString(),synopsisReviewStatus:row.synopsisSource?.includes('AI')?'unreviewed':'source',genreSource:'MyAnimeList'};
 if(JSON.stringify(row.genres)!==JSON.stringify(draft.genres)){values.genres=draft.genres;values.genre=draft.genre;report.genreCorrections++;}
 if(row.animeTitle!==title)report.renamed++;
 if(!metadata){values.catalogStatus=status;const clean=v=>String(v).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');const same=songs.filter(s=>clean(s.songTitle)===clean(row.songTitle));if(new Set(same.map(s=>s.songType)).size>1){values.themeContext='เพลงนี้ถูกใช้ทั้ง OP และ ED ในบางตอน ตามข้อมูล MyAnimeList';report.specialThemeAssignments++;}}
 if(metadata){values.songType='';values.songNumber=0;}
 writes.push({update:{name:doc.name,fields:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,encode(v)]))},updateMask:{fieldPaths:Object.keys(values)},currentDocument:{updateTime:doc.updateTime}});report.organized++;
}
if(process.argv.includes('--apply'))for(let i=0;i<writes.length;i+=100)await request(':commit',{writes:writes.slice(i,i+100)});
writeFileSync('.firebase/mal-import/organization-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
