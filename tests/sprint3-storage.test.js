const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/cst286-sprint3-paths.js'),'utf8');
function run(entries) {
 const records=new Map(Object.entries(entries));
 const ctx={window:{},URL,location:{href:'https://example.test/cst286/my-sprint-3-goal-and-plan.html'},localStorage:{getItem:k=>records.has(k)?records.get(k):null,setItem:(k,v)=>records.set(k,v),removeItem:k=>records.delete(k)}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {create:ctx.window.Sprint3Paths.create,records};
}
test('the home-page reflection echo uses item 5, and path switching does not overwrite the exam echo',()=>{
 const draft=JSON.stringify({answers:{path:{text:'A'},leave:{text:'My reflection for A'}}});
 const {create,records}=run({'cst286.s3.path':'A','cst286.s3.4.leave':'Exam note','cst286.s3.5.leave':'Stale B reflection','cc-gi:cst286-my-sprint-3-experience:path:A':draft});
 const store=create('cc-gi:cst286-my-sprint-3-goal-and-plan');
 assert.equal(store.readShared('cst286.s3.5.leave'),'My reflection for A');
 assert.equal(records.get('cst286.s3.5.leave'),'My reflection for A');
 assert.equal(records.get('cst286.s3.4.leave'),'Exam note');
});
test('an old draft with no identifiable path is preserved but not attached to a new path',()=>{
 const old=JSON.stringify({answers:{given:{text:'Unassigned old answer'}}});
 const {create,records}=run({'cst286.s3.path':'C','cc-gi:cst286-my-sprint-3-goal-and-plan':old});
 const store=create('cc-gi:cst286-my-sprint-3-goal-and-plan');
 assert.equal(records.get(store.key),undefined);
 assert.equal(records.get('cc-gi:cst286-my-sprint-3-goal-and-plan'),old);
});
test('a saved draft from another path cannot supply the current path’s look-forward text',()=>{
 const old=JSON.stringify({answers:{path:{text:'A'},leave:{text:'A next step'}}});
 const {create,records}=run({'cst286.s3.path':'B','cst286.s3.1.leave':'A next step','cc-gi:cst286-my-sprint-3-goal-and-plan':old});
 const store=create('cc-gi:cst286-find-and-confirm-my-relationship');
 assert.equal(store.readShared('cst286.s3.1.leave'),'');
 assert.equal(records.get('cst286.s3.1.leave'),undefined);
});
