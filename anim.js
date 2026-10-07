/* Forja: animações dos exercícios ("vídeos" em SVG).
   Boneco articulado com cinemática inversa: cada exercício define duas poses (A e B)
   e o motor interpola A > B > A em loop. Usa as cores do avatar do usuário. */
(function () {
  'use strict';
  const L = { tr: 46, ua: 26, fa: 24, th: 32, sh: 32, hd: 15 };
  const CHAO = 190;

  function ik(R, P, L1, L2, s) {
    let dx = P[0] - R[0], dy = P[1] - R[1];
    let d = Math.hypot(dx, dy) || 0.001;
    const max = L1 + L2 - 0.5, min = Math.abs(L1 - L2) + 0.5;
    const dc = Math.max(min, Math.min(max, d));
    const ux = dx / d, uy = dy / d;
    const a = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc);
    const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const nx = -uy, ny = ux;
    const J = [R[0] + ux * a + nx * h * s, R[1] + uy * a + ny * h * s];
    const E = [R[0] + ux * dc, R[1] + uy * dc];
    return [J, E];
  }
  const lerp = (a, b, f) => a + (b - a) * f;
  const lp = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  function mistura(A, B, f) {
    const o = {};
    for (const k of Object.keys(A)) {
      const a = A[k], b = B[k] === undefined ? a : B[k];
      if (Array.isArray(a)) o[k] = lp(a, b, f);
      else if (typeof a === 'number') o[k] = lerp(a, b, f);
      else o[k] = f < 0.5 ? a : b;
    }
    return o;
  }
  function normaliza(p, v) {
    const o = Object.assign({ h: [120, 126], t: 0 }, p);
    if (v === 'f') {
      o.mN = o.mN || o.m || [100, 128]; o.mF = o.mF || (o.m ? [240 - o.m[0], o.m[1]] : [140, 128]);
      o.pN = o.pN || o.p || [110, CHAO]; o.pF = o.pF || (o.p ? [240 - o.p[0], o.p[1]] : [130, CHAO]);
      o.om = o.om || 0;
    } else {
      o.mN = o.mN || o.m || [122, 128]; o.mF = o.mF || [o.mN[0] - 4, o.mN[1] - 3];
      o.pN = o.pN || o.p || [122, CHAO]; o.pF = o.pF || [o.pN[0] - 5, o.pN[1]];
    }
    o.pt = o.pt || 0;
    return o;
  }

  const seg = (a, b, c, w) => `<path d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const circ = (p, r, c, extra) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${c}" ${extra || ''}/>`;

  function cores(av) {
    const H = window.Heroi;
    const pick = (l, id) => (l.find(x => x.id === id) || l[0]);
    av = Object.assign({}, H.AVATAR_PADRAO, av || {});
    const pele = pick(H.PELES, av.pele), cab = pick(H.CORES_CABELO, av.corCabelo), bar = pick(H.CORES_CABELO, av.corBarba || av.corCabelo);
    return { pele: pele.c, peleS: pele.s, cab: cab.c, barba: bar.e, camisa: '#ff8a3d', camisaE: '#e0702b', short: '#4b5378', tenis: '#f2f0f7', av };
  }

  function props(ex, P, frente) {
    let s = '';
    const eq = ex.eq;
    if (eq === 'barra') {
      if (frente) {
        const y = (P.mN[1] + P.mF[1]) / 2;
        s += seg([P.mN[0] - 34, y], [P.mF[0] + 34, y], '#b9b4c9', 4);
        s += `<rect x="${(P.mN[0] - 44).toFixed(1)}" y="${(y - 15).toFixed(1)}" width="9" height="30" rx="3" fill="#ff8a3d"/><rect x="${(P.mF[0] + 35).toFixed(1)}" y="${(y - 15).toFixed(1)}" width="9" height="30" rx="3" fill="#ff8a3d"/>`;
      } else {
        s += circ(P.mN, 15, '#ff8a3d', 'stroke="#c85f22" stroke-width="2"') + circ(P.mN, 4, '#3a3548');
      }
    }
    return s;
  }
  function propsMao(ex, P, frente) {
    let s = '';
    if (ex.placa) s += `<rect x="${(P.pN[0] + 4).toFixed(1)}" y="${(P.pN[1] - 26).toFixed(1)}" width="8" height="44" rx="3" fill="#7c86b8" transform="rotate(-35 ${P.pN[0].toFixed(1)} ${P.pN[1].toFixed(1)})"/>`;
    if (ex.corda) {
      const y = Math.max(P.pN[1], P.pF[1]) + 4;
      s += `<path d="M${P.mN[0].toFixed(1)},${P.mN[1].toFixed(1)} C${(P.mN[0] - 30).toFixed(1)},${y + 4} ${(P.mF[0] + 30).toFixed(1)},${y + 4} ${P.mF[0].toFixed(1)},${P.mF[1].toFixed(1)}" stroke="#ff8fb1" stroke-width="2.4" fill="none"/>`;
    }
    const halter = p => `<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})"><rect x="-9" y="-2.5" width="18" height="5" rx="2" fill="#b9b4c9"/><rect x="-12" y="-6" width="6" height="12" rx="2" fill="#7c86b8"/><rect x="6" y="-6" width="6" height="12" rx="2" fill="#7c86b8"/></g>`;
    if (ex.eq === 'halter') { s += halter(P.mN); if (frente) s += halter(P.mF); }
    if (ex.eq === 'halter1') s += halter(frente ? lp(P.mN, P.mF, 0.5) : P.mN);
    return s;
  }
  function cabos(ex, P) {
    if (!ex.cabo) return '';
    const alvo = ex.caboPe ? P.pN : P.mN;
    let s = seg(ex.cabo, alvo, '#8f88a8', 1.6);
    if (ex.cabo2) s += seg(ex.cabo2, P.mF, '#8f88a8', 1.6);
    s += circ(ex.cabo, 5, '#5c5670');
    if (ex.cabo2) s += circ(ex.cabo2, 5, '#5c5670');
    return s;
  }
  function estaticos(ex) {
    if (!ex.st) return '';
    return ex.st.map(r => {
      const [x, y, w, h, ang, cor] = r;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${cor || '#3d3852'}" ${ang ? `transform="rotate(${ang} ${x} ${y})"` : ''}/>`;
    }).join('');
  }

  function pe(ank, pt, lado) {
    const toe = pt ? [ank[0] + 9 * lado, ank[1] + 11] : [ank[0] + 13 * lado, ank[1] + 1];
    return seg(ank, toe, '#f2f0f7', 8);
  }

  function lateral(ex, P, C) {
    const t = P.t * Math.PI / 180;
    const td = [Math.sin(t), -Math.cos(t)];
    const fr = P.inv ? [-Math.cos(t), -Math.sin(t)] : [Math.cos(t), Math.sin(t)];
    const H = P.h, S = [H[0] + td[0] * L.tr, H[1] + td[1] * L.tr];
    const cab = [S[0] + td[0] * 20 + fr[0] * 2, S[1] + td[1] * 20 + fr[1] * 2];
    const sA = P.sA || 1, sK = P.sK || -1;
    let mN = P.mN, mF = P.mF;
    if (P.mc) { mN = [cab[0] - fr[0] * 8, cab[1] - fr[1] * 8]; mF = [mN[0] - 3, mN[1] - 2]; }
    const [eF, hF] = ik(S, mF, L.ua, L.fa, sA);
    const [eN, hN] = ik(S, mN, L.ua, L.fa, sA);
    const [kF, aF] = ik(H, P.pF, L.th, L.sh, sK);
    const [kN, aN] = ik(H, P.pN, L.th, L.sh, sK);
    let s = '';
    // membros de trás
    s += seg(H, kF, C.peleS, 13) + seg(kF, aF, C.peleS, 11) + pe(aF, P.pt, 1);
    s += seg(H, lp(H, kF, 0.5), '#3a4062', 17);
    s += seg(S, eF, C.peleS, 11) + seg(eF, hF, C.peleS, 10) + circ(hF, 6, C.peleS);
    // tronco
    s += seg(H, S, C.camisa, 27);
    s += circ(H, 13, C.short);
    // perna da frente
    s += seg(H, kN, C.pele, 13) + seg(kN, aN, C.pele, 11) + pe(aN, P.pt, 1);
    s += seg(H, lp(H, kN, 0.5), C.short, 17);
    // cabeça
    const nk = [S[0] + td[0] * 4, S[1] + td[1] * 4];
    s += seg(S, nk, C.pele, 10);
    const av = C.av;
    if (av.cabelo !== 'careca') s += circ([cab[0] - fr[0] * 3 + td[0] * 2, cab[1] - fr[1] * 3 + td[1] * 2], L.hd + 1, C.cab);
    s += circ([cab[0] + fr[0] * 1.5, cab[1] + fr[1] * 1.5], L.hd - 1, C.pele);
    if (av.cabelo !== 'careca' && av.cabelo !== 'raspado') {
      const top = [cab[0] + td[0] * 9 - fr[0] * 1, cab[1] + td[1] * 9 - fr[1] * 1];
      s += circ(top, 9, C.cab);
    }
    s += circ([cab[0] - fr[0] * 3, cab[1] - fr[1] * 3], 3.5, C.peleS);
    const olho = [cab[0] + fr[0] * 8 + td[0] * 2, cab[1] + fr[1] * 8 + td[1] * 2];
    s += circ(olho, 2.6, '#2a1a10');
    if (av.bigode !== 'nenhum') s += circ([cab[0] + fr[0] * 11 - td[0] * 5, cab[1] + fr[1] * 11 - td[1] * 5], 3.2, C.barba);
    if (av.barba !== 'nenhuma') s += circ([cab[0] + fr[0] * 8 - td[0] * 12, cab[1] + fr[1] * 8 - td[1] * 12], av.barba === 'cheia' ? 5.5 : 3.5, C.barba);
    // braço da frente
    s += seg(S, eN, C.pele, 11) + seg(S, lp(S, eN, 0.42), C.camisa, 14) + seg(eN, hN, C.pele, 10) + circ(hN, 6, C.pele);
    return { s, P: Object.assign({}, P, { mN: hN, mF: hF, pN: aN, pF: aF }) };
  }

  function frontal(ex, P, C) {
    const H = P.h, om = P.om || 0;
    const sy = H[1] - L.tr + om;
    const SL = [H[0] - 15, sy], SR = [H[0] + 15, sy];
    const HL = [H[0] - 9, H[1]], HR = [H[0] + 9, H[1]];
    const [eL, mL] = ik(SL, P.mN, L.ua, L.fa, P.sA || 1);
    const [eR, mR] = ik(SR, P.mF, L.ua, L.fa, -(P.sA || 1));
    const [kL, aL] = ik(HL, P.pN, L.th, L.sh, P.sK || 1);
    const [kR, aR] = ik(HR, P.pF, L.th, L.sh, -(P.sK || 1));
    let s = '';
    s += seg(HL, kL, C.pele, 13) + seg(kL, aL, C.pele, 11) + seg(aL, [aL[0] - 4, aL[1] + 1], '#f2f0f7', 9);
    s += seg(HR, kR, C.pele, 13) + seg(kR, aR, C.pele, 11) + seg(aR, [aR[0] + 4, aR[1] + 1], '#f2f0f7', 9);
    s += `<path d="M${HL[0] - 7},${H[1] - 6} L${HR[0] + 7},${H[1] - 6} L${HR[0] + 9},${H[1] + 14} L${H[0] + 1},${H[1] + 14} L${H[0]},${H[1] + 6} L${H[0] - 1},${H[1] + 14} L${HL[0] - 9},${H[1] + 14} Z" fill="${C.short}"/>`;
    s += `<path d="M${SL[0] - 6},${sy - 2} Q${H[0]},${sy - 8} ${SR[0] + 6},${sy - 2} L${HR[0] + 7},${H[1] - 4} L${HL[0] - 7},${H[1] - 4} Z" fill="${C.camisa}"/>`;
    s += seg(SL, eL, C.pele, 11) + seg(SL, lp(SL, eL, 0.42), C.camisa, 14) + seg(eL, mL, C.pele, 10) + circ(mL, 6, C.pele);
    s += seg(SR, eR, C.pele, 11) + seg(SR, lp(SR, eR, 0.42), C.camisa, 14) + seg(eR, mR, C.pele, 10) + circ(mR, 6, C.pele);
    const cab = [H[0], sy - 20 - om * 0.6];
    s += seg([H[0], sy], [H[0], sy - 8], C.pele, 10);
    const av = C.av;
    s += circ([cab[0] - 15, cab[1] + 2], 4, C.pele) + circ([cab[0] + 15, cab[1] + 2], 4, C.pele);
    s += circ(cab, L.hd, C.pele);
    if (av.cabelo !== 'careca') s += `<path d="M${cab[0] - 15},${cab[1] - 1} C${cab[0] - 16},${cab[1] - 22} ${cab[0] + 16},${cab[1] - 22} ${cab[0] + 15},${cab[1] - 1} C${cab[0] + 8},${cab[1] - 9} ${cab[0] - 8},${cab[1] - 9} ${cab[0] - 15},${cab[1] - 1} Z" fill="${C.cab}"/>`;
    s += circ([cab[0] - 5, cab[1] + 1], 2.3, '#2a1a10') + circ([cab[0] + 5, cab[1] + 1], 2.3, '#2a1a10');
    if (av.bigode !== 'nenhum') s += `<path d="M${cab[0] - 6},${cab[1] + 8} Q${cab[0]},${cab[1] + 4} ${cab[0] + 6},${cab[1] + 8}" stroke="${C.barba}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (av.barba !== 'nenhuma') s += circ([cab[0], cab[1] + 13], av.barba === 'cheia' ? 5 : 3, C.barba);
    return { s, P: Object.assign({}, P, { mN: mL, mF: mR, pN: aL, pF: aR }) };
  }

  function quadro(ex, f, av) {
    if (!ex._A) {
      ex._A = normaliza(ex.a.a, ex.a.v);
      const b = Object.assign({}, ex.a.a, ex.a.b);
      if (ex.a.b.m && !ex.a.b.mN) { delete b.mN; delete b.mF; }
      if (ex.a.b.p && !ex.a.b.pN) { delete b.pN; delete b.pF; }
      ex._B = normaliza(b, ex.a.v);
    }
    const A = ex._A, B = ex._B;
    const P = mistura(A, B, f);
    const C = cores(av);
    const frente = ex.a.v === 'f';
    const r = frente ? frontal(ex, P, C) : lateral(ex, P, C);
    let s = `<rect x="0" y="${CHAO}" width="240" height="12" fill="#2b2838"/>`;
    s += estaticos(ex);
    s += cabos(ex, r.P);
    s += r.s;
    s += props(ex, r.P, frente);
    s += propsMao(ex, r.P, frente);
    return s;
  }

  /* cache de quadros + laço único de animação */
  const CACHE = new Map();
  const N = 36;
  function quadros(ex, av) {
    const k = ex.id + '|' + JSON.stringify(av || {});
    if (!CACHE.has(k)) {
      const arr = [];
      for (let i = 0; i < N; i++) {
        const x = i / N;
        let f = (1 - Math.cos(2 * Math.PI * x)) / 2;
        f = f * f * (3 - 2 * f);
        arr.push(quadro(ex, f, av));
      }
      CACHE.set(k, arr);
    }
    return CACHE.get(k);
  }
  const vivos = new Set();
  let rodando = false, t0 = 0;
  function laco(ts) {
    if (!t0) t0 = ts;
    for (const el of vivos) {
      if (!el.isConnected) { vivos.delete(el); continue; }
      const fr = el._q, dur = el._dur;
      const i = Math.floor(((ts - t0) % dur) / dur * N);
      if (i !== el._i) { el._i = i; el._g.innerHTML = fr[i]; }
    }
    if (vivos.size) requestAnimationFrame(laco); else rodando = false;
  }
  function montar(el, ex, av, opts) {
    opts = opts || {};
    el.innerHTML = `<svg viewBox="0 0 240 200" class="anim-svg" role="img" aria-label="${ex.nome}"><g></g></svg>`;
    el._g = el.querySelector('g');
    el._q = quadros(ex, av);
    el._dur = (ex.dur || 2.6) * 1000;
    el._i = -1;
    el._g.innerHTML = el._q[0];
    if (opts.estatico) return;
    vivos.add(el);
    if (!rodando) { rodando = true; requestAnimationFrame(laco); }
  }
  window.Anim = { montar, quadro };
})();
