'use strict';
const STORAGE_KEY='talentflow.candidates.v1';
const STAGES=['Applied','Screening','Interview','Offer','Hired','Rejected'];
const SOURCES=['LinkedIn','Referral','Company website','Job board','Other'];
const COLORS=['#7969e9','#4ebd98','#efb04c','#5c9ae8','#c084fc','#db5d68'];
const sampleCandidates=[
{id:'c1',name:'Aarav Mehta',email:'aarav.mehta@example.com',role:'Frontend Developer',stage:'Interview',source:'LinkedIn',date:'2026-10-17',notes:'React and accessibility experience'},
{id:'c2',name:'Priya Sharma',email:'priya.sharma@example.com',role:'Product Designer',stage:'Screening',source:'Referral',date:'2026-10-16',notes:'Strong portfolio'},
{id:'c3',name:'Rohan Patel',email:'rohan.patel@example.com',role:'Backend Engineer',stage:'Applied',source:'Company website',date:'2026-10-15',notes:''},
{id:'c4',name:'Ananya Iyer',email:'ananya.iyer@example.com',role:'Full Stack Developer',stage:'Offer',source:'LinkedIn',date:'2026-10-14',notes:'Offer sent'},
{id:'c5',name:'Kabir Singh',email:'kabir.singh@example.com',role:'QA Engineer',stage:'Applied',source:'Job board',date:'2026-10-12',notes:''},
{id:'c6',name:'Diya Nair',email:'diya.nair@example.com',role:'UI/UX Designer',stage:'Hired',source:'Referral',date:'2026-10-11',notes:'Offer accepted'},
{id:'c7',name:'Ishaan Gupta',email:'ishaan.gupta@example.com',role:'Data Analyst',stage:'Screening',source:'LinkedIn',date:'2026-10-10',notes:''},
{id:'c8',name:'Meera Reddy',email:'meera.reddy@example.com',role:'Frontend Developer',stage:'Interview',source:'Company website',date:'2026-10-09',notes:'Technical interview'},
{id:'c9',name:'Arjun Das',email:'arjun.das@example.com',role:'Backend Engineer',stage:'Rejected',source:'Other',date:'2026-10-08',notes:'Role requirements mismatch'},
{id:'c10',name:'Sana Khan',email:'sana.khan@example.com',role:'Product Designer',stage:'Applied',source:'Referral',date:'2026-10-06',notes:''},
{id:'c11',name:'Vikram Joshi',email:'vikram.joshi@example.com',role:'DevOps Engineer',stage:'Screening',source:'LinkedIn',date:'2026-10-04',notes:''},
{id:'c12',name:'Nisha Verma',email:'nisha.verma@example.com',role:'Software Engineer Intern',stage:'Applied',source:'Company website',date:'2026-10-02',notes:'Fresher'}
];
let candidates=loadCandidates();
let editingId=null;
let toastTimer;
function loadCandidates(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw!==null){const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed.filter(isValidCandidate);}
  }catch(e){console.warn('Could not load saved candidates',e);}
  return sampleCandidates.map(c=>({...c}));
}
function isValidCandidate(c){return c&&typeof c.id==='string'&&typeof c.name==='string'&&typeof c.email==='string'&&typeof c.role==='string'&&STAGES.includes(c.stage)&&typeof c.source==='string'&&typeof c.date==='string';}
function saveCandidates(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(candidates));return true;}
  catch(e){toast('Could not save data. Browser storage may be full or disabled.');return false;}
}
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function initials(name){return String(name).trim().split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase();}
function dateLabel(date){if(!date)return '—';const d=new Date(date+'T00:00:00');return Number.isNaN(d.getTime())?escapeHTML(date):d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
function switchView(view){
  if(!document.getElementById(view))return;
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===view));
  document.querySelectorAll('.nav[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  const names={overview:'Overview',candidates:'Candidates',pipeline:'Hiring pipeline',reports:'Reports',settings:'Settings'};
  document.getElementById('crumb').textContent=names[view]||'Overview';
  if(view==='candidates')renderTable();
  if(view==='pipeline')renderBoard();
  if(view==='reports')renderReports();
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav[data-view]').forEach(link=>link.addEventListener('click',()=>switchView(link.dataset.view)));
function countsByStage(){return Object.fromEntries(STAGES.map(s=>[s,candidates.filter(c=>c.stage===s).length]));}
function stageMarkup(counts,includeRejected=false){
  const stages=includeRejected?STAGES:STAGES.filter(s=>s!=='Rejected');
  const max=Math.max(1,...stages.map(s=>counts[s]||0));
  return stages.map((stage,i)=>`<div class="stage"><div class="stage-title">${escapeHTML(stage)} <span>${counts[stage]||0}</span></div><div class="stage-count">${counts[stage]||0}</div><div class="bar"><span style="width:${Math.round((counts[stage]||0)/max*100)}%;background:${COLORS[i]}"></span></div><div class="stage-foot">${candidates.length?Math.round((counts[stage]||0)/candidates.length*100):0}% of candidates</div></div>`).join('');
}
function candidateCell(c){return `<div class="candidate"><div class="avatar" style="background:${avatarColor(c.name)};color:#5146a9">${escapeHTML(initials(c.name))}</div><div><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.email)}</small></div></div>`;}
function avatarColor(name){const colors=['#e8e2ff','#dff4eb','#fff0d9','#dfeeff','#ffe3e8'];let n=0;for(const ch of name)n+=ch.charCodeAt(0);return colors[n%colors.length];}
function stagePill(stage){return `<span class="pill ${escapeHTML(stage)}">${escapeHTML(stage)}</span>`;}
function renderOverview(){
  const counts=countsByStage(),active=candidates.filter(c=>!['Hired','Rejected'].includes(c.stage)).length;
  document.getElementById('totalStat').textContent=candidates.length;
  document.getElementById('activeStat').textContent=active;
  document.getElementById('interviewStat').textContent=counts.Interview||0;
  document.getElementById('hiredStat').textContent=counts.Hired||0;
  document.getElementById('pipelineStats').innerHTML=stageMarkup(counts);
  const recent=[...candidates].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  document.getElementById('recentRows').innerHTML=recent.length?recent.map(c=>`<tr><td>${candidateCell(c)}</td><td class="role">${escapeHTML(c.role)}</td><td>${stagePill(c.stage)}</td><td class="muted">${dateLabel(c.date)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No candidates yet. Add your first candidate to get started.</td></tr>';
  const sourceCounts=SOURCES.map(s=>({name:s,count:candidates.filter(c=>c.source===s).length})).sort((a,b)=>b.count-a.count);
  const sourceIcons={'LinkedIn':'in','Referral':'↗','Company website':'◎','Job board':'⌕','Other':'＋'};
  document.getElementById('sourceList').innerHTML=sourceCounts.map(s=>`<div class="source-row"><div class="source-ico">${sourceIcons[s.name]}</div><div class="source-label">${escapeHTML(s.name)}<small>${s.name==='LinkedIn'?'Professional network':s.name==='Referral'?'Employee referrals':s.name==='Company website'?'Careers page':s.name==='Job board'?'External job listings':'Other sources'}</small></div><div class="source-num">${candidates.length?Math.round(s.count/candidates.length*100):0}%</div></div>`).join('');
  renderActivityChart();
}
function renderActivityChart(){
  const now=new Date(),months=[];
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({year:d.getFullYear(),month:d.getMonth(),label:d.toLocaleDateString('en',{month:'short'})});}
  const apps=months.map(m=>candidates.filter(c=>{const d=new Date(c.date+'T00:00:00');return d.getFullYear()===m.year&&d.getMonth()===m.month;}).length);
  const interviews=months.map(m=>candidates.filter(c=>{const d=new Date(c.date+'T00:00:00');return d.getFullYear()===m.year&&d.getMonth()===m.month&&['Interview','Offer','Hired'].includes(c.stage);}).length);
  const max=Math.max(1,...apps,...interviews),x=i=>i*100;
  const points=arr=>arr.map((v,i)=>`${x(i)},${125-v/max*105}`).join(' ');
  const svg=document.getElementById('activityChart');
  svg.innerHTML=`<g stroke="#edf0f5" stroke-dasharray="3 4"><path d="M0 20H500 M0 55H500 M0 90H500 M0 125H500"/></g><polyline points="${points(apps)}" fill="none" stroke="#7969e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${points(interviews)}" fill="none" stroke="#f0b354" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  document.getElementById('chartLabels').innerHTML=months.map(m=>`<span>${m.label}</span>`).join('');
}
function renderTable(){
  const query=(document.getElementById('search').value||'').trim().toLowerCase(),stage=document.getElementById('stageFilter').value;
  const rows=[...candidates].filter(c=>(!stage||c.stage===stage)&&[c.name,c.email,c.role,c.source,c.stage].some(v=>String(v).toLowerCase().includes(query))).sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('candidateCount').textContent=`${rows.length} of ${candidates.length} candidate${candidates.length===1?'':'s'}`;
  document.getElementById('tableFoot').textContent=`Showing ${rows.length} candidate${rows.length===1?'':'s'}`;
  document.getElementById('candidateRows').innerHTML=rows.length?rows.map(c=>`<tr><td>${candidateCell(c)}</td><td class="role">${escapeHTML(c.role)}</td><td>${stagePill(c.stage)}</td><td>${escapeHTML(c.source)}</td><td class="muted">${dateLabel(c.date)}</td><td><div style="display:flex;align-items:center;gap:5px"><select class="select" aria-label="Update stage for ${escapeHTML(c.name)}" onchange="updateStage('${c.id}',this.value)">${STAGES.map(s=>`<option ${c.stage===s?'selected':''}>${s}</option>`).join('')}</select><button class="action" title="Edit candidate" aria-label="Edit ${escapeHTML(c.name)}" onclick="editCandidate('${c.id}')">✎</button><button class="action danger" title="Delete candidate" aria-label="Delete ${escapeHTML(c.name)}" onclick="deleteCandidate('${c.id}')">×</button></div></td></tr>`).join(''):'<tr><td colspan="6" class="empty">No matching candidates. Try another search or add a candidate.</td></tr>';
}
function renderBoard(){
  const counts=countsByStage();
  document.getElementById('board').innerHTML=STAGES.slice(0,5).map((stage,i)=>`<div class="board-col"><h3>${stage} <span>${counts[stage]||0}</span></h3>${candidates.filter(c=>c.stage===stage).sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`<div class="board-card"><strong>${escapeHTML(c.name)}</strong><p>${escapeHTML(c.role)}<br>${escapeHTML(c.email)}</p><select aria-label="Move ${escapeHTML(c.name)} to stage" onchange="updateStage('${c.id}',this.value)">${STAGES.map(s=>`<option ${c.stage===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')||'<div class="muted" style="font-size:11px;padding:8px 2px">No candidates</div>'}</div>`).join('')+`<div class="board-col"><h3>Rejected <span>${counts.Rejected||0}</span></h3>${candidates.filter(c=>c.stage==='Rejected').map(c=>`<div class="board-card"><strong>${escapeHTML(c.name)}</strong><p>${escapeHTML(c.role)}</p><select aria-label="Move ${escapeHTML(c.name)} to stage" onchange="updateStage('${c.id}',this.value)">${STAGES.map(s=>`<option ${c.stage===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join('')||'<div class="muted" style="font-size:11px;padding:8px 2px">No candidates</div>'}</div>`;
}
function renderReports(){
  const counts=countsByStage(),active=candidates.filter(c=>!['Hired','Rejected'].includes(c.stage)).length;
  const stats=[['Total candidates',candidates.length,'♙'],['Active applications',active,'▤'],['Interview stage',counts.Interview,'◷'],['Hired',counts.Hired,'✓']];
  document.getElementById('reportStats').innerHTML=stats.map(s=>`<div class="stat"><div class="stat-top">${s[0]}<span class="stat-icon">${s[2]}</span></div><div class="stat-number">${s[1]}</div><div class="sub">Current workspace data</div></div>`).join('');
  document.getElementById('reportPipeline').innerHTML=stageMarkup(counts,true);
}
function refreshAll(){renderOverview();renderTable();renderBoard();renderReports();}
function openModal(id=null){
  editingId=id;
  const form=document.getElementById('candidateForm');form.reset();
  document.getElementById('modalTitle').textContent=id?'Edit candidate':'Add a candidate';
  document.getElementById('modalSubtitle').textContent=id?'Update this candidate’s details.':'Add a new applicant to your hiring pipeline.';
  document.getElementById('saveCandidateBtn').textContent=id?'Save changes':'Save candidate';
  document.getElementById('date').value=todayISO();
  if(id){
    const c=candidates.find(x=>x.id===id);if(!c)return;
    for(const key of ['name','email','role','stage','source','date','notes'])form.elements[key].value=c[key]||'';
  }
  document.getElementById('modalBack').classList.add('show');
  setTimeout(()=>document.getElementById('name').focus(),50);
}
function closeModal(){document.getElementById('modalBack').classList.remove('show');editingId=null;}
document.getElementById('candidateForm').addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.currentTarget,fd=new FormData(form);
  const record={name:String(fd.get('name')).trim(),email:String(fd.get('email')).trim(),role:String(fd.get('role')).trim(),stage:String(fd.get('stage')),source:String(fd.get('source')),date:String(fd.get('date')),notes:String(fd.get('notes')||'').trim()};
  if(!record.name||!record.email||!record.role||!STAGES.includes(record.stage)||!SOURCES.includes(record.source)||!record.date){toast('Please complete all required fields.');return;}
  const duplicate=candidates.find(c=>c.email.toLowerCase()===record.email.toLowerCase()&&c.id!==editingId);
  if(duplicate){toast('A candidate with this email already exists.');return;}
  if(editingId){const index=candidates.findIndex(c=>c.id===editingId);if(index<0)return;candidates[index]={...candidates[index],...record};}
  else candidates.unshift({id:makeId(),...record});
  if(!saveCandidates())return;
  closeModal();refreshAll();toast(editingId?'Candidate updated.':'Candidate added successfully.');
});
function makeId(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function updateStage(id,stage){
  if(!STAGES.includes(stage))return;
  const c=candidates.find(x=>x.id===id);if(!c)return;
  c.stage=stage;saveCandidates();refreshAll();toast(`${c.name} moved to ${stage}.`);
}
function editCandidate(id){openModal(id);}
function deleteCandidate(id){
  const c=candidates.find(x=>x.id===id);if(!c)return;
  if(!confirm(`Delete ${c.name} from your candidate records? This cannot be undone.`))return;
  candidates=candidates.filter(x=>x.id!==id);saveCandidates();refreshAll();toast('Candidate deleted.');
}
function exportCSV(){
  const headers=['Name','Email','Position','Stage','Source','Applied date','Notes'];
  const rows=candidates.map(c=>[c.name,c.email,c.role,c.stage,c.source,c.date,c.notes||'']);
  const csv=[headers,...rows].map(row=>row.map(value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`talentflow-candidates-${todayISO()}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('CSV export downloaded.');
}
function resetData(){
  if(!confirm('Reset all changes and restore the sample candidates? This will replace your saved records.'))return;
  candidates=sampleCandidates.map(c=>({...c}));
  if(saveCandidates()){refreshAll();toast('Demo data restored.');}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
refreshAll();
