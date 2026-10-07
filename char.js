/* Forja: personagem em camadas SVG.
   O corpo depende apenas das medidas reais (peso, altura, massa muscular).
   Camadas: cenário (fora), aura, capa, pernas, short, tronco, braços, cabeça, acessórios, efeitos. */
(function () {
  const PELE = '#f4c39c', PELE_S = '#e3a77f', CABELO = '#6b4226', CABELO_E = '#4f2f1a', OLHO = '#7a4a26';

  const ROUPAS = {
    camiseta: { nome: 'Camiseta azul', cor: '#7cb7ff', esc: '#5d97e0', tipo: 'manga' },
    regata: { nome: 'Regata verde', cor: '#8fd6a8', esc: '#6bb98a', tipo: 'regata' },
    forja: { nome: 'Camiseta Forja', cor: '#ffb27a', esc: '#ef8f52', tipo: 'manga', logo: true },
    moletom: { nome: 'Moletom roxo', cor: '#b9a3f2', esc: '#957ad8', tipo: 'longa' },
    dourado: { nome: 'Uniforme dourado', cor: '#ffd36e', esc: '#e9b43c', tipo: 'manga', faixas: true }
  };

  const AURAS = [
    null,
    { nome: 'Aura branca', a: '#ffffff', b: '#dfeeff', brilho: '#ffffff' },
    { nome: 'Aura dourada', a: '#fff1a8', b: '#ffcf3f', brilho: '#fff6c9' },
    { nome: 'Aura laranja', a: '#ffc27a', b: '#ff8a3d', brilho: '#ffe0b8', fagulhas: true },
    { nome: 'Aura vermelha', a: '#ff8a8a', b: '#ff3b3b', brilho: '#ffd0d0', fagulhas: true },
    { nome: 'Aura rubi', a: '#ff5a7a', b: '#d1003a', brilho: '#ffb3c4', fagulhas: true, raios: false },
    { nome: 'Aura carmesim', a: '#e0213f', b: '#7a0011', brilho: '#ff8fa0', fagulhas: true, raios: true }
  ];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Converte medidas em parâmetros visuais.
     m = musculatura (0 a 1), g = gordura aparente (0 a 1), h = escala de altura */
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

  function pt(x, y) { return x.toFixed(1) + ',' + y.toFixed(1); }

  function braco(lado, S, A, pose, roupa, munhequeira) {
    // lado: -1 esquerda, 1 direita. Ângulos em graus a partir de "para baixo", positivo para fora.
    const poses = {
      idle: [14, 8], comemora: [150, 168], flex: [88, 178], sono: [6, 2], aceno: [14, 8]
    };
    let [a1, a2] = poses[pose] || poses.idle;
    if (pose === 'aceno' && lado === 1) { a1 = 140; a2 = 165; }
    if (pose === 'flex' && lado === -1) { a1 = 88; a2 = 178; }
    const sx = 150 + lado * (S - 7), sy = 164;
    const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
    const L1 = 50, L2 = 46;
    const ex = sx + lado * Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
    const hx = ex + lado * Math.sin(r2) * L2, hy = ey + Math.cos(r2) * L2;
    const R = ROUPAS[roupa] || ROUPAS.camiseta;
    let s = `<g class="braco ${lado < 0 ? 'b-esq' : 'b-dir'}">`;
    // antebraço
    s += `<path d="M${pt(ex, ey)} L${pt(hx, hy)}" stroke="${R.tipo === 'longa' ? R.cor : PELE}" stroke-width="${(A * 1.7).toFixed(1)}" stroke-linecap="round"/>`;
    // braço
    s += `<path d="M${pt(sx, sy)} L${pt(ex, ey)}" stroke="${R.tipo === 'longa' ? R.cor : PELE}" stroke-width="${(A * 2).toFixed(1)}" stroke-linecap="round"/>`;
    // bíceps
    const bx = sx + (ex - sx) * 0.55, by = sy + (ey - sy) * 0.55;
    const ang = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
    const bulge = pose === 'flex' ? 1.22 : 1.06;
    s += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${(A * 1.3).toFixed(1)}" ry="${(A * bulge).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)})" fill="${R.tipo === 'longa' ? R.cor : PELE}"/>`;
    if (R.tipo === 'manga') {
      const mx = sx + (ex - sx) * 0.42, my = sy + (ey - sy) * 0.42;
      s += `<path d="M${pt(sx, sy)} L${pt(mx, my)}" stroke="${R.cor}" stroke-width="${(A * 2 + 9).toFixed(1)}" stroke-linecap="round"/>`;
      s += `<path d="M${pt(mx - (ex - sx) * 0.02, my - (ey - sy) * 0.02)} L${pt(mx, my)}" stroke="${R.esc}" stroke-width="${(A * 2 + 9).toFixed(1)}" stroke-linecap="butt" opacity=".5"/>`;
    }
    if (R.tipo === 'longa') {
      s += `<circle cx="${pt(hx, hy).split(',')[0]}" cy="${hy.toFixed(1)}" r="${(A * 0.95).toFixed(1)}" fill="${R.esc}"/>`;
    }
    if (munhequeira) {
      const wx = ex + (hx - ex) * 0.82, wy = ey + (hy - ey) * 0.82;
      const wx2 = ex + (hx - ex) * 0.7, wy2 = ey + (hy - ey) * 0.7;
      s += `<path d="M${pt(wx2, wy2)} L${pt(wx, wy)}" stroke="#ff7aa8" stroke-width="${(A * 1.9).toFixed(1)}" stroke-linecap="butt"/>`;
    }
    // mão
    s += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(A * 0.85 + 2).toFixed(1)}" fill="${PELE}"/>`;
    s += `<circle cx="${(hx - lado * 2).toFixed(1)}" cy="${(hy - 2).toFixed(1)}" r="${(A * 0.35).toFixed(1)}" fill="#ffffff" opacity=".25"/>`;
    s += '</g>';
    return s;
  }

  function aura(n) {
    const A = AURAS[n];
    if (!A) return '';
    const id = 'au' + n;
    let s = `<defs><radialGradient id="${id}g" cx="50%" cy="62%" r="60%"><stop offset="0%" stop-color="${A.brilho}" stop-opacity=".95"/><stop offset="55%" stop-color="${A.a}" stop-opacity=".75"/><stop offset="100%" stop-color="${A.b}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}l" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${A.b}" stop-opacity=".9"/><stop offset="100%" stop-color="${A.a}" stop-opacity=".2"/></linearGradient></defs>`;
    s += `<g class="aura aura-${n}">`;
    s += `<ellipse cx="150" cy="250" rx="130" ry="185" fill="url(#${id}g)" class="aura-halo"/>`;
    const chama = 'M150,22 C160,52 178,40 182,70 C196,58 208,84 204,108 C226,104 232,142 222,170 C246,184 246,236 236,270 C254,300 246,350 230,398 L70,398 C54,350 46,300 64,270 C54,236 54,184 78,170 C68,142 74,104 96,108 C92,84 104,58 118,70 C122,40 140,52 150,22 Z';
    s += `<path d="${chama}" fill="url(#${id}l)" class="aura-chama a1"/>`;
    s += `<g transform="translate(150 398) scale(.82 .9) translate(-150 -398)"><path d="${chama}" fill="url(#${id}l)" class="aura-chama a2"/></g>`;
    if (A.fagulhas) {
      for (let i = 0; i < 9; i++) {
        const x = 70 + (i * 37) % 160, d = (i * 0.37).toFixed(2);
        s += `<circle class="fagulha" cx="${x}" cy="380" r="${2 + (i % 3)}" fill="${A.brilho}" style="animation-delay:${d}s"/>`;
      }
    }
    if (A.raios) {
      s += `<path class="raio r1" d="M64,150 L82,186 L70,190 L92,232" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path class="raio r2" d="M236,200 L218,236 L232,240 L210,286" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    s += '</g>';
    return s;
  }

  function cabeca(humor, acessorio) {
    let s = '<g class="cabeca">';
    // orelhas
    s += `<circle cx="110" cy="100" r="10" fill="${PELE}"/><circle cx="190" cy="100" r="10" fill="${PELE}"/>`;
    s += `<circle cx="110" cy="100" r="5" fill="${PELE_S}"/><circle cx="190" cy="100" r="5" fill="${PELE_S}"/>`;
    // rosto
    s += `<ellipse cx="150" cy="96" rx="41" ry="44" fill="${PELE}"/>`;
    s += `<ellipse cx="140" cy="80" rx="18" ry="10" fill="#ffffff" opacity=".18"/>`;
    // cabelo
    s += `<path d="M107,94 C100,56 128,36 156,42 C186,40 204,62 194,94 C190,78 182,70 172,66 C164,74 146,74 132,66 C120,72 112,80 107,94 Z" fill="${CABELO}"/>`;
    s += `<path d="M132,48 C138,30 158,26 170,40 C160,36 150,40 146,50 Z" fill="${CABELO}"/>`;
    s += `<path d="M150,46 C160,44 170,48 176,56" stroke="${CABELO_E}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
    // bochechas
    s += `<ellipse cx="122" cy="114" rx="8" ry="5" fill="#ff8f8f" opacity=".35"/><ellipse cx="178" cy="114" rx="8" ry="5" fill="#ff8f8f" opacity=".35"/>`;
    // sobrancelhas
    if (humor === 'sono') {
      s += `<path d="M124,86 Q134,84 144,88" stroke="${CABELO_E}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M156,88 Q166,84 176,86" stroke="${CABELO_E}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    } else {
      s += `<path d="M123,82 Q133,74 145,80" stroke="${CABELO_E}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M155,82 Q167,78 177,84" stroke="${CABELO_E}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    // olhos
    if (humor === 'comemora') {
      s += `<path d="M126,100 Q134,88 142,100" stroke="#3a2416" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M158,100 Q166,88 174,100" stroke="#3a2416" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    } else if (humor === 'sono') {
      for (const cx of [134, 166]) {
        s += `<path d="M${cx - 10},97 Q${cx},106 ${cx + 10},97 Z" fill="#ffffff"/><path d="M${cx - 6},99 Q${cx + 1},105 ${cx + 7},99 Z" fill="${OLHO}"/>`;
        s += `<path d="M${cx - 11},97 Q${cx},93 ${cx + 11},97" stroke="#3a2416" stroke-width="3" fill="${PELE}" stroke-linecap="round"/>`;
      }
    } else {
      s += `<g class="olhos">`;
      for (const cx of [134, 166]) {
        s += `<ellipse cx="${cx}" cy="98" rx="9.5" ry="11.5" fill="#ffffff"/>`;
        s += `<circle cx="${cx + 1}" cy="100" r="6.8" fill="${OLHO}"/><circle cx="${cx + 1}" cy="100" r="3.6" fill="#2a1a10"/>`;
        s += `<circle cx="${cx + 3.5}" cy="96.5" r="2.3" fill="#ffffff"/><circle cx="${cx - 1.5}" cy="103" r="1.1" fill="#ffffff" opacity=".8"/>`;
      }
      s += `</g>`;
    }
    // nariz
    s += `<ellipse cx="150" cy="110" rx="6.5" ry="5.5" fill="${PELE_S}"/><ellipse cx="148" cy="108" rx="2.2" ry="1.6" fill="#ffffff" opacity=".4"/>`;
    // boca
    if (humor === 'comemora') {
      s += `<path d="M135,121 Q150,142 165,121 Z" fill="#7a2e2e"/><path d="M142,131 Q150,138 158,131 Q150,128 142,131 Z" fill="#ff8a8a"/>`;
    } else if (humor === 'sono') {
      s += `<ellipse cx="150" cy="125" rx="4" ry="5" fill="#7a2e2e"/>`;
    } else {
      s += `<path d="M138,121 Q150,135 163,120 Q150,126 138,121 Z" fill="#7a2e2e"/><path d="M146,127 Q151,130 156,126" stroke="#ff8a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    // bigode
    s += `<path d="M150,115 C143,110 131,112 126,121 C134,118 142,120 150,118 C158,120 166,118 174,121 C169,112 157,110 150,115 Z" fill="${CABELO_E}"/>`;
    // cavanhaque
    s += `<path d="M141,134 Q150,152 159,134 Q150,139 141,134 Z" fill="${CABELO_E}"/>`;
    // acessórios de cabeça
    if (acessorio === 'faixa') {
      s += `<path d="M108,78 Q150,64 192,78 L192,88 Q150,74 108,88 Z" fill="#ff6b8b"/><path d="M190,82 Q206,84 210,98 Q200,90 192,92 Z" fill="#ff6b8b"/><path d="M190,84 Q212,78 218,88 Q204,86 192,90 Z" fill="#ff8fa6"/>`;
    }
    if (acessorio === 'bone') {
      s += `<path d="M108,76 C108,44 192,44 192,76 Z" fill="#ff7a59"/><path d="M106,76 Q150,68 194,76 Q200,82 214,82 Q206,90 192,86 Q150,78 108,86 Z" fill="#e85c3d"/><circle cx="150" cy="50" r="4" fill="#e85c3d"/>`;
    }
    if (acessorio === 'fone') {
      s += `<path d="M104,98 C98,40 202,40 196,98" stroke="#5b6b9a" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="96" y="88" width="16" height="26" rx="8" fill="#7c8cc4"/><rect x="188" y="88" width="16" height="26" rx="8" fill="#7c8cc4"/>`;
    }
    if (humor === 'sono') {
      s += `<g class="zzz"><text x="196" y="60" font-family="Fredoka" font-weight="700" font-size="18" fill="#8a9bd6">z</text><text x="208" y="44" font-family="Fredoka" font-weight="700" font-size="24" fill="#8a9bd6">Z</text></g>`;
    }
    s += '</g>';
    return s;
  }

  function render(o) {
    const c = o.corpo || corpoDeMedidas(null);
    const { m, g } = c;
    const S = 44 + 22 * m + 4 * g;
    const W = 31 + 5 * m + 21 * g;
    const A = 10.5 + 7 * m + 3 * g;
    const T = 15 + 6 * m + 5 * g;
    const C = 10.5 + 4 * m + 2 * g;
    const bar = 16 * g;
    const pei = 8 * m;
    const pose = o.pose || 'idle';
    const humor = o.humor || 'feliz';
    const R = ROUPAS[o.roupa] || ROUPAS.camiseta;
    const acc = o.acessorio || 'nenhum';
    const hx = Math.max(W * 0.48, T + 1);
    const Mx = Math.max(W + bar * 0.3, S - 9);

    let s = `<svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" class="heroi-svg ${o.apagado ? 'apagado' : ''} pose-${pose} humor-${humor}" aria-label="Personagem">`;
    s += `<ellipse cx="150" cy="404" rx="${(70 + S * 0.4).toFixed(1)}" ry="10" fill="#000" opacity=".12"/>`;
    s += aura(o.aura || 0);
    s += `<g class="corpo" transform="translate(150 400) scale(${c.h.toFixed(3)}) translate(-150 -400)">`;
    // capa
    if (acc === 'capa') {
      s += `<path d="M${150 - S + 8},150 Q150,140 ${150 + S - 8},150 L${150 + S + 28},330 Q150,350 ${150 - S - 28},330 Z" fill="#ff5a6e" class="capa"/>`;
    }
    // pernas
    const pernas = [-1, 1].map(l => {
      const qx = 150 + l * hx, kx = qx + l * 3, ax = qx + l * 4;
      let p = `<path d="M${pt(qx, 252)} L${pt(kx, 322)}" stroke="${PELE}" stroke-width="${(T * 2).toFixed(1)}" stroke-linecap="round"/>`;
      p += `<path d="M${pt(kx, 322)} L${pt(ax, 384)}" stroke="${PELE}" stroke-width="${(C * 2).toFixed(1)}" stroke-linecap="round"/>`;
      p += `<ellipse cx="${(kx + l * 1.5).toFixed(1)}" cy="344" rx="${(C * 1.12).toFixed(1)}" ry="${(C * 1.5).toFixed(1)}" fill="${PELE}"/>`;
      p += `<ellipse cx="${(kx + l * -2).toFixed(1)}" cy="322" rx="${(T * 0.55).toFixed(1)}" ry="${(T * 0.4).toFixed(1)}" fill="${PELE_S}" opacity=".35"/>`;
      // meia e tênis
      p += `<path d="M${pt(ax, 374)} L${pt(ax, 386)}" stroke="#ffffff" stroke-width="${(C * 2 + 1).toFixed(1)}" stroke-linecap="butt"/>`;
      p += `<path d="M${(ax - 18 + l * 5).toFixed(1)},398 Q${(ax - 18 + l * 5).toFixed(1)},382 ${(ax + l * 5).toFixed(1)},382 Q${(ax + 20 + l * 5).toFixed(1)},382 ${(ax + 22 + l * 5).toFixed(1)},398 Z" fill="#ffffff" stroke="#c9d4f0" stroke-width="2"/>`;
      p += `<rect x="${(ax - 19 + l * 5).toFixed(1)}" y="394" width="42" height="7" rx="3.5" fill="#7c8cc4"/>`;
      return p;
    }).join('');
    s += `<g class="pernas">${pernas}</g>`;
    // short
    const sy = 244;
    s += `<path d="M${pt(150 - W - 2, sy)} L${pt(150 + W + 2, sy)} L${pt(150 + hx + T + 4, 298)} Q${pt(150 + hx, 304)} ${pt(150 + 3, 296)} L150,276 L${pt(150 - 3, 296)} Q${pt(150 - hx, 304)} ${pt(150 - hx - T - 4, 298)} Z" fill="#5b6b9a"/>`;
    s += `<path d="M${pt(150 - W - 1, sy + 6)} L${pt(150 + W + 1, sy + 6)}" stroke="#4a5880" stroke-width="5"/>`;
    // pescoço
    s += `<rect x="${(150 - 10 - 3 * m).toFixed(1)}" y="124" width="${(20 + 6 * m).toFixed(1)}" height="30" rx="8" fill="${PELE}"/>`;
    s += `<rect x="${(150 - 10 - 3 * m).toFixed(1)}" y="136" width="${(20 + 6 * m).toFixed(1)}" height="8" fill="${PELE_S}" opacity=".35"/>`;
    // braços atrás quando em pose alta? sempre por cima do tronco, exceto ombro
    // tronco
    const tronco = `M${pt(150 - 15, 144)} Q${pt(150 - S + 4, 144)} ${pt(150 - S, 160)} C${pt(150 - S + 1, 180)} ${pt(150 - S + 6, 194)} ${pt(150 - Mx, 210)} C${pt(150 - Mx - bar * 0.7, 226)} ${pt(150 - W - bar * 0.4, 242)} ${pt(150 - W, 250)} L${pt(150 + W, 250)} C${pt(150 + W + bar * 0.4, 242)} ${pt(150 + Mx + bar * 0.7, 226)} ${pt(150 + Mx, 210)} C${pt(150 + S - 6, 194)} ${pt(150 + S - 1, 180)} ${pt(150 + S, 160)} Q${pt(150 + S - 4, 144)} ${pt(150 + 15, 144)} Z`;
    if (R.tipo === 'regata') {
      // pele dos ombros por baixo da regata
      s += `<path d="${tronco}" fill="${PELE}"/>`;
      s += `<path d="M${pt(150 - 20, 144)} L${pt(150 - S + 16, 150)} C${pt(150 - S + 18, 180)} ${pt(150 - S + 8, 196)} ${pt(150 - Mx, 212)} C${pt(150 - Mx - bar * 0.7, 226)} ${pt(150 - W - bar * 0.4, 242)} ${pt(150 - W, 250)} L${pt(150 + W, 250)} C${pt(150 + W + bar * 0.4, 242)} ${pt(150 + Mx + bar * 0.7, 226)} ${pt(150 + Mx, 212)} C${pt(150 + S - 8, 196)} ${pt(150 + S - 18, 180)} ${pt(150 + S - 16, 150)} L${pt(150 + 20, 144)} Z" fill="${R.cor}"/>`;
    } else {
      s += `<path d="${tronco}" fill="${R.cor}"/>`;
    }
    s += `<path d="M${pt(150 - S * 0.62, 186 + pei * 0.2)} Q${pt(150 - S * 0.3, 198 + pei * 0.6)} ${pt(150, 190)} Q${pt(150 + S * 0.3, 198 + pei * 0.6)} ${pt(150 + S * 0.62, 186 + pei * 0.2)}" stroke="${R.esc}" stroke-width="3" fill="none" stroke-linecap="round" opacity="${(0.15 + m * 0.7).toFixed(2)}"/>`;
    if (m > 0.55) {
      s += `<path d="M150,206 L150,236 M140,214 Q150,217 160,214 M141,226 Q150,229 159,226" stroke="${R.esc}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="${((m - 0.55) * 1.6).toFixed(2)}"/>`;
    }
    if (R.faixas) {
      s += `<path d="M${pt(150 - S + 4, 170)} L${pt(150 - W - 2, 248)} M${pt(150 + S - 4, 170)} L${pt(150 + W + 2, 248)}" stroke="#ffffff" stroke-width="5" opacity=".75"/>`;
    }
    if (R.logo) {
      s += `<path d="M150,190 C158,198 160,206 154,214 C156,206 150,202 148,206 C146,200 150,196 150,190 Z M150,200 C143,206 142,214 148,218 C140,216 138,206 150,200 Z" fill="#ffffff" opacity=".9"/>`;
    }
    // gola
    s += `<path d="M${pt(150 - 15, 144)} Q150,${(162 + m * 2).toFixed(1)} ${pt(150 + 15, 144)} Z" fill="${PELE}"/>`;
    s += `<path d="M${pt(150 - 16, 144)} Q150,${(163 + m * 2).toFixed(1)} ${pt(150 + 16, 144)}" stroke="${R.esc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    if (acc === 'medalha') {
      s += `<path d="M138,146 L150,190 L162,146" stroke="#ff6b8b" stroke-width="6" fill="none" stroke-linejoin="round"/><circle cx="150" cy="196" r="11" fill="#ffd23f" stroke="#e9a91f" stroke-width="3"/><path d="M150,190 L152,195 L157,195 L153,198 L155,203 L150,200 L145,203 L147,198 L143,195 L148,195 Z" fill="#fff6c9"/>`;
    }
    // braços
    s += braco(-1, S, A, pose, o.roupa, acc === 'munhequeira');
    s += braco(1, S, A, pose, o.roupa, acc === 'munhequeira');
    // cabeça
    s += cabeca(humor, acc);
    s += '</g>';
    s += '</svg>';
    return s;
  }

  function cenario(id) {
    const C = {
      parque: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient></defs><rect width="300" height="420" fill="url(#cp)"/><circle cx="246" cy="70" r="26" fill="#fff3b0"/><ellipse cx="70" cy="80" rx="34" ry="14" fill="#fff" opacity=".9"/><ellipse cx="96" cy="72" rx="22" ry="12" fill="#fff" opacity=".9"/><circle cx="34" cy="300" r="40" fill="#a8e0b4"/><circle cx="270" cy="296" r="46" fill="#98d6a6"/><rect x="0" y="330" width="300" height="90" rx="0" fill="#bfe8c2"/><ellipse cx="150" cy="335" rx="220" ry="26" fill="#bfe8c2"/></svg>`,
      academia: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#e9e1ff"/><rect x="0" y="0" width="300" height="40" fill="#d9ccff"/><rect x="18" y="120" width="10" height="200" rx="5" fill="#b9a3f2"/><rect x="62" y="120" width="10" height="200" rx="5" fill="#b9a3f2"/><rect x="10" y="170" width="70" height="8" rx="4" fill="#8f79d6"/><circle cx="12" cy="174" r="16" fill="#7c8cc4"/><circle cx="78" cy="174" r="16" fill="#7c8cc4"/><rect x="226" y="250" width="60" height="70" rx="12" fill="#ffd0e0"/><rect x="0" y="330" width="300" height="90" fill="#cfc2f5"/><path d="M0,330 L300,330" stroke="#b9a3f2" stroke-width="4"/></svg>`,
      praia: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#ffe6d1"/><circle cx="150" cy="210" r="60" fill="#ffc48a" opacity=".8"/><rect x="0" y="240" width="300" height="100" fill="#9ad8f0"/><path d="M0,250 Q40,240 80,250 T160,250 T240,250 T320,250" stroke="#d8f3ff" stroke-width="4" fill="none"/><rect x="0" y="330" width="300" height="90" fill="#ffe2a8"/><ellipse cx="150" cy="332" rx="220" ry="18" fill="#ffe2a8"/><path d="M262,330 Q258,250 270,200" stroke="#c48a5a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M270,200 Q240,190 228,210 M270,200 Q296,186 300,206 M270,200 Q262,176 244,176" stroke="#7cc98f" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`,
      montanha: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#dff1ff"/><path d="M-20,300 L80,150 L150,250 L210,140 L320,300 Z" fill="#b6c6ea"/><path d="M80,150 L98,178 L86,174 L72,186 L62,176 Z M210,140 L228,168 L214,162 L202,174 L194,160 Z" fill="#ffffff"/><path d="M-20,320 L60,240 L140,320 Z" fill="#9fd1a9"/><rect x="0" y="330" width="300" height="90" fill="#bfe8c2"/><ellipse cx="150" cy="332" rx="220" ry="20" fill="#bfe8c2"/></svg>`,
      arena: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#ffe9c7"/><rect x="0" y="120" width="300" height="140" fill="#ffd59a"/><g fill="#ffbf6b">${Array.from({ length: 12 }, (_, i) => `<circle cx="${12 + i * 26}" cy="${150 + (i % 2) * 14}" r="9"/>`).join('')}</g><g fill="#ff9f6b">${Array.from({ length: 12 }, (_, i) => `<circle cx="${25 + i * 26}" cy="${196 + (i % 2) * 12}" r="9"/>`).join('')}</g><rect x="0" y="250" width="300" height="12" fill="#e98a52"/><rect x="0" y="330" width="300" height="90" fill="#f4c88f"/><ellipse cx="150" cy="332" rx="230" ry="22" fill="#f4c88f"/><path d="M60,0 L110,330 L190,330 L240,0" fill="#ffffff" opacity=".18"/></svg>`,
      espaco: `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice"><rect width="300" height="420" fill="#3b3a73"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 73) % 300}" cy="${(i * 41) % 300}" r="${1 + (i % 3) * 0.7}" fill="#ffffff" opacity="${0.4 + (i % 4) * 0.15}"/>`).join('')}<circle cx="240" cy="80" r="30" fill="#ffb3c4"/><ellipse cx="240" cy="80" rx="46" ry="10" fill="none" stroke="#ffd36e" stroke-width="4"/><ellipse cx="150" cy="380" rx="230" ry="70" fill="#a9a6e6"/><circle cx="80" cy="370" r="10" fill="#8e8ad6"/><circle cx="220" cy="390" r="14" fill="#8e8ad6"/></svg>`
    };
    return C[id] || C.parque;
  }

  window.Heroi = { render, cenario, corpoDeMedidas, ROUPAS, AURAS };
})();
