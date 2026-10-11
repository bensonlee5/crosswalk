import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../components/account-panel.tsx',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({configured=true,emailEnabled=true,lost=true}={}){
 const state={ready:true,session:null,slot:'guest',guestAvailable:false,upgrade:null,recoveryOwner:null,message:'',lostGuestOwner:lost?'old-owner':null};
 const slots=[true,false,state,'signin'];let cursor=0,tree,fresh=0,signin=0;
 const react={useState(initial){const at=cursor++;if(!(at in slots))slots[at]=initial;return[slots[at],value=>{slots[at]=typeof value==='function'?value(slots[at]):value;}];},useRef(initial){return{current:initial};},useEffect(){}};
 const jsx=(type,props)=>({type,props:props||{}});
 const exports={};const auth={startFreshGuest:async()=>{fresh++;},signIn:async()=>{signin++;}};
 const require=name=>{if(name==='react')return react;if(name==='react/jsx-runtime')return{jsx,jsxs:jsx};if(name==='lucide-react')return{UserRound:'UserRound'};if(name==='./ui/dialog')return{Dialog:'Dialog',DialogContent:'DialogContent',DialogTitle:'DialogTitle',DialogDescription:'DialogDescription'};if(name==='../lib/supabase-client')return{backendConfigured:configured,emailAuthEnabled:emailEnabled,getAuthManager:()=>auth};throw Error(name);};
 vm.runInNewContext(js,{exports,require,Promise,Error});
 const render=()=>{cursor=0;tree=exports.default({});return tree;};
 const nodes=node=>{if(!node||typeof node!=='object')return[];const children=Array.isArray(node)?node:[node.props?.children];return[...(Array.isArray(node)?[]:[node]),...children.flatMap(child=>nodes(child))];};
 const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(' '):node&&typeof node==='object'?text(node.props?.children):'';
 const button=label=>nodes(tree).find(n=>n.type==='button'&&text(n).includes(label));
 render();return{render,nodes:()=>nodes(tree),text,button,get tree(){return tree;},get fresh(){return fresh;},get signin(){return signin;}};
}
test('lost-session UI warns and requires checked acknowledgment before explicit fresh start',async()=>{
 const h=harness();assert.match(h.text(h.tree),/No replacement guest has been created/);
 assert.match(h.text(h.tree),/all site data is cleared/);
 assert.equal(h.button('Start a separate guest history').props.disabled,true);assert.equal(h.fresh,0);
 h.nodes().find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render();
 assert.equal(h.button('Start a separate guest history').props.disabled,false);
 h.button('Start a separate guest history').props.onClick();await Promise.resolve();await Promise.resolve();assert.equal(h.fresh,1);
});
test('fresh-start recovery remains available while email setup is disabled and does not delete pending data',()=>{
 const h=harness({emailEnabled:false});assert(h.button('Start a separate guest history'));
 assert.match(h.text(h.tree),/Old unconfirmed actions stay kept/);assert.match(h.text(h.tree),/email-account session is preserved/);
 assert.equal(h.fresh,0);assert.equal(h.signin,0);
});
test('closing the account dialog clears fresh-start acknowledgment',()=>{
 const h=harness();h.nodes().find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render();
 h.nodes().find(n=>n.type==='Dialog').props.onOpenChange(false);h.render();
 assert.equal(h.button('Start a separate guest history').props.disabled,true);assert.equal(h.fresh,0);
});
test('account panel does not route players to a retired game site',()=>{
 const h=harness({configured:false,lost:false});
 assert.equal(h.nodes().some(n=>n.type==='a'&&String(n.props.href).includes('crosswalk-life-game')),false);
 assert.doesNotMatch(h.text(h.tree),/Continue an old game|Games started on the original site/);
});
