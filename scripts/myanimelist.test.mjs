import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMalId, malDraft} from '../src/lib/myAnimeList.js';
test('MAL IDs accept canonical anime links and reject unrelated sites',()=>{
 assert.equal(parseMalId('https://myanimelist.net/anime/31240/Re_Zero'),31240);
 assert.equal(parseMalId('31240'),31240);
 assert.equal(parseMalId('https://myanimelist.net.evil.test/anime/1'),null);
 assert.equal(parseMalId('https://myanimelist.net/manga/1'),null);
});
test('metadata import maps several genres and keeps trailer separate from song',()=>{
 const result=malDraft({mal_id:31240,title:'Re:Zero',genres:[{name:'Drama'},{name:'Fantasy'}],themes:[{name:'Isekai'}],trailer:{youtube_id:'abcdefghijk'},images:{jpg:{image_url:'https://cdn.myanimelist.net/images/anime/1.jpg'}},synopsis:'Story [Written by MAL Rewrite]'});
 assert.deepEqual(result.genres,['drama','fantasy','isekai']);assert.equal(result.synopsis,'Story');
 assert.equal(result.trailerVideoId,'abcdefghijk');assert.equal(result.youtubeVideoId,undefined);
 assert.equal(result.malUrl,'https://myanimelist.net/anime/31240');
});
test('missing trailers remain empty and adventure is not classified as fantasy',()=>{
 const result=malDraft({mal_id:1,title:'Example',genres:[{name:'Adventure'}],images:{jpg:{image_url:'javascript:alert(1)'}}});
 assert.equal(result.trailerVideoId,'');assert.equal(result.imageUrl,'');assert.deepEqual(result.genres,['adventure']);
});
