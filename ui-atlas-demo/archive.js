/* ARCHIVE: original curation UI; local public-domain images and pinned Met metadata. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'noshitui.archive.exhibition.v1';
  const NOTES = {
    437329: {short:'A world in motion', note:'Let your eye follow the diagonal gestures and the rhythm of the architecture. Notice where the still shapes meet the moving bodies.', tags:'baroque history architecture motion', era:'early'},
    436121: {short:'A conversation in color', note:'Look at the space the flowers take up, and then the space the figure occupies. Which part of the painting did you notice first?', tags:'portrait flowers interior quiet', era:'middle'},
    435882: {short:'An ordinary kind of wonder', note:'A table, some apples, a pot of flowers. Stay with the small changes in color and the way each object seems to hold its own weight.', tags:'still life apples flowers color', era:'late'},
    436524: {short:'The beauty of looking down', note:'Follow the bent stems and the uneven edges of the petals. Even a flower at rest has a surprising amount of movement.', tags:'sunflowers still life flowers nature', era:'late'},
    436535: {short:'A landscape that feels alive', note:'Look for a line that refuses to stand still. The clouds, the field, and the cypresses each seem to move at their own pace.', tags:'landscape cypress sky field nature', era:'late'}
  };
  let works = [], selectedId = null, era = 'all', state = {saved:[], notes:{}, title:'A few things worth keeping'};
  let zoom = 1, pan = {x:0,y:0}, pointer = null, toastTimer, opener = null, openerId = null, loadController, stateReady = false;
  let storageAvailable = true;
  const node = (tag, className, text) => {const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
  const artwork = id => works.find(work=>work.objectID===Number(id));
  function notify(message) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
  function persist() {
    if(!stateReady)return false;
    try {localStorage.setItem(KEY,JSON.stringify(state));storageAvailable=true;updateStorageHelp();return true;}
    catch {storageAvailable=false;updateStorageHelp();notify('Your exhibition is kept for this visit. Download a guide to keep a copy.');return false;}
  }
  function updateStorageHelp(){document.querySelector('.exhibition-help').textContent=storageAvailable?'Saved on this device. Your download is a self-contained exhibition guide you can open and print.':'Kept for this visit only. Download your self-contained exhibition guide to keep a copy.';}
  function restore() {
    try {
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(raw && typeof raw==='object' && !Array.isArray(raw)) {
        state.saved=Array.isArray(raw.saved)?[...new Set(raw.saved.map(Number).filter(id=>artwork(id)))].slice(0,works.length):[];
        state.title=typeof raw.title==='string'?raw.title.slice(0,80):state.title;
        if(raw.notes && typeof raw.notes==='object' && !Array.isArray(raw.notes)) for(const id of state.saved) if(typeof raw.notes[id]==='string')state.notes[id]=raw.notes[id].slice(0,240);
      }
    } catch {storageAvailable=false;notify('A fresh exhibition is ready. You can still save works for this visit and download a guide.');}
    $('exhibition-name').value=state.title;
  }
  function updateSaveButton(button,id,large=false) {
    const saved=state.saved.includes(id),work=artwork(id);
    button.setAttribute('aria-pressed',String(saved));
    button.setAttribute('aria-label',`${saved?'Remove':'Save'} ${work.title} ${saved?'from':'to'} your exhibition`);
    if(large) {button.replaceChildren(document.createTextNode(saved?'Saved to your exhibition':'Save to your exhibition'),node('span','',saved?'✓':'＋'));}
    else button.textContent=saved?'✓':'＋';
  }
  function toggleSave(id) {
    if(!artwork(id))return;
    if(state.saved.includes(id))state.saved=state.saved.filter(value=>value!==id);
    else state.saved.push(id);
    const stored=persist(); renderSaved();
    document.querySelectorAll('[data-save-id]').forEach(button=>updateSaveButton(button,Number(button.dataset.saveId)));
    if(selectedId)updateSaveButton($('save-art'),selectedId,true);
    if(stored)notify(state.saved.includes(id)?'A little piece of the collection, now in yours.':'Removed from your exhibition.');
  }
  function renderGallery() {
    const terms=$('art-search').value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const shown=works.filter(work=>(era==='all'||NOTES[work.objectID].era===era)&&terms.every(term=>`${work.title} ${work.artistDisplayName} ${work.objectDate} ${NOTES[work.objectID].tags}`.toLocaleLowerCase().includes(term)));
    $('gallery').replaceChildren();
    for(const work of shown) {
      const card=node('article','art-card'),open=node('button','art-image-button');open.type='button';open.dataset.openId=work.objectID;open.setAttribute('aria-label',`Look closer at ${work.title}`);
      const image=node('img');image.src=work.local;image.alt=`${work.title}, ${work.artistDisplayName}, ${work.objectDate}`;image.loading='lazy';image.width=500;image.height=360;
      image.addEventListener('error',()=>{image.alt=`Image unavailable: ${work.title}. Open the museum record in the detail view.`;});
      open.append(image,node('span','art-hint','LOOK CLOSER ↗'));open.addEventListener('click',()=>openArtwork(work.objectID));
      const top=node('div','art-card-top'),save=node('button','save-small');save.type='button';save.dataset.saveId=work.objectID;updateSaveButton(save,work.objectID);save.addEventListener('click',()=>toggleSave(work.objectID));
      top.append(node('p','',work.objectDate),save);card.append(open,top,node('h3','',work.title),node('p','art-author',work.artistDisplayName));$('gallery').append(card);
    }
    $('result-count').textContent=`${shown.length} ${shown.length===1?'painting':'paintings'}${shown.length!==works.length?` / ${works.length} in the collection`:''}`;
    $('collection-empty').hidden=shown.length>0;
    document.querySelectorAll('[data-era]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.era===era)));
  }
  function renderSaved(focusId=null) {
    $('saved-count').textContent=state.saved.length;
    $('export-exhibition').disabled=state.saved.length===0||!stateReady;
    updateStorageHelp();
    $('saved-empty').hidden=state.saved.length>0;
    $('saved-gallery').replaceChildren();
    for(const [index,id] of state.saved.entries()) {
      const work=artwork(id);if(!work)continue;
      const row=node('article','saved-item'),image=node('img');image.src=work.local;image.alt=work.title;image.width=100;image.height=84;
      const open=node('button','saved-art-open');open.type='button';open.dataset.openId=id;open.append(node('h3','',work.title),node('p','',`${work.artistDisplayName} · ${work.objectDate}`));open.addEventListener('click',()=>openArtwork(id));
      const note=node('label','personal-note','YOUR NOTE'),input=node('textarea');input.value=state.notes[id]||'';input.maxLength=240;input.rows=2;input.setAttribute('aria-label',`Your note for ${work.title}`);input.placeholder='What made you stop and look?';input.addEventListener('input',()=>{state.notes[id]=input.value;persist();});note.append(input);
      const actions=node('div','saved-actions');
      for(const [direction,label,symbol] of [[-1,'Move earlier','↑'],[1,'Move later','↓']]) {
        const move=node('button','',symbol);move.type='button';move.dataset.moveId=`${id}-${direction}`;move.setAttribute('aria-label',`${label}: ${work.title}`);move.disabled=index+direction<0||index+direction>=state.saved.length;
        move.addEventListener('click',()=>{[state.saved[index],state.saved[index+direction]]=[state.saved[index+direction],state.saved[index]];const stored=persist();renderSaved(`${id}-${direction}`);if(stored)notify('Exhibition order updated.');});actions.append(move);
      }
      const remove=node('button','','×');remove.type='button';remove.setAttribute('aria-label',`Remove ${work.title} from exhibition`);remove.addEventListener('click',()=>{toggleSave(id);$('exhibition-name').focus({preventScroll:true});});actions.append(remove);
      row.append(image,open,note,actions);$('saved-gallery').append(row);
    }
    if(focusId) {
      const button=[...document.querySelectorAll('[data-move-id]')].find(item=>item.dataset.moveId===focusId);
      if(button&&!button.disabled)button.focus({preventScroll:true});else $('exhibition-name').focus({preventScroll:true});
    }
  }
  function resetZoom() {zoom=1;pan={x:0,y:0};pointer=null;applyZoom();}
  function applyZoom() {
    const box=$('zoom-viewport').getBoundingClientRect();
    const image=$('detail-image');
    const scale=image.naturalWidth&&image.naturalHeight?Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight):0;
    const maxX=Math.max(0,(image.naturalWidth*scale*zoom-box.width)/2),maxY=Math.max(0,(image.naturalHeight*scale*zoom-box.height)/2);
    pan.x=Math.max(-maxX,Math.min(maxX,pan.x));pan.y=Math.max(-maxY,Math.min(maxY,pan.y));
    $('detail-image').style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    $('zoom-value').textContent=`${Math.round(zoom*100)}%`;$('zoom-out').disabled=zoom<=1;$('zoom-in').disabled=zoom>=3;
  }
  function openArtwork(id) {
    const work=artwork(id);if(!work)return;
    if(!$('art-dialog').open){opener=document.activeElement;openerId=id;}
    selectedId=id;$('detail-title').textContent=work.title;$('detail-artist').textContent=work.artistDisplayName;$('detail-year').textContent=`${work.objectDate} / ${NOTES[id].short.toUpperCase()}`;
    $('detail-note').textContent=NOTES[id].note;$('detail-image').src=work.local;$('detail-image').alt=`${work.title} by ${work.artistDisplayName}`;$('detail-number').textContent=`${String(works.indexOf(work)+1).padStart(2,'0')} / ${String(works.length).padStart(2,'0')}`;
    $('detail-facts').replaceChildren();for(const [label,value] of [['Medium',work.medium],['Dimensions',work.dimensions]])$('detail-facts').append(node('dt','',label),node('dd','',value));
    $('detail-credit').textContent=`${work.creditLine}. Public-domain image courtesy of The Metropolitan Museum of Art.`;$('museum-link').href=work.objectURL;updateSaveButton($('save-art'),id,true);
    resetZoom();if(!$('art-dialog').open)$('art-dialog').showModal();$('art-dialog').scrollTop=0;$('close-art').focus({preventScroll:true});requestAnimationFrame(applyZoom);
  }
  $('hero-art-button').addEventListener('click',()=>{if(works.length)openArtwork(436535);else{document.getElementById('collection').scrollIntoView();notify('The collection is opening. Please try again in a moment.');}});
  $('close-art').addEventListener('click',()=>$('art-dialog').close());
  $('art-dialog').addEventListener('close',()=>{pointer=null;const fallback=[...document.querySelectorAll('[data-open-id]')].find(button=>Number(button.dataset.openId)===openerId);const target=opener?.isConnected?opener:fallback||$('exhibition-name');target.focus({preventScroll:true});});
  $('detail-image').addEventListener('load',applyZoom);
  $('save-art').addEventListener('click',()=>toggleSave(selectedId));
  function adjacent(direction) {const index=works.findIndex(work=>work.objectID===selectedId);openArtwork(works[(index+direction+works.length)%works.length].objectID);}
  $('previous-art').addEventListener('click',()=>adjacent(-1));$('next-art').addEventListener('click',()=>adjacent(1));
  const changeZoom=delta=>{zoom=Math.max(1,Math.min(3,Math.round((zoom+delta)*100)/100));applyZoom();};
  $('zoom-in').addEventListener('click',()=>changeZoom(.25));$('zoom-out').addEventListener('click',()=>changeZoom(-.25));$('zoom-reset').addEventListener('click',resetZoom);
  const viewport=$('zoom-viewport');
  viewport.addEventListener('pointerdown',event=>{if(event.button!==0||zoom===1)return;pointer={id:event.pointerId,x:event.clientX,y:event.clientY,px:pan.x,py:pan.y};viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');});
  viewport.addEventListener('pointermove',event=>{if(!pointer||pointer.id!==event.pointerId)return;pan={x:pointer.px+event.clientX-pointer.x,y:pointer.py+event.clientY-pointer.y};applyZoom();});
  function stopPointer(event){if(pointer&&event.pointerId===pointer.id){if(viewport.hasPointerCapture(pointer.id))viewport.releasePointerCapture(pointer.id);pointer=null;viewport.classList.remove('dragging');}}
  viewport.addEventListener('pointerup',stopPointer);viewport.addEventListener('pointercancel',stopPointer);viewport.addEventListener('lostpointercapture',()=>{pointer=null;viewport.classList.remove('dragging');});
  viewport.addEventListener('keydown',event=>{if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','0'].includes(event.key))event.preventDefault();if(event.key==='+'||event.key==='=')changeZoom(.25);if(event.key==='-')changeZoom(-.25);if(event.key==='0')resetZoom();if(event.key==='ArrowLeft')pan.x-=25;if(event.key==='ArrowRight')pan.x+=25;if(event.key==='ArrowUp')pan.y-=25;if(event.key==='ArrowDown')pan.y+=25;applyZoom();});
  window.addEventListener('resize',applyZoom);
  document.querySelectorAll('[data-era]').forEach(button=>button.addEventListener('click',()=>{era=button.dataset.era;renderGallery();}));$('art-search').addEventListener('input',renderGallery);
  $('clear-search').addEventListener('click',()=>{era='all';$('art-search').value='';renderGallery();$('art-search').focus();});
  $('exhibition-name').addEventListener('input',()=>{state.title=$('exhibition-name').value.slice(0,80);persist();});
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not embed image'));reader.readAsDataURL(blob);});}
  $('export-exhibition').addEventListener('click',async()=>{
    const button=$('export-exhibition');if(!stateReady||!state.saved.length||button.getAttribute('aria-busy')==='true')return;
    button.disabled=true;button.setAttribute('aria-busy','true');const selected=state.saved.map(id=>({...artwork(id),personalNote:state.notes[id]||''}));const title=state.title.trim()||'A few things worth keeping';notify('Preparing your exhibition guide…');
    try {
      const pages=await Promise.all(selected.map(async(work,index)=>{const response=await fetch(work.local);if(!response.ok)throw new Error('Image unavailable');const image=await dataURL(await response.blob());return `<article><p class="number">${String(index+1).padStart(2,'0')} / ${selected.length}</p><img src="${image}" alt="${escapeHTML(work.title)}"><h2>${escapeHTML(work.title)}</h2><p>${escapeHTML(work.artistDisplayName)} · ${escapeHTML(work.objectDate)}</p><p>${escapeHTML(work.medium)}<br>${escapeHTML(work.dimensions)}</p>${work.personalNote?`<blockquote>${escapeHTML(work.personalNote)}</blockquote>`:''}<small>${escapeHTML(work.creditLine)}<br>Public-domain image, The Metropolitan Museum of Art. <a href="${escapeHTML(work.objectURL)}">Museum record</a></small></article>`;}));
      const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)} — ARCHIVE</title><style>body{max-width:900px;margin:50px auto;padding:0 25px;background:#f2ede3;color:#273124;font:16px/1.7 Georgia,serif}header{border-bottom:1px solid #b7baab;padding-bottom:30px}h1{font-size:52px;font-weight:400;line-height:1.1}h2{font-size:30px;font-weight:400}article{padding:45px 0;border-bottom:1px solid #b7baab;break-inside:avoid}img{display:block;max-width:100%;max-height:650px;margin:20px auto}.number,small{font:12px/1.6 Arial,sans-serif;color:#646e5b}blockquote{margin:25px 0;border-left:2px solid #909e7e;padding:10px 22px;font-size:22px}footer{font:12px Arial,sans-serif;margin:35px 0}a{color:inherit}@media print{body{margin:0;background:white}article{break-before:page}img{max-height:60vh}}</style><header><p>ARCHIVE / A PERSONAL EXHIBITION</p><h1>${escapeHTML(title)}</h1><p>${selected.length} paintings, selected by you.</p></header>${pages.join('')}<footer>An independent exhibition guide. Artwork and object metadata: The Met Open Access (CC0). No museum affiliation.</footer></html>`;
      const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const link=node('a');link.href=url;link.download='archive-my-exhibition.html';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('Your exhibition is ready. Open the downloaded guide to view or print it.');
    } catch {notify('The guide could not download. Your collection is still here; try again.');}
    finally{button.disabled=state.saved.length===0;button.removeAttribute('aria-busy');}
  });
  async function loadCollection(){
    loadController?.abort();loadController=new AbortController();stateReady=false;$('exhibition-name').disabled=true;$('export-exhibition').disabled=true;$('load-error').hidden=true;$('collection-empty').hidden=true;$('result-count').textContent='Opening the collection…';
    try {
      const response=await fetch('assets/archive/collection.json',{signal:loadController.signal});if(!response.ok)throw new Error('Collection unavailable');const data=await response.json();
      if(!Array.isArray(data))throw new Error('Invalid collection');
      works=data.filter(work=>Number.isInteger(work.objectID)&&NOTES[work.objectID]&&work.isPublicDomain===true&&typeof work.title==='string'&&typeof work.artistDisplayName==='string'&&/^assets\/archive\/\d+\.webp$/.test(work.local)&&/^https:\/\/www\.metmuseum\.org\//.test(work.objectURL)).sort((a,b)=>a.objectBeginDate-b.objectBeginDate);
      if(works.length<4)throw new Error('Incomplete collection');restore();stateReady=true;$('exhibition-name').disabled=false;renderGallery();renderSaved();
    }catch(error){if(error.name==='AbortError')return;$('load-error').hidden=false;$('result-count').textContent='The collection is unavailable.';}
  }
  $('retry-collection').addEventListener('click',loadCollection);loadCollection();
})();
