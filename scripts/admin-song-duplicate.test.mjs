import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('src/admin/AnimeSongForm.jsx','utf8');
const expression=source.match(/const duplicate = ([^;]+);/)[1];
function duplicate(existingItems,item,form){return vm.runInNewContext(expression,{existingItems,item,form,titleKey:v=>String(v||'').replace(/\s*\((OP|ED)\d*\)$/i,'').trim().toLowerCase(),toFormValue:e=>({songType:e.songType||'OP',songNumber:e.songNumber||1})});}
const form={animeTitle:'Example',songType:'OP',songNumber:1};
test('anime metadata does not block editing its OP1',()=>{assert.equal(duplicate([{id:'info',entryType:'metadata',animeTitle:'Example'},{id:'song',...form}],{id:'song'},form),false);});
test('editing excludes its own document even when ids have different primitive types',()=>{assert.equal(duplicate([{id:123,...form}],{id:'123'},form),false);});
test('another real song with the same type and number is still rejected',()=>{assert.equal(duplicate([{id:'other',...form}],{id:'song'},form),true);});
test('different song numbers or types are allowed',()=>{assert.equal(duplicate([{id:'other',...form,songType:'ED'},{id:'two',...form,songNumber:2}],null,form),false);});
