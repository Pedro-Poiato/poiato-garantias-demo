"use strict";
// Poiato Garantias V2: protótipo isolado, sem qualquer dado, PIN, e-mail ou integração real.
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=()=>new Date().toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
const ST={ABERTO:'AGUARDANDO ENVIO',ENVIADO:'ENVIADO AO FORNECEDOR',INFO:'AGUARDANDO INFORMAÇÕES',APROVADO:'TROCA APROVADA / FORMAL PENDENTE',FORMAL:'GARANTIA FORMAL ENVIADA',RECUSADO:'RECUSADA',CONCLUIDO:'CONCLUÍDA'};
const flow={
 [ST.ABERTO]:[ST.ENVIADO],
 [ST.ENVIADO]:[ST.INFO,ST.APROVADO,ST.RECUSADO],
 [ST.INFO]:[ST.ENVIADO],
 [ST.APROVADO]:[ST.FORMAL],
 [ST.FORMAL]:[ST.CONCLUIDO],
 [ST.RECUSADO]:[ST.CONCLUIDO],
 [ST.CONCLUIDO]:[]
};
let role='FISIO';
let serial=5;
const cases=[
 {id:'PRE-DEMO-001',paciente:'Paciente Fictício A',marca:'Fornecedor A',tipo:'Joelho',produto:'Modelo Exemplo 01',sn:'DEMO-SN-001',origem:'Clínica Exemplo',aberto:'Equipe de demonstração',relato:'Ruído intermitente após uso',data:'2026-10-12',status:ST.ABERTO,formal:false,pendencia:'',files:['imagem_ficticia_01.jpg'],history:[]},
 {id:'PRE-DEMO-002',paciente:'Paciente Fictício B',marca:'Fornecedor B',tipo:'Liner',produto:'Modelo Exemplo 02',sn:'DEMO-SN-002',origem:'Empresa Exemplo',aberto:'Equipe de demonstração',relato:'Dificuldade de fixação',data:'2026-10-09',status:ST.INFO,formal:false,pendencia:'Enviar fotos fictícias e descrição adicional',files:[],history:[]},
 {id:'PRE-DEMO-003',paciente:'Paciente Fictício C',marca:'Fornecedor A',tipo:'Pé',produto:'Modelo Exemplo 03',sn:'DEMO-SN-003',origem:'Clínica Exemplo',aberto:'Equipe de demonstração',relato:'Alteração de resistência',data:'2026-10-08',status:ST.ENVIADO,formal:false,pendencia:'',files:['relato_demo.txt'],history:[]},
 {id:'PRE-DEMO-004',paciente:'Paciente Fictício D',marca:'Fornecedor B',tipo:'Componente',produto:'Modelo Exemplo 04',sn:'DEMO-SN-004',origem:'Empresa Exemplo',aberto:'Equipe de demonstração',relato:'Falha mecânica fictícia',data:'2026-10-03',status:ST.APROVADO,formal:false,pendencia:'',files:[],history:[]},
 {id:'GAR-DEMO-001',paciente:'Paciente Fictício E',marca:'Fornecedor A',tipo:'Joelho',produto:'Modelo Exemplo 05',sn:'DEMO-SN-005',origem:'Clínica Exemplo',aberto:'Equipe de demonstração',relato:'Solicitação formal ilustrativa',data:'2026-10-01',status:ST.FORMAL,formal:true,pendencia:'',files:['formulario_ficticio.pdf'],history:[]}
];
cases.forEach(c=>c.history=[{at:'27/10/2026',actor:'Demonstração',what:'Caso fictício inicializado na etapa '+c.status}]);
function notify(s){const d=$('toast');d.textContent=s;d.classList.add('show');clearTimeout(window._t);window._t=setTimeout(()=>d.classList.remove('show'),3200)}
function admin(){return role==='PEDRO'}
function gateMessage(){return admin()?'Perfil: Gerenciamento (sem autenticação real)':'Perfil: Solicitante (sem autenticação real)'}
function showGate(){$('gate').classList.remove('hidden');$('role-current').textContent='Perfil de demonstração não selecionado'}
function enterPreview(){role=$('profile').value;$('gate').classList.add('hidden');$('role-current').textContent=gateMessage();showPage('home');notify(gateMessage())}
function showPage(n){for(const id of ['telaInicioV33','page-pendencias','page-continuar','page-gestao','page-historico'])$(id).classList.add('hidden-page');const tgt=$(n==='home'?'telaInicioV33':`page-${n}`);if(!tgt)return;tgt.classList.remove('hidden-page');if(n==='gestao')setTab('pre');if(n==='pendencias')renderPend();if(n==='historico')renderGlobalHistory();window.scrollTo(0,0)}
function openForm(){$('newPreModal').classList.remove('oculto')}
function closeForm(){$('newPreModal').classList.add('oculto')}
function setTab(n){$('gestao-garantias').classList.toggle('hidden-page',n!=='garantias');$('gestao-pre').classList.toggle('hidden-page',n!=='pre');$('tab-garantias').classList.toggle('ativa',n==='garantias');$('tab-pre').classList.toggle('ativa',n==='pre');renderAll()}
function byName(c,q){return [c.id,c.paciente,c.produto,c.sn,c.marca,c.origem,c.status,c.relato].join(' ').toLocaleLowerCase('pt-BR').includes(q.toLocaleLowerCase('pt-BR'))}
function button(label,action){return `<button class="secundario small-btn" type="button" data-open="${esc(action)}">${esc(label)}</button>`}
function renderPre(){const q=$('preSearch').value.trim();const status=$('preFilter').value;const subset=cases.filter(c=>!c.formal&&byName(c,q)&&(!status||c.status===status));$('preRows').innerHTML=subset.map(c=>`<tr><td><strong>${esc(c.id)}</strong><div>${esc(c.paciente)}</div><small>${esc(c.origem)}</small></td><td>${esc(c.produto)}<div><small>${esc(c.sn)}</small></div></td><td>${esc(c.relato)}</td><td><span class="chip andamento">${esc(c.status)}</span></td><td>${esc(c.data)}</td><td>${button('Abrir ficha',c.id)}</td></tr>`).join('')||'<tr><td colspan="6">Nenhuma pré-garantia encontrada.</td></tr>';
 const p=cases.filter(c=>!c.formal);$('totalPre').textContent=p.length;$('badgePre').textContent=p.length;
 document.querySelectorAll('#gestao-pre .indicador strong:not([id])').forEach((el,i)=>el.textContent=[p.filter(c=>c.status===ST.ABERTO).length,p.filter(c=>c.status===ST.ENVIADO).length,p.filter(c=>c.status===ST.APROVADO).length,p.filter(c=>c.status===ST.INFO).length][i]??'0');
}
function renderGar(){const tbody=$('garRows');const q=$('garSearch').value.trim();const st=$('garStatusFilter').value;const data=cases.filter(c=>c.formal&&byName(c,q)&&(!st||c.status===st));tbody.innerHTML=data.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.paciente)} / ${esc(c.marca)}</td><td>${esc(c.produto)} / ${esc(c.sn)}</td><td>${esc(c.aberto)}</td><td><span class="chip andamento">${esc(c.status)}</span></td><td>${esc(c.data)}</td><td>${button('Abrir ficha',c.id)}</td></tr>`).join('')||'<tr><td colspan="7">Nenhuma garantia formal encontrada.</td></tr>';
 const g=cases.filter(c=>c.formal);$('gar-summary').querySelectorAll('.indicador strong').forEach((el,i)=>el.textContent=[g.length,0,g.filter(c=>c.status!==ST.CONCLUIDO).length,g.filter(c=>c.status===ST.FORMAL).length,g.filter(c=>c.status===ST.CONCLUIDO).length][i]);
}
function renderPend(){const q=$('pendSearch').value.trim();const status=$('pendStatus').value;const selected=cases.filter(c=>c.status===ST.INFO&&byName(c,q)&&(!status||status===c.status));$('pendRows').innerHTML=selected.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.paciente)}</td><td>${esc(c.produto)}</td><td>${esc(c.pendencia||'Complementar informações')}</td><td><span class="chip andamento">${esc(c.status)}</span></td><td>${button('Continuar',c.id)}</td></tr>`).join('')||'<tr><td colspan="6">Sem pendências para estes filtros.</td></tr>';}
function renderGlobalHistory(){const rows=cases.flatMap(c=>c.history.map(h=>({...h,id:c.id}))).sort((a,b)=>String(b.at).localeCompare(String(a.at)));$('historyRows').innerHTML=rows.map(h=>`<tr><td>${esc(h.at)}</td><td>${esc(h.id)}</td><td>${esc(h.actor)}</td><td>${esc(h.what)}</td></tr>`).join('')}
function renderAll(){renderPre();renderGar();renderPend()}
function continueDemo(){const id=$('protocoloBusca').value.trim().toUpperCase();const c=cases.find(x=>x.id===id);$('continuarMsg').textContent=c?`Protocolo ${c.id} encontrado: ${c.status}. A ficha foi aberta.`:'Protocolo não encontrado. Experimente PRE-DEMO-002.';$('continuarMsg').className=c?'info':'aviso';if(c)openCase(c.id)}
function audit(c,what){c.history.unshift({at:fmt(),actor:admin()?'Gestão (demo)':'Solicitante (demo)',what})}
function openCase(id){const c=cases.find(x=>x.id===id);if(!c)return;
 $('caseTitle').textContent=`${c.id} — ${c.paciente}`;
 const canEdit=admin();const canComplement=c.status===ST.INFO&&!admin();const actions=canEdit?(flow[c.status]||[]):canComplement?[ST.ENVIADO]:[];
 const statusOptions=actions.map(st=>`<option value="${esc(st)}">${esc(st)}</option>`).join('');
 $('caseDetails').innerHTML=`<div class="case-grid"><div><small>Fornecedor</small><strong>${esc(c.marca)}</strong></div><div><small>Origem</small><strong>${esc(c.origem)}</strong></div><div><small>Produto / série fictícia</small><strong>${esc(c.produto)} • ${esc(c.sn)}</strong></div><div><small>Data de colocação</small><strong>${esc(c.data)}</strong></div><div><small>Etapa atual</small><strong>${esc(c.status)}</strong></div><div><small>Tipo de registro</small><strong>${c.formal?'Garantia formal':'Pré-garantia'}</strong></div></div><div class="case-note"><strong>Relato</strong><p>${esc(c.relato)}</p>${c.pendencia?`<p><strong>Pendência:</strong> ${esc(c.pendencia)}</p>`:''}</div><div class="case-note"><strong>Anexos ilustrativos</strong><p>${c.files.length?c.files.map(f=>esc(f)).join(' · '):'Nenhum anexo listado'}</p><small>Somente nomes fictícios: nenhum arquivo é enviado ou armazenado.</small></div><h4>Histórico do protocolo</h4><div>${c.history.map(h=>`<div class="case-log"><small>${esc(h.at)} · ${esc(h.actor)}</small><span>${esc(h.what)}</span></div>`).join('')}</div>
 ${actions.length?`<div class="case-editor"><label>Próxima etapa<select id="case-next">${statusOptions}</select></label><label>Observação da movimentação<textarea id="case-comment" maxlength="400" placeholder="Resumo fictício da atualização"></textarea></label><button class="principal" id="case-advance">Registrar próxima etapa</button></div>`:`<p class="info">${c.status===ST.CONCLUIDO?'Protocolo concluído.':canEdit?'Não há próxima etapa nesta simulação.':'Neste perfil, as alterações de etapa são reservadas ao gerenciamento; as complementações são feitas nas pendências.'}</p>`}`;
 $('caseModal').classList.remove('oculto');const button=$('case-advance');if(button)button.onclick=()=>{const next=$('case-next').value;const comment=$('case-comment').value.trim();if(!(flow[c.status]||[]).includes(next))return notify('Transição indisponível para a etapa atual.');if(c.status===ST.ENVIADO&&next===ST.INFO&&!comment)return notify('Descreva quais informações complementares serão necessárias.');c.status=next;if(next===ST.INFO)c.pendencia=comment||'Complementar dados';else c.pendencia='';if(next===ST.FORMAL)c.formal=true;audit(c,`Etapa alterada para ${next}${comment?' • '+comment:''}`);closeCase();renderAll();notify('Etapa atualizada; histórico registrado.');};
}
function closeCase(){$('caseModal').classList.add('oculto')}
function resetDemo(){if(!confirm('Reiniciar todos os registros fictícios?'))return;location.reload()}
function initWarrantyV2(){
 $('role-current').textContent='Escolha o perfil fictício de acesso';
 $('preSearch').oninput=renderPre;$('garSearch').oninput=renderGar;$('pendSearch').oninput=renderPend;
 $('preFilter').onchange=renderPre;$('garStatusFilter').onchange=renderGar;$('pendStatus').onchange=renderPend;
 $('historyBtn').onclick=()=>showPage('historico');$('demoReset').onclick=resetDemo;
 $('protocoloBusca').onkeydown=e=>{if(e.key==='Enter')continueDemo()};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openCase(b.dataset.open)});
 $('caseModal').addEventListener('click',e=>{if(e.target===$('caseModal'))closeCase()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCase();closeForm()}});
 $('preForm').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const patient=String(d.get('paciente')||'').trim(),model=String(d.get('produto')||'').trim(),sn=String(d.get('sn')||'').trim(),relato=String(d.get('relato')||'').trim();if(!patient||!model||!sn||!relato)return;const newId=`PRE-DEMO-${String(++serial).padStart(3,'0')}`;const c={id:newId,paciente:patient,marca:String(d.get('marca')),tipo:String(d.get('tipo')),produto:model,sn,origem:String(d.get('origem')),aberto:String(d.get('aberto')),relato,data:String(d.get('data')),status:ST.ABERTO,formal:false,pendencia:'',files:[],history:[]};audit(c,'Pré-garantia fictícia aberta');cases.unshift(c);e.target.reset();renderAll();closeForm();showPage('gestao');notify(`Protocolo ${newId} registrado apenas neste navegador.`);};
 renderAll();
}
initWarrantyV2();
