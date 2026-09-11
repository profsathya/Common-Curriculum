const {test}=require('node:test');
const assert=require('node:assert/strict');
const {handler}=require('../netlify/functions/ai-proxy');
const event={httpMethod:'POST',headers:{origin:'https://profsathya.github.io'},body:JSON.stringify({messages:[{role:'user',content:'QA fictional example'}]})};
test('proxy collects text blocks and preserves response interface',async()=>{
 const old=global.fetch,key=process.env.ANTHROPIC_API_KEY;process.env.ANTHROPIC_API_KEY='test-only';
 try {global.fetch=async()=>({ok:true,json:async()=>({content:[{type:'thinking',thinking:'private'},{type:'text',text:'first'},{type:'text',text:'second'}],usage:{output_tokens:2}})});
 const r=await handler(event);assert.equal(r.statusCode,200);assert.deepEqual(JSON.parse(r.body),{content:'first\nsecond',usage:{output_tokens:2}});
 global.fetch=async()=>({ok:true,json:async()=>({content:[]})});assert.equal((await handler(event)).statusCode,502);
 global.fetch=async()=>{const e=new Error('timeout');e.name='TimeoutError';throw e;};assert.equal((await handler(event)).statusCode,504);
 }finally{global.fetch=old;if(key===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=key;}
});
test('discussion parser rejects malformed output instead of inventing questions',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../js/activity-components.js'),'utf8');
 const start=source.indexOf('  function parseDiscussionQuestions('),end=source.indexOf('  async function handleAiGenerate(',start);
 const ctx={};vm.runInNewContext(source.slice(start,end)+';this.parse=parseDiscussionQuestions;',ctx);
 assert.throws(()=>ctx.parse('plain prose'),/unreadable/);
 assert.throws(()=>ctx.parse('{"questions":[]}'),/unreadable/);
 assert.throws(()=>ctx.parse(''),/no text/);
 assert.equal(ctx.parse('```json\n{"questions":["Which evidence?"]}\n```').questions[0],'Which evidence?');
});
