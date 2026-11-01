(()=>{
  'use strict';
  const $=s=>document.querySelector(s), M=window.ToastModels, book=window.MANUSCRIPT;
  const chapters=[
    {n:1,page:35,title:'The Rotational Incompleteness of Thought',question:'What happens when a question refuses to resolve?'},
    {n:2,page:40,title:'Meta-Philosophy and the Buttered Brain',question:'What is the mind doing when it thinks about itself?'},
    {n:3,page:44,title:'Emergent Motion and the Nature of Reality',question:'Is stillness an answer, or just a useful approximation?'},
    {n:4,page:48,title:'The Fractal Consciousness Hypothesis',question:'How many selves can a single thought contain?'},
    {n:5,page:52,title:'The Science of Hovering',question:'What can uncertainty make room for?'},
    {n:6,page:57,title:'The Self-Programming Universe',question:'What if the rules are part of the story?'},
    {n:7,page:61,title:'The Last Buttered Cat',question:'What becomes of a book that cannot quite end?'}
  ];
  function el(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;}
  let toastTimer;
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500);}
  for(const c of chapters){const b=el('button',null,'chapter-row'),copy=el('div');copy.append(el('h3',c.title),el('p',c.question));b.append(el('span',`0${c.n}`,'chapter-number'),copy,el('span','↗','chapter-arrow'));b.addEventListener('click',()=>openPage(c.page));$('#chapter-list').append(b);}
  // Explicit models, with a fixed visual scale during each run.
  let mode='fiction', time=0, playing=false, lastFrame=null, frame=null, stageActive=true;
  const height=()=>Number($('#drop-height').value), speed=()=>Number($('#spin-speed').value);
  function display(){
    const h=height(),sample=mode==='fiction'?M.fiction(h,time,speed()):M.fall(h,time),angle=mode==='fiction'?sample.angle:0;
    const y=400-(sample.height/h)*300;
    $('#cat-position').setAttribute('transform',`translate(353 ${y})`);$('#cat-rotation').setAttribute('transform',`rotate(${angle%360})`);$('#height-guide').setAttribute('y1',y);$('#height-guide').setAttribute('y2',y);
    $('#time-value').textContent=`${time.toFixed(2)} s`;$('#height-value').textContent=`${sample.height.toFixed(3)} m`;$('#third-value').textContent=mode==='fiction'?(time*speed()).toFixed(2):`${sample.velocity.toFixed(2)} m/s`;$('#third-label').textContent=mode==='fiction'?'ROTATIONS':'VERTICAL VELOCITY';$('#scrub').value=time;$('#scrub-output').textContent=`${time.toFixed(2)} s`;
    $('#drop-output').textContent=`${h.toFixed(2)} m`;$('#spin-output').textContent=`${speed().toFixed(2)} turns/s`;
    const end=mode==='fall'?sample.hit:8;
    $('#scrub').max=end;$('#scrub').step='any';$('#scrub').value=time;
    $('#run').textContent=playing?'Pause Ⅱ':(time>=end?'Run again ↺':(time>0?'Resume ▶':'Run experiment ▶'));
    $('#lab-status').textContent=playing?'EXPERIMENT RUNNING':(mode==='fall'&&sample.landed?'GROUND REACHED':(time>0?'PAUSED FOR THOUGHT':'READY TO THINK'));
  }
  function stop(){playing=false;lastFrame=null;if(frame!==null)cancelAnimationFrame(frame);frame=null;display();}
  function tick(now){if(!playing)return;if(lastFrame!==null)time+=Math.min((now-lastFrame)/1000,.05);lastFrame=now;const end=mode==='fall'?M.fall(height(),0).hit:8;if(time>=end){time=end;stop();$('#run').textContent='Run again ↺';return;}display();frame=requestAnimationFrame(tick);}
  function reset(){stop();time=0;display();}
  function setMode(next){mode=next;reset();const f=mode==='fiction';$('#mode-fiction').classList.toggle('active',f);$('#mode-fall').classList.toggle('active',!f);$('#mode-fiction').setAttribute('aria-pressed',String(f));$('#mode-fall').setAttribute('aria-pressed',String(!f));$('#spin-speed').disabled=!f;$('#mode-label').textContent=f?'FICTIONAL HOVER':'IDEAL FREE FALL';$('#hover-caption').style.display=f?'':'none';$('#mode-description').textContent=f?'The book’s image, made visible: descent slows toward a prescribed hover height while rotation continues.':'Gravity alone acts on an ideal point mass, released from rest. The drawing marks its position; it does not model animal biomechanics.';$('#model-note').textContent=f?'Hover is prescribed at 0.1016 m (4 in). It is an animation rule, not an outcome derived from gravity or an EFMW proof.':`With constant g = 9.81 m/s², this starting height reaches the ground in ${M.fall(height(),0).hit.toFixed(3)} s. No air resistance, lift, or bounce.`;}
  $('#mode-fiction').addEventListener('click',()=>setMode('fiction'));$('#mode-fall').addEventListener('click',()=>setMode('fall'));$('#reset').addEventListener('click',reset);
  $('#run').addEventListener('click',()=>{if(playing){stop();return;}const end=mode==='fall'?M.fall(height(),0).hit:8;if(time>=end)time=0;playing=true;lastFrame=null;display();frame=requestAnimationFrame(tick);});
  $('#drop-height').addEventListener('input',()=>setMode(mode));$('#spin-speed').addEventListener('input',()=>{stop();display();});$('#scrub').addEventListener('input',()=>{const requestedTime=Number($('#scrub').value);stop();time=requestedTime;if(mode==='fall')time=Math.min(time,M.fall(height(),0).hit);display();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{stageActive=entries[0].isIntersecting;if(!stageActive&&playing)stop();},{threshold:.05}).observe($('#experiment'));
  display();
  // Reproducible synthetic signal and an explicit, small DFT.
  let signalData=[], signalTimer;
  const svgNS='http://www.w3.org/2000/svg';
  function svgElement(tag,attrs,text){const n=document.createElementNS(svgNS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!=null)n.textContent=text;return n;}
  function signalConfig(){const seed=Math.min(4294967295,Math.max(0,Math.floor(Number($('#seed').value)||0)));return {seed,noise:Number($('#noise').value),cycles:$('#cycles').checked};}
  function updateSignal(){
    const config=signalConfig();$('#seed').value=config.seed;signalData=M.signal(config);const spec=M.spectrum(signalData),top=M.peaks(spec),grid=$('#signal-grid');grid.replaceChildren();
    const bound=Math.max(1,...signalData.map(p=>Math.abs(p.y)))*1.12,x=t=>55+t*6.75,y=v=>131-v*105/bound;
    for(const t of [0,25,50,75,100]){grid.append(svgElement('line',{x1:x(t),x2:x(t),y1:22,y2:236,stroke:'#d4cbb6','stroke-width':.8}),svgElement('text',{x:x(t),y:252,'text-anchor':'middle',class:'chart-label'},t));}
    for(const a of [-1,0,1]){const v=a*bound/1.12;grid.append(svgElement('line',{x1:55,x2:730,y1:y(v),y2:y(v),stroke:'#d4cbb6','stroke-width':.8}),svgElement('text',{x:46,y:y(v)+3,'text-anchor':'end',class:'chart-label'},v.toFixed(1)));}
    $('#signal-path').setAttribute('d',signalData.map((p,i)=>`${i?'L':'M'}${x(p.t).toFixed(2)},${y(p.y).toFixed(2)}`).join(' '));
    $('#noise-output').textContent=config.noise.toFixed(2);$('#signal-kind').textContent=config.cycles?'CYCLES + NOISE':'NOISE ONLY';$('#detected-periods').replaceChildren();
    if(top[0].amplitude<1e-10){$('#detected-periods').append(el('li','No signal'));}else for(const p of top){const li=el('li',`${p.period.toFixed(2)} days`);li.append(el('span',`amplitude ${p.amplitude.toFixed(2)}`));$('#detected-periods').append(li);}
    $('#signal-caption').textContent=config.cycles?'The apparent pattern is generated by the recipe. Recovering it does not independently verify a connection to cognition or gravity.':'No cycles were inserted. Finite random samples still produce spectral peaks; these alone are not evidence of a meaningful period.';
  }
  $('#cycles').addEventListener('change',updateSignal);$('#noise').addEventListener('input',()=>{clearTimeout(signalTimer);signalTimer=setTimeout(updateSignal,70);});$('#seed').addEventListener('change',updateSignal);
  function download(name,type,content){const a=el('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('#download-csv').addEventListener('click',()=>{clearTimeout(signalTimer);updateSignal();const c=signalConfig();download('toast-cat-synthetic-signal.csv','text/csv','time_days,synthetic_amplitude,seed,noise_std,planted_cycles\n'+signalData.map(p=>`${p.t},${p.y},${c.seed},${c.noise},${c.cycles}`).join('\n'));});updateSignal();
  // Source reader. All content uses text nodes; manuscript scripts are inert.
  const reader=$('#reader'), key='toast-cat-gravity-v1';let page=29, state={saved:[],notes:{},night:false},storageOK=true;
  try{const x=JSON.parse(localStorage.getItem(key)||'null');if(x&&typeof x==='object'){state.saved=Array.isArray(x.saved)?[...new Set(x.saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=88))]:[];state.night=x.night===true;if(x.notes&&typeof x.notes==='object')for(const[n,t]of Object.entries(x.notes))if(Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=88&&typeof t==='string')state.notes[n]=t;}}catch{storageOK=false;}
  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase(),corpus=book.pages.map(p=>normalize(p.blocks.map(b=>b.text).join(' ')));
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('#note-feedback').textContent=storageOK?'Saved only in this browser. Export to keep a copy.':'Browser storage is unavailable. Export before leaving to keep your notes.';}
  function toc(){const box=$('#reader-toc');box.replaceChildren();box.append(el('p','CHAPTERS','mini-label'));for(const c of chapters){const b=el('button',`${String(c.n).padStart(2,'0')} / ${c.title}`);b.addEventListener('click',()=>openPage(c.page));box.append(b);}if(state.saved.length){box.append(el('p','SAVED PAGES','mini-label'));for(const p of state.saved){const b=el('button',`✧ Page ${p} · ${book.pages[p-1].title}`,'toc-saved');b.addEventListener('click',()=>openPage(p));box.append(b);}}}
  function annotation(n){
    const box=$('#reading-note');box.replaceChildren();let message='';
    if(n>=4&&n<=7)message='The original dialogue asserts a P versus NP solution. This edition does not contain or certify a verified solution. The Clay Mathematics Institute currently lists P versus NP as unsolved.';
    else if((n>=8&&n<=16)||(n>=77&&n<=80))message='These passages discuss synthetic signals, not measured gravitational waves or neuroplasticity. The epilogue explicitly inserts 3.14-, 6.28-, and 1.57-day periods into its generated signal. Recovering those periods cannot independently validate a link between cognition and gravity.';
    else if(n>=18&&n<=25)message='This passage presents a proposed EFMW argument. Zero total angular momentum does not imply hovering, and competing orientation preferences do not supply an external upward force. The site preserves the proposal without treating it as an established physical proof.';
    else if(n===29||n===30||(n>=52&&n<=55)||(n>=66&&n<=69))message='Read the hovering cat here as the manuscript’s thought experiment. The website’s hover mode prescribes the motion; it does not demonstrate antigravity. The free-fall comparison shows the separate gravity-only assumption.';
    else if(n===76||n===82||n===83)message='The predictive intelligence described here is a speculative narrative device. This site does not measure your cognition or forecast personal breakthroughs.';
    box.hidden=!message;if(message){box.append(el('strong','WEB EDITION / READING NOTE'),el('span',message));if(n>=4&&n<=7){const a=el('a',' Clay’s problem page ↗');a.href='https://www.claymath.org/millennium/p-vs-np/';a.target='_blank';a.rel='noopener';box.append(a);}}
  }
  function renderPage(){const p=book.pages[page-1],box=$('#page-text');box.replaceChildren();let first=true;
    if(!p.blocks.some(b=>b.kind==='heading')){const title=el('h1',page===2?'Dedications':`Page ${page}`);title.id='reader-title';box.append(title);first=false;}
    for(const b of p.blocks){const e=el(b.kind==='heading'?(first?'h1':'h2'):(b.kind==='code'?'pre':'p'),b.text);if(b.kind==='heading'&&first){e.id='reader-title';first=false;}box.append(e);}
    if(p.image){const figure=el('figure'),img=el('img');img.src=p.image;img.alt=`Original synthetic chart from manuscript page ${page}`;figure.append(img,el('figcaption',`Source chart · PDF page ${page} · generated data`));box.append(figure);}
    $('#page-number').value=page;$('#page-counter').textContent=`SOURCE PDF / PAGE ${String(page).padStart(2,'0')} OF 88`;$('#prev').disabled=page===1;$('#next').disabled=page===88;$('#margin').value=state.notes[page]||'';$('#bookmark').textContent=state.saved.includes(page)?'✓ Page saved':'Save this page';$('#bookmark').setAttribute('aria-pressed',String(state.saved.includes(page)));$('#note-feedback').textContent=storageOK?'Saved only in this browser. Export to keep a copy.':'Session only. Export to preserve your notes.';annotation(page);$('.reader-scroll').scrollTop=0;$('.reader-layout').scrollTop=0;
  }
  function openPage(n,push=true){n=Number(n);if(!Number.isInteger(n)||n<1||n>88)return;page=n;stop();$('#reader-toc').classList.remove('mobile-open');$('#reader-index-toggle').setAttribute('aria-expanded','false');if(!reader.open)reader.showModal();document.body.style.overflow='hidden';renderPage();if(push&&location.hash!==`#page-${n}`)history.pushState(null,'',`#page-${n}`);}
  function closeReader(){reader.close();document.body.style.overflow='';if(/^#page-\d+$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);}
  function fromURL(){const m=location.hash.match(/^#page-(\d+)$/);if(m){const n=Number(m[1]);if(n>=1&&n<=88)openPage(n,false);else{if(reader.open)closeReader();toast('The manuscript contains pages 1–88.');}}else if(reader.open)closeReader();}
  document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>openPage(b.dataset.page)));
  $('#close-reader').addEventListener('click',closeReader);reader.addEventListener('cancel',e=>{e.preventDefault();closeReader();});$('#prev').addEventListener('click',()=>openPage(page-1));$('#next').addEventListener('click',()=>openPage(page+1));$('#loop').addEventListener('click',()=>openPage(17));$('#jump').addEventListener('submit',e=>{e.preventDefault();openPage($('#page-number').value);});
  $('#bookmark').addEventListener('click',()=>{state.saved=state.saved.includes(page)?state.saved.filter(n=>n!==page):[...state.saved,page].sort((a,b)=>a-b);persist();$('#bookmark').textContent=state.saved.includes(page)?'✓ Page saved':'Save this page';$('#bookmark').setAttribute('aria-pressed',String(state.saved.includes(page)));toc();});
  $('#margin').addEventListener('input',()=>{const t=$('#margin').value;if(t.trim())state.notes[page]=t;else delete state.notes[page];persist();});
  function setNight(){reader.classList.toggle('night',state.night);$('#night').textContent=state.night?'Day reading':'Night reading';$('#night').setAttribute('aria-pressed',String(state.night));}
  $('#night').addEventListener('click',()=>{state.night=!state.night;setNight();persist();});
  $('#export-notes').addEventListener('click',()=>download('toast-cat-gravity-marginalia.json','application/json',JSON.stringify({book:book.title,sourceSHA256:book.sourceSHA256,exportedAt:new Date().toISOString(),...state},null,2)));
  function search(){const q=normalize($('#search').value.trim()),box=$('#search-results');box.replaceChildren();$('#reader-toc').hidden=!!q;if(!q){$('#search-count').textContent='Search the complete extracted text.';return;}const matches=[];corpus.forEach((t,i)=>{if(t.includes(q))matches.push(i);});$('#search-count').textContent=`${matches.length} matching ${matches.length===1?'page':'pages'}.`;for(const i of matches){const p=book.pages[i],b=el('button'),plain=p.blocks.map(b=>b.text).join(' ').replace(/\s+/g,' '),start=corpus[i].indexOf(q);b.append(el('strong',`${p.number} · ${p.title}`),el('span',`${start>35?'…':''}${plain.slice(Math.max(0,start-35),start+105)}…`));b.addEventListener('click',()=>openPage(p.number));box.append(b);}}
  let searchTimer;$('#search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,90);});
  $('#random-interlude').addEventListener('click',()=>openPage([39,47,56,60][Math.floor(Math.random()*4)]));
  document.addEventListener('keydown',e=>{if(!reader.open||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight'&&page<88){e.preventDefault();openPage(page+1);}if(e.key==='ArrowLeft'&&page>1){e.preventDefault();openPage(page-1);}});
  $('#reader-index-toggle').addEventListener('click',()=>{const open=$('#reader-toc').classList.toggle('mobile-open');$('#reader-index-toggle').setAttribute('aria-expanded',String(open));});
  window.addEventListener('hashchange',fromURL);toc();setNight();fromURL();
})();
