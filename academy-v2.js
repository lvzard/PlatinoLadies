(()=>{'use strict';
const data=window.ACADEMY_DATA, $=id=>document.getElementById(id);
const categories=$('academy-categories'),overview=$('academy-overview'),figures=$('academy-figures'),detail=$('academy-detail'),crumb=$('academy-crumb');
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
function showOverview(){overview.hidden=false;figures.hidden=true;detail.hidden=true;crumb.replaceChildren();}
function showGroupedChapter(category, graphic, noteText){
 overview.hidden=true;figures.hidden=false;detail.hidden=true;
 const list=$('academy-figure-list');list.replaceChildren();list.classList.add('arena-vertical-list');
 $('academy-search').hidden=true;
 const title=$('academy-category-title');title.textContent=category.name;
 const entries=data.figures.filter(f=>f.category===category.name);
 const groups=[...new Set(entries.map(f=>f.group))];
 function showGroups(){
  crumb.replaceChildren(button('⌂ Alle Themen',showOverview),' › '+category.name);
  title.textContent=category.name;list.replaceChildren();
  if(!entries.length){const empty=document.createElement('p');empty.className='academy-subhint';empty.textContent='Noch keine Inhalte eingetragen. Dieser Bereich wurde zurückgesetzt und ist bereit für einen Neustart.';list.append(empty);return;}
  const hint=document.createElement('p');hint.className='academy-subhint';hint.textContent='Wähle ein Unterthema:';list.append(hint);
  const nav=document.createElement('div');nav.className='academy-subtopics';
  for(const group of groups){const b=button(group,()=>showGroup(group));b.className='academy-subtopic';const count=document.createElement('small');count.textContent=entries.filter(e=>e.group===group).length+' Einträge';b.append(count);nav.append(b);}
  list.append(nav);
 }
 function showGroup(group){
  crumb.replaceChildren(button('⌂ Alle Themen',showOverview),' › ',button(category.name,showGroups),' › '+group);
  title.textContent=group;list.replaceChildren();
  const back=button('← Alle Unterthemen',showGroups);back.className='academy-subback';list.append(back);
  for(const item of entries.filter(f=>f.group===group)){
   const article=document.createElement('article');article.className='arena-entry';
   const h=document.createElement('h4');h.textContent=item.name;
   const desc=document.createElement('p');desc.textContent=item.description;
   const isMove=category.name==='Fundamentals' && group==='Fundamental Moves & Cues';
   article.append(h,desc);

   list.append(article);
  }
  if(noteText){const note=document.createElement('p');note.className='fundamentals-note';note.textContent=noteText;list.append(note);}
 }
 showGroups();
}
function showArena(category){showGroupedChapter(category,null,'');}

function showFundamentals(category){showGroupedChapter(category,null,'');}

function showCategory(category){
 if(category.name==='Fundamentals'){showFundamentals(category);return;}
 if(category.name==='The Arena'){showArena(category);return;}
 $('academy-search').hidden=false;
 $('academy-figure-list').classList.remove('arena-vertical-list');
 $('academy-figure-list').classList.add('academy-group-columns');
 overview.hidden=true;figures.hidden=false;detail.hidden=true;
 crumb.replaceChildren(button('⌂ Alle Themen',showOverview));
 crumb.append(' › '+category.name);
 $('academy-category-title').textContent=category.name;
 const input=$('academy-search');input.value='';
 const list=$('academy-figure-list');
 const items=data.figures.filter(f=>f.category===category.name);
 function render(){
  list.replaceChildren();
  const q=input.value.trim().toLocaleLowerCase();
  const groups=[...new Set(items.map(f=>f.group))];
  let matches=0;
  for(const group of groups){
   const matching=items.filter(f=>f.group===group && [f.name,f.description,f.group].some(v=>v.toLocaleLowerCase().includes(q)));
   if(!matching.length)continue;
   const section=document.createElement('section');section.className='academy-group-column';
   const heading=document.createElement('h3');heading.className='academy-group-title';heading.textContent=group;
   section.append(heading);
   const buttons=document.createElement('div');buttons.className='academy-group-moves';
   for(const f of matching){
    const b=button(f.name,()=>showFigure(category,f));
    b.className='academy-figure';
    b.setAttribute('aria-label','Beschreibung öffnen: '+f.name);
    buttons.append(b);matches++;
   }
   section.append(buttons);list.append(section);
  }
  if(!matches){const msg=document.createElement('p');msg.textContent=items.length?'Keine passenden Einträge.':'Noch keine Figuren eingetragen. Wir beginnen hier später bei null.';list.append(msg);}
 }
 input.oninput=render;render();
}
function showFigure(category,f){
 overview.hidden=true;figures.hidden=true;detail.hidden=false;
 crumb.replaceChildren(button('⌂ Alle Themen',showOverview),' › ',button(category.name,()=>showCategory(category)),' › '+f.name);
 $('academy-group').textContent=f.group;
 $('academy-figure-title').textContent=f.name;
 $('academy-description').textContent=f.description;
}

for(const category of data.categories.filter(c=>!['The Arena','Fundamentals','Alignment','Meter System','Flats & Exits'].includes(c.name))){const b=button('',()=>showCategory(category));b.className='academy-topic';const name=document.createElement('strong');name.textContent=category.name;const count=document.createElement('small');const n=data.figures.filter(f=>f.category===category.name).length;count.textContent=n+' '+(n===1?'Figur':'Figuren');b.append(name,count);categories.append(b);}const rule=button('',()=>{location.href='regelwerk.html'});rule.className='academy-topic academy-rulebook-topic';rule.innerHTML='<strong>✧ Regelwerk</strong><small>5 Kapitel · Interaktives Buch</small>';categories.prepend(rule);showOverview();
})();