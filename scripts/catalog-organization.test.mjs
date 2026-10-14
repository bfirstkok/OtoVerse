import test from 'node:test';
import assert from 'node:assert/strict';
import {groupCatalogItems,songStatus} from '../src/lib/catalogOrganization.js';
test('distinct MAL seasons remain separate and metadata is not a track',()=>{
 const groups=groupCatalogItems([{id:'info',entryType:'metadata',malId:1,title:'Same',synopsis:'Story'},{id:'op',malId:1,title:'Same (OP1)',songType:'OP',songNumber:1},{id:'second',entryType:'metadata',malId:2,title:'Same'}]);
 assert.equal(groups.length,2);const first=groups.find(x=>x.key==='mal:1');assert.equal(first.primary.id,'info');assert.equal(first.songs.length,1);
});
test('ready status requires an actual playable song, never metadata',()=>{
 assert.equal(songStatus({entryType:'metadata',title:'Anime',isActive:true}),null);
 assert.equal(songStatus({title:'Anime (OP1)',isActive:true,youtubeVideoId:'abcdefghijk'}),'ready');
 assert.equal(songStatus({title:'Anime (OP1)',isActive:false,youtubeVideoId:''}),'pending');
 assert.equal(songStatus({title:'Anime (OP1)',isActive:false,youtubeVideoId:'',videoReviewReason:'Wrong version'}),'review');
 assert.equal(songStatus({title:'Anime (OP1)',isActive:false,youtubeVideoId:'abcdefghijk'}),'review');
});

import {catalogDisplayTitle} from '../src/lib/catalogOrganization.js';
test('source season label does not overwrite a manually edited title',()=>{
 assert.match(catalogDisplayTitle({malId:28977,animeTitle:'Gintama°'}),/ภาค 4/);
 assert.equal(catalogDisplayTitle({malId:28977,animeTitle:'My custom title',updatedAt:'saved'}),'My custom title');
});
