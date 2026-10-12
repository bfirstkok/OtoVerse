import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('editing catalog metadata cannot turn it into an empty playable song',()=>{
 const source=readFileSync('src/lib/adminContent.js','utf8').replace(/^import[\s\S]*?;\s*/gm,'').replace(/\bexport /g,'');
 const context={module:{exports:{}},getYouTubeId:value=>String(value||''),getEffectiveAnimeGenre:()=> 'fantasy',getEffectiveAnimeGenres:()=>['fantasy','adventure'],normalizeAnimeGenres:value=>value};
 vm.runInNewContext(source+'\nmodule.exports=cleanAnimeSong;',context);
 const clean=context.module.exports;
 const metadata=clean({entryType:'metadata',animeTitle:'Example',songType:'OP',songNumber:1,songTitle:'accidental song',youtubeVideoId:'abcdefghijk',synopsis:'Updated description',genres:['fantasy','adventure']});
 assert.equal(metadata.title,'Example');assert.equal(metadata.songType,'');assert.equal(metadata.youtubeVideoId,'');assert.equal(metadata.songTitle,'');assert.equal(metadata.synopsis,'Updated description');
 const song=clean({entryType:'song',animeTitle:'Example',songType:'ED',songNumber:2,youtubeVideoId:'abcdefghijk'});
 assert.equal(song.title,'Example (ED2)');assert.equal(song.youtubeVideoId,'abcdefghijk');
});
