/* Forja: o herói é um gato que fica bombado.
   Corpo calculado só com as medidas reais do usuário (peso, altura, massa muscular),
   com extremos bem visíveis: magro, definido, musculoso, acima do peso e muito acima do peso.
   Camadas: aura, capa, cauda, pernas, short, tronco, braços, cabeça, acessórios. */
(function () {
  'use strict';

  const PELAGENS = [
    { id: 'laranja', nome: 'Laranja', c: '#d98a4b', e: '#a9622c', l: '#f3caa0' },
    { id: 'cinza', nome: 'Cinza', c: '#8f949a', e: '#5f646a', l: '#d2d4d7' },
    { id: 'preto', nome: 'Preto', c: '#34343a', e: '#1d1d21', l: '#55555c' },
    { id: 'branco', nome: 'Branco', c: '#ebe6de', e: '#c9c1b5', l: '#ffffff' },
    { id: 'creme', nome: 'Creme', c: '#dfc49b', e: '#b99a6c', l: '#f4e6cd' },
    { id: 'marrom', nome: 'Marrom', c: '#83593a', e: '#5c3c24', l: '#b8916d' }
  ];
  const PADROES = [['liso', 'Liso'], ['tigrado', 'Tigrado'], ['frajola', 'Frajola'], ['siames', 'Siamês'], ['malhado', 'Malhado']];
  const OLHOS = [
    { id: 'verde', nome: 'Verde', c: '#7fae5c' },
    { id: 'amarelo', nome: 'Amarelo', c: '#d9b23a' },
    { id: 'cobre', nome: 'Cobre', c: '#c4782f' },
    { id: 'azul', nome: 'Azul', c: '#6f9fd0' },
    { id: 'cinza', nome: 'Cinza', c: '#9aa3a8' }
  ];
  const AVATAR_PADRAO = { pelo: 'laranja', padrao: 'tigrado', olhos: 'verde' };

  const ROUPAS = {
    nenhuma: { nome: 'Só o pelo', tipo: 'nada' },
    preta: { nome: 'Camiseta grafite', cor: '#33373d', esc: '#24272c', tipo: 'manga' },
    regata: { nome: 'Regata', cor: '#3f5a4c', esc: '#2f4539', tipo: 'regata' },
    camiseta: { nome: 'Camiseta aço', cor: '#5f7590', esc: '#4a5d74', tipo: 'manga' },
    forja: { nome: 'Camiseta Forja', cor: '#8a4a2a', esc: '#6b371d', tipo: 'manga', logo: true },
    moletom: { nome: 'Moletom', cor: '#4b4458', esc: '#3a3446', tipo: 'longa' },
    dourado: { nome: 'Regata de campeão', cor: '#b8914f', esc: '#94733f', tipo: 'regata', faixas: true }
  };

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
  const achar = (l, id) => l.find(x => x.id === id) || l[0];
  const f1 = n => n.toFixed(1);
  const pt = (x, y) => f1(x) + ',' + f1(y);

  /* Medidas reais -> corpo.
     m: musculatura (0 a 1), g: gordura aparente (0 a 1), h: escala de altura.
     Sem massa muscular informada, usa 36% (média adulta) e o IMC decide sozinho. */
  function corpoDeMedidas(med) {
    if (!med || !med.peso || !med.altura) return { m: 0.25, g: 0.2, h: 1, semDados: true };
    const alt = med.altura / 100;
    const imc = med.peso / (alt * alt);
    const pctM = med.musculoKg ? (med.musculoKg / med.peso) * 100 : 36;
    // músculo depende do % e do tamanho do corpo: magro com % alto continua magro
    const m = clamp((pctM - 32) / 10, 0, 1) * clamp((imc - 17) / 6, 0.35, 1);
    // gordura cresce de forma contínua até obesidade grave (IMC 45+)
    const g = clamp((imc - 21.5) / 18 - (pctM - 36) / 35, 0, 1.35);
    const fino = clamp((20.5 - imc) / 3.5, 0, 1);
    const h = clamp(med.altura / 175, 0.92, 1.08);
    return { m, g, h, imc, pctM, fino };
  }

  function cores(av) {
    av = Object.assign({}, AVATAR_PADRAO, av || {});
    const P = achar(PELAGENS, av.pelo);
    const c = { pelo: P.c, esc: P.e, claro: P.l, peito: P.l, patas: P.c, ponta: P.e, olho: achar(OLHOS, av.olhos).c, padrao: av.padrao, nariz: '#d98c8c' };
    if (av.padrao === 'frajola') { c.peito = '#f2eee8'; c.patas = '#f2eee8'; }
    if (av.padrao === 'siames') { c.pelo = '#efe2cc'; c.claro = '#f8f0e2'; c.peito = '#f8f0e2'; c.ponta = '#4a3a30'; c.patas = '#4a3a30'; c.esc = '#c9b593'; }
    if (av.padrao === 'malhado') { c.pelo = '#f2eee8'; c.claro = '#ffffff'; c.peito = '#ffffff'; c.patas = '#f2eee8'; c.esc = '#d8d1c6'; c.mancha1 = '#d98a4b'; c.mancha2 = '#2f2f34'; }
    if (av.pelo === 'preto' && av.padrao !== 'siames' && av.padrao !== 'malhado') c.nariz = '#4a3a3a';
    return c;
  }

  function braco(lado, S, A, pose, R, C, Q, m) {
    const ab = 18 * m;
    const poses = { idle: [12 + ab, 6 + ab * 0.6], comemora: [150, 168], flex: [88, 178], sono: [5 + ab * 0.6, 2 + ab * 0.4], aceno: [12 + ab, 6 + ab * 0.6] };
    let [a1, a2] = poses[pose] || poses.idle;
    if (pose === 'aceno' && lado === 1) { a1 = 140; a2 = 165; }
    const sx = 150 + lado * (S - 9), sy = 166;
    const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
    const L1 = 44, L2 = 40;
    const ex = sx + lado * Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
    const hx = ex + lado * Math.sin(r2) * L2, hy = ey + Math.cos(r2) * L2;
    const cor = R.tipo === 'longa' ? R.cor : C.pelo;
    let s = '<g>';
    s += `<path d="M${pt(ex, ey)} L${pt(hx, hy)}" stroke="${cor}" stroke-width="${f1(A * (1.6 + 0.45 * m))}" stroke-linecap="round"/>`;
    s += `<path d="M${pt(sx, sy)} L${pt(ex, ey)}" stroke="${cor}" stroke-width="${f1(A * 2.05)}" stroke-linecap="round"/>`;
    if (m > 0.15) s += `<circle cx="${f1(sx + lado * A * 0.15)}" cy="${f1(sy - 2)}" r="${f1(A * (0.95 + 0.35 * m))}" fill="${cor}"/><path d="M${pt(sx + lado * A * 0.9, sy + A * 0.5)} Q${pt(sx + lado * A * 1.25, sy)} ${pt(sx + lado * A * 0.6, sy - A * 0.9)}" stroke="${C.esc}" stroke-width="2" fill="none" opacity="${f1(Math.min(0.7, m))}"/>`;
    const bx = sx + (ex - sx) * 0.55, by = sy + (ey - sy) * 0.55;
    const ang = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
    const bul = 1 + m * (pose === 'flex' ? 1.15 : 0.6);
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(A * 1.35)}" ry="${f1(A * bul)}" transform="rotate(${f1(ang)} ${f1(bx)} ${f1(by)})" fill="${cor}"/>`;
    if (C.padrao === 'tigrado' && R.tipo !== 'longa') {
      for (const t of [0.3, 0.62]) {
        const x = ex + (hx - ex) * t, y = ey + (hy - ey) * t;
        s += `<path d="M${pt(x - A * 0.8, y - 1)} L${pt(x + A * 0.8, y + 1)}" stroke="${C.esc}" stroke-width="3" stroke-linecap="round" transform="rotate(${f1(Math.atan2(hy - ey, hx - ex) * 180 / Math.PI - 90)} ${f1(x)} ${f1(y)})" opacity=".8"/>`;
      }
    }
    if (C.mancha1 && lado === 1) s += `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(A * 1.1)}" ry="${f1(A * 0.8)}" fill="${C.mancha1}" transform="rotate(${f1(ang)} ${f1(bx)} ${f1(by)})"/>`;
    if (R.tipo === 'manga') {
      const mx = sx + (ex - sx) * 0.4, my = sy + (ey - sy) * 0.4;
      s += `<path d="M${pt(sx, sy)} L${pt(mx, my)}" stroke="${R.cor}" stroke-width="${f1(A * 2 + 8)}" stroke-linecap="round"/>`;
    }
    const AC = window.Acess;
    if (AC && lado === -1 && Q.tatuagem && R.tipo !== 'longa') s += AC.tatBraco(Q.tatuagem, bx, by, ang, A);
    const pr = A * 0.95 + 2;
    s += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(pr)}" fill="${C.patas}"/>`;
    s += `<circle cx="${f1(hx)}" cy="${f1(hy + pr * 0.25)}" r="${f1(pr * 0.38)}" fill="#e3a3a3" opacity=".55"/>`;
    if (AC && Q.maos) s += AC.maos(Q.maos, hx, hy, pr, ex, ey);
    return s + '</g>';
  }

  function aura(n) {
    const A = AURAS[n];
    if (!A) return '';
    const id = 'au' + n + Math.random().toString(36).slice(2, 6);
    let s = `<defs><radialGradient id="${id}g" cx="50%" cy="62%" r="60%"><stop offset="0%" stop-color="${A.brilho}" stop-opacity=".9"/><stop offset="55%" stop-color="${A.a}" stop-opacity=".7"/><stop offset="100%" stop-color="${A.b}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}l" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="${A.b}" stop-opacity=".95"/><stop offset="100%" stop-color="${A.a}" stop-opacity=".15"/></linearGradient></defs>`;
    s += `<g class="aura${A.lenda ? ' lenda' : ''}">`;
    s += `<ellipse cx="150" cy="250" rx="${125 + n * 3}" ry="${175 + n * 3}" fill="url(#${id}g)" class="aura-halo"/>`;
    const chama = 'M150,18 C160,48 178,36 182,66 C196,54 210,80 206,104 C228,100 236,140 226,168 C250,182 250,236 240,270 C258,300 250,350 234,398 L66,398 C50,350 42,300 60,270 C50,236 50,182 74,168 C64,140 72,100 94,104 C90,80 104,54 118,66 C122,36 140,48 150,18 Z';
    s += `<path d="${chama}" fill="url(#${id}l)" class="aura-chama a1"/>`;
    s += `<g transform="translate(150 398) scale(.82 .9) translate(-150 -398)"><path d="${chama}" fill="url(#${id}l)" class="aura-chama a2"/></g>`;
    if (A.fagulhas) for (let i = 0; i < 5 + n * 2; i++) s += `<circle class="fagulha" cx="${60 + (i * 37) % 180}" cy="380" r="${2 + (i % 3)}" fill="${A.brilho}" style="animation-delay:${(i * 0.29).toFixed(2)}s"/>`;
    if (A.raios) {
      s += `<path class="raio r1" d="M60,150 L78,186 L66,190 L88,232" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path class="raio r2" d="M240,200 L222,236 L236,240 L214,286" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (A.lenda) s += `<path class="raio r3" d="M150,6 L140,38 L154,40 L144,72" stroke="#fff3b0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return s + '</g>';
  }

  function cabeca(humor, Q, C, g, m) {
    const gg = Math.min(g, 1.2), rx = 50 + 9 * gg, ry = 43 + 4 * gg, cy = 96;
    let s = '<g class="cabeca">';
    // orelhas
    const orelha = (l) => {
      const bx = 150 + l * 30, ox = 150 + l * 46;
      return `<path d="M${pt(bx - l * 16, 68)} L${pt(ox, 22 + g * 6)} L${pt(bx + l * 18, 60)} Z" fill="${C.padrao === 'siames' ? C.ponta : C.pelo}"/><path d="M${pt(bx - l * 8, 64)} L${pt(ox - l * 3, 32 + g * 6)} L${pt(bx + l * 10, 60)} Z" fill="#e2a4a4" opacity=".75"/>`;
    };
    s += orelha(-1) + orelha(1);
    // bochechas e queixo duplo
    if (g > 0.35) s += `<ellipse cx="150" cy="${f1(cy + ry - 2)}" rx="${f1(rx * 0.72)}" ry="${f1(10 + g * 12)}" fill="${C.pelo}"/><path d="M${pt(150 - rx * 0.55, cy + ry + 2 + g * 6)} Q150,${f1(cy + ry + 12 + g * 10)} ${pt(150 + rx * 0.55, cy + ry + 2 + g * 6)}" stroke="${C.esc}" stroke-width="2" fill="none" opacity=".5"/>`;
    // rosto com tufos laterais
    s += `<path d="M${pt(150 - rx, cy + 6)} L${pt(150 - rx - 10, cy + 20)} L${pt(150 - rx + 6, cy + 22)} L${pt(150 - rx - 4, cy + 34)} L${pt(150 - rx + 16, cy + 32)} Z" fill="${C.pelo}"/>`;
    s += `<path d="M${pt(150 + rx, cy + 6)} L${pt(150 + rx + 10, cy + 20)} L${pt(150 + rx - 6, cy + 22)} L${pt(150 + rx + 4, cy + 34)} L${pt(150 + rx - 16, cy + 32)} Z" fill="${C.pelo}"/>`;
    s += `<ellipse cx="150" cy="${cy}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${C.pelo}"/>`;
    // padrões do rosto
    if (C.padrao === 'tigrado') {
      s += `<path d="M138,${cy - 38} L141,${cy - 26} M150,${cy - 42} L150,${cy - 27} M162,${cy - 38} L159,${cy - 26}" stroke="${C.esc}" stroke-width="4" stroke-linecap="round"/>`;
      s += `<path d="M${pt(150 - rx + 2, cy + 2)} L${pt(150 - rx + 16, cy + 4)} M${pt(150 - rx + 3, cy + 12)} L${pt(150 - rx + 15, cy + 12)} M${pt(150 + rx - 2, cy + 2)} L${pt(150 + rx - 16, cy + 4)} M${pt(150 + rx - 3, cy + 12)} L${pt(150 + rx - 15, cy + 12)}" stroke="${C.esc}" stroke-width="3.5" stroke-linecap="round"/>`;
    }
    if (C.padrao === 'siames') s += `<ellipse cx="150" cy="${cy + 12}" rx="${f1(rx * 0.62)}" ry="${f1(ry * 0.72)}" fill="${C.ponta}" opacity=".85"/>`;
    if (C.mancha1) s += `<path d="M${pt(150 - rx + 4, cy - 10)} Q${pt(150 - rx + 10, cy - ry + 4)} 146,${cy - ry + 2} L146,${cy - 6} Q${pt(150 - rx + 20, cy + 4)} ${pt(150 - rx + 4, cy - 10)} Z" fill="${C.mancha1}"/><path d="M${pt(150 + rx - 6, cy - 14)} Q${pt(150 + rx - 12, cy - ry + 6)} 158,${cy - ry + 4} L162,${cy - 12} Z" fill="${C.mancha2}"/>`;
    // focinho claro
    s += `<ellipse cx="139" cy="${cy + 19}" rx="15" ry="11" fill="${C.padrao === 'frajola' || C.padrao === 'malhado' ? '#f2eee8' : C.claro}"/><ellipse cx="161" cy="${cy + 19}" rx="15" ry="11" fill="${C.padrao === 'frajola' || C.padrao === 'malhado' ? '#f2eee8' : C.claro}"/>`;
    if (C.padrao === 'frajola') s += `<path d="M150,${cy - 4} L140,${cy + 14} L160,${cy + 14} Z" fill="#f2eee8"/><ellipse cx="150" cy="${cy + 30}" rx="16" ry="9" fill="#f2eee8"/>`;
    // olhos
    const sobre = C.padrao === 'siames' || C.pelo === '#34343a' ? '#0e0e10' : '#2a1d14';
    if (humor === 'comemora') {
      s += `<path d="M122,${cy + 2} Q131,${cy - 10} 140,${cy + 2}" stroke="${sobre}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M160,${cy + 2} Q169,${cy - 10} 178,${cy + 2}" stroke="${sobre}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    } else if (humor === 'sono') {
      s += `<path d="M121,${cy} Q131,${cy + 7} 141,${cy}" stroke="${sobre}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M159,${cy} Q169,${cy + 7} 179,${cy}" stroke="${sobre}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    } else {
      s += '<g class="olhos">';
      for (const [cx, l] of [[131, -1], [169, 1]]) {
        s += `<path d="M${cx - 13},${cy} Q${cx},${cy - 14} ${cx + 13},${cy} Q${cx},${cy + 12} ${cx - 13},${cy} Z" fill="${C.olho}" stroke="${sobre}" stroke-width="2.4"/>`;
        s += `<ellipse cx="${cx}" cy="${cy}" rx="${humor === 'foco' ? 2 : 3.2}" ry="9" fill="#141414"/>`;
        s += `<circle cx="${cx + 3}" cy="${cy - 4}" r="2.2" fill="#fff" opacity=".9"/>`;
        // sobrancelha determinada quando musculoso
        if (m > 0.45) s += `<path d="M${cx - 11 * l * -1},${cy - 15} L${cx + 9 * l},${cy - 11}" stroke="${C.esc}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
      }
      s += '</g>';
    }
    // nariz, boca, bigodes
    s += `<path d="M144,${cy + 11} L156,${cy + 11} L150,${cy + 18} Z" fill="${C.nariz}"/>`;
    if (humor === 'comemora') s += `<path d="M140,${cy + 22} Q150,${cy + 38} 160,${cy + 22} Z" fill="#6b2b2b"/>`;
    else if (humor === 'sono') s += `<ellipse cx="150" cy="${cy + 25}" rx="3" ry="3.5" fill="#6b2b2b"/>`;
    else s += `<path d="M150,${cy + 18} L150,${cy + 22} M150,${cy + 22} Q144,${cy + 28} 139,${cy + 22} M150,${cy + 22} Q156,${cy + 28} 161,${cy + 22}" stroke="#3a2a22" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const bg = C.padrao === 'siames' || C.pelo === '#34343a' ? '#d8d3cb' : '#ffffff';
    s += `<g stroke="${bg}" stroke-width="1.4" stroke-linecap="round" opacity=".8"><path d="M126,${cy + 18} L94,${cy + 12} M126,${cy + 22} L93,${cy + 23} M127,${cy + 26} L96,${cy + 33} M174,${cy + 18} L206,${cy + 12} M174,${cy + 22} L207,${cy + 23} M173,${cy + 26} L204,${cy + 33}"/></g>`;
    // acessórios de cabeça
    if (window.Acess) { s += window.Acess.rosto(Q.rosto, { rx, cy }); s += window.Acess.chapeu(Q.chapeu, { rx, cy }); }
    if (humor === 'sono') s += `<g class="zzz"><text x="200" y="52" font-family="Archivo,sans-serif" font-weight="700" font-size="18" fill="#9fb0c9">z</text><text x="212" y="36" font-family="Archivo,sans-serif" font-weight="700" font-size="24" fill="#9fb0c9">Z</text></g>`;
    return s + '</g>';
  }

  function render(o) {
    const c = o.corpo || corpoDeMedidas(null);
    const { m, g } = c;
    const C = cores(o.avatar);
    const R = ROUPAS[o.roupa] || ROUPAS.nenhuma;
    const Q = Object.assign({}, o.equip || {});
    const LEG = { faixa: 'chapeu', bone: 'chapeu', fone: 'chapeu', medalha: 'pescoco', munhequeira: 'maos', capa: 'costas' };
    if (o.acessorio && LEG[o.acessorio] && !Q[LEG[o.acessorio]]) Q[LEG[o.acessorio]] = o.acessorio;
    const AC = window.Acess;
    const pose = o.pose || 'idle', humor = o.humor || 'feliz';
    const so = o.soCabeca;
    // proporções
    const fi = c.fino || 0;
    const S = 36 + 52 * m + 12 * g - 6 * fi;   // meia largura dos ombros (quase dobra com músculo)
    const W = 26 + 7 * m + 40 * g - 4 * fi;    // meia largura da cintura (forma em V)
    const Bx = 22 * g;                          // barriga para fora
    const A = 8 + 19 * m + 6 * g - 2 * fi;     // raio do braço
    const T = 12 + 15 * m + 11 * g - 3 * fi;   // raio da coxa
    const Cc = 9 + 8 * m + 6 * g - 2 * fi;     // raio da canela
    const cai = 26 * Math.max(0, g - 0.25);     // barriga caindo por cima do short
    const Mx = Math.max(W + Bx * 0.25, S - 10 + 4 * g);
    const hx = Math.max(W * 0.45, T + 1);
    const yc = 266 + 6 * Math.min(g, 1);
    const ctx = { S, W, Bx, A, T, Cc, Mx, yc, g, m, hx };                     // linha da cintura

    let s = `<svg viewBox="${so ? '82 14 136 168' : '-40 0 380 420'}" xmlns="http://www.w3.org/2000/svg" class="heroi-svg ${o.apagado ? 'apagado' : ''}" role="img" aria-label="Gato">`;
    if (!so) {
      s += `<ellipse cx="150" cy="403" rx="${f1(64 + S * 0.5 + g * 20)}" ry="9" fill="#000" opacity=".28"/>`;
      s += aura(o.aura || 0);
    }
    s += `<g class="corpo" transform="translate(150 400) scale(${(so ? 1 : c.h * (1 + 0.14 * m)).toFixed(3)}) translate(-150 -400)">`;
    if (!so) {
      if (AC && Q.costas) s += AC.costas(Q.costas, ctx);
      // cauda
      const tb = 150 + W * 0.55, tw = 11 + 6 * g + 2 * m;
      s += `<g class="cauda"><path d="M${pt(tb, yc + 8)} C${pt(tb + 60, yc + 24)} ${pt(tb + 74, yc - 40)} ${pt(tb + 54, yc - 96)}" stroke="${C.padrao === 'siames' ? C.ponta : C.pelo}" stroke-width="${f1(tw)}" fill="none" stroke-linecap="round"/>`;
      if (C.padrao === 'tigrado' || C.padrao === 'frajola') s += `<path d="M${pt(tb + 60, yc - 70)} C${pt(tb + 64, yc - 82)} ${pt(tb + 60, yc - 90)} ${pt(tb + 54, yc - 96)}" stroke="${C.padrao === 'frajola' ? '#f2eee8' : C.esc}" stroke-width="${f1(tw + 0.5)}" fill="none" stroke-linecap="round"/>`;
      s += '</g>';
      // pernas
      s += '<g>' + [-1, 1].map(l => {
        const qx = 150 + l * hx, kx = qx + l * (2 + g * 4), ax = qx + l * (3 + g * 3);
        let p = `<path d="M${pt(qx, yc + 4)} L${pt(kx, 334)}" stroke="${C.pelo}" stroke-width="${f1(T * 2)}" stroke-linecap="round"/>`;
        p += `<path d="M${pt(kx, 334)} L${pt(ax, 384)}" stroke="${C.pelo}" stroke-width="${f1(Cc * 2)}" stroke-linecap="round"/>`;
        p += `<ellipse cx="${f1(kx + l * 1.5)}" cy="356" rx="${f1(Cc * (1.05 + m * 0.25))}" ry="${f1(Cc * 1.4)}" fill="${C.pelo}"/>`;
        if (C.padrao === 'tigrado') p += `<path d="M${pt(kx - Cc, 350)} L${pt(kx + Cc, 352)} M${pt(kx - Cc + 1, 366)} L${pt(kx + Cc - 1, 368)}" stroke="${C.esc}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
        const pata = () => `<ellipse cx="${f1(ax + l * 4)}" cy="392" rx="${f1(17 + g * 7 + m * 2)}" ry="${f1(10 + g * 2)}" fill="${C.patas}"/><path d="M${pt(ax + l * 4 - 6, 397)} v-5 M${pt(ax + l * 4 + 1, 398)} v-6 M${pt(ax + l * 4 + 8, 397)} v-5" stroke="${C.esc}" stroke-width="1.4" opacity=".5"/>`;
        p += AC && Q.pes ? AC.pes(Q.pes, ctx, l, ax, pata) : pata();
        return p;
      }).join('') + '</g>';
      // short
      s += `<path d="M${pt(150 - W - Bx * 0.2 - 3, yc - 8)} L${pt(150 + W + Bx * 0.2 + 3, yc - 8)} L${pt(150 + hx + T + 5, yc + 44)} Q${pt(150 + hx, yc + 50)} ${pt(153, yc + 42)} L150,${yc + 20} L${pt(147, yc + 42)} Q${pt(150 - hx, yc + 50)} ${pt(150 - hx - T - 5, yc + 44)} Z" fill="#2c3038"/>`;
      s += `<path d="M${pt(150 - W - Bx * 0.2 - 2, yc - 3)} L${pt(150 + W + Bx * 0.2 + 2, yc - 3)}" stroke="#a8834f" stroke-width="3"/>`;
    }
    // trapézio
    if (m > 0.2) s += `<path d="M${pt(150 - 16, 118)} Q${pt(150 - S * 0.55, 128 - m * 6)} ${pt(150 - S + 4, 158)} L${pt(150 + S - 4, 158)} Q${pt(150 + S * 0.55, 128 - m * 6)} ${pt(150 + 16, 118)} Z" fill="${C.pelo}"/>`;
    // tronco
    const tronco = `M${pt(150 - S * 0.5, 146)} Q${pt(150 - S + 2, 146)} ${pt(150 - S, 166)} C${pt(150 - S + 1, 190)} ${pt(150 - Mx - Bx * 0.2, 206)} ${pt(150 - Mx - Bx * 0.5, 226)} C${pt(150 - Mx - Bx * 0.8, 250)} ${pt(150 - W - Bx * 0.4, yc - 4)} ${pt(150 - W, yc + 2)} Q150,${f1(yc + 2 + cai * 1.6)} ${pt(150 + W, yc + 2)} C${pt(150 + W + Bx * 0.4, yc - 4)} ${pt(150 + Mx + Bx * 0.8, 250)} ${pt(150 + Mx + Bx * 0.5, 226)} C${pt(150 + Mx + Bx * 0.2, 206)} ${pt(150 + S - 1, 190)} ${pt(150 + S, 166)} Q${pt(150 + S - 2, 146)} ${pt(150 + S * 0.5, 146)} Z`;
    s += `<path d="${tronco}" fill="${C.pelo}"/>`;
    if (R.tipo === 'nada' || R.tipo === 'regata') {
      // peito/barriga clara
      s += `<path d="M${pt(150 - S * 0.42, 150)} Q150,${f1(160)} ${pt(150 + S * 0.42, 150)} C${pt(150 + S * 0.5 + Bx * 0.4, 200)} ${pt(150 + W * 0.7 + Bx * 0.6, 240)} ${pt(150 + W * 0.55, yc)} Q150,${f1(yc + cai * 1.5)} ${pt(150 - W * 0.55, yc)} C${pt(150 - W * 0.7 - Bx * 0.6, 240)} ${pt(150 - S * 0.5 - Bx * 0.4, 200)} ${pt(150 - S * 0.42, 150)} Z" fill="${C.peito}" opacity="${C.padrao === 'liso' ? 0.55 : 0.95}"/>`;
      if (C.padrao === 'tigrado') {
        s += `<path d="M${pt(150 - S + 2, 182)} l14,4 M${pt(150 - Mx - Bx * 0.4, 214)} l15,3 M${pt(150 - Mx - Bx * 0.6, 240)} l14,1 M${pt(150 + S - 2, 182)} l-14,4 M${pt(150 + Mx + Bx * 0.4, 214)} l-15,3 M${pt(150 + Mx + Bx * 0.6, 240)} l-14,1" stroke="${C.esc}" stroke-width="4" stroke-linecap="round"/>`;
      }
      if (C.mancha1) s += `<ellipse cx="${f1(150 - S * 0.62)}" cy="200" rx="${f1(S * 0.32)}" ry="20" fill="${C.mancha2}"/><ellipse cx="${f1(150 + Mx * 0.7)}" cy="236" rx="${f1(Mx * 0.3)}" ry="18" fill="${C.mancha1}"/>`;
      // músculos: peitoral em placas, abdômen em blocos, serrátil
      const lin = C.esc;
      const opP = Math.max(0, Math.min(0.85, 0.15 + m * 0.9 - g * 0.35));
      if (m > 0.12) {
        const py = 172, ph = 22 + 16 * m, pw = S * 0.62;
        s += `<path d="M150,${py} C${f1(150 - pw * 0.4)},${py - 4} ${f1(150 - pw)},${py - 2} ${f1(150 - pw - 4)},${f1(py + ph * 0.45)} C${f1(150 - pw)},${f1(py + ph)} ${f1(150 - pw * 0.3)},${f1(py + ph + 6)} 150,${f1(py + ph - 2)}" stroke="${lin}" stroke-width="${f1(2 + m * 2)}" fill="none" stroke-linecap="round" opacity="${f1(opP)}"/>`;
        s += `<path d="M150,${py} C${f1(150 + pw * 0.4)},${py - 4} ${f1(150 + pw)},${py - 2} ${f1(150 + pw + 4)},${f1(py + ph * 0.45)} C${f1(150 + pw)},${f1(py + ph)} ${f1(150 + pw * 0.3)},${f1(py + ph + 6)} 150,${f1(py + ph - 2)}" stroke="${lin}" stroke-width="${f1(2 + m * 2)}" fill="none" stroke-linecap="round" opacity="${f1(opP)}"/>`;
        s += `<ellipse cx="${f1(150 - pw * 0.55)}" cy="${f1(py + ph * 0.45)}" rx="${f1(pw * 0.35)}" ry="${f1(ph * 0.22)}" fill="#fff" opacity="${f1(0.06 + m * 0.08)}"/><ellipse cx="${f1(150 + pw * 0.55)}" cy="${f1(py + ph * 0.45)}" rx="${f1(pw * 0.35)}" ry="${f1(ph * 0.22)}" fill="#fff" opacity="${f1(0.06 + m * 0.08)}"/>`;
      } else {
        s += `<path d="M${pt(150 - S * 0.62, 186)} Q150,${f1(196)} ${pt(150 + S * 0.62, 186)}" stroke="${lin}" stroke-width="2" fill="none" opacity=".2"/>`;
      }
      if (m > 0.3 && g < 0.55) {
        const op = Math.min(0.9, (m - 0.3) * 2) * (1 - g * 1.4);
        const top = 204 + m * 6, bw = 9 + m * 6, bh = (yc - 14 - top) / 3;
        let abs = '';
        for (let k = 0; k < 3; k++) for (const l of [-1, 1]) abs += `<rect x="${f1(l < 0 ? 150 - bw - 1.5 : 151.5)}" y="${f1(top + k * bh + 1)}" width="${f1(bw)}" height="${f1(bh - 3)}" rx="${f1(bw * 0.4)}" fill="none" stroke="${lin}" stroke-width="2"/>`;
        s += `<g opacity="${f1(op)}">${abs}</g>`;
        s += `<path d="M${pt(150 - S + 8, 196)} l10,4 M${pt(150 - S + 10, 208)} l10,4 M${pt(150 - S + 13, 220)} l9,4 M${pt(150 + S - 8, 196)} l-10,4 M${pt(150 + S - 10, 208)} l-10,4 M${pt(150 + S - 13, 220)} l-9,4" stroke="${lin}" stroke-width="2" stroke-linecap="round" opacity="${f1(op * 0.8)}"/>`;
      }
      if (R.tipo === 'nada' && AC && AC.TAT_PEITO.includes(Q.tatuagem)) s += AC.tatPeito(Q.tatuagem, ctx);
      if (g > 0.3) {
        s += `<path d="M${pt(150 - W * 0.6, yc - 18 - g * 8)} Q150,${f1(yc - 6 + g * 4)} ${pt(150 + W * 0.6, yc - 18 - g * 8)}" stroke="${lin}" stroke-width="2" fill="none" opacity="${f1(g * 0.55)}"/>`;
        s += `<ellipse cx="150" cy="${f1(234 + g * 10)}" rx="2.4" ry="3.2" fill="${lin}" opacity="${f1(g * 0.7)}"/>`;
      }
    }
    if (R.tipo === 'manga' || R.tipo === 'longa' || R.tipo === 'regata') {
      const recorte = R.tipo === 'regata' ? 16 : 0;
      s += `<path d="M${pt(150 - S * 0.5, 146)} Q${pt(150 - S + 2 + recorte, 146)} ${pt(150 - S + recorte, 166)} C${pt(150 - S + 1 + recorte * 0.6, 190)} ${pt(150 - Mx - Bx * 0.2, 206)} ${pt(150 - Mx - Bx * 0.5, 226)} C${pt(150 - Mx - Bx * 0.8, 250)} ${pt(150 - W - Bx * 0.4, yc - 4)} ${pt(150 - W, yc + 2)} Q150,${f1(yc + 2 + cai * 1.6)} ${pt(150 + W, yc + 2)} C${pt(150 + W + Bx * 0.4, yc - 4)} ${pt(150 + Mx + Bx * 0.8, 250)} ${pt(150 + Mx + Bx * 0.5, 226)} C${pt(150 + Mx + Bx * 0.2, 206)} ${pt(150 + S - 1 - recorte * 0.6, 190)} ${pt(150 + S - recorte, 166)} Q${pt(150 + S - 2 - recorte, 146)} ${pt(150 + S * 0.5, 146)} Z" fill="${R.cor}"/>`;
      s += `<path d="M${pt(150 - S * 0.62, 186 + m * 4)} Q150,${f1(200 + m * 8)} ${pt(150 + S * 0.62, 186 + m * 4)}" stroke="${R.esc}" stroke-width="2.5" fill="none" opacity="${f1(0.15 + m * 0.6)}"/>`;
      if (R.faixas) s += `<path d="M${pt(150 - S + 18, 168)} L${pt(150 - W - 2, yc)} M${pt(150 + S - 18, 168)} L${pt(150 + W + 2, yc)}" stroke="#e2c79b" stroke-width="4" opacity=".7"/>`;
      if (R.logo) s += `<path d="M150,194 C157,201 158,208 153,214 C154,208 150,205 148,208 C146,203 150,199 150,194 Z" fill="#e2c79b"/>`;
      s += `<path d="M${pt(150 - 18, 147)} Q150,160 ${pt(150 + 18, 147)}" stroke="${R.esc}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    if (AC && !so) { s += AC.cintura(Q.cintura, ctx); s += AC.costasFrente(Q.costas, ctx); }
    if (AC && Q.pescoco !== 'toalha') s += AC.pescoco(Q.pescoco, ctx);
    if (!so) {
      s += braco(-1, S, A, pose, R, C, Q, m);
      s += braco(1, S, A, pose, R, C, Q, m);
      if (AC && Q.pescoco === 'toalha') s += AC.toalha(ctx);
    }
    s += cabeca(humor, Q, C, g, m);
    s += '</g></svg>';
    return s;
  }

  window.Heroi = { render, corpoDeMedidas, ROUPAS, AURAS, PELAGENS, PADROES, OLHOS, AVATAR_PADRAO, cores };
})();
