/* Forja: lógica do app (etapa 1) */
(function () {
  'use strict';
  const CHAVE = 'forja_v1';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const GRUPOS = [
    { id: 'peito', nome: 'Peito', cor: '#ff8fb1', sig: 'PE' },
    { id: 'costas', nome: 'Costas', cor: '#7cb7ff', sig: 'CO' },
    { id: 'ombros', nome: 'Ombros', cor: '#b9a3f2', sig: 'OM' },
    { id: 'bracos', nome: 'Braços', cor: '#ffa76b', sig: 'BR' },
    { id: 'pernas', nome: 'Pernas', cor: '#5fd08a', sig: 'PN' },
    { id: 'abdomen', nome: 'Abdômen', cor: '#ffc94a', sig: 'AB' },
    { id: 'cardio', nome: 'Cardio', cor: '#ff7a7a', sig: 'CA' }
  ];
  const XP_SERIE = 10, XP_MIN_CARDIO = 2, MAX_CARDIO_MIN = 60;
  const TETO_GRUPO = 150, TETO_DIA = 400;
  const DIAS_SONO = 4, DIAS_APAGADO = 8, DIAS_AURA = 100, DIAS_BACKUP = 14;

  const ITENS = [
    { id: 'camiseta', tipo: 'roupa', nome: 'Camiseta azul', nivel: 0, cor: '#7cb7ff' },
    { id: 'regata', tipo: 'roupa', nome: 'Regata verde', nivel: 10, cor: '#8fd6a8' },
    { id: 'forja', tipo: 'roupa', nome: 'Camiseta Forja', nivel: 20, cor: '#ffb27a' },
    { id: 'moletom', tipo: 'roupa', nome: 'Moletom roxo', nivel: 35, cor: '#b9a3f2' },
    { id: 'dourado', tipo: 'roupa', nome: 'Uniforme dourado', nivel: 60, cor: '#ffd36e' },
    { id: 'nenhum', tipo: 'acessorio', nome: 'Nenhum', nivel: 0, cor: '#eeeeee' },
    { id: 'faixa', tipo: 'acessorio', nome: 'Faixa', nivel: 15, cor: '#ff6b8b' },
    { id: 'fone', tipo: 'acessorio', nome: 'Fone', nivel: 25, cor: '#7c8cc4' },
    { id: 'bone', tipo: 'acessorio', nome: 'Boné', nivel: 30, cor: '#ff7a59' },
    { id: 'munhequeira', tipo: 'acessorio', nome: 'Munhequeiras', nivel: 40, cor: '#ff7aa8' },
    { id: 'medalha', tipo: 'acessorio', nome: 'Medalha', nivel: 50, cor: '#ffd23f' },
    { id: 'capa', tipo: 'acessorio', nome: 'Capa', nivel: 75, cor: '#ff5a6e' },
    { id: 'parque', tipo: 'cenario', nome: 'Parque', nivel: 0, cor: '#bfe8c2' },
    { id: 'academia', tipo: 'cenario', nome: 'Academia', nivel: 12, cor: '#cfc2f5' },
    { id: 'praia', tipo: 'cenario', nome: 'Praia', nivel: 18, cor: '#ffe2a8' },
    { id: 'montanha', tipo: 'cenario', nome: 'Montanha', nivel: 28, cor: '#b6c6ea' },
    { id: 'arena', tipo: 'cenario', nome: 'Arena', nivel: 45, cor: '#ffbf6b' },
    { id: 'espaco', tipo: 'cenario', nome: 'Espaço', nivel: 70, cor: '#3b3a73' }
  ];

  const FRASES = {
    oi: ['Bora treinar!', 'Hoje tem treino?', 'Tô pronto, e você?', 'Vamos forjar esse corpo!', 'Um treino de cada vez.'],
    toque: ['Olha esse muque!', 'Opa, cosquinha!', 'Sentiu a energia?', 'Quase lá, campeão!', 'Treino bom é treino feito.'],
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
  const segunda = s => { const d = dataDe(s); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return iso(d); };
  const fmtData = s => { const d = dataDe(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(2); };
  const num = (v, c = 1) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: c });

  /* ---------- estado ---------- */
  function novoEstado() {
    const xp = {}; GRUPOS.forEach(g => xp[g.id] = 0);
    return {
      app: 'forja', v: 1,
      perfil: { metaSemanal: 4, criadoEm: hoje() },
      xp,
      xpDia: { data: hoje(), total: 0, grupos: {} },
      sessoes: [],
      medidas: [],
      equip: { roupa: 'camiseta', acessorio: 'nenhum', cenario: 'parque' },
      nivelVisto: 7,
      ultimoBackup: null
    };
  }
  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.app === 'forja') return Object.assign(novoEstado(), s);
    } catch (e) { }
    return novoEstado();
  }
  let E = carregar();
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { alert('Não consegui salvar os dados neste aparelho.'); } };

  /* ---------- níveis ---------- */
  // XP para sair do nível L para L+1 = 40 + 20*(L-1)
  function infoNivel(xp) {
    let L = 1, base = 0, prox = 40;
    while (xp >= base + prox) { base += prox; L++; prox = 40 + 20 * (L - 1); }
    return { nivel: L, atual: xp - base, prox };
  }
  const nivelGeral = () => GRUPOS.reduce((s, g) => s + infoNivel(E.xp[g.id]).nivel, 0);

  /* ---------- semana, sequência e aura ---------- */
  function diasTreino() { return new Set(E.sessoes.map(s => s.data)); }
  function contaSemana(seg, dias) { let c = 0; for (let i = 0; i < 7; i++) if (dias.has(somaDias(seg, i))) c++; return c; }
  function statusSemana() {
    const dias = diasTreino(), meta = E.perfil.metaSemanal, h = hoje(), seg = segunda(h);
    const atual = contaSemana(seg, dias);
    let cadeia = 0;
    const inicio = segunda(E.perfil.criadoEm);
    while (true) {
      const s = somaDias(seg, -7 * (cadeia + 1));
      if (difDias(s, inicio) < 0) break;
      if (contaSemana(s, dias) >= meta) cadeia++; else break;
    }
    const cumpriu = atual >= meta;
    const semanas = cadeia + (cumpriu ? 1 : 0);
    let diasAura = 0;
    if (cadeia > 0) diasAura = difDias(h, somaDias(seg, -7 * cadeia)) + 1;
    else if (cumpriu) diasAura = difDias(h, seg) + 1;
    return { atual, meta, semanas, diasAura, estagio: Math.min(6, Math.floor(diasAura / DIAS_AURA)) };
  }
  function diasSemTreino() {
    const ult = E.sessoes.length ? E.sessoes[E.sessoes.length - 1].data : E.perfil.criadoEm;
    return difDias(hoje(), ult);
  }
  const medidaAtual = () => E.medidas.length ? E.medidas[E.medidas.length - 1] : null;

  /* ---------- personagem ---------- */
  let auraPrevia = null, poseTemp = null, humorTemp = null, timerPose = null;
  function opcoesHeroi(extra) {
    const st = statusSemana(), sem = diasSemTreino();
    const sono = E.sessoes.length > 0 ? sem >= DIAS_SONO : sem >= DIAS_SONO;
    return Object.assign({
      corpo: Heroi.corpoDeMedidas(medidaAtual()),
      roupa: E.equip.roupa, acessorio: E.equip.acessorio,
      aura: auraPrevia != null ? auraPrevia : st.estagio,
      pose: poseTemp || (sono ? 'sono' : 'idle'),
      humor: humorTemp || (sono ? 'sono' : 'feliz'),
      apagado: !poseTemp && sem >= DIAS_APAGADO
    }, extra || {});
  }
  function desenharHeroi() {
    $('#cenario').innerHTML = Heroi.cenario(E.equip.cenario);
    $('#heroi-wrap').innerHTML = Heroi.render(opcoesHeroi());
  }
  function fala(t) { const b = $('#balao'); b.style.opacity = 0; setTimeout(() => { b.textContent = t; b.style.opacity = 1; }, 150); }
  const sorteia = a => a[Math.floor(Math.random() * a.length)];
  function reagir(pose, humor, frase, ms) {
    clearTimeout(timerPose);
    poseTemp = pose; humorTemp = humor;
    desenharHeroi();
    if (frase) fala(frase);
    const w = $('#heroi-wrap'); w.classList.remove('pula'); void w.offsetWidth;
    if (pose === 'comemora') w.classList.add('pula');
    timerPose = setTimeout(() => { poseTemp = null; humorTemp = null; w.classList.remove('pula'); desenharHeroi(); }, ms || 2400);
  }
  function confete(n) {
    const c = $('#confete'), cores = ['#ff8fb1', '#ffd36e', '#7cb7ff', '#5fd08a', '#b9a3f2', '#ffa76b'];
    for (let i = 0; i < (n || 40); i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cores[i % cores.length];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.transform = `rotate(${Math.random() * 180}deg)`;
      c.appendChild(p);
      setTimeout(() => p.remove(), 2600);
    }
  }

  /* ---------- telas ---------- */
  function ir(t) {
    $$('.tela').forEach(s => s.classList.toggle('ativa', s.id === 'tela-' + t));
    $$('.barra-nav button').forEach(b => b.classList.toggle('ativo', b.dataset.ir === t));
    window.scrollTo({ top: 0 });
    if (t === 'heroi') renderHeroiTela();
    if (t === 'treinar') renderRegistro();
    if (t === 'corpo') renderCorpo();
    if (t === 'ajustes') renderAjustes();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ir]');
    if (b) ir(b.dataset.ir);
  });

  function renderHeroiTela() {
    desenharHeroi();
    const nv = nivelGeral();
    $('#chip-nivel').textContent = 'Nv ' + nv;
    const st = statusSemana();
    $('#semana-txt').textContent = st.atual + ' de ' + st.meta;
    $('#bolinhas').innerHTML = Array.from({ length: st.meta }, (_, i) => `<i class="${i < st.atual ? 'ok' : ''}"></i>`).join('');
    $('#seq-n').textContent = st.semanas;
    $('#aura-dias').textContent = st.diasAura;
    const prox = Math.min(6, st.estagio + 1);
    if (st.estagio >= 6) {
      $('#aura-nome').textContent = Heroi.AURAS[6].nome + ' (máxima)';
      $('#aura-falta').textContent = 'lenda total';
      $('#aura-barra').style.width = '100%';
    } else {
      $('#aura-nome').textContent = (st.estagio ? Heroi.AURAS[st.estagio].nome + ' ativa. Próxima: ' : 'Próxima: ') + Heroi.AURAS[prox].nome;
      const resto = DIAS_AURA - (st.diasAura % DIAS_AURA);
      $('#aura-falta').textContent = 'faltam ' + resto + ' dias';
      $('#aura-barra').style.width = ((st.diasAura % DIAS_AURA) / DIAS_AURA * 100) + '%';
    }
    $('#atributos').innerHTML = GRUPOS.map(g => {
      const i = infoNivel(E.xp[g.id]);
      return `<div class="attr"><div class="ic" style="background:${g.cor}">${g.sig}</div>
        <div><div class="nm">${g.nome}<small>${i.atual}/${i.prox} XP</small></div><div class="barra"><i style="width:${i.atual / i.prox * 100}%;background:${g.cor}"></i></div></div>
        <div class="nv">${i.nivel}</div></div>`;
    }).join('');
    const m = medidaAtual();
    if (m) {
      const c = Heroi.corpoDeMedidas(m), p = E.medidas[0];
      let delta = '';
      if (E.medidas.length > 1 && p.musculoKg && m.musculoKg) {
        const d = m.musculoKg - p.musculoKg;
        delta = `<div class="delta">${d >= 0 ? '+' : ''}${num(d)} kg de massa muscular desde ${fmtData(p.data)}</div>`;
      }
      $('#corpo-resumo').innerHTML = `<div class="linha-topo"><h2>Corpo real</h2><small>${fmtData(m.data)}</small></div>
        <div class="linhas"><div><b>${num(m.peso)}</b><span>kg</span></div><div><b>${num(c.pctM)}%</b><span>massa muscular</span></div><div><b>${m.altura}</b><span>cm</span></div></div>${delta}`;
    } else {
      $('#corpo-resumo').innerHTML = `<h2>Corpo real</h2><p class="sub pequeno">Cadastre peso, altura e massa muscular para o personagem ficar igual a você.</p><button class="btn azul" data-ir="corpo" style="width:100%">Cadastrar medidas</button>`;
    }
    const ultB = E.ultimoBackup || E.perfil.criadoEm;
    $('#aviso-backup').classList.toggle('oculto', !(E.sessoes.length && difDias(hoje(), ultB) >= DIAS_BACKUP));
    if (!poseTemp) {
      const sem = diasSemTreino();
      fala(sem >= DIAS_APAGADO ? sorteia(FRASES.apagado) : sem >= DIAS_SONO ? sorteia(FRASES.sono) : sorteia(FRASES.oi));
    }
  }

  $('#heroi-wrap').addEventListener('click', () => {
    reagir(Math.random() < 0.5 ? 'flex' : 'aceno', 'feliz', sorteia(FRASES.toque), 2000);
  });

  /* ---------- registro rápido ---------- */
  let reg = { series: {}, cardio: 0 };
  function zerarDia() {
    if (E.xpDia.data !== hoje()) E.xpDia = { data: hoje(), total: 0, grupos: {} };
  }
  function calculaXP() {
    zerarDia();
    const res = {}; let total = 0, cortou = false;
    let restoDia = TETO_DIA - E.xpDia.total;
    for (const g of GRUPOS) {
      let bruto = g.id === 'cardio' ? Math.min(reg.cardio, MAX_CARDIO_MIN) * XP_MIN_CARDIO : (reg.series[g.id] || 0) * XP_SERIE;
      if (g.id === 'cardio' && reg.cardio > MAX_CARDIO_MIN) cortou = true;
      if (!bruto) continue;
      const restoG = TETO_GRUPO - (E.xpDia.grupos[g.id] || 0);
      let v = Math.max(0, Math.min(bruto, restoG, restoDia));
      if (v < bruto) cortou = true;
      restoDia -= v; total += v;
      res[g.id] = v;
    }
    return { res, total, cortou };
  }
  function renderRegistro() {
    $('#grupos-reg').innerHTML = GRUPOS.filter(g => g.id !== 'cardio').map(g => {
      const n = reg.series[g.id] || 0;
      return `<div class="grupo ${n ? 'on' : ''}" style="--cor:${g.cor}"><div class="ic" style="background:${g.cor}">${g.sig}</div>
        <div class="nm">${g.nome}<small>${n ? n * XP_SERIE + ' XP' : 'séries'}</small></div>
        <div class="stepper"><button class="btn redondo" data-g="${g.id}" data-d="-1">−</button><b>${n}</b><button class="btn redondo" data-g="${g.id}" data-d="1">+</button></div></div>`;
    }).join('');
    $('#cardio-min').textContent = reg.cardio + ' min';
    const c = calculaXP();
    const tags = Object.entries(c.res).map(([k, v]) => `<span class="tag">${GRUPOS.find(g => g.id === k).nome} +${v}</span>`).join('');
    $('#previa-xp').innerHTML = `<div class="total">+${c.total} XP</div>${tags || '<span class="sub pequeno">Nada marcado ainda.</span>'}${c.cortou ? '<div class="limite">Parte do XP passou do teto diário e não vai contar.</div>' : ''}<div class="sub pequeno" style="width:100%;margin:0">Hoje: ${E.xpDia.total}/${TETO_DIA} XP</div>`;
    $('#btn-concluir').disabled = !Object.values(reg.series).some(v => v > 0) && !reg.cardio;
  }
  $('#grupos-reg').addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    const g = b.dataset.g;
    reg.series[g] = Math.max(0, Math.min(15, (reg.series[g] || 0) + Number(b.dataset.d)));
    renderRegistro();
  });
  $$('[data-cardio]').forEach(b => b.addEventListener('click', () => {
    reg.cardio = Math.max(0, Math.min(120, reg.cardio + Number(b.dataset.cardio)));
    renderRegistro();
  }));
  $('#btn-concluir').addEventListener('click', () => {
    const nvAntes = nivelGeral();
    const c = calculaXP();
    const h = hoje();
    for (const [k, v] of Object.entries(c.res)) {
      E.xp[k] += v;
      E.xpDia.grupos[k] = (E.xpDia.grupos[k] || 0) + v;
    }
    E.xpDia.total += c.total;
    E.sessoes.push({ id: Date.now().toString(36), data: h, tipo: 'rapido', series: Object.assign({}, reg.series), cardioMin: reg.cardio, xp: c.res });
    reg = { series: {}, cardio: 0 };
    salvar();
    const nvDepois = nivelGeral();
    ir('heroi');
    reagir('comemora', 'comemora', sorteia(FRASES.treino), 3200);
    confete(36);
    setTimeout(() => {
      if (nvDepois > nvAntes) modalNivel(nvAntes, nvDepois, c);
      else modalTreino(c);
    }, 1400);
  });

  /* ---------- modais ---------- */
  function abrirModal(html) { $('#modal-caixa').innerHTML = html; $('#modal').classList.remove('oculto'); }
  function fecharModal() { $('#modal').classList.add('oculto'); }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-fechar]')) fecharModal(); });
  function tagsXP(c) { return Object.entries(c.res).map(([k, v]) => `<span class="tag">${GRUPOS.find(g => g.id === k).nome} +${v}</span>`).join(''); }
  function modalTreino(c) {
    abrirModal(`<h2>Treino concluído!</h2><p class="sub">+${c.total} XP para o seu herói</p><div class="tags">${tagsXP(c)}</div>${c.cortou ? '<p class="sub pequeno">Parte do XP passou do teto diário.</p>' : ''}<button class="btn grande verde" data-fechar>Show!</button>`);
  }
  function modalNivel(a, b, c) {
    const novos = ITENS.filter(i => i.nivel > a && i.nivel <= b);
    abrirModal(`<div class="mini-heroi">${Heroi.render(opcoesHeroi({ pose: 'comemora', humor: 'comemora', apagado: false }))}</div>
      <h2>Nível ${b}!</h2><p class="sub">Seu herói subiu de nível.</p><div class="tags">${tagsXP(c)}</div>
      ${novos.map(i => `<div class="novo">Desbloqueado: ${i.nome}</div>`).join('')}
      <button class="btn grande verde" data-fechar>${novos.length ? 'Ver depois no guarda-roupa' : 'Bora!'}</button>`);
    confete(60);
  }

  /* ---------- corpo ---------- */
  let unid = 'kg';
  $('#seg-unid').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    unid = b.dataset.u;
    $$('#seg-unid button').forEach(x => x.classList.toggle('ativo', x === b));
    $('#in-musculo').placeholder = unid === 'kg' ? 'ex.: 34,2' : 'ex.: 41,5';
  });
  function renderCorpo() {
    const m = medidaAtual();
    if (m) {
      const c = Heroi.corpoDeMedidas(m);
      $('#medida-atual').innerHTML = `<div class="linha-topo"><h2>Medição atual</h2><small>${fmtData(m.data)}</small></div>
        <div class="medida-grid"><div><b>${num(m.peso)} kg</b><span>peso</span></div><div><b>${m.altura} cm</b><span>altura</span></div>
        <div><b>${m.musculoKg ? num(m.musculoKg) + ' kg' : 'sem dado'}</b><span>massa muscular</span></div><div><b>${num(c.pctM)}%</b><span>do peso em músculo</span></div></div>`;
      if (!$('#in-altura').value) $('#in-altura').value = m.altura;
      $('#pv-p').value = Math.round(m.peso);
      $('#pv-m').value = Math.round(c.pctM * 2) / 2;
    } else {
      $('#medida-atual').innerHTML = `<h2>Sem medições ainda</h2><p class="sub pequeno">Enquanto isso, o personagem usa um corpo médio. Meça a cada 2 a 4 semanas, sempre no mesmo horário e em jejum, para comparar de forma justa.</p>`;
    }
    $('#hist-medidas').innerHTML = E.medidas.length ? E.medidas.slice().reverse().map(x =>
      `<div class="item"><span>${fmtData(x.data)}: ${num(x.peso)} kg, ${x.musculoKg ? num(x.musculoKg) + ' kg músc.' : 'sem músc.'}</span><button data-del="${x.data}">apagar</button></div>`).join('')
      : '<div class="vazio">Nenhuma medição registrada.</div>';
    previa();
  }
  $('#btn-medida').addEventListener('click', () => {
    const peso = parseFloat(String($('#in-peso').value).replace(',', '.'));
    const altura = parseFloat(String($('#in-altura').value).replace(',', '.'));
    let mus = parseFloat(String($('#in-musculo').value).replace(',', '.'));
    if (!(peso > 30 && peso < 300)) return alert('Confira o peso (em kg).');
    if (!(altura > 120 && altura < 230)) return alert('Confira a altura (em cm).');
    let musculoKg = null;
    if (mus > 0) {
      musculoKg = unid === 'pct' ? peso * mus / 100 : mus;
      if (musculoKg >= peso * 0.7 || musculoKg < peso * 0.15) return alert('A massa muscular parece fora do normal. Confira o valor e a unidade (kg ou %).');
    }
    const antes = medidaAtual();
    const h = hoje();
    E.medidas = E.medidas.filter(x => x.data !== h);
    E.medidas.push({ data: h, peso, altura, musculoKg: musculoKg ? Math.round(musculoKg * 10) / 10 : null });
    salvar();
    $('#in-peso').value = ''; $('#in-musculo').value = '';
    const ganhou = antes && antes.musculoKg && musculoKg && musculoKg > antes.musculoKg;
    ir('heroi');
    if (ganhou) { reagir('flex', 'comemora', 'Ganhei músculo de verdade!', 3200); confete(40); }
    else reagir('aceno', 'feliz', 'Medidas atualizadas!', 2200);
  });
  $('#hist-medidas').addEventListener('click', e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    if (!confirm('Apagar a medição de ' + fmtData(b.dataset.del) + '?')) return;
    E.medidas = E.medidas.filter(x => x.data !== b.dataset.del);
    salvar(); renderCorpo();
  });
  function previa() {
    const pm = parseFloat($('#pv-m').value), pp = parseFloat($('#pv-p').value);
    $('#pv-m-t').textContent = num(pm) + '%'; $('#pv-p-t').textContent = pp + ' kg';
    const alt = (medidaAtual() && medidaAtual().altura) || 175;
    const c = Heroi.corpoDeMedidas({ peso: pp, altura: alt, musculoKg: pp * pm / 100 });
    $('#previa-heroi').innerHTML = Heroi.render(opcoesHeroi({ corpo: c, aura: 0, pose: 'flex', humor: 'feliz', apagado: false }));
  }
  $('#pv-m').addEventListener('input', previa);
  $('#pv-p').addEventListener('input', previa);

  /* ---------- ajustes ---------- */
  function renderAjustes() {
    $$('#seg-meta button').forEach(b => b.classList.toggle('ativo', Number(b.dataset.meta) === E.perfil.metaSemanal));
    const nv = nivelGeral();
    for (const tipo of ['roupa', 'acessorio', 'cenario']) {
      $('#itens-' + tipo).innerHTML = ITENS.filter(i => i.tipo === tipo).map(i => {
        const livre = nv >= i.nivel, sel = E.equip[tipo] === i.id;
        return `<button class="item-g ${sel ? 'sel' : ''} ${livre ? '' : 'trava'}" data-item="${i.id}" data-tipo="${tipo}"><span class="bola" style="background:${i.cor}"></span>${i.nome}${livre ? '' : `<small>nível ${i.nivel}</small>`}</button>`;
      }).join('');
    }
    const st = statusSemana();
    $('#grade-auras').innerHTML = Heroi.AURAS.slice(1).map((a, i) =>
      `<button class="aura-item ${st.estagio >= i + 1 ? 'ating' : ''}" data-aura="${i + 1}"><div class="bola" style="background:radial-gradient(circle,${a.brilho},${a.a} 50%,${a.b})"></div>${a.nome.replace('Aura ', '')}<br><small>${(i + 1) * DIAS_AURA} dias</small></button>`).join('');
    $('#backup-info').textContent = E.ultimoBackup ? 'Último backup: ' + fmtData(E.ultimoBackup) + '. Os dados ficam só neste aparelho.' : 'Nenhum backup feito ainda. Os dados ficam só neste aparelho.';
  }
  $('#seg-meta').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    E.perfil.metaSemanal = Number(b.dataset.meta); salvar(); renderAjustes();
  });
  $('#tela-ajustes').addEventListener('click', e => {
    const it = e.target.closest('[data-item]');
    if (it) {
      const item = ITENS.find(i => i.id === it.dataset.item);
      if (nivelGeral() < item.nivel) { it.classList.remove('pula-uma'); void it.offsetWidth; return alert('Desbloqueia no nível ' + item.nivel + '.'); }
      E.equip[it.dataset.tipo] = item.id; salvar(); renderAjustes();
      return;
    }
    const au = e.target.closest('[data-aura]');
    if (au) {
      auraPrevia = Number(au.dataset.aura);
      ir('heroi');
      fala('Prévia: ' + Heroi.AURAS[auraPrevia].nome);
      setTimeout(() => { auraPrevia = null; desenharHeroi(); }, 6000);
    }
  });

  /* ---------- backup ---------- */
  function pacote() { return JSON.stringify({ app: 'forja', versao: 1, exportadoEm: new Date().toISOString(), dados: E }); }
  function marcarBackup() { E.ultimoBackup = hoje(); salvar(); renderAjustes(); }
  $('#btn-exportar').addEventListener('click', async () => {
    const nome = 'forja-backup-' + hoje() + '.json';
    const blob = new Blob([pacote()], { type: 'application/json' });
    try {
      const f = new File([blob], nome, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], title: 'Backup Forja' });
        return marcarBackup();
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    marcarBackup();
  });
  $('#btn-copiar').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(pacote()); marcarBackup(); alert('Backup copiado. Cole em um lugar seguro, como uma conversa com você mesmo.'); }
    catch (e) { abrirModal(`<h2>Copie o texto</h2><textarea readonly>${pacote().replace(/</g, '&lt;')}</textarea><div class="col-btns"><button class="btn azul" data-fechar>Pronto</button></div>`); marcarBackup(); }
  });
  function importar(txt) {
    let o;
    try { o = JSON.parse(txt); } catch (e) { return alert('Esse conteúdo não é um backup válido.'); }
    const d = o && o.app === 'forja' && o.dados ? o.dados : null;
    if (!d || d.app !== 'forja') return alert('Esse arquivo não é um backup do Forja.');
    if (!confirm('Substituir todos os dados atuais pelo backup de ' + (o.exportadoEm ? fmtData(o.exportadoEm.slice(0, 10)) : 'data desconhecida') + '?')) return;
    E = Object.assign(novoEstado(), d); salvar(); fecharModal(); ir('heroi'); reagir('comemora', 'comemora', 'Voltei! Tudo restaurado.', 2600);
  }
  $('#in-arquivo').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => importar(r.result); r.readAsText(f); e.target.value = '';
  });
  $('#btn-colar').addEventListener('click', () => {
    abrirModal(`<h2>Colar backup</h2><p class="sub pequeno">Cole abaixo o texto do backup.</p><textarea id="txt-backup"></textarea><div class="col-btns"><button class="btn verde" id="btn-importar-txt">Restaurar</button><button class="btn branco" data-fechar>Cancelar</button></div>`);
    $('#btn-importar-txt').addEventListener('click', () => importar($('#txt-backup').value));
  });
  $('#btn-zerar').addEventListener('click', () => {
    if (!confirm('Apagar todo o progresso deste aparelho? Faça um backup antes.')) return;
    if (!confirm('Tem certeza? Isso não pode ser desfeito.')) return;
    E = novoEstado(); salvar(); ir('heroi');
  });

  /* ---------- início ---------- */
  zerarDia(); salvar();
  ir('heroi');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && $('#tela-heroi').classList.contains('ativa')) renderHeroiTela(); });
})();
