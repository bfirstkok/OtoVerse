import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
function api(file,{admin=true,authenticated=true,quotaError=false}={}) {
 const calls=[];const context={module:{exports:{}},require:name=>name==='firebase-admin/auth'?{getAuth:()=>({verifyIdToken:async()=>{if(!authenticated)throw new Error('invalid');return {uid:'test-admin'};}})}:{consumeQuota:async()=>{if(quotaError)throw Object.assign(new Error('suspended'),{status:403});}},process:{env:{NEWS_AI_KEY:'test-only'}},AbortSignal,Map,Set,Date,JSON,Number,String,RegExp};
 context.fetch=async(url,options)=>{calls.push(url);if(url.includes('/admins/'))return {ok:true,json:async()=>({fields:{role:{stringValue:admin?'admin':'user'}}})};if(url.includes('/account_controls/'))return {ok:false,status:404};if(url.includes('api.jikan.moe'))return {ok:true,json:async()=>({data:{mal_id:31240,title:'Re:Zero',synopsis:'A boy arrives in another world.',trailer:{youtube_id:'abcdefghijk'}}})};if(url.includes('/chat/completions'))return {ok:true,json:async()=>({choices:[{message:{content:'เด็กหนุ่มเดินทางไปยังอีกโลกหนึ่ง'}}]})};throw new Error('Unexpected endpoint');};
 vm.runInNewContext(fs.readFileSync(`server/mascot-api/api/${file}.js`,'utf8'),context);
 return {handler:context.module.exports,calls};
}
async function invoke(handler,body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;},end(){return this;}};await handler({method:'POST',headers:{origin:'https://otoverse.games',authorization:'Bearer test-only'},body},res);return res;}
test('admin can obtain metadata and summary from server-fetched source',async()=>{
 const metadata=api('anime-metadata');const m=await invoke(metadata.handler,{malId:31240});assert.equal(m.statusCode,200);assert.equal(m.data.data.mal_id,31240);
 const summary=api('anime-summary');const s=await invoke(summary.handler,{malId:31240});assert.equal(s.statusCode,200);assert.match(s.data.synopsis,/เด็กหนุ่ม/);assert.ok(summary.calls.some(url=>url.includes('api.jikan.moe/v4/anime/31240')));
});
test('unauthenticated and non-admin requests cannot call upstream AI',async()=>{
 for(const file of ['anime-metadata','anime-summary'])for(const options of [{authenticated:false},{admin:false}]){const endpoint=api(file,options);const r=await invoke(endpoint.handler,{malId:31240});assert.equal(r.statusCode,options.authenticated===false?401:403);assert.equal(endpoint.calls.some(url=>url.includes('api.jikan.moe')||url.includes('/chat/completions')),false);}
});
test('invalid IDs and suspended quota fail before paid provider calls',async()=>{
 const endpoint=api('anime-summary');assert.equal((await invoke(endpoint.handler,{malId:'https://evil.test'})).statusCode,400);
 const suspended=api('anime-summary',{quotaError:true});assert.equal((await invoke(suspended.handler,{malId:31240})).statusCode,403);assert.equal(suspended.calls.some(url=>url.includes('/chat/completions')),false);
});
