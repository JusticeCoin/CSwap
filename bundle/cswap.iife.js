var CSwap=(function(h){"use strict";var Bt=Object.defineProperty;var pt=h=>{throw TypeError(h)};var Ot=(h,v,m)=>v in h?Bt(h,v,{enumerable:!0,configurable:!0,writable:!0,value:m}):h[v]=m;var dt=(h,v,m)=>Ot(h,typeof v!="symbol"?v+"":v,m),Y=(h,v,m)=>v.has(h)||pt("Cannot "+m);var n=(h,v,m)=>(Y(h,v,"read from private field"),m?m.call(h):v.get(h)),k=(h,v,m)=>v.has(h)?pt("Cannot add the same private member more than once"):v instanceof WeakSet?v.add(h):v.set(h,m),u=(h,v,m,j)=>(Y(h,v,"write to private field"),j?j.call(h,m):v.set(h,m),m),r=(h,v,m)=>(Y(h,v,"access private method"),m);var g,P,x,F,H,d,G,ht,K,V,ut,B,ft,M,f,C,R,L,z,N,q,o,I,Z,vt,mt,gt,bt,wt,J,Q,xt,yt,y;const m={author:{text:"Written by the author",mark:""},approved:{text:"AI-drafted · Author approved",mark:"✓ "},ai:{text:"AI generated · not reviewed by the author",mark:"⚠ "}},j="ABCDEFGHIJKLMNOPQRSTUVWXYZ",$t=`
:host { display: block; margin: 22px 0; font-family: var(--cswap-font, system-ui, -apple-system, 'Segoe UI', sans-serif); }
.root {
  padding: 16px 0; cursor: pointer; perspective: 900px; outline: none;
  border-top: 1px solid var(--cswap-line, rgba(127,127,127,.35));
  border-bottom: 1px solid var(--cswap-line, rgba(127,127,127,.35));
}
.root:focus-visible { outline: 2px solid var(--cswap-focus, var(--cswap-color-3, #6aa8ff)); outline-offset: 4px; }
.head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.tab {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--cswap-muted, rgba(127,127,127,.9)); opacity: .45; padding-bottom: 2px;
  border-bottom: 2px solid transparent; transition: all .2s ease;
}
.tab.on { opacity: 1; color: var(--c); border-bottom-color: var(--c); }
.spacer { flex: 1; }
.hint { font-size: 10px; letter-spacing: 1px; color: var(--cswap-muted, rgba(127,127,127,.9)); }
.stage {
  font-size: var(--cswap-font-size, 15.5px); line-height: var(--cswap-line-height, 1.8);
  color: var(--c); transform-origin: 50% 50%; backface-visibility: hidden;
}
.prov {
  margin-top: 10px; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase;
  color: var(--cswap-muted, rgba(127,127,127,.9));
}
.prov.approved { color: var(--cswap-approved, #3fae6c); }
.prov.ai { color: var(--cswap-ai, #d9a441); }
::slotted(c-level) { display: block; white-space: pre-line; }
::slotted(c-level[hidden]) { display: none; }
`,kt=`
:host {
  --cswap-color-1: #1a1a1a; --cswap-color-2: #1f8f4e; --cswap-color-3: #2563c9;
}
@media (prefers-color-scheme: dark) {
  :host { --cswap-color-1: #f2f2f2; --cswap-color-2: #5fd38d; --cswap-color-3: #6aa8ff; }
}
`;let O;function St(i){const l=kt+$t;if(typeof CSSStyleSheet<"u"&&"adoptedStyleSheets"in i&&CSSStyleSheet.prototype.replaceSync)try{O||(O=new CSSStyleSheet,O.replaceSync(l)),i.adoptedStyleSheets=[O];return}catch{}const t=document.createElement("style");t.textContent=l,i.appendChild(t)}const Et=i=>String(i).toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");function At(i,l){const t=i.getAttribute("provenance"),e=t==null||t===""?l:t;return Object.hasOwn(m,e)?e:"ai"}class tt extends HTMLElement{constructor(){super();k(this,d);k(this,g,0);k(this,P,!1);k(this,x,[]);k(this,F);k(this,H,!1);const t=this.attachShadow({mode:"open"});St(t);const e=document.createElement("div");e.className="root",e.setAttribute("part","root"),e.setAttribute("role","button"),e.tabIndex=0,e.title="Tap to swap this idea",e.innerHTML='<div class="head" part="head"><span class="tabs" style="display:contents"></span><span class="spacer"></span><span class="hint" part="hint">TAP ↻</span></div><div class="stage" part="stage"><slot></slot></div><div class="prov" part="provenance"></div>',t.appendChild(e),this._wrap=e,this._tabs=e.querySelector(".tabs"),this._stage=e.querySelector(".stage"),this._prov=e.querySelector(".prov"),e.addEventListener("click",a=>r(this,d,M).call(this,a.shiftKey?-1:1)),e.addEventListener("keydown",a=>{a.key==="Enter"||a.key===" "?(a.preventDefault(),r(this,d,M).call(this,a.shiftKey?-1:1)):a.key==="ArrowRight"?(a.preventDefault(),r(this,d,M).call(this,1)):a.key==="ArrowLeft"&&(a.preventDefault(),r(this,d,M).call(this,-1))}),this._tabs.addEventListener("click",a=>{var c,p;const s=(p=(c=a.target).closest)==null?void 0:p.call(c,".tab");s&&(a.stopPropagation(),this.goTo(Number(s.dataset.i)))})}connectedCallback(){r(this,d,K).call(this,!0),u(this,F,new MutationObserver(()=>r(this,d,K).call(this,!1))),n(this,F).observe(this,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:["label","provenance"]})}disconnectedCallback(){var t;(t=n(this,F))==null||t.disconnect()}attributeChangedCallback(t){t==="start"&&n(this,H)&&(u(this,g,r(this,d,G).call(this)),r(this,d,B).call(this))}get length(){return n(this,x).length}get index(){return n(this,g)}set index(t){this.goTo(t)}next(){r(this,d,M).call(this,1)}prev(){r(this,d,M).call(this,-1)}goTo(t){const e=n(this,x).length;!Number.isInteger(t)||t<0||t>=e||t===n(this,g)||r(this,d,M).call(this,t>n(this,g)?1:-1,t)}}g=new WeakMap,P=new WeakMap,x=new WeakMap,F=new WeakMap,H=new WeakMap,d=new WeakSet,G=function(){const t=(this.getAttribute("start")||"").trim(),e=n(this,x).length;if(!t)return 0;let a=-1;return/^\d+$/.test(t)?a=Number(t)-1:/^[A-Za-z]$/.test(t)&&t.toUpperCase()<=j[Math.max(0,e-1)]&&(a=j.indexOf(t.toUpperCase())),(a<0||a>=e)&&(a=n(this,x).findIndex(s=>s.id===t.toLowerCase()||s.label.toLowerCase()===t.toLowerCase())),a>=0&&a<e?a:0},ht=function(){const t=this.getAttribute("default-provenance"),e=t&&Object.hasOwn(m,t)?t:t?"ai":"author";return[...this.children].filter(a=>a.localName==="c-level").map((a,s)=>{const c=a.getAttribute("label")||["Author","Beginner","Cub"][s]||`Level ${s+1}`;return{el:a,label:c,id:a.getAttribute("id")||Et(c)||`level-${s+1}`,provenance:At(a,e),color:a.getAttribute("color")}})},K=function(t){const e=n(this,x).length;u(this,x,r(this,d,ht).call(this)),t||!n(this,H)?u(this,g,r(this,d,G).call(this)):n(this,g)>=n(this,x).length&&u(this,g,Math.max(0,n(this,x).length-1)),u(this,H,!0),(e!==n(this,x).length||t)&&r(this,d,ut).call(this),r(this,d,B).call(this)},V=function(t){var e;return((e=n(this,x)[t])==null?void 0:e.color)||`var(--cswap-color-${t%3+1})`},ut=function(){this._tabs.replaceChildren(...n(this,x).map((t,e)=>{const a=document.createElement("span");return a.className="tab",a.dataset.i=String(e),a.setAttribute("part","tab"),a}))},B=function(){const t=n(this,x);if(!t.length)return;t.forEach((s,c)=>{s.el.hidden=c!==n(this,g)}),[...this._tabs.children].forEach((s,c)=>{t[c]&&(s.textContent=`${j[c]??c+1} · ${t[c].label}`,s.style.setProperty("--c",r(this,d,V).call(this,c)),s.classList.toggle("on",c===n(this,g)))});const e=t[n(this,g)];this._wrap.style.setProperty("--c",r(this,d,V).call(this,n(this,g)));const a=m[e.provenance];this._prov.textContent=a.mark+a.text,this._prov.className=`prov ${e.provenance}`,this._wrap.title=t.length>1?"Tap to swap this idea":""},ft=function(){const t=parseFloat(getComputedStyle(this).getPropertyValue("--cswap-duration"));return Number.isFinite(t)&&t>=0?t:170},M=async function(t,e){const a=n(this,x).length;if(a<2||n(this,P))return;const s=e??(n(this,g)+t+a)%a,c=n(this,g),p=this._stage,w=typeof p.animate=="function",$=r(this,d,ft).call(this);u(this,P,!0);try{w&&$>0&&await p.animate([{transform:"rotateX(0deg)",opacity:1},{transform:`rotateX(${90*t}deg)`,opacity:0}],{duration:$,easing:"ease-in",fill:"forwards"}).finished,u(this,g,s),r(this,d,B).call(this),w&&$>0&&(await p.animate([{transform:`rotateX(${-90*t}deg)`,opacity:0},{transform:"rotateX(0deg)",opacity:1}],{duration:$,easing:"ease-out"}).finished,p.getAnimations().forEach(E=>E.cancel()))}catch{u(this,g,s),r(this,d,B).call(this)}finally{u(this,P,!1)}const T=n(this,x)[n(this,g)];this.dispatchEvent(new CustomEvent("cswap:swap",{bubbles:!0,composed:!0,detail:{index:n(this,g),id:T.id,label:T.label,provenance:T.provenance,previousIndex:c,total:a}}))},dt(tt,"observedAttributes",["start"]);function Ct(){typeof customElements>"u"||customElements.get("c-swap")||customElements.define("c-swap",tt)}Ct();const Lt=new RegExp(`(?<=[.!?…])["')\\]]*\\s+(?=[A-Z"'(\\[0-9])`);function X(i){return String(i).trim().split(Lt).map(l=>l.trim()).filter(Boolean)}const Tt=i=>{const l=i.toLowerCase().replace(/e$/,"").match(/[aeiouy]+/g);return Math.max(1,l?l.length:1)};function zt(i){const l=Math.max(1,X(i).length),t=String(i).match(/[\p{L}\p{N}'’-]+/gu)||[];if(!t.length)return 100;const e=t.reduce((a,s)=>a+Tt(s),0);return 206.835-1.015*(t.length/l)-84.6*(e/t.length)}function _t(i,l={}){const{granularity:t="auto",maxChars:e=320,minChars:a=40,hardBelow:s=60,score:c=zt}=l,p=String(i??"").replace(/\r\n?/g,`
`).split(`
`),w=[];let $=[],T=!1;const E=()=>{$.length&&w.push($.join(`
`)),$=[]};for(const b of p){if(/^\s*```/.test(b)){T=!T,$.push(b);continue}if(!T&&!b.trim()){E();continue}$.push(b)}E();const W=[],D=(b,S)=>{const _=S==="text"&&b.length>=a,ct=_?c(b):null;W.push({id:`c${W.length+1}`,text:b,kind:S,swappable:_,hard:_&&ct<s,ease:ct})};for(const b of w)if(/^\s*```/.test(b))D(b,"code");else if(/^\s*#{1,6}\s/.test(b))D(b,"heading");else if(/^\s*([-*+]|\d+\.)\s/.test(b))D(b,"list");else if(t==="sentence")X(b.replace(/\s*\n\s*/g," ")).forEach(S=>D(S,"text"));else if(t==="auto"&&b.length>e){let S="";for(const _ of X(b.replace(/\s*\n\s*/g," ")))S&&(S+" "+_).length>e?(D(S,"text"),S=_):S=S?`${S} ${_}`:_;S&&D(S,"text")}else D(b.replace(/\s*\n\s*/g," "),"text");return W}const Mt=["Author","Beginner","Cub"].map((i,l)=>({label:i,audience:["the author","a reader new to the subject","a young reader (a child, or anyone who needs it broken down)"][l]}));function et(i,l={}){const{mode:t="automatic",levels:e=Mt,chunk:a={}}=l,s=_t(i,a).map(c=>({...c,swap:t==="automatic"&&c.hard,levels:e.map((p,w)=>({label:p.label,audience:p.audience,text:w===0?c.text:"",provenance:"author",status:w===0?"done":"empty"}))}));return{mode:t,levels:e,chunks:s}}const U=(i,l)=>i.chunks.find(t=>t.id===l);function Nt(i,l,t){return U(i,l).swap=!!t,i}function Dt(i,l,t,e){const a=U(i,l).levels[t];return a.text=e,a.provenance="author",a.status=e.trim()?"done":"empty",i}function It(i,l,t,e){const a=U(i,l).levels[t];return a.text=e,a.provenance==="author"&&a.status!=="empty"||(a.provenance="ai"),i}function at(i,l,t){const e=U(i,l).levels[t];return e.provenance==="ai"&&e.text.trim()&&(e.provenance="approved"),i}function jt(i){return i.chunks.forEach(l=>l.swap&&l.levels.forEach((t,e)=>at(i,l.id,e))),i}async function st(i,l,t){const e=U(i,l),a=e.levels[0].text;return await Promise.all(e.levels.map(async(s,c)=>{if(!(c===0||s.text.trim())){s.status="drafting";try{const p=await t({text:a,level:s.label,audience:s.audience,label:s.label,index:c});s.text=String(p??"").trim(),s.provenance="ai",s.status=s.text?"done":"error"}catch(p){s.status="error",s.error=String((p==null?void 0:p.message)??p)}}})),i}async function Pt(i,l,t){for(const e of i.chunks.filter(a=>a.swap))await st(i,e.id,l),t==null||t(i,e);return i}function nt(i){const l=i.chunks.filter(e=>e.swap),t=l.flatMap(e=>e.levels.slice(1));return{swaps:l.length,levels:t.length,reviewed:t.filter(e=>e.provenance!=="ai"&&e.text.trim()).length,notReviewed:t.filter(e=>e.provenance==="ai").length,missing:t.filter(e=>!e.text.trim()).length}}const Ft={author:"",approved:"+",ai:"~"};function Ht(i){return i.chunks.map(l=>l.swap&&l.levels.every(e=>e.text.trim())?`:::swap
${l.levels.map((e,a)=>{const s=Ft[e.provenance]??"~";return a===0&&!s?e.text:`--- ${e.label}${s?" "+s:""}
${e.text}`}).join(`
`)}
:::`:l.text).join(`

`)}async function it({text:i,index:l}){await new Promise(s=>setTimeout(s,250+Math.random()*350));const t={utilize:"use",approximately:"about",demonstrate:"show",facilitate:"help",subsequently:"then",commence:"start",therefore:"so",however:"but",additional:"more",obtain:"get",sufficient:"enough",adjudicated:"decided",disclosed:"shown",provisional:"not final",regarding:"about",nevertheless:"still"};let a=i.replace(/\b[A-Za-z]+\b/g,s=>t[s.toLowerCase()]??s).replace(/\([^)]*\)/g,"").replace(/;\s*/g,". ").split(new RegExp("(?<=[.!?])\\s+")).map(s=>s.replace(/,\s+(which|who|and|but)\b.*$/i,"."));return l>=2&&(a=a.map(s=>s.split(/\s+/).slice(0,9).join(" ").replace(/[,;:]$/,"")).map(s=>/[.!?]$/.test(s)?s:s+".")),a.join(" ").replace(/\s+/g," ").trim()}const rt={author:"",approved:"✓ ",ai:"⚠ "},ot={author:"Written by the author",approved:"AI-drafted · Author approved",ai:"AI generated · not reviewed by the author"},A=i=>String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),lt=`The Protocol

Every adjudicated outcome is weighted seven to three between human and machine reasoning, and the weighting is disclosed alongside each verdict so that no participant must infer how a conclusion was reached.

Appeals remain open for a fixed window. A verdict is provisional until that window closes, and subsequently it becomes final unless additional evidence is presented that demonstrates a material error.

You can join today.

Participation does not require approximately any prior experience with distributed systems; however, sufficient familiarity with the published rules is expected before an adjudicator commences a ruling.`,Rt=`
:host { --cswap-color-1: #1a1a1a; --cswap-color-2: #1f8f4e; --cswap-color-3: #2563c9; }
@media (prefers-color-scheme: dark) { :host { --cswap-color-1: #f2f2f2; --cswap-color-2: #5fd38d; --cswap-color-3: #6aa8ff; } }
:host { display: block; font-family: var(--cswap-font, system-ui, -apple-system, 'Segoe UI', sans-serif); color: var(--cswap-color-1);
  --ink: var(--cswap-color-1); --panel: var(--cswap-panel, rgba(127,127,127,.08)); max-width: 780px; }
* { box-sizing: border-box; }
h2 { margin: 0 0 4px; font-size: 20px; } .sub { margin: 0 0 18px; opacity: .65; font-size: 14px; line-height: 1.5; }
.modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.mode { text-align: left; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--cswap-line, rgba(127,127,127,.35));
  background: transparent; color: inherit; font: inherit; cursor: pointer; }
.mode b { display: block; font-size: 14px; margin-bottom: 2px; } .mode span { font-size: 12.5px; opacity: .65; line-height: 1.4; }
.mode.on { border-color: var(--cswap-color-2); background: var(--panel); } .mode.on b { color: var(--cswap-color-2); }
textarea { width: 100%; font: inherit; font-size: 14.5px; line-height: 1.6; color: inherit; background: var(--panel);
  border: 1px solid var(--cswap-line, rgba(127,127,127,.35)); border-radius: 8px; padding: 10px 12px; resize: vertical; }
textarea:focus { outline: 2px solid var(--cswap-color-3); outline-offset: 1px; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 12px 0; }
.row .grow { flex: 1; }
label.sel { font-size: 12.5px; opacity: .8; display: flex; gap: 6px; align-items: center; }
select { font: inherit; font-size: 13px; color: inherit; background: var(--panel); border: 1px solid var(--cswap-line, rgba(127,127,127,.35)); border-radius: 6px; padding: 4px 6px; }
button.btn { font: inherit; font-size: 13.5px; font-weight: 600; padding: 8px 14px; border-radius: 8px; cursor: pointer; color: inherit;
  background: transparent; border: 1px solid var(--cswap-line, rgba(127,127,127,.5)); }
button.btn.primary { background: var(--cswap-color-2); border-color: var(--cswap-color-2); color: #06140b; }
button.btn.small { padding: 4px 10px; font-size: 12px; }
button.btn:disabled { opacity: .45; cursor: default; }
.summary { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 10px; background: var(--panel); margin-bottom: 14px; font-size: 13.5px; }
.summary .grow { flex: 1; } .warn { color: var(--cswap-ai, #d9a441); } .ok { color: var(--cswap-approved, #3fae6c); }
.chunk { border: 1px solid var(--cswap-line, rgba(127,127,127,.3)); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; }
.chunk.off { border-style: dashed; opacity: .85; }
.chead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; letter-spacing: .5px; opacity: .8; }
.chead .grow { flex: 1; } .tag { padding: 1px 7px; border-radius: 99px; border: 1px solid currentColor; font-size: 11px; }
.orig { font-size: 14.5px; line-height: 1.6; white-space: pre-line; margin: 0 0 4px; }
.lvl { margin-top: 12px; }
.lvlhead { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
.lvlhead .grow { flex: 1; }
.chip { font-weight: 500; letter-spacing: .8px; font-size: 10.5px; }
.chip.approved { color: var(--cswap-approved, #3fae6c); } .chip.ai { color: var(--cswap-ai, #d9a441); } .chip.author, .chip.empty { opacity: .6; }
.drafting { opacity: .6; font-size: 13px; padding: 8px 0; }
.err { color: #e5645b; font-size: 12.5px; }
.preview { margin-top: 10px; }
.out { margin-top: 18px; } .out h3 { font-size: 13px; letter-spacing: 1.4px; text-transform: uppercase; opacity: .65; margin: 0 0 6px; }
.out textarea { font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; }
.note { font-size: 12px; opacity: .55; margin-top: 8px; line-height: 1.5; }
`;class Ut extends HTMLElement{constructor(){super();k(this,o);k(this,f,null);k(this,C,"automatic");k(this,R,"auto");k(this,L,"");k(this,z,!1);k(this,N,it);k(this,q,!0);this.attachShadow({mode:"open"});const t=this.shadowRoot;t.addEventListener("click",e=>r(this,o,vt).call(this,e)),t.addEventListener("input",e=>r(this,o,gt).call(this,e)),t.addEventListener("change",e=>r(this,o,bt).call(this,e))}connectedCallback(){this.shadowRoot.firstChild||r(this,o,y).call(this)}set translate(t){u(this,N,t),u(this,q,!1),r(this,o,y).call(this)}get translate(){return n(this,N)}get document(){return n(this,f)}get syntax(){return n(this,f)?Ht(n(this,f)):""}set text(t){u(this,L,String(t??"")),r(this,o,y).call(this)}set mode(t){u(this,C,t==="manual"?"manual":"automatic"),r(this,o,y).call(this)}async start(t,e){t!=null&&u(this,L,t),e&&u(this,C,e),await r(this,o,Z).call(this)}}f=new WeakMap,C=new WeakMap,R=new WeakMap,L=new WeakMap,z=new WeakMap,N=new WeakMap,q=new WeakMap,o=new WeakSet,I=function(){this.dispatchEvent(new CustomEvent("cswap:intake-change",{bubbles:!0,composed:!0,detail:{syntax:this.syntax,progress:nt(n(this,f))}}))},Z=async function(){n(this,L).trim()&&(u(this,f,et(n(this,L),{mode:n(this,C),chunk:{granularity:n(this,R)}})),u(this,z,n(this,C)==="automatic"),r(this,o,y).call(this),n(this,C)==="automatic"&&(n(this,f).chunks.filter(t=>t.swap).forEach(t=>t.levels.slice(1).forEach(e=>{e.status="drafting"})),r(this,o,y).call(this),await Pt(n(this,f),n(this,N),()=>r(this,o,y).call(this)),u(this,z,!1),r(this,o,y).call(this)),r(this,o,I).call(this))},vt=function(t){var p;const e=t.target.closest("[data-act]");if(!e)return;const{act:a,id:s}=e.dataset,c=Number(e.dataset.i);a==="mode"?(u(this,C,e.dataset.mode),r(this,o,y).call(this)):a==="sample"?(u(this,L,lt),r(this,o,y).call(this)):a==="begin"?r(this,o,Z).call(this):a==="restart"?(u(this,f,null),u(this,z,!1),r(this,o,y).call(this)):a==="approve"?(at(n(this,f),s,c),r(this,o,y).call(this),r(this,o,I).call(this)):a==="approve-all"?(jt(n(this,f)),r(this,o,y).call(this),r(this,o,I).call(this)):a==="draft"?r(this,o,mt).call(this,s):a==="copy"&&((p=navigator.clipboard)==null||p.writeText(this.syntax),e.textContent="Copied")},mt=async function(t){n(this,f).chunks.find(a=>a.id===t).levels.slice(1).forEach(a=>{a.text.trim()||(a.status="drafting")}),r(this,o,y).call(this),await st(n(this,f),t,n(this,N)),r(this,o,y).call(this),r(this,o,I).call(this)},gt=function(t){const e=t.target;if(e.dataset.field==="source"){u(this,L,e.value);return}if(e.dataset.field==="level"){const{id:a,i:s}=e.dataset,c=n(this,f).chunks.find(p=>p.id===a).levels[Number(s)];c.provenance==="ai"||c.status==="drafting"?It(n(this,f),a,Number(s),e.value):Dt(n(this,f),a,Number(s),e.value),r(this,o,wt).call(this,a,Number(s))}},bt=function(t){const e=t.target;e.dataset.field==="gran"?u(this,R,e.value):e.dataset.field==="swap"&&(Nt(n(this,f),e.dataset.id,e.checked),r(this,o,y).call(this),r(this,o,I).call(this))},wt=function(t,e){const a=this.shadowRoot,s=n(this,f).chunks.find(E=>E.id===t).levels[e],c=a.querySelector(`[data-chip="${t}:${e}"]`);if(c){const E=s.text.trim()?s.provenance:"empty";c.className=`chip ${E}`,c.textContent=E==="empty"?"Empty":rt[E]+ot[E]}const p=a.querySelector(`[data-approve="${t}:${e}"]`);p&&(p.hidden=s.provenance!=="ai"||!s.text.trim());const w=a.querySelector(".summary .stat");w&&(w.innerHTML=r(this,o,J).call(this));const $=a.querySelector('textarea[data-field="out"]');$&&($.value=this.syntax);const T=a.querySelector(`[data-preview="${t}"]`);T&&(T.innerHTML=r(this,o,Q).call(this,n(this,f).chunks.find(E=>E.id===t))),r(this,o,I).call(this)},J=function(){const t=nt(n(this,f));if(!t.swaps)return"No swaps yet. Switch on “Swap this” for the chunks you want.";const e=[`<b>${t.swaps}</b> swap${t.swaps===1?"":"s"}`];return e.push(t.notReviewed?`<span class="warn">${t.notReviewed} draft${t.notReviewed===1?"":"s"} not reviewed</span>`:'<span class="ok">every level reviewed</span>'),t.missing&&e.push(`${t.missing} level${t.missing===1?"":"s"} still empty`),e.join(" · ")},Q=function(t){return!t.swap||!t.levels.every(a=>a.text.trim())?"":`<c-swap>${t.levels.map(a=>`<c-level label="${A(a.label)}" provenance="${a.provenance}">${A(a.text)}</c-level>`).join("")}</c-swap>`},xt=function(t,e,a){const s=e.text.trim()?e.provenance:"empty";return e.status==="drafting"?`<div class="lvl"><div class="lvlhead">${a<3?"ABC"[a]+" · ":""}${A(e.label)}</div><div class="drafting">Drafting…</div></div>`:`<div class="lvl">
      <div class="lvlhead"><span>${a<3?"ABC"[a]+" · ":""}${A(e.label)}</span><span class="grow"></span>
        <span class="chip ${s}" data-chip="${t.id}:${a}">${s==="empty"?"Empty":rt[s]+ot[s]}</span>
        <button class="btn small" data-act="approve" data-id="${t.id}" data-i="${a}" data-approve="${t.id}:${a}" ${e.provenance==="ai"&&e.text.trim()?"":"hidden"}>Approve</button>
      </div>
      <textarea rows="3" data-field="level" data-id="${t.id}" data-i="${a}" placeholder="Write the ${A(e.label)} version, or use “Draft levels”">${A(e.text)}</textarea>
      ${e.status==="error"?`<div class="err">The translator failed${e.error?": "+A(e.error):""}. Write it yourself or try again.</div>`:""}
    </div>`},yt=function(t,e){const a=!t.swappable,s=t.kind==="text"?"":t.kind,c=`<div class="chead"><span>${e}</span>
      ${t.hard?'<span class="tag warn" title="Reading ease score is low">hard to read</span>':""}
      ${s?`<span class="tag">${s}</span>`:""}<span class="grow"></span>
      ${a?"<span>Left as written</span>":`<label><input type="checkbox" data-field="swap" data-id="${t.id}" ${t.swap?"checked":""}> Swap this</label>`}</div>`;if(a||!t.swap)return`<div class="chunk off">${c}<p class="orig">${A(t.text)}</p></div>`;const p=t.levels.slice(1).some(w=>!w.text.trim()&&w.status!=="drafting");return`<div class="chunk">${c}
      ${t.levels.map((w,$)=>$===0?`<div class="lvl"><div class="lvlhead"><span>A · ${A(w.label)}</span><span class="grow"></span><span class="chip author">Your text, as written</span></div><p class="orig">${A(w.text)}</p></div>`:r(this,o,xt).call(this,t,w,$)).join("")}
      ${p?`<div class="row"><button class="btn small" data-act="draft" data-id="${t.id}">Draft the empty levels</button><span class="note">Drafts arrive as “not reviewed” until you approve them.</span></div>`:""}
      <div class="preview" data-preview="${t.id}">${r(this,o,Q).call(this,t)}</div>
    </div>`},y=function(){const t=this.shadowRoot,e=n(this,C)==="automatic";let a;if(!n(this,f))a=`
        <div class="modes">
          <button class="mode ${e?"on":""}" data-act="mode" data-mode="automatic"><b>Automatic</b><span>Give us the whole text. We find the hard parts and draft the easier levels. You review.</span></button>
          <button class="mode ${e?"":"on"}" data-act="mode" data-mode="manual"><b>Manual</b><span>We break it into chunks. You choose which to swap and write every level yourself.</span></button>
        </div>
        <textarea rows="11" data-field="source" placeholder="Paste or type your whole text here…">${A(n(this,L))}</textarea>
        <div class="row">
          <label class="sel">Chunk by
            <select data-field="gran">
              ${[["auto","Paragraphs (long ones split)"],["paragraph","Paragraphs"],["sentence","Sentences"]].map(([s,c])=>`<option value="${s}" ${n(this,R)===s?"selected":""}>${c}</option>`).join("")}
            </select></label>
          <span class="grow"></span>
          <button class="btn" data-act="sample">Use sample text</button>
          <button class="btn primary" data-act="begin">${e?"Find the hard parts and draft levels":"Break into chunks"}</button>
        </div>
        ${n(this,q)&&e?'<div class="note">Demo translator: no AI is connected, so drafts here are only simple word swaps and shortening. Plug in your own translator to get real drafts.</div>':""}`;else{const s=n(this,f).chunks;let c=0;a=`
        <div class="summary"><span class="stat">${n(this,z)?"Drafting levels…":r(this,o,J).call(this)}</span><span class="grow"></span>
          <button class="btn small" data-act="approve-all" ${n(this,z)?"disabled":""}>Approve all drafts</button>
          <button class="btn small" data-act="restart">Start over</button></div>
        ${s.map(p=>r(this,o,yt).call(this,p,++c)).join("")}
        <div class="out"><h3>Result</h3>
          <textarea rows="8" readonly data-field="out">${A(this.syntax)}</textarea>
          <div class="row"><button class="btn small" data-act="copy">Copy</button><span class="note">Unreviewed drafts keep their <code>~</code> flag, so readers always see which levels the author has not checked.</span></div></div>`}t.innerHTML=`<style>${Rt}</style>
      <h2>C Swap intake</h2>
      <p class="sub">${n(this,f)?e?"Automatic mode: review each draft, edit it, and approve what you stand behind.":"Manual mode: choose the chunks to swap and write each level.":"Turn a whole text into swaps. Every level is labeled with who stands behind it."}</p>
      ${a}`};function qt(){typeof customElements<"u"&&!customElements.get("c-swap-intake")&&customElements.define("c-swap-intake",Ut)}return qt(),h.SAMPLE_TEXT=lt,h.createIntake=et,h.demoTranslator=it,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"}),h})({});
