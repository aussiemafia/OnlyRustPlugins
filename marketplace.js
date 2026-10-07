(() => {
'use strict';
const catalog=[
{id:'roadlights',name:'RoadLights',category:'World enhancement',price:'24.99',image:'roadlights.jpg',description:'Automatic roadside lighting that follows Rust’s day and night cycle.'},
{id:'electric-bikes',name:'Electric Bikes',category:'Vehicles',price:'9.99',image:'electric-bikes.png',description:'Electric bike enhancements for your Rust server.'},
{id:'enchanted-mushrooms',name:'Enchanted Mushrooms',category:'Gameplay',price:'9.99',image:'enchanted-mushrooms.png',description:'A glowing mushroom gameplay enhancement for Rust.'}
];
const sections=['plugins','forums','maps','assets','tools','collections','services','deals','purchases','support','wishlist'];
const KEY='onlyrust-library-v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=id=>catalog.some(p=>p.id===id);
let storageProblem=false;
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {wishlist:[...new Set((Array.isArray(x.wishlist)?x.wishlist:[]).filter(valid))],collections:(Array.isArray(x.collections)?x.collections:[]).filter(c=>c&&/^[\w-]{1,80}$/.test(c.id)&&typeof c.name==='string').slice(0,100).map(c=>({id:c.id,name:c.name.slice(0,60),items:[...new Set((Array.isArray(c.items)?c.items:[]).filter(valid))]})),drafts:x.drafts&&typeof x.drafts==='object'&&!Array.isArray(x.drafts)?x.drafts:{}}}catch(e){storageProblem=true;return {wishlist:[],collections:[],drafts:{}}}}
let state=read();
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;refresh();return true}catch(e){toast('Could not save. Browser storage may be full or unavailable.');return false}}
function change(fn){const next=JSON.parse(JSON.stringify(state));fn(next);return save(next)}
const toastEl=document.createElement('div');toastEl.className='hub-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl);let toastTimer;
function toast(text){toastEl.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.textContent='',4500)}
const dialog=document.createElement('dialog');dialog.className='library-dialog';dialog.setAttribute('aria-labelledby','libraryDialogTitle');document.body.appendChild(dialog);
function openDialog(title,body){dialog.innerHTML='<button class="close" data-action="close-dialog" aria-label="Close">×</button><h2 id="libraryDialogTitle">'+esc(title)+'</h2>'+body;dialog.showModal()}
function closeDialog(){dialog.close()}
function storageNote(){return '<p class="local-note">Your wishlist, collections, and drafts are saved on this device. They are not shared with other visitors or synced to your account.</p>'}
function actions(p){return `<div class="save-actions"><button data-wishlist="${p.id}" aria-pressed="${state.wishlist.includes(p.id)}">${state.wishlist.includes(p.id)?'♥ In wishlist':'♡ Wishlist'}</button><button data-action="choose-collection" data-id="${p.id}">＋ Collection</button></div>`}
function card(p){return `<article class="hub-card"><a href="${p.id}.html"><img src="assets/${p.image}" alt="${esc(p.name)} plugin artwork" loading="lazy" width="600" height="375"></a><div class="hub-card-copy"><span class="eyebrow">${esc(p.category)}</span><h2><a href="${p.id}.html">${esc(p.name)}</a></h2><p>${esc(p.description)}</p><div class="price-line"><span><strong>$${p.price}</strong> <small>USD</small></span><a class="plain-button" href="${p.id}.html">View details</a></div>${actions(p)}</div></article>`}
function empty(title,text,link='marketplace.html#plugins',label='Browse plugins'){return `<div class="empty-panel"><h2>${esc(title)}</h2><p>${esc(text)}</p>${link?`<a class="button primary" href="${link}">${esc(label)}</a>`:''}</div>`}
function heading(eyebrow,title,description,action=''){return `<div class="catalog-heading"><div><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</div>`}
function savedDraft(kind,product){const x=state.drafts[kind+':'+(product||'general')];return x&&typeof x==='object'?x:{}}
function draftForm(kind,product='general'){
 const d=savedDraft(kind,product);const review=kind==='review';const noun=review?'review':kind==='discussion'?'discussion':kind==='forum'?'forum topic':'support request';
 return `<form class="draft-form" data-draft-kind="${kind}" data-draft-product="${product}"><h3>Prepare a ${noun}</h3><p class="privacy-copy">${review?'Public reviews are not open yet.':kind==='support'?'Support submissions are not open yet.':'Public posting is not open yet.'} You can save a private draft on this device or download a copy. Saving does not send or publish it.</p>
 ${kind==='forum'?`<label>Category<select name="category"><option value="general" ${d.category==='general'?'selected':''}>General</option><option value="plugins" ${d.category==='plugins'?'selected':''}>Plugins</option><option value="help" ${d.category==='help'?'selected':''}>Server help</option></select></label>`:''}
 ${review?`<label>Your rating<select name="rating" required><option value="">Choose a rating</option>${[5,4,3,2,1].map(v=>`<option value="${v}" ${String(d.rating)===String(v)?'selected':''}>${v} ${v===1?'star':'stars'}</option>`).join('')}</select></label>`:''}
 <label>${review?'Review title':'Subject'}<input name="title" required maxlength="120" value="${esc(d.title)}" placeholder="${review?'Summarise your experience':'What would you like to discuss?'}"></label>
 <label>${kind==='support'?'Issue, error message, and steps to reproduce':'Your message'}<textarea name="body" required maxlength="5000" rows="5">${esc(d.body)}</textarea></label>
 <div class="form-actions"><button class="button primary" type="submit">Save private draft</button><button class="plain-button" type="button" data-action="download-draft">Download draft</button><button class="plain-button" type="button" data-action="clear-draft">Clear draft</button></div><p class="form-status" role="status">${d.saved?'Saved on this device. Not sent or published.':''}</p></form>`;
}
function draftsList(kind,category='all'){
 return Object.entries(state.drafts).filter(([key,d])=>key.startsWith(kind+':')&&d&&typeof d==='object'&&d.saved&&(category==='all'||d.category===category)).map(([key,d])=>`<article class="draft-entry"><small>PRIVATE DRAFT · NOT PUBLISHED</small><h3>${esc(d.title)}</h3><p>${esc(d.body)}</p></article>`).join('');
}
function renderForms(){document.querySelectorAll('[data-draft-host]').forEach(host=>{host.innerHTML=draftForm(host.dataset.draftHost,host.dataset.product||'general')})}
function refresh(){document.querySelectorAll('[data-wishlist]').forEach(b=>{const on=state.wishlist.includes(b.dataset.wishlist);b.setAttribute('aria-pressed',String(on));b.textContent=on?'♥ In wishlist':'♡ Wishlist'});document.querySelectorAll('[data-wishlist-count]').forEach(e=>e.textContent=String(state.wishlist.length))}
function collectionDialog(product){
 if(!valid(product))return;
 const p=catalog.find(x=>x.id===product);
 openDialog('Add '+p.name+' to a collection',`<form id="chooseCollection" data-id="${product}"><p>Choose one or more collections, or create a new one. Saved on this device.</p>${state.collections.map(c=>`<label class="check-row"><input type="checkbox" name="collection" value="${c.id}" ${c.items.includes(product)?'checked':''}>${esc(c.name)}</label>`).join('')||'<p>You have no collections yet.</p>'}<label>New collection name (optional)<input name="newName" maxlength="60" placeholder="My server setup"></label><div class="dialog-actions"><button class="plain-button" type="button" data-action="close-dialog">Cancel</button><button class="button primary" type="submit">Save to collections</button></div></form>`);
}
function manageCollection(mode,id){const c=state.collections.find(x=>x.id===id);if(mode!=='create'&&!c)return;
 if(mode==='delete'){openDialog('Delete this collection?',`<p>“${esc(c.name)}” will be removed from this device. Plugins and your wishlist will remain available.</p><div class="dialog-actions"><button class="plain-button" data-action="close-dialog">Cancel</button><button class="button primary" data-action="confirm-delete" data-id="${id}">Delete collection</button></div>`);return;}
 openDialog(mode==='create'?'Create a collection':'Rename collection',`<form id="nameCollection" data-id="${c?c.id:''}"><label>Collection name<input name="name" required maxlength="60" value="${c?esc(c.name):''}" placeholder="My server setup"></label><div class="dialog-actions"><button class="plain-button" type="button" data-action="close-dialog">Cancel</button><button class="button primary" type="submit">Save collection</button></div></form>`);
}
function activeNav(section){document.querySelectorAll('.marketplace-nav a').forEach(a=>{const active=a.dataset.section===section;if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
let forumCategory='all';
function renderHub(){
 const root=$('#marketplaceContent');if(!root)return;
 const parts=location.hash.slice(1).split('/');const section=sections.includes(parts[0])?parts[0]:'plugins';const id=parts[1];activeNav(section);document.title=section[0].toUpperCase()+section.slice(1)+' — OnlyRust Plugins';
 if(section==='plugins'){
 root.innerHTML=heading('THE MARKETPLACE','Plugins','Explore the collection. Compare the features, read setup details, and save your next server upgrade.')+'<div class="hub-toolbar"><label><input class="hub-search" id="hubSearch" type="search" placeholder="Search plugins…" aria-label="Search plugins"></label><span class="privacy-copy">3 plugins · Prices in USD · Purchasing coming soon</span></div><div class="hub-grid" id="catalogResults">'+catalog.map(card).join('')+'</div><p id="catalogEmpty" hidden>No plugins match your search.</p>';
 }else if(['maps','assets','tools','services','deals'].includes(section)){
 const titles={maps:'Maps',assets:'Assets',tools:'Tools',services:'Services',deals:'Deals'};
 const copy={maps:['Discover your next world.','No maps listed yet','Map listings will appear here when creators add them. Your plugin collection is available now.'],assets:['Find finishing touches for your server.','No assets listed yet','There are no standalone asset listings in the current catalogue.'],tools:['Find tools for running your server.','No tools listed yet','There are no standalone tools in the current catalogue.'],services:['Explore help from server creators.','No services listed yet','There are no service offers in the current catalogue.'],deals:['Check the latest offers.','No active deals','No discounts are currently listed. Browse the plugins at their standard prices.']}[section];
 root.innerHTML=heading('THE MARKETPLACE',titles[section],copy[0])+empty(copy[1],copy[2]);
 }else if(section==='wishlist'){
 const items=catalog.filter(p=>state.wishlist.includes(p.id));root.innerHTML=heading('YOUR LIBRARY','Your wishlist','Keep the plugins you want to explore next in one place.')+storageNote()+(items.length?'<div class="hub-grid">'+items.map(card).join('')+'</div>':empty('Your wishlist is empty','Use the Wishlist button on any plugin to save it here.'));
 }else if(section==='collections'){
 const c=state.collections.find(x=>x.id===id);
 if(id&&c){root.innerHTML='<a class="breadcrumb" href="#collections">All collections</a>'+heading('YOUR COLLECTION',c.name,c.items.length+' plugin'+(c.items.length===1?'':'s'),`<button class="plain-button" data-action="rename-collection" data-id="${c.id}">Rename</button>`)+storageNote()+(c.items.length?'<div class="hub-grid">'+catalog.filter(p=>c.items.includes(p.id)).map(p=>card(p).replace('</article>',`<div class="hub-card-copy"><button class="plain-button" data-action="remove-from-collection" data-collection="${c.id}" data-id="${p.id}">Remove from this collection</button></div></article>`)).join('')+'</div>':empty('This collection is empty','Use the Collection button on a plugin to add it here.'));}
 else{root.innerHTML=heading('YOUR LIBRARY','Collections','Organise plugins into your own server setups.', '<button class="button primary" data-action="create-collection">New collection</button>')+storageNote()+(state.collections.length?'<div class="collection-grid">'+state.collections.map(c=>`<article class="collection-tile"><span class="eyebrow">PERSONAL COLLECTION</span><h2><a href="#collections/${c.id}">${esc(c.name)}</a></h2><p>${c.items.length} plugin${c.items.length===1?'':'s'}</p><div class="tile-actions"><a class="plain-button" href="#collections/${c.id}">Open</a><button class="plain-button" data-action="rename-collection" data-id="${c.id}">Rename</button><button class="plain-button" data-action="delete-collection" data-id="${c.id}">Delete</button></div></article>`).join('')+'</div>':empty('Build your first collection','Group plugins for a PvE world, a vehicle server, or your next wipe. Create a collection to get started.','', ''));}
 }else if(section==='purchases'){
 root.innerHTML=heading('YOUR ACCOUNT','Purchases','Your purchased plugins and downloads belong here.')+empty('Purchasing is coming soon','Checkout and purchase history are not connected yet. No orders or download entitlements are being shown. Your wishlist and collections are available now.','account.html','Open your account');
 }else if(section==='forums'){
 root.innerHTML=heading('THE COMMUNITY','Forums','A home for creator conversations and server-owner questions.')+'<div class="forum-categories" aria-label="Forum categories">'+[['all','All topics'],['general','General'],['plugins','Plugins'],['help','Server help']].map(([id,name])=>`<button data-action="forum-category" data-category="${id}" aria-pressed="${forumCategory===id}">${name}</button>`).join('')+'</div>'+empty('Public forums are not open yet','Public topics and replies are not connected. You can prepare a private topic draft below. It will not be visible to other visitors.','', '')+draftForm('forum')+'<section class="draft-list" id="forumDrafts">'+draftsList('forum',forumCategory)+'</section>';
 }else if(section==='support'){
 root.innerHTML=heading('HELP & SUPPORT','How can we help?','Start with the plugin’s setup information, or prepare a support request.')+'<div class="help-grid">'+catalog.map(p=>`<a class="help-card" href="${p.id}.html#support"><h2>${p.name}</h2><p>Open setup help and the support tab for this plugin.</p></a>`).join('')+'</div><div class="faq-list"><details><summary>Where are my downloads?</summary><p>Purchasing and protected downloads are not connected yet. The Purchases section explains current availability.</p><a class="plain-button" href="#purchases">Open Purchases</a></details><details><summary>How do I save a plugin?</summary><p>Use Wishlist to keep a favourite, or Collection to group plugins into a server setup. These are stored on this device.</p></details><details><summary>How do I sign in?</summary><p>Open Your account to sign in or create an account with your email address.</p><a class="plain-button" href="account.html">Open your account</a></details></div>'+draftForm('support');
 }
 refresh();
}
function selectProductTab(name,focus=false){const tabs=[...document.querySelectorAll('[data-product-tab]')];if(!tabs.length)return;const chosen=tabs.find(t=>t.dataset.productTab===name)||tabs[0];tabs.forEach(t=>{const on=t===chosen;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!on});if(focus)chosen.focus();}
document.addEventListener('click',e=>{
 const wish=e.target.closest('[data-wishlist]');if(wish){const id=wish.dataset.wishlist;if(!valid(id))return;const adding=!state.wishlist.includes(id);if(change(x=>x.wishlist=adding?[...x.wishlist,id]:x.wishlist.filter(v=>v!==id))){toast(adding?'Saved to your wishlist on this device.':'Removed from your wishlist.');if($('#marketplaceContent'))renderHub()}return;}
 const tab=e.target.closest('[data-product-tab]');if(tab){selectProductTab(tab.dataset.productTab);history.replaceState(null,'','#'+tab.dataset.productTab);return;}
 const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,id=b.dataset.id;
 if(action==='close-dialog')closeDialog();
 if(action==='choose-collection')collectionDialog(id);
 if(action==='create-collection')manageCollection('create');
 if(action==='rename-collection')manageCollection('rename',id);
 if(action==='delete-collection')manageCollection('delete',id);
 if(action==='confirm-delete'){if(change(x=>x.collections=x.collections.filter(c=>c.id!==id))){closeDialog();renderHub();toast('Collection deleted.')}}
 if(action==='remove-from-collection'){if(change(x=>{const c=x.collections.find(c=>c.id===b.dataset.collection);if(c)c.items=c.items.filter(p=>p!==id)}))renderHub();}
 if(action==='forum-category'){forumCategory=b.dataset.category;renderHub();}
 if(action==='download-draft'){
 const f=b.closest('form');if(!f.reportValidity())return;const d=Object.fromEntries(new FormData(f));const product=f.dataset.draftProduct;const content=['PRIVATE DRAFT — NOT SENT OR PUBLISHED','OnlyRust Plugins',product==='general'?'General':product,'',d.title,d.rating?'Rating: '+d.rating+'/5':'',d.category?'Category: '+d.category:'','',d.body].filter(x=>x!==undefined).join('\n');const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='onlyrust-'+f.dataset.draftKind+'-draft.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);f.querySelector('.form-status').textContent='Downloaded a private draft. It has not been sent or published.';
 }
 if(action==='clear-draft'){const f=b.closest('form');const key=f.dataset.draftKind+':'+f.dataset.draftProduct;if(change(x=>delete x.drafts[key])){f.reset();f.querySelectorAll('input,textarea').forEach(e=>e.value='');f.querySelector('.form-status').textContent='Draft cleared from this device.';if($('#forumDrafts'))$('#forumDrafts').innerHTML=draftsList('forum',forumCategory);}}
});
document.addEventListener('submit',e=>{
 const f=e.target;
 if(f.id==='chooseCollection'){e.preventDefault();const id=f.dataset.id;const checked=[...f.querySelectorAll('[name=collection]:checked')].map(x=>x.value);const name=f.elements.newName.value.trim();if(change(x=>{for(const c of x.collections)c.items=checked.includes(c.id)?[...new Set([...c.items,id])]:c.items.filter(p=>p!==id);if(name)x.collections.push({id:crypto.randomUUID(),name,items:[id]})})){closeDialog();renderHub();toast('Collection choices saved on this device.')}}
 if(f.id==='nameCollection'){e.preventDefault();const name=f.elements.name.value.trim();if(!name){f.elements.name.setCustomValidity('Enter a collection name.');f.elements.name.reportValidity();f.elements.name.addEventListener('input',()=>f.elements.name.setCustomValidity(''),{once:true});return}if(change(x=>{const c=x.collections.find(c=>c.id===f.dataset.id);if(c)c.name=name;else x.collections.push({id:crypto.randomUUID(),name,items:[]})})){closeDialog();renderHub();toast('Collection saved on this device.')}}
 if(f.matches('.draft-form')){e.preventDefault();const key=f.dataset.draftKind+':'+f.dataset.draftProduct;const d=Object.fromEntries(new FormData(f));if(!d.title.trim()||!d.body.trim()){f.querySelector('.form-status').textContent='Enter a subject and a message before saving.';return}d.title=d.title.trim();d.body=d.body.trim();d.saved=new Date().toISOString();if(change(x=>x.drafts[key]=d)){f.querySelector('.form-status').textContent='Saved on this device. Not sent or published.';if($('#forumDrafts'))$('#forumDrafts').innerHTML=draftsList('forum',forumCategory);}}
});
document.addEventListener('input',e=>{if(e.target.id==='hubSearch'){const q=e.target.value.trim().toLowerCase();const items=catalog.filter(p=>(p.name+' '+p.category+' '+p.description).toLowerCase().includes(q));$('#catalogResults').innerHTML=items.map(card).join('');$('#catalogEmpty').hidden=items.length>0;refresh()}});
document.addEventListener('keydown',e=>{const tab=e.target.closest('[data-product-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-product-tab]')];let i=tabs.indexOf(tab);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;selectProductTab(tabs[i].dataset.productTab,true);history.replaceState(null,'','#'+tabs[i].dataset.productTab)});
window.addEventListener('hashchange',()=>{renderHub();selectProductTab(location.hash.slice(1));});
window.addEventListener('storage',e=>{if(e.key===KEY){state=read();refresh();renderHub()}});
document.addEventListener('orp:refresh',refresh);
renderForms();renderHub();selectProductTab(location.hash.slice(1));refresh();
if(storageProblem)toast('Saved items could not be read. Browser storage may be unavailable.');
})();
