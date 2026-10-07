/* Forja: personagem em camadas SVG.
   Corpo: calculado só pelas medidas reais (peso, altura, massa muscular).
   Rosto e cabelo: configuráveis no criador de avatar.
   Camadas: aura, capa, cabelo de trás, pernas, short, tronco, braços, cabeça, acessórios. */
(function () {
  'use strict';

  const PELES = [
    { id: 'p1', nome: 'Clara', c: '#fbd7c0', s: '#eab397' },
    { id: 'p2', nome: 'Rosada', c: '#f4c39c', s: '#e3a77f' },
    { id: 'p3', nome: 'Morena clara', c: '#e3a97c', s: '#c98b5e' },
    { id: 'p4', nome: 'Morena', c: '#c68a5c', s: '#a86f45' },
    { id: 'p5', nome: 'Negra', c: '#8d5a3b', s: '#714429' },
    { id: 'p6', nome: 'Retinta', c: '#5e3a26', s: '#4a2c1b' }
  ];
  const CORES_CABELO = [
    { id: 'preto', nome: 'Preto', c: '#2b2220', e: '#1a1413' },
    { id: 'castanho-esc', nome: 'Castanho escuro', c: '#4f2f1a', e: '#3a2112' },
    { id: 'castanho', nome: 'Castanho', c: '#6b4226', e: '#4f2f1a' },
    { id: 'ruivo', nome: 'Ruivo', c: '#b4532a', e: '#8e3d1c' },
    { id: 'loiro', nome: 'Loiro', c: '#d9a74a', e: '#b8862f' },
    { id: 'grisalho', nome: 'Grisalho', c: '#a9a6ad', e: '#85828a' }
  ];
  const CORES_OLHO = [
    { id: 'castanho', nome: 'Castanho', c: '#7a4a26' },
    { id: 'preto', nome: 'Preto', c: '#2e211a' },
    { id: 'mel', nome: 'Mel', c: '#b07a2c' },
    { id: 'verde', nome: 'Verde', c: '#4f8a4a' },
    { id: 'azul', nome: 'Azul', c: '#3f7cc4' },
    { id: 'cinza', nome: 'Cinza', c: '#7d8a96' }
  ];
  const OPCOES = {
    cabelo: [['curto', 'Curto'], ['raspado', 'Raspado'], ['topete', 'Topete'], ['cacheado', 'Cacheado'], ['longo', 'Longo'], ['coque', 'Coque'], ['careca', 'Careca']],
    sobrancelha: [['fina', 'Fina'], ['media', 'Média'], ['grossa', 'Grossa']],
    bigode: [['nenhum', 'Sem bigode'], ['fino', 'Fino'], ['cheio', 'Cheio']],
    barba: [['nenhuma', 'Sem barba'], ['cavanhaque', 'Cavanhaque'], ['porfazer', 'Por fazer'], ['curta', 'Curta'], ['cheia', 'Cheia']],
    oculos: [['nenhum', 'Sem óculos'], ['redondo', 'Redondo'], ['quadrado', 'Quadrado']]
  };
  const AVATAR_PADRAO = { pele: 'p2', cabelo: 'curto', corCabelo: 'castanho', corBarba: 'castanho-esc', olhos: 'castanho', sobrancelha: 'media', bigode: 'cheio', barba: 'cavanhaque', oculos: 'nenhum' };

  const ROUPAS = {
    camiseta: { nome: 'Camiseta azul', cor: '#7cb7ff', esc: '#5d97e0', tipo: 'manga' },
    regata: { nome: 'Regata verde', cor: '#8fd6a8', esc: '#6bb98a', tipo: 'regata' },
    preta: { nome: 'Camiseta grafite', cor: '#33373d', esc: '#24272c', tipo: 'manga' },
    forja: { nome: 'Camiseta Forja', cor: '#ffb27a', esc: '#ef8f52', tipo: 'manga', logo: true },
    moletom: { nome: 'Moletom roxo', cor: '#b9a3f2', esc: '#957ad8', tipo: 'longa' },
    dourado: { nome: 'Uniforme dourado', cor: '#ffd36e', esc: '#e9b43c', tipo: 'manga', faixas: true }
  };

  /* Auras: liberadas por dias de consistência (ver app.js). Cada estágio mais quente. */
  const AURAS = [
    null,
    { nome: 'Aura amarela', dias: 15, rotulo: '15 dias', a: '#fff3a6', b: '#ffd23f', brilho: '#fffbe0' },
    { nome: 'Aura dourada', dias: 30, rotulo: '1 mês', a: '#ffe07a', b: '#ffb21f', brilho: '#fff1c2', fagulhas: true },
    { nome: 'Aura laranja', dias: 182, rotulo: '6 meses', a: '#ffbf73', b: '#ff7f2a', brilho: '#ffe0b8', fagulhas: true },
    { nome: 'Aura vermelha', dias: 365, rotulo: '1 ano', a: '#ff8a7a', b: '#ff3232', brilho: '#ffd0d0', fagulhas: true },
    { nome: 'Aura rubi', dias: 730, rotulo: '2 anos', a: '#ff5a7a', b: '#d1003a', brilho: '#ffb3c4', fagulhas: true },
    { nome: 'Aura carmesim', dias: 1825, rotulo: '5 anos', a: '#e0213f', b: '#8a0016', brilho: '#ff8fa0', fagulhas: true, raios: true },
    { nome: 'Aura lendária', dias: 3650, rotulo: '10 anos', a: '#ff1a3d', b: '#5c000c', brilho: '#ffe36e', fagulhas: true, raios: true, lenda: true }
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const achar = (lista, id) => lista.find(x => x.id === id) || lista[0];
  const pt = (x, y) => x.toFixed(1) + ',' + y.toFixed(1);

  function corpoDeMedidas(med) {
    if (!med || !med.peso || !med.altura) return { m: 0.3, g: 0.25, h: 1 };
    const alt = med.altura / 100;
    const imc = med.peso / (alt * alt);
    const pctM = med.musculoKg ? (med.musculoKg / med.peso) * 100 : 36;
    const m = clamp((pctM - 30) / 16, 0, 1);
    const g = clamp((imc - 21) / 11 - m * 0.35, 0, 1);
    const h = clamp(med.altura / 175, 0.93, 1.07);
    return { m, g, h, imc, pctM };
  }

  function braco(lado, S, A, pose, R, pele, munhequeira) {
    const poses = { idle: [14, 8], comemora: [150, 168], flex: [88, 178], sono: [6, 2], aceno: [14, 8] };
    let [a1, a2] = poses[pose] || poses.idle;
    if (pose === 'aceno' && lado === 1) { a1 = 140; a2 = 165; }
    const sx = 150 + lado * (S - 7), sy = 164;
    const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
    const L1 = 50, L2 = 46;
    const ex = sx + lado * Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
    const hx = ex + lado * Math.sin(r2) * L2, hy = ey + Math.cos(r2) * L2;
    const cBraco = R.tipo === 'longa' ? R.cor : pele.c;
    let s = `<g class="braco">`;
    s += `<path d="M${pt(ex, ey)} L${pt(hx, hy)}" stroke="${cBraco}" stroke-width="${(A * 1.7).toFixed(1)}" stroke-linecap="round"/>`;
    s += `<path d="M${pt(sx, sy)} L${pt(ex, ey)}" stroke="${cBraco}" stroke-width="${(A * 2).toFixed(1)}" stroke-linecap="round"/>`;
    const bx = sx + (ex - sx) * 0.55, by = sy + (ey - sy) * 0.55;
    const ang = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
    s += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${(A * 1.3).toFixed(1)}" ry="${(A * (pose === 'flex' ? 1.22 : 1.06)).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)})" fill="${cBraco}"/>`;
    if (R.tipo === 'manga') {
      const mx = sx + (ex - sx) * 0.42, my = sy + (ey - sy) * 0.42;
      s += `<path d="M${pt(sx, sy)} L${pt(mx, my)}" stroke="${R.cor}" stroke-width="${(A * 2 + 9).toFixed(1)}" stroke-linecap="round"/>`;
    }
    if (R.tipo === 'longa') s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(A * 0.95).toFixed(1)}" fill="${R.esc}"/>`;
    if (munhequeira) {
      s += `<path d="M${pt(ex + (hx - ex) * 0.7, ey + (hy - ey) * 0.7)} L${pt(ex + (hx - ex) * 0.84, ey + (hy - ey) * 0.84)}" stroke="#ff7aa8" stroke-width="${(A * 1.9).toFixed(1)}"/>`;
    }
    s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(A * 0.85 + 2).toFixed(1)}" fill="${pele.c}"/>`;
    s += `<circle cx="${(hx - lado * 2).toFixed(1)}" cy="${(hy - 2).toFixed(1)}" r="${(A * 0.35).toFixed(1)}" fill="#fff" opacity=".25"/>`;
    return s + '</g>';
  }

  function aura(n) {
    const A = AURAS[n];
    if (!A) return '';
    const id = 'au' + n + Math.random().toString(36).slice(2, 6);
    let s = `<defs><radialGradient id="${id}g" cx="50%" cy="62%" r="60%"><stop offset="0%" stop-color="${A.brilho}" stop-opacity=".95"/><stop offset="55%" stop-color="${A.a}" stop-opacity=".75"/><stop offset="100%" stop-color="${A.b}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}l" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${A.b}" stop-opacity=".95"/><stop offset="100%" stop-color="${A.a}" stop-opacity=".2"/></linearGradient></defs>`;
    s += `<g class="aura${A.lenda ? ' lenda' : ''}">`;
    s += `<ellipse cx="150" cy="250" rx="${120 + n * 3}" ry="${175 + n * 3}" fill="url(#${id}g)" class="aura-halo"/>`;
    const chama = 'M150,22 C160,52 178,40 182,70 C196,58 208,84 204,108 C226,104 232,142 222,170 C246,184 246,236 236,270 C254,300 246,350 230,398 L70,398 C54,350 46,300 64,270 C54,236 54,184 78,170 C68,142 74,104 96,108 C92,84 104,58 118,70 C122,40 140,52 150,22 Z';
    s += `<path d="${chama}" fill="url(#${id}l)" class="aura-chama a1"/>`;
    s += `<g transform="translate(150 398) scale(.82 .9) translate(-150 -398)"><path d="${chama}" fill="url(#${id}l)" class="aura-chama a2"/></g>`;
    if (A.fagulhas) {
      const q = 5 + n * 2;
      for (let i = 0; i < q; i++) {
        const x = 64 + (i * 37) % 172;
        s += `<circle class="fagulha" cx="${x}" cy="380" r="${2 + (i % 3)}" fill="${A.brilho}" style="animation-delay:${(i * 0.29).toFixed(2)}s"/>`;
      }
    }
    if (A.raios) {
      s += `<path class="raio r1" d="M64,150 L82,186 L70,190 L92,232" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path class="raio r2" d="M236,200 L218,236 L232,240 L210,286" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (A.lenda) s += `<path class="raio r3" d="M150,8 L140,40 L154,42 L144,74" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return s + '</g>';
  }

  function cabeloTras(av, cor) {
    if (av.cabelo === 'longo') return `<path d="M103,92 C94,150 104,176 116,186 L184,186 C196,176 206,150 197,92 C190,58 110,58 103,92 Z" fill="${cor.c}"/>`;
    return '';
  }

  function cabeloFrente(av, cor, pele) {
    const c = cor.c, e = cor.e;
    switch (av.cabelo) {
      case 'careca':
        return `<ellipse cx="138" cy="62" rx="14" ry="6" fill="#fff" opacity=".25"/>`;
      case 'raspado':
        return `<path d="M108,90 C104,48 196,48 192,90 C186,68 170,60 150,60 C130,60 114,68 108,90 Z" fill="${c}" opacity=".55"/>`;
      case 'topete':
        return `<path d="M107,94 C100,56 128,40 156,44 C186,42 204,62 194,94 C190,78 182,72 172,68 C164,74 146,74 132,68 C120,74 112,82 107,94 Z" fill="${c}"/>
          <path d="M118,62 C112,26 158,12 188,32 C200,40 196,52 190,58 C178,44 160,44 150,56 C140,50 126,54 118,62 Z" fill="${c}"/>
          <path d="M136,36 C150,26 170,26 182,36" stroke="${e}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
      case 'cacheado': {
        let s = `<path d="M106,96 C98,52 202,52 194,96 C188,76 172,68 150,68 C128,68 112,76 106,96 Z" fill="${c}"/>`;
        const pts = [[108, 86], [110, 70], [120, 58], [134, 50], [150, 47], [166, 50], [180, 58], [190, 70], [192, 86], [128, 64], [150, 60], [172, 64]];
        for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="${e}" opacity=".45"/>`;
        return s;
      }
      case 'coque':
        return `<circle cx="150" cy="44" r="15" fill="${c}"/><path d="M106,94 C100,54 200,54 194,94 C188,74 172,64 150,64 C128,64 112,74 106,94 Z" fill="${c}"/><path d="M128,64 C140,58 160,58 172,64" stroke="${e}" stroke-width="2.5" fill="none" opacity=".6"/>`;
      case 'longo':
        return `<path d="M104,100 C98,52 202,52 196,100 C190,74 178,64 160,62 C150,70 136,72 122,68 C112,76 106,86 104,100 Z" fill="${c}"/>`;
      default:
        return `<path d="M107,94 C100,56 128,36 156,42 C186,40 204,62 194,94 C190,78 182,70 172,66 C164,74 146,74 132,66 C120,72 112,80 107,94 Z" fill="${c}"/>
          <path d="M132,48 C138,30 158,26 170,40 C160,36 150,40 146,50 Z" fill="${c}"/>
          <path d="M150,46 C160,44 170,48 176,56" stroke="${e}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
    }
  }

  function cabeca(humor, acessorio, av) {
    const pele = achar(PELES, av.pele), cab = achar(CORES_CABELO, av.corCabelo), bar = achar(CORES_CABELO, av.corBarba || av.corCabelo), olho = achar(CORES_OLHO, av.olhos);
    let s = '<g class="cabeca">';
    s += `<circle cx="110" cy="100" r="10" fill="${pele.c}"/><circle cx="190" cy="100" r="10" fill="${pele.c}"/>`;
    s += `<circle cx="110" cy="100" r="5" fill="${pele.s}"/><circle cx="190" cy="100" r="5" fill="${pele.s}"/>`;
    s += `<ellipse cx="150" cy="96" rx="41" ry="44" fill="${pele.c}"/>`;
    s += `<ellipse cx="140" cy="80" rx="18" ry="10" fill="#fff" opacity=".16"/>`;
    // barba (atrás da boca)
    if (av.barba === 'curta' || av.barba === 'porfazer') {
      s += `<path d="M110,100 C111,142 130,152 150,152 C170,152 189,142 190,100 C185,124 172,136 150,136 C128,136 115,124 110,100 Z" fill="${bar.c}" opacity="${av.barba === 'porfazer' ? '.38' : '1'}"/>`;
      s += `<path d="M132,124 Q150,116 168,124 L168,132 Q150,128 132,132 Z" fill="${bar.c}" opacity="${av.barba === 'porfazer' ? '.38' : '1'}"/>`;
    }
    if (av.barba === 'cheia') {
      s += `<path d="M107,94 C104,152 128,166 150,166 C172,166 196,152 193,94 C188,122 174,132 150,132 C126,132 112,122 107,94 Z" fill="${bar.c}"/>`;
      s += `<path d="M128,120 Q150,110 172,120 L172,134 Q150,128 128,134 Z" fill="${bar.c}"/>`;
      s += `<path d="M140,150 Q150,156 160,150" stroke="${bar.e}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/>`;
    }
    s += cabeloFrente(av, cab, pele);
    s += `<ellipse cx="122" cy="114" rx="8" ry="5" fill="#ff8f8f" opacity=".3"/><ellipse cx="178" cy="114" rx="8" ry="5" fill="#ff8f8f" opacity=".3"/>`;
    const sw = { fina: 3, media: 5, grossa: 7 }[av.sobrancelha] || 5;
    if (humor === 'sono') {
      s += `<path d="M124,86 Q134,84 144,88" stroke="${cab.e}" stroke-width="${sw}" fill="none" stroke-linecap="round"/><path d="M156,88 Q166,84 176,86" stroke="${cab.e}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    } else {
      s += `<path d="M123,82 Q133,74 145,80" stroke="${cab.e}" stroke-width="${sw}" fill="none" stroke-linecap="round"/><path d="M155,82 Q167,78 177,84" stroke="${cab.e}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    }
    if (humor === 'comemora') {
      s += `<path d="M126,100 Q134,88 142,100" stroke="#3a2416" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M158,100 Q166,88 174,100" stroke="#3a2416" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    } else if (humor === 'sono') {
      for (const cx of [134, 166]) {
        s += `<path d="M${cx - 10},97 Q${cx},106 ${cx + 10},97 Z" fill="#fff"/><path d="M${cx - 6},99 Q${cx + 1},105 ${cx + 7},99 Z" fill="${olho.c}"/>`;
        s += `<path d="M${cx - 11},97 Q${cx},93 ${cx + 11},97" stroke="#3a2416" stroke-width="3" fill="${pele.c}" stroke-linecap="round"/>`;
      }
    } else {
      s += `<g class="olhos">`;
      for (const cx of [134, 166]) {
        s += `<ellipse cx="${cx}" cy="98" rx="9.5" ry="11.5" fill="#fff"/>`;
        s += `<circle cx="${cx + 1}" cy="100" r="6.8" fill="${olho.c}"/><circle cx="${cx + 1}" cy="100" r="3.6" fill="#1e1410"/>`;
        s += `<circle cx="${cx + 3.5}" cy="96.5" r="2.3" fill="#fff"/><circle cx="${cx - 1.5}" cy="103" r="1.1" fill="#fff" opacity=".8"/>`;
      }
      s += `</g>`;
    }
    if (av.oculos === 'redondo') {
      s += `<g fill="none" stroke="#2e2a38" stroke-width="3"><circle cx="134" cy="98" r="14"/><circle cx="166" cy="98" r="14"/><path d="M148,96 Q150,93 152,96"/><path d="M120,96 L111,93 M180,96 L189,93"/></g>`;
    } else if (av.oculos === 'quadrado') {
      s += `<g fill="none" stroke="#2e2a38" stroke-width="3.2"><rect x="119" y="87" width="30" height="23" rx="6"/><rect x="151" y="87" width="30" height="23" rx="6"/><path d="M119,94 L110,91 M181,94 L190,91"/></g>`;
    }
    s += `<ellipse cx="150" cy="110" rx="6.5" ry="5.5" fill="${pele.s}"/><ellipse cx="148" cy="108" rx="2.2" ry="1.6" fill="#fff" opacity=".4"/>`;
    if (humor === 'comemora') {
      s += `<path d="M135,121 Q150,142 165,121 Z" fill="#7a2e2e"/><path d="M142,131 Q150,138 158,131 Q150,128 142,131 Z" fill="#ff8a8a"/>`;
    } else if (humor === 'sono') {
      s += `<ellipse cx="150" cy="125" rx="4" ry="5" fill="#7a2e2e"/>`;
    } else {
      s += `<path d="M138,121 Q150,135 163,120 Q150,126 138,121 Z" fill="#7a2e2e"/><path d="M146,127 Q151,130 156,126" stroke="#ff8a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    if (av.bigode === 'cheio') {
      s += `<path d="M150,115 C143,110 131,112 126,121 C134,118 142,120 150,118 C158,120 166,118 174,121 C169,112 157,110 150,115 Z" fill="${bar.e}"/>`;
    } else if (av.bigode === 'fino') {
      s += `<path d="M150,116 C143,114 135,115 131,119 C138,118 144,119 150,118.5 C156,119 162,118 169,119 C165,115 157,114 150,116 Z" fill="${bar.e}"/>`;
    }
    if (av.barba === 'cavanhaque') {
      s += `<path d="M141,134 Q150,152 159,134 Q150,139 141,134 Z" fill="${bar.e}"/>`;
    }
    if (acessorio === 'faixa') {
      s += `<path d="M108,78 Q150,64 192,78 L192,88 Q150,74 108,88 Z" fill="#ff6b8b"/><path d="M190,84 Q212,78 218,88 Q204,86 192,90 Z" fill="#ff8fa6"/>`;
    }
    if (acessorio === 'bone') {
      s += `<path d="M108,76 C108,44 192,44 192,76 Z" fill="#ff7a59"/><path d="M106,76 Q150,68 194,76 Q200,82 214,82 Q206,90 192,86 Q150,78 108,86 Z" fill="#e85c3d"/><circle cx="150" cy="50" r="4" fill="#e85c3d"/>`;
    }
    if (acessorio === 'fone') {
      s += `<path d="M104,98 C98,40 202,40 196,98" stroke="#5b6b9a" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="96" y="88" width="16" height="26" rx="8" fill="#7c8cc4"/><rect x="188" y="88" width="16" height="26" rx="8" fill="#7c8cc4"/>`;
    }
    if (humor === 'sono') {
      s += `<g class="zzz"><text x="196" y="60" font-family="Archivo,sans-serif" font-weight="700" font-size="18" fill="#a9b6ee">z</text><text x="208" y="44" font-family="Archivo,sans-serif" font-weight="700" font-size="24" fill="#a9b6ee">Z</text></g>`;
    }
    return s + '</g>';
  }

  function render(o) {
    const c = o.corpo || corpoDeMedidas(null);
    const av = Object.assign({}, AVATAR_PADRAO, o.avatar || {});
    const pele = achar(PELES, av.pele);
    const { m, g } = c;
    const S = 44 + 22 * m + 4 * g, W = 31 + 5 * m + 21 * g, A = 10.5 + 7 * m + 3 * g;
    const T = 15 + 6 * m + 5 * g, C = 10.5 + 4 * m + 2 * g, bar = 16 * g, pei = 8 * m;
    const pose = o.pose || 'idle', humor = o.humor || 'feliz';
    const R = ROUPAS[o.roupa] || ROUPAS.camiseta;
    const acc = o.acessorio || 'nenhum';
    const hx = Math.max(W * 0.48, T + 1);
    const Mx = Math.max(W + bar * 0.3, S - 9);
    const so = o.soCabeca;

    let s = `<svg viewBox="${so ? '92 22 116 150' : '0 0 300 420'}" xmlns="http://www.w3.org/2000/svg" class="heroi-svg ${o.apagado ? 'apagado' : ''}" role="img" aria-label="Personagem">`;
    if (!so) {
      s += `<ellipse cx="150" cy="404" rx="${(70 + S * 0.4).toFixed(1)}" ry="10" fill="#000" opacity=".18"/>`;
      s += aura(o.aura || 0);
    }
    s += `<g class="corpo" transform="translate(150 400) scale(${(so ? 1 : c.h).toFixed(3)}) translate(-150 -400)">`;
    if (acc === 'capa' && !so) {
      s += `<path d="M${150 - S + 8},150 Q150,140 ${150 + S - 8},150 L${150 + S + 28},330 Q150,350 ${150 - S - 28},330 Z" fill="#ff5a6e" class="capa"/>`;
    }
    s += cabeloTras(av, achar(CORES_CABELO, av.corCabelo));
    if (!so) {
      s += '<g class="pernas">' + [-1, 1].map(l => {
        const qx = 150 + l * hx, kx = qx + l * 3, ax = qx + l * 4;
        let p = `<path d="M${pt(qx, 252)} L${pt(kx, 322)}" stroke="${pele.c}" stroke-width="${(T * 2).toFixed(1)}" stroke-linecap="round"/>`;
        p += `<path d="M${pt(kx, 322)} L${pt(ax, 384)}" stroke="${pele.c}" stroke-width="${(C * 2).toFixed(1)}" stroke-linecap="round"/>`;
        p += `<ellipse cx="${(kx + l * 1.5).toFixed(1)}" cy="344" rx="${(C * 1.12).toFixed(1)}" ry="${(C * 1.5).toFixed(1)}" fill="${pele.c}"/>`;
        p += `<ellipse cx="${(kx - l * 2).toFixed(1)}" cy="322" rx="${(T * 0.55).toFixed(1)}" ry="${(T * 0.4).toFixed(1)}" fill="${pele.s}" opacity=".35"/>`;
        p += `<path d="M${pt(ax, 374)} L${pt(ax, 386)}" stroke="#fff" stroke-width="${(C * 2 + 1).toFixed(1)}"/>`;
        p += `<path d="M${(ax - 18 + l * 5).toFixed(1)},398 Q${(ax - 18 + l * 5).toFixed(1)},382 ${(ax + l * 5).toFixed(1)},382 Q${(ax + 20 + l * 5).toFixed(1)},382 ${(ax + 22 + l * 5).toFixed(1)},398 Z" fill="#fff" stroke="#c9d4f0" stroke-width="2"/>`;
        p += `<rect x="${(ax - 19 + l * 5).toFixed(1)}" y="394" width="42" height="7" rx="3.5" fill="#c6a06a"/>`;
        return p;
      }).join('') + '</g>';
      const sy = 244;
      s += `<path d="M${pt(150 - W - 2, sy)} L${pt(150 + W + 2, sy)} L${pt(150 + hx + T + 4, 298)} Q${pt(150 + hx, 304)} ${pt(153, 296)} L150,276 L${pt(147, 296)} Q${pt(150 - hx, 304)} ${pt(150 - hx - T - 4, 298)} Z" fill="#343a46"/>`;
      s += `<path d="M${pt(150 - W - 1, sy + 6)} L${pt(150 + W + 1, sy + 6)}" stroke="#2a2f3a" stroke-width="5"/>`;
    }
    s += `<rect x="${(140 - 3 * m).toFixed(1)}" y="124" width="${(20 + 6 * m).toFixed(1)}" height="30" rx="8" fill="${pele.c}"/>`;
    s += `<rect x="${(140 - 3 * m).toFixed(1)}" y="136" width="${(20 + 6 * m).toFixed(1)}" height="8" fill="${pele.s}" opacity=".35"/>`;
    const tronco = `M${pt(135, 144)} Q${pt(150 - S + 4, 144)} ${pt(150 - S, 160)} C${pt(150 - S + 1, 180)} ${pt(150 - S + 6, 194)} ${pt(150 - Mx, 210)} C${pt(150 - Mx - bar * 0.7, 226)} ${pt(150 - W - bar * 0.4, 242)} ${pt(150 - W, 250)} L${pt(150 + W, 250)} C${pt(150 + W + bar * 0.4, 242)} ${pt(150 + Mx + bar * 0.7, 226)} ${pt(150 + Mx, 210)} C${pt(150 + S - 6, 194)} ${pt(150 + S - 1, 180)} ${pt(150 + S, 160)} Q${pt(150 + S - 4, 144)} ${pt(165, 144)} Z`;
    if (R.tipo === 'regata') {
      s += `<path d="${tronco}" fill="${pele.c}"/>`;
      s += `<path d="M${pt(130, 144)} L${pt(150 - S + 16, 150)} C${pt(150 - S + 18, 180)} ${pt(150 - S + 8, 196)} ${pt(150 - Mx, 212)} C${pt(150 - Mx - bar * 0.7, 226)} ${pt(150 - W - bar * 0.4, 242)} ${pt(150 - W, 250)} L${pt(150 + W, 250)} C${pt(150 + W + bar * 0.4, 242)} ${pt(150 + Mx + bar * 0.7, 226)} ${pt(150 + Mx, 212)} C${pt(150 + S - 8, 196)} ${pt(150 + S - 18, 180)} ${pt(150 + S - 16, 150)} L${pt(170, 144)} Z" fill="${R.cor}"/>`;
    } else {
      s += `<path d="${tronco}" fill="${R.cor}"/>`;
    }
    s += `<path d="M${pt(150 - S * 0.62, 186 + pei * 0.2)} Q${pt(150 - S * 0.3, 198 + pei * 0.6)} ${pt(150, 190)} Q${pt(150 + S * 0.3, 198 + pei * 0.6)} ${pt(150 + S * 0.62, 186 + pei * 0.2)}" stroke="${R.esc}" stroke-width="3" fill="none" stroke-linecap="round" opacity="${(0.15 + m * 0.7).toFixed(2)}"/>`;
    if (m > 0.55) s += `<path d="M150,206 L150,236 M140,214 Q150,217 160,214 M141,226 Q150,229 159,226" stroke="${R.esc}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="${((m - 0.55) * 1.6).toFixed(2)}"/>`;
    if (R.faixas) s += `<path d="M${pt(150 - S + 4, 170)} L${pt(150 - W - 2, 248)} M${pt(150 + S - 4, 170)} L${pt(150 + W + 2, 248)}" stroke="#fff" stroke-width="5" opacity=".75"/>`;
    if (R.logo) s += `<path d="M150,190 C158,198 160,206 154,214 C156,206 150,202 148,206 C146,200 150,196 150,190 Z M150,200 C143,206 142,214 148,218 C140,216 138,206 150,200 Z" fill="#fff" opacity=".9"/>`;
    if (o.roupa === 'preta') s += `<path d="M150,192 C156,198 158,206 153,212 C154,206 150,203 148,206 C146,201 150,197 150,192 Z" fill="#c6a06a"/>`;
    s += `<path d="M${pt(135, 144)} Q150,${(162 + m * 2).toFixed(1)} ${pt(165, 144)} Z" fill="${pele.c}"/>`;
    s += `<path d="M${pt(134, 144)} Q150,${(163 + m * 2).toFixed(1)} ${pt(166, 144)}" stroke="${R.esc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    if (acc === 'medalha') s += `<path d="M138,146 L150,190 L162,146" stroke="#ff6b8b" stroke-width="6" fill="none" stroke-linejoin="round"/><circle cx="150" cy="196" r="11" fill="#ffd23f" stroke="#e9a91f" stroke-width="3"/>`;
    if (!so) {
      s += braco(-1, S, A, pose, R, pele, acc === 'munhequeira');
      s += braco(1, S, A, pose, R, pele, acc === 'munhequeira');
    }
    s += cabeca(humor, acc, av);
    s += '</g></svg>';
    return s;
  }

  function cenario(id) {
    const C = {
      forja: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="fw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17181b"/><stop offset="1" stop-color="#22201e"/></linearGradient><radialGradient id="fg" cx="18%" cy="82%" r="70%"><stop offset="0" stop-color="#d9693a" stop-opacity=".55"/><stop offset=".45" stop-color="#8a3d1c" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2420"/><stop offset="1" stop-color="#131315"/></linearGradient></defs><rect width="300" height="420" fill="url(#fw)"/><g stroke="#ffffff" stroke-opacity=".035" stroke-width="1">${Array.from({ length: 12 }, (_, i) => `<line x1="0" x2="300" y1="${30 + i * 26}" y2="${30 + i * 26}"/>`).join('')}${Array.from({ length: 24 }, (_, i) => `<line x1="${(i % 2 ? 25 : 0) + (i >> 1) * 50}" x2="${(i % 2 ? 25 : 0) + (i >> 1) * 50}" y1="${30 + (i % 12) * 26}" y2="${56 + (i % 12) * 26}"/>`).join('')}</g><g fill="#0f1012" opacity=".9"><rect x="214" y="70" width="4" height="70"/><rect x="204" y="134" width="24" height="12" rx="2"/><rect x="242" y="70" width="3" height="60"/><circle cx="243.5" cy="138" r="10" fill="none" stroke="#0f1012" stroke-width="4"/><path d="M14 330 L14 270 Q14 236 46 236 L74 236 Q96 236 96 270 L96 330 Z"/></g><path d="M30 300 Q55 262 80 300 Z" fill="#d9693a" opacity=".9"/><path d="M40 300 Q55 276 70 300 Z" fill="#f0a06b"/><rect width="300" height="420" fill="url(#fg)"/><g fill="#0d0e10"><path d="M222 328 h58 v-8 q-6 -14 -24 -14 h-40 q10 8 6 14 z"/><rect x="236" y="328" width="20" height="18"/><rect x="226" y="346" width="40" height="8" rx="2"/></g><rect x="0" y="352" width="300" height="68" fill="url(#ff)"/><ellipse cx="150" cy="356" rx="200" ry="6" fill="#d9693a" opacity=".08"/>${[[60, 210, 1.6], [82, 170, 1.2], [44, 150, 1], [96, 240, 1.4], [70, 120, .9], [110, 190, 1]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0a06b" opacity=".7"/>`).join('')}</svg>`,
      parque: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient></defs><rect width="300" height="420" fill="url(#cp)"/><circle cx="246" cy="70" r="26" fill="#fff3b0"/><ellipse cx="70" cy="80" rx="34" ry="14" fill="#fff" opacity=".9"/><ellipse cx="96" cy="72" rx="22" ry="12" fill="#fff" opacity=".9"/><circle cx="34" cy="300" r="40" fill="#a8e0b4"/><circle cx="270" cy="296" r="46" fill="#98d6a6"/><rect x="0" y="330" width="300" height="90" fill="#bfe8c2"/><ellipse cx="150" cy="335" rx="220" ry="26" fill="#bfe8c2"/></svg>`,
      noite: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1a33"/><stop offset="1" stop-color="#34305a"/></linearGradient></defs><rect width="300" height="420" fill="url(#cn)"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${(i * 61) % 300}" cy="${(i * 37) % 260}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity="${0.35 + (i % 4) * 0.15}"/>`).join('')}<circle cx="240" cy="72" r="22" fill="#fff3c4"/><circle cx="250" cy="66" r="20" fill="#2a2748"/><circle cx="34" cy="300" r="40" fill="#2f4a46"/><circle cx="270" cy="296" r="46" fill="#2a433f"/><rect x="0" y="330" width="300" height="90" fill="#334d44"/><ellipse cx="150" cy="335" rx="220" ry="26" fill="#334d44"/></svg>`,
      academia: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#2a2638"/><rect x="0" y="0" width="300" height="40" fill="#221f2e"/><rect x="40" y="10" width="60" height="10" rx="5" fill="#ffe9a8" opacity=".8"/><rect x="200" y="10" width="60" height="10" rx="5" fill="#ffe9a8" opacity=".8"/><rect x="18" y="120" width="10" height="200" rx="5" fill="#4a4460"/><rect x="62" y="120" width="10" height="200" rx="5" fill="#4a4460"/><rect x="10" y="170" width="70" height="8" rx="4" fill="#8f79d6"/><circle cx="12" cy="174" r="16" fill="#ff8a3d"/><circle cx="78" cy="174" r="16" fill="#ff8a3d"/><rect x="226" y="250" width="60" height="70" rx="12" fill="#3d3654"/><rect x="0" y="330" width="300" height="90" fill="#3a3450"/><path d="M0,330 L300,330" stroke="#ff8a3d" stroke-width="3"/></svg>`,
      praia: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#ffe6d1"/><circle cx="150" cy="210" r="60" fill="#ffc48a" opacity=".8"/><rect x="0" y="240" width="300" height="100" fill="#9ad8f0"/><path d="M0,250 Q40,240 80,250 T160,250 T240,250 T320,250" stroke="#d8f3ff" stroke-width="4" fill="none"/><rect x="0" y="330" width="300" height="90" fill="#ffe2a8"/><ellipse cx="150" cy="332" rx="220" ry="18" fill="#ffe2a8"/><path d="M262,330 Q258,250 270,200" stroke="#c48a5a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M270,200 Q240,190 228,210 M270,200 Q296,186 300,206 M270,200 Q262,176 244,176" stroke="#7cc98f" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`,
      montanha: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#dff1ff"/><path d="M-20,300 L80,150 L150,250 L210,140 L320,300 Z" fill="#b6c6ea"/><path d="M80,150 L98,178 L86,174 L72,186 L62,176 Z M210,140 L228,168 L214,162 L202,174 L194,160 Z" fill="#fff"/><path d="M-20,320 L60,240 L140,320 Z" fill="#9fd1a9"/><rect x="0" y="330" width="300" height="90" fill="#bfe8c2"/><ellipse cx="150" cy="332" rx="220" ry="20" fill="#bfe8c2"/></svg>`,
      arena: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#2b1f1a"/><rect x="0" y="120" width="300" height="140" fill="#3d2a22"/><g fill="#6b4a3a">${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + i * 26}" cy="${150 + (i % 2) * 14}" r="9"/>`).join('')}</g><g fill="#7d5644">${Array.from({ length: 12 }, (_, i) => `<circle cx="${25 + i * 26}" cy="${196 + (i % 2) * 12}" r="9"/>`).join('')}</g><rect x="0" y="250" width="300" height="12" fill="#ff8a3d"/><rect x="0" y="330" width="300" height="90" fill="#c99a6a"/><ellipse cx="150" cy="332" rx="230" ry="22" fill="#c99a6a"/><path d="M60,0 L110,330 L190,330 L240,0" fill="#fff" opacity=".1"/></svg>`,
      espaco: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#16152e"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 73) % 300}" cy="${(i * 41) % 300}" r="${1 + (i % 3) * 0.7}" fill="#fff" opacity="${0.4 + (i % 4) * 0.15}"/>`).join('')}<circle cx="240" cy="80" r="30" fill="#ffb3c4"/><ellipse cx="240" cy="80" rx="46" ry="10" fill="none" stroke="#ffd36e" stroke-width="4"/><ellipse cx="150" cy="380" rx="230" ry="70" fill="#4a4780"/><circle cx="80" cy="370" r="10" fill="#3a3770"/><circle cx="220" cy="390" r="14" fill="#3a3770"/></svg>`
    };
    return C[id] || C.forja;
  }

  window.Heroi = { render, cenario, corpoDeMedidas, ROUPAS, AURAS, PELES, CORES_CABELO, CORES_OLHO, OPCOES, AVATAR_PADRAO };
})();
