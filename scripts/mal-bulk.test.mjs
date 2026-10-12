import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { isDuplicate, parseThemes, videoCandidates } from './mal-bulk-utils.mjs';
const require=createRequire(import.meta.url),cheerio=require('../server/mascot-api/node_modules/cheerio');
test('duplicates respect MAL season IDs and legacy aliases/year',()=>{
 const anime={mal_id:2,title:'Re:Zero Season 2',title_english:'Re:ZERO -Starting Life- Season 2',year:2020};
 assert.equal(isDuplicate(anime,[{malId:1,animeTitle:anime.title}]),false);
 assert.equal(isDuplicate(anime,[{malId:2,animeTitle:'Other name'}]),true);
 assert.equal(isDuplicate(anime,[{animeTitle:'Other',altTitles:['ReZERO Season 2'],year:2020}]),true);
 assert.equal(isDuplicate(anime,[{animeTitle:'ReZERO Season 2',year:2016}]),false);
 assert.equal(isDuplicate({mal_id:3,title:'Jujutsu Kaisen',year:2020},[{animeTitle:'Jujutsu Kaisen season 1',year:2020}]),true);
 assert.equal(isDuplicate({mal_id:4,title:'Shingeki no Kyojin Season 2',year:2017},[{animeTitle:'Shingeki no Kyojin (Attack On Titan) Season 2',year:2017}]),true);
 assert.equal(isDuplicate({mal_id:5,title:'One Punch Man 2nd Season',year:2019},[{animeTitle:'One Punch Man Season 2',year:2019}]),true);
 assert.equal(isDuplicate({mal_id:6,title:'Shingeki no Kyojin: The Final Season',year:2020},[{animeTitle:'Shingeki no Kyojin (Attack On Titan): Final Season',year:2020}]),true);
 assert.equal(isDuplicate({mal_id:7,title:'Kono Subarashii Sekai ni Shukufuku wo! 2',year:2017},[{animeTitle:'KonoSuba Season 2',year:2017}]),true);
 assert.equal(isDuplicate({mal_id:8,title:'Assassination Classroom 2nd Season',year:2016},[{animeTitle:'Assassination Classroom Staffel 2',year:2016}]),true);
});
test('MAL theme parser separates opening and ending and ignores specials',()=>{
 const $=cheerio.load('<div class="theme-songs opnening"><table><tr><td>▶</td><td>1: "Yuusha (勇者)"<span> by YOASOBI</span> (eps 1-16)</td></tr></table></div><div class="theme-songs ending"><table><tr><td></td><td>1: "Anytime Anywhere" by milet (eps 1-28)</td></tr><tr><td></td><td>S1: "bliss" by milet</td></tr></table></div>');
 assert.deepEqual(parseThemes($).map(x=>[x.songType,x.songNumber,x.songTitle,x.artist]),[['OP',1,'Yuusha (勇者)','YOASOBI'],['ED',1,'Anytime Anywhere','milet']]);
});
test('video matcher requires verified channel, correct song and artist and excludes covers',()=>{
 const video=(title,owner='YOASOBI',verified=true)=>({videoRenderer:{videoId:'OIBODIPC_8Y',title:{runs:[{text:title}]},ownerText:{runs:[{text:owner}]},ownerBadges:verified?[{metadataBadgeRenderer:{style:'BADGE_STYLE_TYPE_VERIFIED_ARTIST'}}]:[]}});
 const data=[video('YOASOBI「勇者」 Official Music Video'),video('YOASOBI Yuusha cover'),video('YOASOBI Yuusha','Impostor',false),video('YOASOBI Idol'),video('Yuusha','Someone')];
 assert.equal(videoCandidates(data,{songTitle:'Yuusha (勇者)',artist:'YOASOBI'}).length,1);
});
