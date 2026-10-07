/* Forja v2: app de academia estilo RPG */
(function () {
  'use strict';
  const CHAVE = 'forja_v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const { GRUPOS, EX: EXB, TREINOS: TPAD, CIENCIA } = window.Dados;
  const H = window.Heroi;

  const ATTRS = [
    { id: 'peito', nome: 'Peito', cor: '#ff8fb1', sig: 'PE' },
    { id: 'costas', nome: 'Costas', cor: '#7cb7ff', sig: 'CO' },
    { id: 'ombros', nome: 'Ombros', cor: '#b9a3f2', sig: 'OM' },
    { id: 'bracos', nome: 'Braços', cor: '#ffa76b', sig: 'BR' },
    { id: 'pernas', nome: 'Pernas', cor: '#5fd08a', sig: 'PN' },
    { id: 'abdomen', nome: 'Abdômen', cor: '#ffc94a', sig: 'AB' },
    { id: 'cardio', nome: 'Cardio', cor: '#ff7a7a', sig: 'CA' }
  ];
  const XP_SERIE = 10, XP_SEC = 5, XP_MIN = 2, TETO_GRUPO = 150, TETO_DIA = 400;
  const DIAS_SONO = 4, DIAS_APAGADO = 8, DIAS_BACKUP = 14, BONUS_REC = 15, MAX_REC = 3, MIN_AURA = 3;

  const ITENS = [
    { id: 'camiseta', tipo: 'roupa', nome: 'Camiseta azul', nivel: 0, cor: '#7cb7ff' },
    { id: 'preta', tipo: 'roupa', nome: 'Camiseta preta', nivel: 0, cor: '#3a3646' },
    { id: 'regata', tipo: 'roupa', nome: 'Regata verde', nivel: 10, cor: '#8fd6a8' },
    { id: 'forja', tipo: 'roupa', nome: 'Camiseta Forja', nivel: 20, cor: '#ffb27a' },
    { id: 'moletom', tipo: 'roupa', nome: 'Moletom roxo', nivel: 35, cor: '#b9a3f2' },
    { id: 'dourado', tipo: 'roupa', nome: 'Uniforme dourado', nivel: 60, cor: '#ffd36e' },
    { id: 'nenhum', tipo: 'acessorio', nome: 'Nenhum', nivel: 0, cor: '#2f2a40' },
    { id: 'faixa', tipo: 'acessorio', nome: 'Faixa', nivel: 15, cor: '#ff6b8b' },
    { id: 'fone', tipo: 'acessorio', nome: 'Fone', nivel: 25, cor: '#7c8cc4' },
    { id: 'bone', tipo: 'acessorio', nome: 'Boné', nivel: 30, cor: '#ff7a59' },
    { id: 'munhequeira', tipo: 'acessorio', nome: 'Munhequeiras', nivel: 40, cor: '#ff7aa8' },
    { id: 'medalha', tipo: 'acessorio', nome: 'Medalha', nivel: 50, cor: '#ffd23f' },
    { id: 'capa', tipo: 'acessorio', nome: 'Capa', nivel: 75, cor: '#ff5a6e' },
    { id: 'noite', tipo: 'cenario', nome: 'Noite', nivel: 0, cor: '#2a2748' },
    { id: 'parque', tipo: 'cenario', nome: 'Parque', nivel: 0, cor: '#bfe8c2' },
    { id: 'academia', tipo: 'cenario', nome: 'Academia', nivel: 12, cor: '#3a3450' },
    { id: 'praia', tipo: 'cenario', nome: 'Praia', nivel: 18, cor: '#ffe2a8' },
    { id: 'montanha', tipo: 'cenario', nome: 'Montanha', nivel: 28, cor: '#b6c6ea' },
    { id: 'arena', tipo: 'cenario', nome: 'Arena', nivel: 45, cor: '#c99a6a' },
    { id: 'espaco', tipo: 'cenario', nome: 'Espaço', nivel: 70, cor: '#4a4780' }
  ];

  const FRASES = {
    oi: ['Bora treinar?', 'Hoje tem treino?', 'Tô pronto, e você?', 'Vamos forjar esse corpo!', 'Um treino de cada vez.'],
    toque: ['Olha esse muque!', 'Opa, cosquinha!', 'Sentiu a energia?', 'Treino bom é treino feito.'],
    sono: ['Zzz... cadê o treino?', 'Tô ficando molenga...', 'Me acorda com um treino?'],
    apagado: ['Perdi meu brilho...', 'Sinto falta da academia.', 'Um treino e eu volto a brilhar!'],
    treino: ['Mandou bem!', 'Isso que é treino!', 'Mais forte a cada dia!', 'Sensacional!']
  };

  /* ---------- datas ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const hoje = () => iso(new Date());
  const dataDe = s => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const somaDias = (s, n) => { const d = dataDe(s); d.setDate(d.getDate() + n); return iso(d); };
  const difDias = (a, b) => Math.round((dataDe(a) - dataDe(b)) / 86400000);
  const segunda = s => { const d = dataDe(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); };
  const fmtD = s => { const d = dataDe(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
  const fmtDA = s => fmtD(s) + '/' + s.slice(2, 4);
  const DIAS_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const num = (v, c = 1) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: c });
  const fmtDur = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return m >= 60 ? Math.floor(m / 60) + 'h' + pad(m % 60) : m + ':' + pad(s % 60); };
  const fmtDesc = s => s >= 60 ? Math.floor(s / 60) + ' min' + (s % 60 ? ' ' + (s % 60) + ' s' : '') : s + ' s';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- estado ---------- */
  function novoEstado() {
    const xp = {}; ATTRS.forEach(a => xp[a.id] = 0);
    return {
      app: 'forja', v: 2,
      perfil: { nome: '', metaSemanal: 4, criadoEm: hoje() },
      avatar: Object.assign({}, H.AVATAR_PADRAO),
      xp, xpDia: { data: hoje(), total: 0, grupos: {} },
      sessoes: [], medidas: [], treinos: [], exProprios: [],
      prog: {}, recordes: {}, amigos: [],
      equip: { roupa: 'preta', acessorio: 'nenhum', cenario: 'noite' },
      sessaoAtiva: null, ultimoBackup: null, onboard: false
    };
  }
  function migrar(s) {
    const n = novoEstado();
    const o = Object.assign(n, s);
    o.perfil = Object.assign(n.perfil, s.perfil || {});
    o.avatar = Object.assign({}, H.AVATAR_PADRAO, s.avatar || {});
    o.xp = Object.assign({}, n.xp, s.xp || {});
    o.equip = Object.assign({ roupa: 'preta', acessorio: 'nenhum', cenario: 'noite' }, s.equip || {});
    ['sessoes', 'medidas', 'treinos', 'exProprios', 'amigos'].forEach(k => { if (!Array.isArray(o[k])) o[k] = []; });
    ['prog', 'recordes'].forEach(k => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; });
    o.v = 2;
    return o;
  }
  function carregar() {
    try { const s = JSON.parse(localStorage.getItem(CHAVE)); if (s && s.app === 'forja') return migrar(s); } catch (e) { }
    return novoEstado();
  }
  let E = carregar();
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { toast('Não consegui salvar neste aparelho.'); } };

  /* ---------- catálogo ---------- */
  const todosEx = () => EXB.concat(E.exProprios);
  const exPor = id => todosEx().find(e => e.id === id) || { id, nome: 'Exercício removido', g: 'peito', tipo: 'carga', sec: [] };
  const grupoPor = id => GRUPOS.find(g => g.id === id) || { id: 'fullbody', nome: 'Full Body', attr: 'pernas', cor: '#ffd36e', sig: 'FB' };
  const attrPor = id => ATTRS.find(a => a.id === id);
  const todosTreinos = () => E.treinos.concat(TPAD);
  const treinoPor = id => todosTreinos().find(t => t.id === id);

  /* ---------- níveis ---------- */
  function infoNivel(xp) {
    let L = 1, base = 0, prox = 40;
    while (xp >= base + prox) { base += prox; L++; prox = 40 + 20 * (L - 1); }
    return { nivel: L, atual: xp - base, prox };
  }
  const nivelGeral = () => ATTRS.reduce((s, a) => s + infoNivel(E.xp[a.id]).nivel, 0);
  const xpTotal = () => ATTRS.reduce((s, a) => s + E.xp[a.id], 0);

  /* ---------- semana, sequência, aura ---------- */
  const diasTreino = () => new Set(E.sessoes.map(s => s.data));
  const contaSemana = (seg, dias) => { let c = 0; for (let i = 0; i < 7; i++) if (dias.has(somaDias(seg, i))) c++; return c; };
  function statusSemana() {
    const dias = diasTreino(), meta = E.perfil.metaSemanal, seg = segunda(hoje());
    const atual = contaSemana(seg, dias);
    let cadeia = 0;
    const inicio = segunda(E.perfil.criadoEm);
    while (true) {
      const s = somaDias(seg, -7 * (cadeia + 1));
      if (difDias(s, inicio) < 0) break;
      if (contaSemana(s, dias) >= meta) cadeia++; else break;
    }
    return { atual, meta, semanas: cadeia + (atual >= meta ? 1 : 0) };
  }
  /* Aura: cada semana com pelo menos 3 treinos soma 7 dias.
     Semana abaixo de 3 treinos tira dias: 2 treinos -2, 1 treino -4, nenhum -7. */
  function auraInfo() {
    const dias = diasTreino();
    const segAtual = segunda(hoje());
    let pts = 0, ultimaPen = null;
    if (E.sessoes.length) {
      const primeira = segunda(E.sessoes.map(s => s.data).sort()[0]);
      for (let s = primeira; difDias(segAtual, s) > 0; s = somaDias(s, 7)) {
        const c = contaSemana(s, dias);
        if (c >= MIN_AURA) pts += 7;
        else {
          const pen = c === 2 ? 2 : c === 1 ? 4 : 7;
          const antes = pts; pts = Math.max(0, pts - pen);
          if (difDias(segAtual, s) === 7) ultimaPen = { c, pen: antes - pts };
        }
      }
    }
    const cur = contaSemana(segAtual, dias);
    if (cur >= MIN_AURA) pts += difDias(hoje(), segAtual) + 1;
    let est = 0;
    H.AURAS.forEach((a, i) => { if (a && pts >= a.dias) est = i; });
    return { pts, estagio: est, prox: H.AURAS[est + 1] || null, ultimaPen, cur };
  }
  function diasSemTreino() {
    const ult = E.sessoes.length ? E.sessoes.map(s => s.data).sort().pop() : E.perfil.criadoEm;
    return difDias(hoje(), ult);
  }
  const medidaAtual = () => E.medidas.length ? E.medidas[E.medidas.length - 1] : null;

  /* ---------- UI base ---------- */
  let tToast;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove('on'), 2600); }
  function abrirModal(html) { $('#modal-caixa').innerHTML = html; $('#modal').classList.remove('oculto'); }
  function fecharModal() { $('#modal').classList.add('oculto'); }
  function confirmar(txt, sim, perigo) {
    return new Promise(res => {
      abrirModal(`<h2>${esc(txt)}</h2><div class="col"><button class="btn largo ${perigo ? 'verm' : 'prim'}" id="cf-sim">${esc(sim || 'Confirmar')}</button><button class="btn largo fant" id="cf-nao">Cancelar</button></div>`);
      $('#cf-sim').onclick = () => { fecharModal(); res(true); };
      $('#cf-nao').onclick = () => { fecharModal(); res(false); };
    });
  }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-fechar]')) fecharModal(); });
  function confete(n) {
    const c = $('#confete'), cores = ['#ff8fb1', '#ffd36e', '#7cb7ff', '#4fd08a', '#b9a3f2', '#ff8a3d'];
    for (let i = 0; i < (n || 40); i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%'; p.style.background = cores[i % cores.length];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      c.appendChild(p); setTimeout(() => p.remove(), 2600);
    }
  }
  const vibrar = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };
  let audioCtx;
  function bip() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach(t => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.12);
      });
    } catch (e) { }
  }

  /* ---------- miniaturas ---------- */
  function thumb(ex, animar) {
    if (ex.a) return `<div class="th" data-anim="${ex.id}" ${animar ? 'data-vivo="1"' : ''}></div>`;
    const g = grupoPor(ex.g);
    return `<div class="th"><div class="gen-ic" style="background:${g.cor}">${g.sig}</div></div>`;
  }
  function montarAnims(raiz) {
    $$('[data-anim]', raiz).forEach(el => {
      if (el._montado) return;
      el._montado = true;
      const ex = exPor(el.dataset.anim);
      if (ex.a) Anim.montar(el, ex, E.avatar, { estatico: !el.dataset.vivo });
    });
  }
  const rosto = (av, extra) => H.render(Object.assign({ avatar: av, soCabeca: true, roupa: 'preta' }, extra || {}));

  /* ---------- navegação ---------- */
  let abaAtual = 'heroi';
  function ir(t) {
    abaAtual = t;
    $$('.tela').forEach(s => s.classList.toggle('ativa', s.id === 'tela-' + t));
    $$('#barra-nav button').forEach(b => b.classList.toggle('ativo', b.dataset.ir === t));
    window.scrollTo({ top: 0 });
    renderAba();
  }
  function renderAba() {
    $('#chip-nivel').textContent = 'Nv ' + nivelGeral();
    ({ heroi: renderHeroi, treinos: renderTreinos, progresso: renderProgresso, amigos: renderAmigos, perfil: renderPerfil })[abaAtual]();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (b) { fecharTodasFolhas(); ir(b.dataset.ir); return; }
    const a = e.target.closest('[data-a]');
    if (a && ACOES[a.dataset.a]) { e.preventDefault(); ACOES[a.dataset.a](a, e); }
  });

  /* folhas sobrepostas */
  const pilha = [];
  function abrirFolha(id, render, depois) {
    const el = document.createElement('div');
    el.className = 'folha'; el.dataset.id = id;
    $('#folhas').appendChild(el);
    const f = { id, el, render, depois };
    pilha.push(f);
    desenharFolha(f);
    document.body.style.overflow = 'hidden';
    return f;
  }
  function desenharFolha(f) {
    const y = f.el.scrollTop;
    f.el.innerHTML = `<div class="folha-in">${f.render()}</div>`;
    f.el.scrollTop = y;
    montarAnims(f.el);
    if (f.depois) f.depois(f.el);
  }
  function redesenharTopo() { if (pilha.length) desenharFolha(pilha[pilha.length - 1]); }
  function fecharFolha() {
    const f = pilha.pop(); if (f) f.el.remove();
    if (!pilha.length) { document.body.style.overflow = ''; renderAba(); } else redesenharTopo();
  }
  function fecharTodasFolhas() { while (pilha.length) pilha.pop().el.remove(); document.body.style.overflow = ''; }
  const topoFolha = (titulo, extra) => `<div class="folha-topo"><button class="icone-btn" data-a="voltar" aria-label="Voltar"><svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h1>${esc(titulo)}</h1>${extra || ''}</div>`;

  /* ---------- herói ---------- */
  let auraPrevia = null, poseTemp = null, humorTemp = null, timerPose = null;
  function opcoesHeroi(extra) {
    const sem = diasSemTreino();
    const sono = sem >= DIAS_SONO;
    return Object.assign({
      corpo: H.corpoDeMedidas(medidaAtual()), avatar: E.avatar,
      roupa: E.equip.roupa, acessorio: E.equip.acessorio,
      aura: auraPrevia != null ? auraPrevia : auraInfo().estagio,
      pose: poseTemp || (sono ? 'sono' : 'idle'),
      humor: humorTemp || (sono ? 'sono' : 'feliz'),
      apagado: !poseTemp && sem >= DIAS_APAGADO
    }, extra || {});
  }
  function desenharHeroi() {
    const c = $('#cenario'), w = $('#heroi-wrap');
    if (!c || !w) return;
    c.innerHTML = H.cenario(E.equip.cenario);
    w.innerHTML = H.render(opcoesHeroi());
  }
  function fala(t) { const b = $('#balao'); if (!b) return; b.style.opacity = 0; setTimeout(() => { b.textContent = t; b.style.opacity = 1; }, 150); }
  const sorteia = a => a[Math.floor(Math.random() * a.length)];
  function reagir(pose, humor, frase, ms) {
    clearTimeout(timerPose);
    poseTemp = pose; humorTemp = humor; desenharHeroi();
    if (frase) fala(frase);
    const w = $('#heroi-wrap'); if (!w) return;
    w.classList.remove('pula'); void w.offsetWidth;
    if (pose === 'comemora') w.classList.add('pula');
    timerPose = setTimeout(() => { poseTemp = null; humorTemp = null; w.classList.remove('pula'); desenharHeroi(); }, ms || 2400);
  }

  function proximoTreino() {
    const meus = E.treinos.length ? E.treinos : TPAD.filter(t => t.g !== 'cardio');
    let melhor = null, dt = -1;
    for (const t of meus) {
      const ult = E.sessoes.filter(s => s.treinoId === t.id).map(s => s.data).sort().pop();
      const d = ult ? difDias(hoje(), ult) : 9999;
      if (d > dt) { dt = d; melhor = t; }
    }
    return melhor;
  }

  function renderHeroi() {
    const st = statusSemana(), au = auraInfo(), nv = nivelGeral();
    const nome = E.perfil.nome ? ', ' + esc(E.perfil.nome.split(' ')[0]) : '';
    const sem = diasSemTreino();
    const prox = proximoTreino();
    const ativa = E.sessaoAtiva;
    let auraTxt, auraW;
    if (!au.prox) { auraTxt = H.AURAS[au.estagio].nome + ': nível máximo'; auraW = 100; }
    else {
      const base = au.estagio ? H.AURAS[au.estagio].dias : 0;
      auraW = Math.min(100, (au.pts - base) / (au.prox.dias - base) * 100);
      auraTxt = (au.estagio ? H.AURAS[au.estagio].nome + ' ativa. ' : '') + 'Próxima: ' + au.prox.nome + ' em ' + (au.prox.dias - au.pts) + ' dias';
    }
    const m = medidaAtual();
    $('#tela-heroi').innerHTML = `
      <div class="palco"><div class="cenario" id="cenario"></div><div class="heroi-wrap" id="heroi-wrap" data-a="tocarHeroi"></div><div class="balao" id="balao">Olá${nome}!</div></div>
      <div class="stats">
        <div class="stat"><b>${nv}</b><span>nível</span></div>
        <div class="stat"><b>${st.semanas}</b><span>semanas</span></div>
        <div class="stat"><b>${au.pts}</b><span>dias de aura</span></div>
      </div>
      ${ativa ? `<div class="cartao"><div class="prox"><div class="tit"><b>${esc(ativa.nome)}</b><span>Treino em andamento</span></div><button class="btn verde" data-a="abrirSessao">Continuar</button></div></div>` :
        prox ? `<div class="cartao"><div class="prox"><div class="tit"><small class="sub peq">Sugestão para hoje</small><b>${esc(prox.nome)}</b><span>${prox.itens.length} exercícios, ${prox.itens.reduce((s, i) => s + i.series, 0)} séries</span></div><button class="btn prim" data-a="iniciarTreino" data-id="${prox.id}">Começar</button></div></div>` : ''}
      <div class="cartao">
        <div class="linha"><h2>Meta da semana</h2><b class="fd">${st.atual} de ${st.meta}</b></div>
        <div class="bolinhas">${Array.from({ length: st.meta }, (_, i) => `<i class="${i < st.atual ? 'ok' : ''}"></i>`).join('')}</div>
        <div style="margin-top:14px" class="linha"><span class="peq" style="font-weight:800">Aura</span><small>${au.cur >= MIN_AURA ? 'semana garantida' : 'treine ' + (MIN_AURA - au.cur) + 'x para garantir a semana'}</small></div>
        <div class="barra aura-barra"><i style="width:${auraW}%"></i></div>
        <p class="sub peq" style="margin-top:6px">${esc(auraTxt)}</p>
        ${au.ultimaPen && au.ultimaPen.pen ? `<div class="alerta">Semana passada: ${au.ultimaPen.c} treino${au.ultimaPen.c === 1 ? '' : 's'}. Sua aura perdeu ${au.ultimaPen.pen} dias.</div>` : ''}
        ${sem >= DIAS_SONO ? `<div class="alerta">${sem} dias sem treinar. Seu herói está ${sem >= DIAS_APAGADO ? 'sem brilho' : 'sonolento'}.</div>` : ''}
      </div>
      <div class="cartao">
        <div class="linha"><h2>Atributos</h2><small>nível geral = soma</small></div>
        ${ATTRS.map(a => { const i = infoNivel(E.xp[a.id]); return `<div class="attr"><div class="badge" style="background:${a.cor}">${a.sig}</div><div><div class="nm">${a.nome}<small>${i.atual}/${i.prox} XP</small></div><div class="barra"><i style="width:${i.atual / i.prox * 100}%;background:${a.cor}"></i></div></div><div class="nv">${i.nivel}</div></div>`; }).join('')}
      </div>
      ${m ? `<div class="cartao slim"><div class="linha"><div><b class="fd" style="font-size:18px">${num(m.peso)} kg</b> <span class="sub peq">${m.musculoKg ? num(H.corpoDeMedidas(m).pctM) + '% de massa muscular' : ''}</span></div><button class="btn mini" data-a="abrirMedidas">Medidas</button></div></div>`
        : `<div class="cartao"><h2>Deixe o herói igual a você</h2><p class="sub">Cadastre peso, altura e massa muscular. O corpo do personagem só muda com o seu progresso real.</p><button class="btn azul largo" style="margin-top:12px" data-a="abrirMedidas">Cadastrar medidas</button></div>`}
      ${E.sessoes.length && difDias(hoje(), E.ultimoBackup || E.perfil.criadoEm) >= DIAS_BACKUP ? `<div class="info">Faz ${difDias(hoje(), E.ultimoBackup || E.perfil.criadoEm)} dias sem backup. <a href="#" data-a="abrirBackup" style="color:inherit">Fazer agora</a></div>` : ''}
    `;
    desenharHeroi();
    if (!poseTemp) fala(sem >= DIAS_APAGADO ? sorteia(FRASES.apagado) : sem >= DIAS_SONO ? sorteia(FRASES.sono) : (E.perfil.nome && Math.random() < 0.4 ? 'Olá' + nome + '!' : sorteia(FRASES.oi)));
  }

  /* ---------- treinos ---------- */
  let abaTreinos = 'grupo';
  function resumoTreino(t) {
    const ser = t.itens.reduce((s, i) => s + i.series, 0);
    return `${t.itens.length} exercícios, ${ser} séries`;
  }
  function renderTreinos() {
    const meus = E.treinos;
    let corpo = '';
    if (abaTreinos === 'grupo') {
      corpo = `<div class="grupos">${TPAD.map(t => {
        const g = grupoPor(t.g), ex = exPor(t.itens[0].ex);
        return `<button class="grupo-c" style="--cor:${g.cor}" data-a="abrirGrupo" data-id="${t.id}"><div class="mini" data-anim="${ex.id}"></div><b>${esc(g.id === 'fullbody' ? 'Full Body' : (g.curto || g.nome))}</b><small>${resumoTreino(t)}</small></button>`;
      }).join('')}</div>
      <div class="cartao"><h2>Como os treinos foram montados</h2>${CIENCIA.map(c => `<p class="sub peq" style="margin-top:8px">${esc(c)}</p>`).join('')}<p class="nota" style="text-align:left;margin:12px 0 0">Referências: Schoenfeld, Ogborn e Krieger (2017), sobre volume semanal; Schoenfeld e colaboradores (2016), sobre intervalo de descanso; Helgerud e colaboradores (2007), sobre o protocolo 4x4. São treinos genéricos e podem ser ajustados. Com dor ou lesão, procure um profissional.</p></div>`;
    } else {
      corpo = (meus.length ? meus.map(t => `<div class="cartao"><div class="treino-c"><div class="tit"><b>${esc(t.nome)}</b><span>${resumoTreino(t)}</span></div><button class="btn prim mini" data-a="iniciarTreino" data-id="${t.id}">Iniciar</button></div>
        <div class="chips">${[...new Set(t.itens.map(i => exPor(i.ex).g))].map(g => `<span class="chip">${esc(grupoPor(g).curto || grupoPor(g).nome)}</span>`).join('')}</div>
        <div class="acoes-s" style="margin-top:12px"><button class="btn mini fant" data-a="editarTreino" data-id="${t.id}">Editar</button><button class="btn mini fant" data-a="duplicarTreino" data-id="${t.id}">Duplicar</button><button class="btn mini verm" data-a="excluirTreino" data-id="${t.id}">Excluir</button></div></div>`).join('')
        : `<div class="vazio">Você ainda não tem treinos próprios.<br>Crie do zero ou duplique um treino pronto.</div>`) +
        `<button class="btn prim grande" data-a="novoTreino">Criar treino</button>`;
    }
    $('#tela-treinos').innerHTML = `<h1>Treinos</h1>
      <div class="seg" style="margin-top:10px"><button class="${abaTreinos === 'grupo' ? 'ativo' : ''}" data-a="abaTreinos" data-v="grupo">Por grupo</button><button class="${abaTreinos === 'meus' ? 'ativo' : ''}" data-a="abaTreinos" data-v="meus">Meus treinos (${meus.length})</button></div>
      ${corpo}`;
    montarAnims($('#tela-treinos'));
  }

  function telaGrupo(tid) {
    const t = treinoPor(tid), g = grupoPor(t.g);
    const lib = g.id === 'fullbody' ? [] : todosEx().filter(e => e.g === g.id);
    return topoFolha(g.id === 'fullbody' ? 'Full Body' : g.nome) + `
      <div class="cartao"><div class="linha"><h2>Treino recomendado</h2><span class="chip cor" style="background:${g.cor}">${resumoTreino(t)}</span></div>
      ${t.nota ? `<p class="sub peq" style="margin-top:4px">${esc(t.nota)}</p>` : ''}
      ${t.itens.map(i => { const ex = exPor(i.ex); return `<button class="ex-item" data-a="abrirEx" data-id="${ex.id}">${thumb(ex, true)}<div class="tit"><b>${esc(ex.nome)}</b><span>${i.series} x ${faixa(i, ex)}, descanso ${fmtDesc(i.desc)}</span></div></button>`; }).join('')}
      <div class="col" style="margin-top:12px"><button class="btn prim largo" data-a="iniciarTreino" data-id="${t.id}">Iniciar treino</button><button class="btn fant largo" data-a="duplicarTreino" data-id="${t.id}">Duplicar e editar</button></div></div>
      ${lib.length ? `<h3>Todos os exercícios de ${esc(g.nome)}</h3><div class="cartao">${lib.map(ex => `<button class="ex-item" data-a="abrirEx" data-id="${ex.id}">${thumb(ex, true)}<div class="tit"><b>${esc(ex.nome)}</b><span>${ex.proprio ? 'exercício próprio' : esc(rotuloTipo(ex))}</span></div></button>`).join('')}</div>` : ''}
      <p class="nota">Toque em um exercício para ver a animação grande e como executar.</p>`;
  }
  const rotuloTipo = ex => ({ carga: 'carga e repetições', corpo: 'peso do corpo', tempo: 'tempo', cardio: 'minutos' })[ex.tipo] || '';
  function faixa(i, ex) {
    const u = ex.tipo === 'tempo' ? ' s' : ex.tipo === 'cardio' ? ' min' : '';
    return (i.rMin === i.rMax ? i.rMin : i.rMin + ' a ' + i.rMax) + u;
  }

  function telaEx(id) {
    const ex = exPor(id), g = grupoPor(ex.g);
    const hist = historicoEx(id);
    const rec = E.recordes[id], prog = E.prog[id];
    const sec = (ex.sec || []).map(s => attrPor(s)).filter(Boolean).map(a => a.nome);
    return topoFolha(ex.nome) + `
      ${ex.a ? `<div class="anim-grande" data-anim="${ex.id}" data-vivo="1"></div>` : `<div class="anim-grande" style="display:grid;place-items:center"><div class="badge" style="width:90px;height:90px;font-size:30px;border-radius:26px;background:${g.cor}">${g.sig}</div></div>`}
      <div class="chips" style="margin-top:12px"><span class="chip cor" style="background:${g.cor}">${esc(g.nome)}</span>${sec.map(s => `<span class="chip">${esc(s)}</span>`).join('')}<span class="chip">${esc(rotuloTipo(ex))}</span></div>
      ${ex.dica ? `<div class="cartao"><h2>Como fazer</h2><p class="sub">${esc(ex.dica)}</p></div>` : ''}
      <div class="cartao"><h2>Seu histórico</h2>
        ${hist.length ? `<div class="grade2" style="margin-top:6px">
          <div class="kpi"><b>${rec ? num(rec.kg) + ' kg' : '-'}</b><span>${rec ? 'recorde, ' + rec.reps + ' reps' : 'sem recorde'}</span></div>
          <div class="kpi"><b>${prog && prog.kg ? num(prog.kg) + ' kg' : '-'}</b><span>meta do próximo</span></div></div>
          <p class="ultima">Última vez (${fmtD(hist[hist.length - 1].data)}): ${hist[hist.length - 1].series.map(s => (ex.tipo === 'carga' ? num(s.kg) + ' kg x ' : '') + s.reps).join(', ')}</p>
          ${ex.tipo === 'carga' && hist.length ? `<div class="graf" data-graf="ex"></div><p class="nota" style="margin:4px 0 0">Maior carga de cada treino. Toque nos pontos.</p>` : ''}`
        : '<p class="sub peq">Você ainda não fez este exercício. Seu progresso aparece aqui.</p>'}
      </div>
      ${ex.proprio ? `<button class="btn verm largo" data-a="excluirExProprio" data-id="${ex.id}">Excluir exercício próprio</button>` : ''}`;
  }
  function historicoEx(id) {
    const out = [];
    E.sessoes.forEach(s => (s.itens || []).forEach(i => { if (i.ex === id && i.series.length) out.push({ data: s.data, series: i.series }); }));
    return out.sort((a, b) => a.data < b.data ? -1 : 1);
  }

  /* ---------- editor de treino ---------- */
  let rascunho = null;
  function abrirEditor(t, titulo) {
    rascunho = JSON.parse(JSON.stringify(t));
    abrirFolha('editor', () => telaEditor(titulo), el => {
      const n = $('#ed-nome', el); if (n) n.oninput = () => { rascunho.nome = n.value; };
      $$('[data-campo]', el).forEach(inp => inp.onchange = () => {
        const i = rascunho.itens[+inp.dataset.i]; const k = inp.dataset.campo;
        let v = Number(String(inp.value).replace(',', '.')); if (!(v >= 0)) v = 0;
        i[k] = k === 'series' ? Math.max(1, Math.min(10, Math.round(v))) : Math.round(v);
        if (k === 'rMin' && i.rMax < i.rMin) i.rMax = i.rMin;
        if (k === 'rMax' && i.rMin > i.rMax) i.rMin = i.rMax;
      });
    });
  }
  function telaEditor(titulo) {
    const r = rascunho;
    return topoFolha(titulo || 'Editar treino') + `
      <label class="campo"><span>Nome do treino</span><input id="ed-nome" value="${esc(r.nome)}" placeholder="ex.: Treino A, Segunda" maxlength="40"></label>
      ${r.itens.length ? r.itens.map((i, k) => { const ex = exPor(i.ex); return `<div class="ed-item">
        <div class="linha"><b>${k + 1}. ${esc(ex.nome)}</b><span style="display:flex;gap:6px"><button class="icone-btn" data-a="edMover" data-i="${k}" data-d="-1" aria-label="Subir">&#8593;</button><button class="icone-btn" data-a="edMover" data-i="${k}" data-d="1" aria-label="Descer">&#8595;</button><button class="icone-btn" data-a="edRemover" data-i="${k}" aria-label="Remover" style="color:var(--vermelho)">&#10005;</button></span></div>
        <div class="ed-ctrl"><label>Séries<input type="number" inputmode="numeric" value="${i.series}" data-campo="series" data-i="${k}"></label>
        <label>${ex.tipo === 'tempo' ? 'Seg mín' : ex.tipo === 'cardio' ? 'Min' : 'Reps mín'}<input type="number" inputmode="numeric" value="${i.rMin}" data-campo="rMin" data-i="${k}"></label>
        <label>${ex.tipo === 'tempo' ? 'Seg máx' : ex.tipo === 'cardio' ? 'Min máx' : 'Reps máx'}<input type="number" inputmode="numeric" value="${i.rMax}" data-campo="rMax" data-i="${k}"></label></div>
        <div class="ed-ctrl" style="grid-template-columns:1fr"><label>Descanso (segundos)<input type="number" inputmode="numeric" value="${i.desc}" data-campo="desc" data-i="${k}"></label></div></div>`; }).join('')
        : '<div class="vazio">Nenhum exercício ainda.</div>'}
      <button class="btn fant largo" data-a="edAdicionar">+ Adicionar exercício</button>
      <div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="edSalvar">Salvar treino</button></div></div>`;
  }
  let filtroPick = 'todos', buscaPick = '';
  function telaPicker() {
    const lista = todosEx().filter(e => (filtroPick === 'todos' || e.g === filtroPick) && (!buscaPick || e.nome.toLowerCase().includes(buscaPick.toLowerCase())));
    return topoFolha('Adicionar exercício') + `
      <input class="busca" id="pk-busca" placeholder="Buscar exercício" value="${esc(buscaPick)}">
      <div class="filtros"><button class="${filtroPick === 'todos' ? 'ativo' : ''}" data-a="pkFiltro" data-v="todos">Todos</button>${GRUPOS.map(g => `<button class="${filtroPick === g.id ? 'ativo' : ''}" data-a="pkFiltro" data-v="${g.id}">${esc(g.curto || g.nome)}</button>`).join('')}</div>
      <div class="cartao">${lista.length ? lista.map(ex => `<button class="ex-item" data-a="pkEscolher" data-id="${ex.id}">${thumb(ex)}<div class="tit"><b>${esc(ex.nome)}</b><span>${esc(grupoPor(ex.g).nome)}</span></div><span class="chip">+</span></button>`).join('') : '<div class="vazio">Nada encontrado.</div>'}</div>
      <button class="btn fant largo" data-a="novoExProprio">Criar exercício próprio</button>`;
  }
  function telaExProprio() {
    return topoFolha('Exercício próprio') + `
      <label class="campo"><span>Nome</span><input id="ep-nome" maxlength="40" placeholder="ex.: Remada cavalinho"></label>
      <label class="campo"><span>Grupo muscular</span><select id="ep-g">${GRUPOS.map(g => `<option value="${g.id}">${esc(g.nome)}</option>`).join('')}</select></label>
      <label class="campo"><span>Tipo</span><select id="ep-tipo"><option value="carga">Carga e repetições</option><option value="corpo">Peso do corpo</option><option value="tempo">Tempo (segundos)</option><option value="cardio">Cardio (minutos)</option></select></label>
      <p class="sub peq">Exercícios próprios usam o ícone do grupo muscular, sem animação.</p>
      <div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="salvarExProprio">Criar e adicionar</button></div></div>`;
  }

  /* ---------- sessão (treino ao vivo) ---------- */
  function ultimaSeries(exId) { const h = historicoEx(exId); return h.length ? h[h.length - 1].series : null; }
  function iniciarSessao(tid) {
    const t = treinoPor(tid);
    if (!t) return;
    E.sessaoAtiva = {
      treinoId: t.id, nome: t.nome, inicio: Date.now(),
      itens: t.itens.map(i => {
        const ex = exPor(i.ex), ult = ultimaSeries(i.ex), pg = E.prog[i.ex];
        const series = [];
        for (let k = 0; k < i.series; k++) {
          const u = ult && (ult[k] || ult[ult.length - 1]);
          let kg = pg && pg.kg ? pg.kg : u ? u.kg : 0;
          let reps = ex.tipo === 'carga' ? (pg && pg.kg ? i.rMin : u ? u.reps : i.rMin) : (u ? u.reps : i.rMin);
          series.push({ kg: kg || 0, reps: reps || i.rMin, feito: false });
        }
        return { ex: i.ex, rMin: i.rMin, rMax: i.rMax, desc: i.desc, series };
      })
    };
    salvar();
    abrirSessao();
  }
  let timerCron = null, wakeLock = null;
  function abrirSessao() {
    fecharTodasFolhas();
    abrirFolha('sessao', telaSessao, el => {
      $$('[data-s]', el).forEach(inp => {
        inp.onfocus = () => inp.select();
        inp.onchange = () => {
          const [i, k, campo] = inp.dataset.s.split('.');
          let v = Number(String(inp.value).replace(',', '.'));
          if (!(v >= 0)) v = 0;
          E.sessaoAtiva.itens[+i].series[+k][campo] = campo === 'kg' ? Math.round(v * 4) / 4 : Math.round(v);
          salvar();
        };
      });
    });
    clearInterval(timerCron);
    timerCron = setInterval(() => { const c = $('#cron'); if (c && E.sessaoAtiva) c.textContent = fmtDur((Date.now() - E.sessaoAtiva.inicio) / 1000); else if (!E.sessaoAtiva) clearInterval(timerCron); }, 1000);
    try { if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wakeLock = w; }).catch(() => { }); } catch (e) { }
  }
  function telaSessao() {
    const S = E.sessaoAtiva;
    if (!S) return topoFolha('Treino') + '<div class="vazio">Nenhum treino em andamento.</div>';
    const tot = S.itens.reduce((s, i) => s + i.series.length, 0), feitas = S.itens.reduce((s, i) => s + i.series.filter(x => x.feito).length, 0);
    return topoFolha(S.nome, `<span class="cron" id="cron">${fmtDur((Date.now() - S.inicio) / 1000)}</span>`) + `
      <div class="barra" style="margin:2px 0 4px"><i style="width:${tot ? feitas / tot * 100 : 0}%;background:var(--verde)"></i></div>
      <p class="sub peq">${feitas} de ${tot} séries. Confira o peso e as reps de cada série e toque no ✓ ao terminar.</p>
      ${S.itens.map((it, i) => {
        const ex = exPor(it.ex), pg = E.prog[it.ex], ult = ultimaSeries(it.ex);
        const cK = ex.tipo === 'carga' || ex.tipo === 'corpo';
        const lbR = ex.tipo === 'tempo' ? 'Seg' : ex.tipo === 'cardio' ? 'Min' : 'Reps';
        const todas = it.series.length && it.series.every(s => s.feito);
        return `<div class="ex-sess ${todas ? 'feito' : ''}">
          <div class="cab"><button style="border:0;padding:0;background:none" data-a="abrirEx" data-id="${ex.id}">${thumb(ex)}</button><div class="tit"><b>${esc(ex.nome)}</b><span>${it.series.length} x ${faixa(it, ex)}, descanso ${fmtDesc(it.desc)}</span></div></div>
          ${pg && pg.kg && ex.tipo === 'carga' ? `<span class="meta-chip">Meta de hoje: ${num(pg.kg)} kg</span>` : ''}
          ${ult ? `<p class="ultima">Última vez: ${ult.map(s => (ex.tipo === 'carga' ? num(s.kg) + 'x' : '') + s.reps).join(', ')}</p>` : ''}
          <div class="series"><div class="serie cab-s"><span class="n">#</span><span>${cK ? (ex.tipo === 'corpo' ? 'Extra kg' : 'Kg') : ''}</span><span>${lbR}</span><span></span></div>
          ${it.series.map((s, k) => `<div class="serie ${s.feito ? 'feita' : ''}"><span class="n">${k + 1}</span>
            ${cK ? `<input type="number" inputmode="decimal" step="0.5" value="${s.kg}" data-s="${i}.${k}.kg" aria-label="Carga">` : '<span></span>'}
            <input type="number" inputmode="numeric" value="${s.reps}" data-s="${i}.${k}.reps" aria-label="${lbR}">
            <button class="ok" data-a="marcarSerie" data-i="${i}" data-k="${k}" aria-label="Concluir série"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="${s.feito ? '#062514' : '#6f6886'}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`).join('')}
          </div>
          <div class="acoes-s"><button class="btn mini fant" data-a="addSerie" data-i="${i}">+ Série</button><button class="btn mini fant" data-a="remSerie" data-i="${i}">− Série</button></div>
        </div>`;
      }).join('')}
      <button class="btn fant largo" data-a="addExSessao">+ Adicionar exercício</button>
      <button class="btn verm largo" style="margin-top:10px" data-a="descartarSessao">Descartar treino</button>
      <div class="rodape-fixo"><div class="dentro"><button class="btn verde grande" data-a="finalizarSessao">Finalizar treino</button></div></div>`;
  }

  /* cronômetro de descanso */
  let descFim = 0, descTotal = 0, descTimer = null;
  function iniciarDescanso(seg) {
    if (!seg) return;
    descTotal = seg; descFim = Date.now() + seg * 1000;
    clearInterval(descTimer);
    const el = $('#descanso'); el.classList.remove('oculto');
    const tick = () => {
      const r = Math.ceil((descFim - Date.now()) / 1000);
      if (r <= 0) { el.classList.add('oculto'); clearInterval(descTimer); vibrar([200, 100, 200]); bip(); toast('Descanso acabou. Próxima série!'); return; }
      el.innerHTML = `<div class="t">${fmtDur(r)}</div><div style="flex:1"><div class="lb">DESCANSO</div><div class="barra"><i style="width:${(1 - r / descTotal) * 100}%;background:var(--amarelo)"></i></div></div><button class="btn mini fant" data-a="descMais" data-v="-15">−15</button><button class="btn mini fant" data-a="descMais" data-v="15">+15</button><button class="btn mini" data-a="descPular">Pular</button>`;
    };
    tick(); descTimer = setInterval(tick, 500);
  }
  function pararDescanso() { clearInterval(descTimer); $('#descanso').classList.add('oculto'); }

  function finalizarSessao() {
    const S = E.sessaoAtiva;
    const itens = S.itens.map(it => ({ ex: it.ex, rMin: it.rMin, rMax: it.rMax, series: it.series.filter(s => s.feito).map(s => ({ kg: s.kg, reps: s.reps })), total: it.series.length })).filter(i => i.series.length);
    if (!itens.length) { toast('Marque pelo menos uma série como feita.'); return; }
    const nvAntes = nivelGeral();
    if (E.xpDia.data !== hoje()) E.xpDia = { data: hoje(), total: 0, grupos: {} };
    const bruto = {};
    const soma = (a, v) => { bruto[a] = (bruto[a] || 0) + v; };
    const recordes = [], progs = [];
    let volume = 0, nRec = 0;
    for (const it of itens) {
      const ex = exPor(it.ex), attr = grupoPor(ex.g).attr;
      for (const s of it.series) {
        if (ex.tipo === 'cardio') soma('cardio', Math.min(s.reps, 60) * XP_MIN);
        else { soma(attr, XP_SERIE); (ex.sec || []).forEach(a => { if (attrPor(a)) soma(a, XP_SEC); }); }
        if (ex.tipo === 'carga') volume += s.kg * s.reps;
      }
      if (ex.tipo === 'carga' || ex.tipo === 'corpo') {
        const melhor = it.series.reduce((b, s) => { const e = s.kg * (1 + s.reps / 30); return e > b.e ? { e, kg: s.kg, reps: s.reps } : b; }, { e: 0 });
        const ant = E.recordes[it.ex];
        if (ex.tipo === 'carga' && melhor.kg > 0 && (!ant || melhor.e > ant.e + 0.01)) {
          if (ant) { recordes.push(ex.nome); if (nRec < MAX_REC) { soma(attr, BONUS_REC); nRec++; } }
          E.recordes[it.ex] = { e: melhor.e, kg: melhor.kg, reps: melhor.reps, data: hoje() };
        }
        // progressão dupla
        const completas = it.series.length >= it.total && it.series.every(s => s.reps >= it.rMax);
        const maxKg = Math.max(...it.series.map(s => s.kg));
        if (ex.tipo === 'carga' && completas && maxKg > 0) {
          const nk = Math.round((maxKg + (ex.inc || 2.5)) * 4) / 4;
          E.prog[it.ex] = { kg: nk, data: hoje() };
          progs.push(ex.nome + ': ' + num(nk) + ' kg');
        } else if (ex.tipo === 'carga' && maxKg > 0) {
          E.prog[it.ex] = { kg: maxKg, data: hoje() };
        }
      }
    }
    const xp = {}; let total = 0, cortou = false, restoDia = TETO_DIA - E.xpDia.total;
    for (const [a, v] of Object.entries(bruto)) {
      const r = Math.max(0, Math.min(v, TETO_GRUPO - (E.xpDia.grupos[a] || 0), restoDia));
      if (r < v) cortou = true;
      if (r > 0) { xp[a] = r; E.xp[a] += r; E.xpDia.grupos[a] = (E.xpDia.grupos[a] || 0) + r; restoDia -= r; total += r; }
    }
    E.xpDia.total += total;
    const dur = Math.round((Date.now() - S.inicio) / 1000);
    E.sessoes.push({ id: uid(), data: hoje(), tipo: 'treino', treinoId: S.treinoId, nome: S.nome, dur, itens: itens.map(i => ({ ex: i.ex, series: i.series })), xp, volume: Math.round(volume), recordes });
    E.sessaoAtiva = null;
    salvar();
    pararDescanso(); clearInterval(timerCron);
    try { wakeLock && wakeLock.release(); } catch (e) { }
    fecharTodasFolhas(); ir('heroi');
    reagir('comemora', 'comemora', recordes.length ? 'Recorde pessoal!' : sorteia(FRASES.treino), 3200);
    confete(recordes.length ? 70 : 40); vibrar(80);
    const nvDepois = nivelGeral();
    const novos = ITENS.filter(i => i.nivel > nvAntes && i.nivel <= nvDepois);
    setTimeout(() => {
      abrirModal(`<div class="mini-heroi">${H.render(opcoesHeroi({ pose: 'comemora', humor: 'comemora', apagado: false }))}</div>
        <h2>${nvDepois > nvAntes ? 'Nível ' + nvDepois + '!' : 'Treino concluído!'}</h2>
        <p class="sub">${fmtDur(dur)} de treino, ${itens.reduce((s, i) => s + i.series.length, 0)} séries${volume ? ', ' + num(volume, 0) + ' kg levantados' : ''}</p>
        <div class="tags"><span class="tag ouro">+${total} XP</span>${Object.entries(xp).map(([a, v]) => `<span class="tag">${attrPor(a).nome} +${v}</span>`).join('')}</div>
        ${recordes.length ? `<div class="info" style="color:#ffe39a;background:#2a2412;border-color:#5a4a1c">Recorde em: ${esc(recordes.join(', '))}</div>` : ''}
        ${progs.length ? `<div class="info">Próximo treino, aumente a carga em: ${esc(progs.join('; '))}</div>` : ''}
        ${novos.map(i => `<div class="info" style="color:#ffd0a8;background:#2a1c12;border-color:#5a3a1c">Desbloqueado: ${esc(i.nome)}</div>`).join('')}
        ${cortou ? '<p class="sub peq" style="margin-top:8px">Parte do XP passou do teto diário e não contou.</p>' : ''}
        <div class="col"><button class="btn prim largo" data-fechar>Show!</button></div>`);
    }, 1300);
  }

  /* ---------- progresso ---------- */
  let exGraf = null;
  function grafico(el, pts, unid) {
    if (!el) return;
    if (!pts.length) { el.innerHTML = '<div class="vazio">Sem dados ainda.</div>'; return; }
    const W = 320, Hh = 190, pl = 40, pr = 12, pt = 14, pb = 26;
    const ys = pts.map(p => p.y);
    let mn = Math.min(...ys), mx = Math.max(...ys);
    if (mn === mx) { mn -= 1; mx += 1; }
    const folga = (mx - mn) * 0.15; mn -= folga; mx += folga;
    const X = i => pts.length === 1 ? (pl + W - pr) / 2 : pl + i * (W - pl - pr) / (pts.length - 1);
    const Y = v => pt + (1 - (v - mn) / (mx - mn)) * (Hh - pt - pb);
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Gráfico">`;
    for (let k = 0; k <= 3; k++) {
      const v = mn + (mx - mn) * k / 3, y = Y(v);
      s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#2f2a40" stroke-width="1"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#a59ebb" font-family="Nunito" font-weight="700">${num(v, 1)}</text>`;
    }
    const idxs = pts.length <= 6 ? pts.map((_, i) => i) : [0, Math.floor(pts.length / 2), pts.length - 1];
    idxs.forEach(i => { s += `<text x="${X(i)}" y="${Hh - 6}" text-anchor="middle" font-size="10.5" fill="#a59ebb" font-family="Nunito" font-weight="700">${pts[i].l}</text>`; });
    if (pts.length > 1) s += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(p.y).toFixed(1)).join(' ')}" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    pts.forEach((p, i) => { s += `<circle cx="${X(i)}" cy="${Y(p.y)}" r="4.5" fill="#ff8a3d" stroke="#1b1826" stroke-width="2"/>`; });
    pts.forEach((p, i) => { s += `<rect x="${X(i) - 14}" y="0" width="28" height="${Hh}" fill="transparent" data-gi="${i}"/>`; });
    s += '</svg><div class="dica oculto"></div>';
    el.innerHTML = s;
    const dica = $('.dica', el);
    const mostrar = i => {
      const r = el.getBoundingClientRect(), p = pts[i];
      dica.textContent = p.l + ': ' + num(p.y) + ' ' + unid + (p.d ? ' (' + p.d + ')' : '');
      dica.style.left = Math.max(60, Math.min(r.width - 60, X(i) / W * r.width)) + 'px';
      dica.style.top = (Y(p.y) / Hh * 190) + 'px';
      dica.classList.remove('oculto');
    };
    $$('[data-gi]', el).forEach(rc => { rc.addEventListener('pointerenter', () => mostrar(+rc.dataset.gi)); rc.addEventListener('click', () => mostrar(+rc.dataset.gi)); });
    el.addEventListener('pointerleave', () => dica.classList.add('oculto'));
  }
  function pontosEx(id) {
    return historicoEx(id).map(h => { const b = h.series.reduce((m, s) => s.kg > m.kg ? s : m, { kg: 0, reps: 0 }); return { l: fmtD(h.data), y: b.kg, d: b.reps + ' reps' }; });
  }
  function renderProgresso() {
    const mes = hoje().slice(0, 7);
    const treinosMes = new Set(E.sessoes.filter(s => s.data.startsWith(mes)).map(s => s.data)).size;
    const seg = segunda(hoje());
    const volSem = E.sessoes.filter(s => s.data >= seg).reduce((v, s) => v + (s.volume || 0), 0);
    const nRec = Object.keys(E.recordes).length;
    const dias = diasTreino();
    const semanas = 16, ini = somaDias(seg, -7 * (semanas - 1));
    let mapa = '';
    for (let i = 0; i < semanas * 7; i++) {
      const d = somaDias(ini, i), fut = d > hoje();
      const n = E.sessoes.filter(s => s.data === d).length;
      mapa += `<i class="${fut ? '' : n >= 2 ? 't3' : n === 1 ? 't2' : ''} ${d === hoje() ? 'hoje' : ''}" ${fut ? 'style="opacity:.25"' : ''}></i>`;
    }
    const comHist = [...new Set(E.sessoes.flatMap(s => (s.itens || []).map(i => i.ex)))].filter(id => exPor(id).tipo === 'carga');
    if (!exGraf || !comHist.includes(exGraf)) exGraf = comHist[0] || null;
    const lista = E.sessoes.slice().reverse().slice(0, 30);
    $('#tela-progresso').innerHTML = `<h1>Progresso</h1>
      <div class="kpis" style="margin-top:10px">
        <div class="kpi"><b>${treinosMes}</b><span>treinos neste mês</span></div>
        <div class="kpi"><b>${new Set(E.sessoes.map(s => s.data)).size}</b><span>treinos no total</span></div>
        <div class="kpi"><b>${num(volSem / 1000, 1)} t</b><span>levantadas na semana</span></div>
        <div class="kpi"><b>${nRec}</b><span>exercícios com recorde</span></div>
      </div>
      <div class="cartao"><div class="linha"><h2>Frequência</h2><small>últimas 16 semanas</small></div><div class="mapa">${mapa}</div></div>
      <div class="cartao"><h2>Carga por exercício</h2>
        ${comHist.length ? `<select class="busca" id="sel-ex">${comHist.map(id => `<option value="${id}" ${id === exGraf ? 'selected' : ''}>${esc(exPor(id).nome)}</option>`).join('')}</select><div class="graf" id="graf-ex"></div><p class="nota" style="margin:4px 0 0">Maior carga em cada treino (kg).</p>` : '<div class="vazio">Faça um treino com carga para ver a evolução.</div>'}
      </div>
      <div class="cartao"><div class="linha"><h2>Peso corporal</h2><button class="btn mini" data-a="abrirMedidas">Medidas</button></div><div class="graf" id="graf-peso"></div></div>
      <div class="cartao"><h2>Massa muscular</h2><div class="graf" id="graf-mus"></div></div>
      <div class="cartao"><h2>Histórico</h2>${lista.length ? lista.map(s => { const d = dataDe(s.data); return `<div class="hist-s"><div class="d"><b>${pad(d.getDate())}</b><span>${DIAS_SEM[d.getDay()]}</span></div><div class="tit"><b>${esc(s.nome || 'Treino rápido')}</b><span>${s.dur ? fmtDur(s.dur) + ', ' : ''}+${Object.values(s.xp || {}).reduce((a, b) => a + b, 0)} XP${s.volume ? ', ' + num(s.volume, 0) + ' kg' : ''}${s.recordes && s.recordes.length ? ', ' + s.recordes.length + ' recorde' + (s.recordes.length > 1 ? 's' : '') : ''}</span></div><button class="icone-btn" data-a="excluirSessao" data-id="${s.id}" aria-label="Apagar" style="color:var(--fraco)">&#10005;</button></div>`; }).join('') : '<div class="vazio">Nenhum treino registrado ainda.</div>'}</div>`;
    if (exGraf) grafico($('#graf-ex'), pontosEx(exGraf), 'kg');
    grafico($('#graf-peso'), E.medidas.map(m => ({ l: fmtD(m.data), y: m.peso })), 'kg');
    grafico($('#graf-mus'), E.medidas.filter(m => m.musculoKg).map(m => ({ l: fmtD(m.data), y: m.musculoKg })), 'kg');
    const sel = $('#sel-ex'); if (sel) sel.onchange = () => { exGraf = sel.value; grafico($('#graf-ex'), pontosEx(exGraf), 'kg'); };
  }

  /* ---------- amigos ---------- */
  let abaRank = 'semana';
  function meuResumo() {
    const st = statusSemana(), au = auraInfo();
    return { v: 1, id: E.perfil.id || (E.perfil.id = uid()), n: E.perfil.nome || 'Herói', av: E.avatar, nv: nivelGeral(), xp: xpTotal(), sem: st.atual, sid: segunda(hoje()), seq: st.semanas, au: au.pts, ae: au.estagio, tot: new Set(E.sessoes.map(s => s.data)).size, ts: hoje() };
  }
  const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  const meuCodigo = () => 'FORJA-' + b64e(JSON.stringify(meuResumo()));
  const meuLink = () => location.origin + location.pathname + '#amigo=' + meuCodigo();
  function lerCodigo(txt) {
    try {
      const m = String(txt).match(/FORJA-([A-Za-z0-9_-]+)/);
      if (!m) return null;
      const o = JSON.parse(b64d(m[1]));
      if (!o || o.v !== 1 || !o.id) return null;
      return o;
    } catch (e) { return null; }
  }
  function adicionarAmigo(o) {
    if (o.id === E.perfil.id) { toast('Esse é o seu próprio código.'); return; }
    const i = E.amigos.findIndex(a => a.id === o.id);
    if (i >= 0) E.amigos[i] = o; else E.amigos.push(o);
    salvar();
    toast(i >= 0 ? o.n + ' foi atualizado.' : o.n + ' entrou no seu ranking!');
  }
  function renderAmigos() {
    const eu = Object.assign(meuResumo(), { eu: true });
    const seg = segunda(hoje());
    const todos = [eu].concat(E.amigos);
    const val = p => abaRank === 'semana' ? (p.sid === seg ? p.sem : 0) : abaRank === 'nivel' ? p.nv : abaRank === 'seq' ? p.seq : p.au;
    const rot = { semana: 'treinos', nivel: 'nível', seq: 'semanas', aura: 'dias' }[abaRank];
    todos.sort((a, b) => val(b) - val(a) || b.xp - a.xp);
    $('#tela-amigos').innerHTML = `<h1>Amigos</h1>
      <p class="sub">Compita com quem treina com você. Cada um compartilha o próprio código.</p>
      <div class="cartao"><div class="perfil-cab"><div class="rosto">${rosto(E.avatar)}</div><div style="flex:1"><b>${esc(E.perfil.nome || 'Herói')}</b><span class="sub peq">Nível ${eu.nv}, ${eu.sem} treino${eu.sem === 1 ? '' : 's'} nesta semana</span></div></div>
        <div class="col" style="margin-top:12px"><button class="btn prim largo" data-a="compartilharCodigo">Enviar meu código</button><button class="btn fant largo" data-a="colarAmigo">Adicionar amigo</button></div></div>
      <div class="seg"><button class="${abaRank === 'semana' ? 'ativo' : ''}" data-a="abaRank" data-v="semana">Semana</button><button class="${abaRank === 'nivel' ? 'ativo' : ''}" data-a="abaRank" data-v="nivel">Nível</button><button class="${abaRank === 'seq' ? 'ativo' : ''}" data-a="abaRank" data-v="seq">Sequência</button><button class="${abaRank === 'aura' ? 'ativo' : ''}" data-a="abaRank" data-v="aura">Aura</button></div>
      <div class="cartao">${todos.map((p, i) => {
        const velho = !p.eu && difDias(hoje(), p.ts) >= 3;
        return `<div class="rank ${p.eu ? 'eu' : ''}"><div class="pos ${i === 0 ? 'p1' : ''}">${i + 1}</div><div class="rosto">${rosto(p.av)}</div><div class="tit"><b>${esc(p.n)}${p.eu ? ' (você)' : ''}</b><span>${p.eu ? 'agora' : velho ? 'atualizado há ' + difDias(hoje(), p.ts) + ' dias' : 'atualizado em ' + fmtD(p.ts)}</span></div><div style="text-align:right"><div class="val">${val(p)}</div><span class="sub peq">${rot}</span></div>${p.eu ? '' : `<button class="icone-btn" data-a="removerAmigo" data-id="${esc(p.id)}" style="margin-left:4px;color:var(--fraco)" aria-label="Remover">&#10005;</button>`}</div>`;
      }).join('')}
      ${E.amigos.length ? '' : '<div class="vazio">Adicione amigos para começar a disputa.</div>'}</div>
      <div class="info">Desafio da semana: quem fizer mais treinos até domingo vence. Para atualizar o placar, peça para cada amigo enviar o código de novo.</div>
      <p class="nota">Sem servidor e sem custo: o código leva só nome, avatar, nível e números de treino. Quando quiser placar automático, dá para ligar um banco de dados gratuito.</p>`;
  }

  /* ---------- perfil ---------- */
  function renderPerfil() {
    const au = auraInfo();
    $('#tela-perfil').innerHTML = `
      <div class="cartao"><div class="perfil-cab"><div class="rosto">${rosto(E.avatar)}</div><div><b>${esc(E.perfil.nome || 'Herói')}</b><span class="sub peq">Nível ${nivelGeral()}, ${xpTotal()} XP no total</span></div></div></div>
      <div class="lista-menu">
        <button data-a="abrirAvatar"><span class="ic" style="background:#2a1c12">&#9786;</span><span>Criar avatar</span><small>rosto e barba</small></button>
        <button data-a="abrirMedidas"><span class="ic" style="background:#16243a">&#9878;</span><span>Corpo e medidas</span><small>${medidaAtual() ? num(medidaAtual().peso) + ' kg' : 'cadastrar'}</small></button>
        <button data-a="abrirRoupas"><span class="ic" style="background:#251a33">&#10022;</span><span>Guarda-roupa</span><small>itens</small></button>
        <button data-a="abrirAuras"><span class="ic" style="background:#33150f">&#128293;</span><span>Evolução da aura</span><small>${au.pts} dias</small></button>
        <button data-a="abrirBackup"><span class="ic" style="background:#14261c">&#8645;</span><span>Backup</span><small>${E.ultimoBackup ? fmtD(E.ultimoBackup) : 'nunca'}</small></button>
      </div>
      <div class="cartao"><h2>Nome</h2><label class="campo" style="margin:0"><input id="pf-nome" value="${esc(E.perfil.nome)}" maxlength="24" placeholder="Seu nome"></label></div>
      <div class="cartao"><h2>Meta semanal</h2><div class="seg">${[3, 4, 5].map(n => `<button class="${E.perfil.metaSemanal === n ? 'ativo' : ''}" data-a="meta" data-v="${n}">${n} treinos</button>`).join('')}</div>
        <p class="sub peq" style="margin-top:8px">A sequência conta semanas cumpridas, para respeitar o descanso. A aura exige pelo menos 3 treinos por semana.</p></div>
      <button class="btn verm largo" data-a="zerar">Apagar todos os dados</button>
      <p class="nota">Forja v2. Seus dados ficam só neste aparelho.</p>`;
    const n = $('#pf-nome'); n.onchange = () => { E.perfil.nome = n.value.trim(); salvar(); toast('Nome salvo.'); renderAba(); };
  }

  function telaAvatar(titulo, botao) {
    const av = E.avatar, O = H.OPCOES;
    const ops = (k, lista) => `<div class="opcoes">${lista.map(([id, nm]) => `<button class="${av[k] === id ? 'ativo' : ''}" data-a="av" data-k="${k}" data-v="${id}">${nm}</button>`).join('')}</div>`;
    const cores = (k, lista) => `<div class="opcoes cores">${lista.map(c => `<button class="${av[k] === c.id ? 'ativo' : ''}" style="background:${c.c}" data-a="av" data-k="${k}" data-v="${c.id}" aria-label="${c.nome}" title="${c.nome}"></button>`).join('')}</div>`;
    return (titulo === false ? '' : topoFolha(titulo || 'Criar avatar', '<button class="btn mini fant" data-a="avSortear">Sortear</button>')) + `
      <div class="av-prev" id="av-prev">${H.render(opcoesHeroi({ pose: 'idle', humor: 'feliz', apagado: false, aura: 0 }))}</div>
      <h3>Tom de pele</h3>${cores('pele', H.PELES)}
      <h3>Cabelo</h3>${ops('cabelo', O.cabelo)}
      <h3>Cor do cabelo</h3>${cores('corCabelo', H.CORES_CABELO)}
      <h3>Olhos</h3>${cores('olhos', H.CORES_OLHO)}
      <h3>Sobrancelha</h3>${ops('sobrancelha', O.sobrancelha)}
      <h3>Bigode</h3>${ops('bigode', O.bigode)}
      <h3>Barba</h3>${ops('barba', O.barba)}
      <h3>Cor da barba</h3>${cores('corBarba', H.CORES_CABELO)}
      <h3>Óculos</h3>${ops('oculos', O.oculos)}
      ${botao ? '' : '<div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="voltar">Pronto</button></div></div>'}`;
  }

  function telaMedidas() {
    const m = medidaAtual(), c = m ? H.corpoDeMedidas(m) : null;
    return topoFolha('Corpo e medidas') + `
      <p class="sub">O corpo do herói é calculado só com as suas medidas reais. Meça a cada 2 a 4 semanas, no mesmo horário e em jejum.</p>
      ${m ? `<div class="grade2" style="margin-top:12px"><div class="kpi"><b>${num(m.peso)} kg</b><span>peso</span></div><div class="kpi"><b>${m.altura} cm</b><span>altura</span></div><div class="kpi"><b>${m.musculoKg ? num(m.musculoKg) + ' kg' : '-'}</b><span>massa muscular</span></div><div class="kpi"><b>${num(c.pctM)}%</b><span>do peso em músculo</span></div></div>` : ''}
      <div class="cartao"><h2>Nova medição</h2>
        <label class="campo"><span>Peso (kg)</span><input id="md-peso" type="number" inputmode="decimal" step="0.1" placeholder="ex.: 78,5"></label>
        <label class="campo"><span>Altura (cm)</span><input id="md-alt" type="number" inputmode="numeric" value="${m ? m.altura : ''}" placeholder="ex.: 178"></label>
        <label class="campo"><span>Massa muscular</span><div style="display:flex;gap:8px"><input id="md-mus" type="number" inputmode="decimal" step="0.1" placeholder="ex.: 34,2" style="flex:1"><select id="md-un" style="width:90px"><option value="kg">kg</option><option value="pct">%</option></select></div></label>
        <button class="btn azul largo" data-a="salvarMedida">Salvar medição</button></div>
      <div class="cartao"><h2>Prévia</h2><p class="sub peq">Arraste para ver como o herói muda. Não salva nada.</p>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;margin-top:8px">
          <div class="av-prev" style="height:190px" id="pv-heroi"></div>
          <div><label class="campo"><span>Massa muscular <b id="pv-m-t"></b></span><input type="range" id="pv-m" min="28" max="50" step="0.5" value="${c ? Math.round(c.pctM * 2) / 2 : 36}" style="width:100%;accent-color:#ff8a3d"></label>
          <label class="campo"><span>Peso <b id="pv-p-t"></b></span><input type="range" id="pv-p" min="50" max="130" step="1" value="${m ? Math.round(m.peso) : 78}" style="width:100%;accent-color:#ff8a3d"></label></div></div></div>
      <div class="cartao"><h2>Histórico</h2>${E.medidas.length ? E.medidas.slice().reverse().map(x => `<div class="hist-s"><div class="tit"><b>${fmtDA(x.data)}</b><span>${num(x.peso)} kg${x.musculoKg ? ', ' + num(x.musculoKg) + ' kg de músculo' : ''}</span></div><button class="icone-btn" data-a="apagarMedida" data-id="${x.data}" style="color:var(--fraco)">&#10005;</button></div>`).join('') : '<div class="vazio">Nenhuma medição ainda.</div>'}</div>`;
  }
  function previaMedidas(el) {
    const pm = +$('#pv-m', el).value, pp = +$('#pv-p', el).value;
    $('#pv-m-t', el).textContent = num(pm) + '%'; $('#pv-p-t', el).textContent = pp + ' kg';
    const alt = (medidaAtual() && medidaAtual().altura) || 175;
    $('#pv-heroi', el).innerHTML = H.render(opcoesHeroi({ corpo: H.corpoDeMedidas({ peso: pp, altura: alt, musculoKg: pp * pm / 100 }), aura: 0, pose: 'flex', humor: 'feliz', apagado: false }));
  }

  function telaRoupas() {
    const nv = nivelGeral();
    const grade = tipo => `<div class="grade-itens">${ITENS.filter(i => i.tipo === tipo).map(i => { const livre = nv >= i.nivel; return `<button class="item-g ${E.equip[tipo] === i.id ? 'sel' : ''} ${livre ? '' : 'trava'}" data-a="equipar" data-id="${i.id}"><span class="bola" style="background:${i.cor}"></span>${esc(i.nome)}${livre ? '' : `<small>nível ${i.nivel}</small>`}</button>`; }).join('')}</div>`;
    return topoFolha('Guarda-roupa') + `<div class="av-prev" style="height:240px">${H.render(opcoesHeroi({ pose: 'idle', humor: 'feliz', apagado: false }))}</div>
      <h3>Roupas</h3>${grade('roupa')}<h3>Acessórios</h3>${grade('acessorio')}<h3>Cenários</h3>${grade('cenario')}
      <p class="nota">Novos itens são liberados ao subir de nível.</p>`;
  }
  function telaAuras() {
    const au = auraInfo();
    return topoFolha('Evolução da aura') + `
      <div class="cartao"><div class="linha"><h2>${au.pts} dias de aura</h2><small>${au.estagio ? H.AURAS[au.estagio].nome : 'sem aura ainda'}</small></div>
      <p class="sub peq" style="margin-top:6px">Cada semana com pelo menos 3 treinos soma 7 dias. Semana abaixo disso tira dias: 2 treinos tiram 2, 1 treino tira 4 e nenhum treino tira 7. Os dias de aura nunca ficam negativos.</p></div>
      <div class="grade3">${H.AURAS.slice(1).map((a, i) => `<button class="aura-item ${au.estagio >= i + 1 ? 'ating' : ''}" data-a="previaAura" data-v="${i + 1}"><div class="bola" style="background:radial-gradient(circle,${a.brilho},${a.a} 50%,${a.b})"></div>${esc(a.nome.replace('Aura ', ''))}<small>${a.rotulo}</small></button>`).join('')}</div>
      <p class="nota">Toque em uma aura para ver no seu herói.</p>`;
  }
  function telaBackup() {
    return topoFolha('Backup') + `<p class="sub">Seus dados ficam só neste aparelho. Faça backup para não perder o progresso se trocar de celular ou limpar o navegador.</p>
      <div class="col" style="margin-top:14px"><button class="btn prim largo" data-a="exportar">Exportar arquivo</button><button class="btn fant largo" data-a="copiarBackup">Copiar backup como texto</button>
      <label class="btn fant largo" style="position:relative;overflow:hidden">Importar arquivo<input type="file" id="in-arq" accept=".json,application/json" style="position:absolute;inset:0;opacity:0"></label>
      <button class="btn fant largo" data-a="colarBackup">Colar backup de texto</button></div>
      <p class="nota">Último backup: ${E.ultimoBackup ? fmtDA(E.ultimoBackup) : 'nunca'}.</p>`;
  }
  function pacote() { return JSON.stringify({ app: 'forja', versao: 2, exportadoEm: new Date().toISOString(), dados: E }); }
  function marcarBackup() { E.ultimoBackup = hoje(); salvar(); redesenharTopo(); }
  async function importar(txt) {
    let o; try { o = JSON.parse(txt); } catch (e) { return toast('Esse conteúdo não é um backup válido.'); }
    const d = o && o.app === 'forja' && o.dados && o.dados.app === 'forja' ? o.dados : null;
    if (!d) return toast('Esse arquivo não é um backup do Forja.');
    if (!(await confirmar('Substituir os dados atuais pelo backup de ' + (o.exportadoEm ? fmtDA(o.exportadoEm.slice(0, 10)) : 'data desconhecida') + '?', 'Restaurar', true))) return;
    E = migrar(d); salvar(); fecharTodasFolhas(); ir('heroi'); reagir('comemora', 'comemora', 'Voltei! Tudo restaurado.', 2600);
  }

  /* ---------- onboarding ---------- */
  let passoOnb = 0;
  function telaOnb() {
    const passos = `<div class="passos">${[0, 1, 2].map(i => `<i class="${i <= passoOnb ? 'on' : ''}"></i>`).join('')}</div>`;
    if (passoOnb === 0) return `<div class="onb">${passos}<div class="heroi-intro">${H.render(opcoesHeroi({ pose: 'aceno', humor: 'feliz', aura: 2, apagado: false }))}</div>
      <h1>Bem-vindo à Forja</h1><p class="sub">Cada treino real deixa seu herói mais forte. Vamos criar o seu.</p>
      <label class="campo"><span>Como você se chama?</span><input id="onb-nome" maxlength="24" value="${esc(E.perfil.nome)}" placeholder="Seu nome"></label>
      <div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="onbProx">Continuar</button></div></div></div>`;
    if (passoOnb === 1) return `<div class="onb">${passos}<h1>Seu avatar</h1><p class="sub">Deixe o herói com a sua cara.</p></div>${telaAvatar(false, true)}
      <div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="onbProx">Continuar</button></div></div>`;
    return `<div class="onb">${passos}<h1>Sua meta</h1><p class="sub">Quantos treinos por semana? A sequência conta semanas cumpridas, e a aura cresce com pelo menos 3 treinos por semana.</p>
      <div class="seg" style="margin-top:16px">${[3, 4, 5].map(n => `<button class="${E.perfil.metaSemanal === n ? 'ativo' : ''}" data-a="onbMeta" data-v="${n}">${n} treinos</button>`).join('')}</div>
      <div class="cartao" style="text-align:left;margin-top:18px"><h2>Como seu herói evolui</h2>
        <p class="sub peq">Cada série concluída dá XP ao grupo muscular. O corpo do herói só muda com suas medidas reais. A aura aparece com 15 dias de consistência e evolui até 10 anos.</p></div>
      <div class="rodape-fixo"><div class="dentro"><button class="btn prim grande" data-a="onbFim">Começar</button></div></div></div>`;
  }

  /* ---------- ações ---------- */
  const ACOES = {
    voltar: () => fecharFolha(),
    nada: () => { },
    tocarHeroi: () => reagir(Math.random() < 0.5 ? 'flex' : 'aceno', 'feliz', sorteia(FRASES.toque), 2000),
    abaTreinos: b => { abaTreinos = b.dataset.v; renderTreinos(); },
    abaRank: b => { abaRank = b.dataset.v; renderAmigos(); },
    abrirGrupo: b => abrirFolha('grupo', () => telaGrupo(b.dataset.id)),
    abrirEx: b => abrirFolha('ex', () => telaEx(b.dataset.id), el => { const g = $('[data-graf]', el); if (g) grafico(g, pontosEx(b.dataset.id), 'kg'); }),
    iniciarTreino: async b => {
      if (E.sessaoAtiva && !(await confirmar('Já existe um treino em andamento. Descartar e começar outro?', 'Começar novo', true))) return abrirSessao();
      iniciarSessao(b.dataset.id);
    },
    abrirSessao: () => abrirSessao(),
    novoTreino: () => abrirEditor({ id: 'u_' + uid(), nome: '', itens: [] }, 'Novo treino'),
    editarTreino: b => abrirEditor(treinoPor(b.dataset.id), 'Editar treino'),
    duplicarTreino: b => { const t = treinoPor(b.dataset.id); abrirEditor(Object.assign(JSON.parse(JSON.stringify(t)), { id: 'u_' + uid(), nome: t.nome + ' (cópia)', padrao: false }), 'Duplicar treino'); },
    excluirTreino: async b => { if (await confirmar('Excluir este treino?', 'Excluir', true)) { E.treinos = E.treinos.filter(t => t.id !== b.dataset.id); salvar(); renderTreinos(); } },
    edMover: b => { const i = +b.dataset.i, j = i + +b.dataset.d, it = rascunho.itens; if (j < 0 || j >= it.length) return; [it[i], it[j]] = [it[j], it[i]]; redesenharTopo(); },
    edRemover: b => { rascunho.itens.splice(+b.dataset.i, 1); redesenharTopo(); },
    edAdicionar: () => { modoPicker = 'editor'; abrirPicker(); },
    edSalvar: () => {
      if (!rascunho.nome.trim()) return toast('Dê um nome ao treino.');
      if (!rascunho.itens.length) return toast('Adicione pelo menos um exercício.');
      rascunho.padrao = false; delete rascunho.g; delete rascunho.nota;
      const i = E.treinos.findIndex(t => t.id === rascunho.id);
      if (i >= 0) E.treinos[i] = rascunho; else E.treinos.unshift(rascunho);
      salvar(); fecharTodasFolhas(); abaTreinos = 'meus'; ir('treinos'); toast('Treino salvo.');
    },
    pkFiltro: b => { filtroPick = b.dataset.v; redesenharTopo(); },
    pkEscolher: b => adicionarDoPicker(b.dataset.id),
    novoExProprio: () => abrirFolha('exp', telaExProprio),
    salvarExProprio: () => {
      const nome = $('#ep-nome').value.trim(); if (!nome) return toast('Dê um nome ao exercício.');
      const ex = { id: 'p_' + uid(), nome, g: $('#ep-g').value, tipo: $('#ep-tipo').value, sec: [], proprio: true, inc: 2.5 };
      E.exProprios.push(ex); salvar(); fecharFolha(); adicionarDoPicker(ex.id);
    },
    excluirExProprio: async b => { if (await confirmar('Excluir este exercício próprio?', 'Excluir', true)) { E.exProprios = E.exProprios.filter(e => e.id !== b.dataset.id); salvar(); fecharFolha(); } },
    marcarSerie: b => {
      const it = E.sessaoAtiva.itens[+b.dataset.i], s = it.series[+b.dataset.k];
      s.feito = !s.feito; salvar(); redesenharTopo();
      if (s.feito) { vibrar(30); const ultima = E.sessaoAtiva.itens.every(x => x.series.every(y => y.feito)); if (!ultima) iniciarDescanso(it.desc); else { pararDescanso(); toast('Todas as séries feitas. Finalize o treino!'); } }
    },
    addSerie: b => { const it = E.sessaoAtiva.itens[+b.dataset.i], u = it.series[it.series.length - 1] || { kg: 0, reps: it.rMin }; it.series.push({ kg: u.kg, reps: u.reps, feito: false }); salvar(); redesenharTopo(); },
    remSerie: b => { const it = E.sessaoAtiva.itens[+b.dataset.i]; if (it.series.length > 1) { it.series.pop(); salvar(); redesenharTopo(); } },
    addExSessao: () => { modoPicker = 'sessao'; abrirPicker(); },
    descartarSessao: async () => { if (await confirmar('Descartar este treino? Nada será salvo.', 'Descartar', true)) { E.sessaoAtiva = null; salvar(); pararDescanso(); fecharTodasFolhas(); renderAba(); } },
    finalizarSessao: async () => {
      const S = E.sessaoAtiva, faltam = S.itens.reduce((s, i) => s + i.series.filter(x => !x.feito).length, 0);
      if (faltam && !(await confirmar(faltam + ' série' + (faltam > 1 ? 's' : '') + ' sem marcar. Finalizar mesmo assim?', 'Finalizar'))) return;
      finalizarSessao();
    },
    descMais: b => { descFim += +b.dataset.v * 1000; descTotal = Math.max(descTotal, Math.ceil((descFim - Date.now()) / 1000)); },
    descPular: () => pararDescanso(),
    excluirSessao: async b => {
      if (!(await confirmar('Apagar este treino do histórico? O XP dele também sai.', 'Apagar', true))) return;
      const s = E.sessoes.find(x => x.id === b.dataset.id);
      if (s) Object.entries(s.xp || {}).forEach(([a, v]) => { E.xp[a] = Math.max(0, (E.xp[a] || 0) - v); });
      E.sessoes = E.sessoes.filter(x => x.id !== b.dataset.id); salvar(); renderAba();
    },
    abrirMedidas: () => abrirFolha('medidas', telaMedidas, el => { previaMedidas(el); $('#pv-m', el).oninput = $('#pv-p', el).oninput = () => previaMedidas(el); }),
    salvarMedida: () => {
      const peso = parseFloat(String($('#md-peso').value).replace(',', '.')), altura = parseFloat(String($('#md-alt').value).replace(',', '.'));
      const mus = parseFloat(String($('#md-mus').value).replace(',', '.')), un = $('#md-un').value;
      if (!(peso > 30 && peso < 300)) return toast('Confira o peso (em kg).');
      if (!(altura > 120 && altura < 230)) return toast('Confira a altura (em cm).');
      let musculoKg = null;
      if (mus > 0) { musculoKg = un === 'pct' ? peso * mus / 100 : mus; if (musculoKg >= peso * 0.7 || musculoKg < peso * 0.15) return toast('A massa muscular parece fora do normal. Confira o valor e a unidade.'); }
      const antes = medidaAtual();
      E.medidas = E.medidas.filter(x => x.data !== hoje());
      E.medidas.push({ data: hoje(), peso, altura, musculoKg: musculoKg ? Math.round(musculoKg * 10) / 10 : null });
      salvar(); fecharTodasFolhas(); ir('heroi');
      if (antes && antes.musculoKg && musculoKg && musculoKg > antes.musculoKg) { reagir('flex', 'comemora', 'Ganhei músculo de verdade!', 3200); confete(40); }
      else reagir('aceno', 'feliz', 'Medidas atualizadas!', 2200);
    },
    apagarMedida: async b => { if (await confirmar('Apagar a medição de ' + fmtDA(b.dataset.id) + '?', 'Apagar', true)) { E.medidas = E.medidas.filter(x => x.data !== b.dataset.id); salvar(); redesenharTopo(); } },
    abrirAvatar: () => abrirFolha('avatar', () => telaAvatar()),
    av: b => { E.avatar[b.dataset.k] = b.dataset.v; salvar(); redesenharTopo(); },
    avSortear: () => {
      const r = l => l[Math.floor(Math.random() * l.length)];
      E.avatar = { pele: r(H.PELES).id, cabelo: r(H.OPCOES.cabelo)[0], corCabelo: r(H.CORES_CABELO).id, corBarba: r(H.CORES_CABELO).id, olhos: r(H.CORES_OLHO).id, sobrancelha: r(H.OPCOES.sobrancelha)[0], bigode: r(H.OPCOES.bigode)[0], barba: r(H.OPCOES.barba)[0], oculos: r(H.OPCOES.oculos)[0] };
      salvar(); redesenharTopo();
    },
    abrirRoupas: () => abrirFolha('roupas', telaRoupas),
    equipar: b => { const i = ITENS.find(x => x.id === b.dataset.id); if (nivelGeral() < i.nivel) return toast('Libera no nível ' + i.nivel + '.'); E.equip[i.tipo] = i.id; salvar(); redesenharTopo(); },
    abrirAuras: () => abrirFolha('auras', telaAuras),
    previaAura: b => { auraPrevia = +b.dataset.v; fecharTodasFolhas(); ir('heroi'); fala('Prévia: ' + H.AURAS[auraPrevia].nome); setTimeout(() => { auraPrevia = null; desenharHeroi(); }, 6000); },
    abrirBackup: () => abrirFolha('backup', telaBackup, el => { const inp = $('#in-arq', el); inp.onchange = () => { const fl = inp.files[0]; if (!fl) return; const r = new FileReader(); r.onload = () => importar(r.result); r.readAsText(fl); inp.value = ''; }; }),
    exportar: async () => {
      const nome = 'forja-backup-' + hoje() + '.json', blob = new Blob([pacote()], { type: 'application/json' });
      try { const fl = new File([blob], nome, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [fl] })) { await navigator.share({ files: [fl], title: 'Backup Forja' }); return marcarBackup(); } } catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); marcarBackup();
    },
    copiarBackup: async () => {
      try { await navigator.clipboard.writeText(pacote()); marcarBackup(); toast('Backup copiado. Guarde em um lugar seguro.'); }
      catch (e) { abrirModal(`<h2>Copie o texto</h2><textarea readonly>${esc(pacote())}</textarea><div class="col"><button class="btn prim largo" data-fechar>Pronto</button></div>`); marcarBackup(); }
    },
    colarBackup: () => { abrirModal(`<h2>Colar backup</h2><textarea id="txt-bk" placeholder="Cole aqui o texto do backup"></textarea><div class="col"><button class="btn prim largo" id="bk-ok">Restaurar</button><button class="btn fant largo" data-fechar>Cancelar</button></div>`); $('#bk-ok').onclick = () => { const t = $('#txt-bk').value; fecharModal(); importar(t); }; },
    meta: b => { E.perfil.metaSemanal = +b.dataset.v; salvar(); renderPerfil(); },
    zerar: async () => {
      if (!(await confirmar('Apagar todo o progresso deste aparelho? Faça um backup antes.', 'Apagar tudo', true))) return;
      if (!(await confirmar('Tem certeza? Isso não pode ser desfeito.', 'Sim, apagar', true))) return;
      E = novoEstado(); salvar(); location.reload();
    },
    compartilharCodigo: async () => {
      const link = meuLink(), txt = 'Bora competir na Forja! Abra o link para me adicionar: ' + link;
      try { if (navigator.share) { await navigator.share({ title: 'Forja', text: txt }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(txt); toast('Link copiado. Mande para seus amigos.'); }
      catch (e) { abrirModal(`<h2>Seu código</h2><textarea readonly>${esc(txt)}</textarea><div class="col"><button class="btn prim largo" data-fechar>Pronto</button></div>`); }
    },
    colarAmigo: () => {
      abrirModal(`<h2>Adicionar amigo</h2><p class="sub peq">Cole o link ou o código que seu amigo enviou.</p><textarea id="txt-am" placeholder="FORJA-..."></textarea><div class="col"><button class="btn prim largo" id="am-ok">Adicionar</button><button class="btn fant largo" data-fechar>Cancelar</button></div>`);
      $('#am-ok').onclick = () => { const o = lerCodigo($('#txt-am').value); if (!o) return toast('Código inválido.'); fecharModal(); adicionarAmigo(o); renderAmigos(); };
    },
    removerAmigo: async b => { if (await confirmar('Remover este amigo do ranking?', 'Remover', true)) { E.amigos = E.amigos.filter(a => a.id !== b.dataset.id); salvar(); renderAmigos(); } },
    onbProx: () => {
      if (passoOnb === 0) { const n = $('#onb-nome').value.trim(); if (!n) return toast('Digite seu nome.'); E.perfil.nome = n; salvar(); }
      passoOnb++; redesenharTopo(); pilha[pilha.length - 1].el.scrollTop = 0;
    },
    onbMeta: b => { E.perfil.metaSemanal = +b.dataset.v; salvar(); redesenharTopo(); },
    onbFim: () => { E.onboard = true; salvar(); fecharTodasFolhas(); ir('heroi'); reagir('comemora', 'comemora', 'Vamos nessa, ' + E.perfil.nome.split(' ')[0] + '!', 3000); confete(40); }
  };

  /* picker compartilhado entre editor e sessão */
  let modoPicker = 'editor';
  function abrirPicker() {
    buscaPick = '';
    const f = abrirFolha('picker', telaPicker, el => { const b = $('#pk-busca', el); b.oninput = () => { buscaPick = b.value; const pos = b.selectionStart; desenharFolha(f); const nb = $('#pk-busca', f.el); nb.focus(); nb.setSelectionRange(pos, pos); }; });
  }
  function adicionarDoPicker(id) {
    const ex = exPor(id);
    const padrao = ex.tipo === 'carga' ? [8, 12, 90] : ex.tipo === 'tempo' ? [30, 60, 60] : ex.tipo === 'cardio' ? [10, 20, 0] : [10, 15, 60];
    const item = { ex: id, series: ex.tipo === 'cardio' ? 1 : 4, rMin: padrao[0], rMax: padrao[1], desc: padrao[2] };
    if (modoPicker === 'sessao' && E.sessaoAtiva) {
      const ult = ultimaSeries(id), pg = E.prog[id];
      E.sessaoAtiva.itens.push({ ex: id, rMin: item.rMin, rMax: item.rMax, desc: item.desc, series: Array.from({ length: item.series }, (_, k) => ({ kg: pg && pg.kg ? pg.kg : ult ? (ult[k] || ult[0]).kg : 0, reps: ult ? (ult[k] || ult[0]).reps : item.rMin, feito: false })) });
      salvar();
    } else rascunho.itens.push(item);
    fecharFolha();
    toast(ex.nome + ' adicionado.');
  }

  /* ---------- início ---------- */
  if (E.xpDia.data !== hoje()) E.xpDia = { data: hoje(), total: 0, grupos: {} };
  if (!E.perfil.id) E.perfil.id = uid();
  salvar();
  ir('heroi');
  // link de amigo
  const hm = location.hash.match(/amigo=(FORJA-[A-Za-z0-9_-]+)/);
  if (hm) { const o = lerCodigo(hm[1]); history.replaceState(null, '', location.pathname); if (o) { adicionarAmigo(o); if (E.onboard) ir('amigos'); } }
  if (!E.onboard) { passoOnb = 0; abrirFolha('onb', telaOnb); }
  else if (E.sessaoAtiva) toast('Você tem um treino em andamento.');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !pilha.length) renderAba(); });
})();
