/* Forja: acessórios do gato, por encaixe.
   Cada função recebe o contexto do corpo (medidas do desenho) e devolve SVG. */
(function () {
  'use strict';
  const f = n => (+n).toFixed(1);
  const TINTA = '#1c2733';

  const SLOTS = [
    ['chapeu', 'Chapéu'], ['rosto', 'Rosto'], ['pescoco', 'Pescoço'], ['tatuagem', 'Tatuagem'],
    ['maos', 'Mãos'], ['cintura', 'Cintura'], ['pes', 'Pés'], ['costas', 'Costas']
  ];
  const ITENS = [
    // chapéu
    ['bone', 'chapeu', 'Boné', 7, '#1d2024'], ['gorro', 'chapeu', 'Gorro', 8, '#4b5a6e'], ['faixa', 'chapeu', 'Faixa', 9, '#a8834f'],
    ['bandana', 'chapeu', 'Bandana', 11, '#7a2b24'], ['snapback', 'chapeu', 'Aba reta', 13, '#8a4a2a'], ['fone', 'chapeu', 'Fone', 16, '#3a3f46'],
    ['cowboy', 'chapeu', 'Chapéu de caubói', 20, '#83593a'], ['cartola', 'chapeu', 'Cartola', 26, '#26262b'], ['viking', 'chapeu', 'Elmo viking', 34, '#8f949a'],
    ['coroa', 'chapeu', 'Coroa', 50, '#c6a06a'], ['aureola', 'chapeu', 'Auréola', 80, '#f3dc9a'],
    // rosto
    ['oculos_redondo', 'rosto', 'Óculos redondo', 7, '#c6a06a'], ['oculos_sol', 'rosto', 'Óculos escuro', 10, '#1a1d22'], ['visor', 'rosto', 'Visor esportivo', 18, '#2c3e50'],
    ['cicatriz', 'rosto', 'Cicatriz', 24, '#b5554d'], ['tapa_olho', 'rosto', 'Tapa-olho', 30, '#111'],
    // pescoço
    ['coleira', 'pescoco', 'Coleira com sino', 7, '#b33a3a'], ['gravata', 'pescoco', 'Gravata borboleta', 12, '#7a2b24'], ['cachecol', 'pescoco', 'Cachecol', 15, '#5f7590'],
    ['toalha', 'pescoco', 'Toalha no ombro', 19, '#ece8e1'], ['corrente', 'pescoco', 'Corrente de ouro', 28, '#d4af37'], ['medalha', 'pescoco', 'Medalha', 45, '#c6a06a'],
    // tatuagem
    ['tribal', 'tatuagem', 'Tribal no braço', 9, TINTA], ['ancora', 'tatuagem', 'Âncora no braço', 14, TINTA], ['estrelas', 'tatuagem', 'Estrelas no braço', 17, TINTA],
    ['coracao', 'tatuagem', 'Coração no braço', 21, TINTA], ['chama', 'tatuagem', 'Chama no peito', 25, TINTA], ['caveira', 'tatuagem', 'Caveira no peito', 32, TINTA],
    ['dragao', 'tatuagem', 'Dragão no corpo', 40, TINTA],
    // mãos
    ['munhequeira', 'maos', 'Munhequeiras', 10, '#a8834f'], ['faixas', 'maos', 'Faixas de luta', 12, '#ece8e1'], ['luvas', 'maos', 'Luvas de treino', 15, '#1d2024'],
    ['luvas_boxe', 'maos', 'Luvas de boxe', 36, '#a3302a'],
    // cintura
    ['cinto', 'cintura', 'Cinto de musculação', 23, '#4a3424'], ['cinturao', 'cintura', 'Cinturão de campeão', 60, '#d4af37'],
    // pés
    ['chinelo', 'pes', 'Chinelo', 7, '#3a3f46'], ['tenis', 'pes', 'Tênis', 8, '#e8e4dd'], ['botas', 'pes', 'Coturno', 22, '#1d1d21'],
    ['botas_cowboy', 'pes', 'Bota de caubói', 27, '#6b4528'], ['tenis_ouro', 'pes', 'Tênis dourado', 55, '#c6a06a'],
    // costas
    ['mochila', 'costas', 'Mochila', 14, '#3f5a4c'], ['capa', 'costas', 'Capa', 38, '#7a2b24'], ['capa_ouro', 'costas', 'Capa dourada', 65, '#b8914f'],
    ['asas', 'costas', 'Asas', 75, '#ece8e1']
  ].map(([id, slot, nome, nivel, cor]) => ({ id, slot, nome, nivel, cor }));

  /* ---- costas (atrás do corpo) ---- */
  function costas(id, c) {
    const S = c.S;
    if (id === 'capa' || id === 'capa_ouro') {
      const cor = id === 'capa' ? '#7a2b24' : '#b8914f', esc = id === 'capa' ? '#5c1f1a' : '#94733f';
      return `<path class="capa" d="M${150 - S + 6},152 Q150,140 ${150 + S - 6},152 L${150 + S + 32},340 Q150,362 ${150 - S - 32},340 Z" fill="${cor}"/><path d="M${150 - S + 10},160 L${150 - S - 14},336" stroke="${esc}" stroke-width="3" opacity=".6"/>`;
    }
    if (id === 'asas') {
      const asa = l => `<path d="M${150 + l * (S - 14)},176 C${150 + l * (S + 50)},120 ${150 + l * (S + 96)},128 ${150 + l * (S + 104)},150 C${150 + l * (S + 80)},156 ${150 + l * (S + 92)},176 ${150 + l * (S + 70)},184 C${150 + l * (S + 76)},198 ${150 + l * (S + 50)},210 ${150 + l * (S + 30)},210 C${150 + l * (S + 30)},224 ${150 + l * S},226 ${150 + l * (S - 14)},208 Z" fill="#ece8e1" stroke="#c9c1b5" stroke-width="2"/>`;
      return `<g class="asas">${asa(-1)}${asa(1)}</g>`;
    }
    if (id === 'mochila') return `<rect x="${f(150 + S - 22)}" y="170" width="${f(34 + c.g * 10)}" height="64" rx="10" fill="#3f5a4c"/><rect x="${f(150 + S - 16)}" y="200" width="${f(24 + c.g * 8)}" height="22" rx="5" fill="#2f4539"/>`;
    return '';
  }
  function costasFrente(id, c) {
    if (id !== 'mochila') return '';
    const S = c.S;
    return `<path d="M${f(150 - S * 0.45)},148 C${f(150 - S * 0.5)},180 ${f(150 - S * 0.62)},210 ${f(150 - S * 0.6)},236 M${f(150 + S * 0.45)},148 C${f(150 + S * 0.5)},180 ${f(150 + S * 0.62)},210 ${f(150 + S * 0.6)},236" stroke="#2f4539" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }

  /* ---- pés (substitui a pata) ---- */
  function pes(id, c, l, ax, patas) {
    const x = ax + l * 4, g = c.g, Cc = c.Cc, w = 18 + g * 7 + c.m * 2;
    const sapato = (cor, sola, extra) => `<path d="M${f(x - w)},398 Q${f(x - w)},${f(380 - g * 2)} ${f(x)},${f(379 - g * 2)} Q${f(x + w + 2)},${f(380 - g * 2)} ${f(x + w + 3)},398 Z" fill="${cor}"/><rect x="${f(x - w - 1)}" y="394" width="${f(2 * w + 5)}" height="7" rx="3" fill="${sola}"/>${extra || ''}`;
    switch (id) {
      case 'tenis': return sapato('#e8e4dd', '#c6a06a', `<path d="M${f(x - 6)},386 h12 M${f(x - 5)},390 h11" stroke="#9a948a" stroke-width="1.6"/><path d="M${f(x + l * 4)},388 l${l * 10},4" stroke="#c6a06a" stroke-width="2.4"/>`);
      case 'tenis_ouro': return sapato('#c6a06a', '#2b2f35', `<path d="M${f(x - 6)},386 h12 M${f(x - 5)},390 h11" stroke="#7a5c30" stroke-width="1.6"/>`);
      case 'botas': return `<rect x="${f(ax - Cc - 3)}" y="352" width="${f(2 * Cc + 6)}" height="36" rx="5" fill="#1d1d21"/><path d="M${f(ax - 4)},360 l8,4 M${f(ax - 4)},368 l8,4 M${f(ax - 4)},376 l8,4" stroke="#55555c" stroke-width="1.6"/>` + sapato('#1d1d21', '#0e0e10');
      case 'botas_cowboy': return `<path d="M${f(ax - Cc - 3)},348 L${f(ax + Cc + 3)},348 L${f(ax + Cc + 1)},388 L${f(ax - Cc - 1)},388 Z" fill="#6b4528"/><path d="M${f(ax - Cc)},356 Q${f(ax)},364 ${f(ax + Cc)},356" stroke="#c6a06a" stroke-width="1.6" fill="none"/>` + sapato('#6b4528', '#3a2618', `<rect x="${f(x - l * w - (l > 0 ? 0 : 0) - 4)}" y="394" width="8" height="8" fill="#3a2618"/>`);
      case 'chinelo': return `<rect x="${f(x - w - 2)}" y="396" width="${f(2 * w + 6)}" height="5" rx="2.5" fill="#3a3f46"/>` + patas() + `<path d="M${f(x - w * 0.6)},396 L${f(x)},386 L${f(x + w * 0.6)},396" stroke="#c6a06a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      default: return patas();
    }
  }

  /* ---- mãos ---- */
  function maos(id, hx, hy, pr, ex, ey) {
    switch (id) {
      case 'luvas': return `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(pr + 1)}" fill="#1d2024"/><path d="M${f(ex + (hx - ex) * 0.78)},${f(ey + (hy - ey) * 0.78)} L${f(ex + (hx - ex) * 0.86)},${f(ey + (hy - ey) * 0.86)}" stroke="#c6a06a" stroke-width="${f(pr * 1.9)}"/>`;
      case 'faixas': return `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(pr + 1)}" fill="#ece8e1"/><path d="M${f(hx - pr)},${f(hy - 3)} L${f(hx + pr)},${f(hy + 1)} M${f(hx - pr)},${f(hy + 3)} L${f(hx + pr)},${f(hy + 7)}" stroke="#c9c1b5" stroke-width="1.6"/><path d="M${f(ex + (hx - ex) * 0.72)},${f(ey + (hy - ey) * 0.72)} L${f(ex + (hx - ex) * 0.86)},${f(ey + (hy - ey) * 0.86)}" stroke="#ece8e1" stroke-width="${f(pr * 1.8)}"/>`;
      case 'luvas_boxe': return `<path d="M${f(ex + (hx - ex) * 0.74)},${f(ey + (hy - ey) * 0.74)} L${f(ex + (hx - ex) * 0.86)},${f(ey + (hy - ey) * 0.86)}" stroke="#ece8e1" stroke-width="${f(pr * 2)}"/><circle cx="${f(hx)}" cy="${f(hy)}" r="${f(pr * 1.55)}" fill="#a3302a"/><circle cx="${f(hx - pr * 0.4)}" cy="${f(hy - pr * 0.5)}" r="${f(pr * 0.5)}" fill="#c94a40"/>`;
      case 'munhequeira': return `<path d="M${f(ex + (hx - ex) * 0.68)},${f(ey + (hy - ey) * 0.68)} L${f(ex + (hx - ex) * 0.84)},${f(ey + (hy - ey) * 0.84)}" stroke="#a8834f" stroke-width="${f(pr * 1.9)}"/>`;
      default: return '';
    }
  }

  /* ---- tatuagens ---- */
  const TAT_BRACO = {
    tribal: '<path d="M-11,-5 L-5,0 L-11,5 M-3,-6 L4,0 L-3,6 M6,-5 L11,0 L6,5" stroke-width="2.4" fill="none"/>',
    ancora: '<circle cx="0" cy="-8" r="2.2" fill="none" stroke-width="1.8"/><path d="M0,-6 V8 M-6,3 Q0,11 6,3 M-4,-2 H4" stroke-width="2" fill="none"/>',
    estrelas: '<path d="M-6,-6 l1.5,3.5 3.6,.4 -2.7,2.4 .8,3.6 -3.2,-1.9 -3.2,1.9 .8,-3.6 -2.7,-2.4 3.6,-.4z M6,2 l1.2,2.7 2.8,.3 -2.1,1.9 .6,2.8 -2.5,-1.5 -2.5,1.5 .6,-2.8 -2.1,-1.9 2.8,-.3z" stroke="none"/>',
    coracao: '<path d="M0,7 C-10,-1 -7,-9 0,-4 C7,-9 10,-1 0,7 Z" fill="none" stroke-width="2"/><path d="M-9,1 H9" stroke-width="3"/>'
  };
  function tatBraco(id, bx, by, ang, A) {
    const d = TAT_BRACO[id];
    if (!d) return '';
    const k = Math.max(0.8, A / 11);
    return `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(ang - 90)}) scale(${f(k)})" stroke="${TINTA}" fill="${TINTA}" opacity=".75" stroke-linecap="round" stroke-linejoin="round">${d}</g>`;
  }
  function tatPeito(id, c) {
    const { S, W, Mx } = c;
    const g0 = `stroke="${TINTA}" fill="none" opacity=".75" stroke-linecap="round" stroke-linejoin="round"`;
    if (id === 'chama') { const x = 150 - S * 0.42, y = 182; return `<path ${g0} stroke-width="2.4" d="M${f(x)},${y + 14} C${f(x - 10)},${y + 6} ${f(x - 4)},${y - 4} ${f(x)},${y - 14} C${f(x + 2)},${y - 4} ${f(x + 10)},${y} ${f(x + 6)},${y + 8} C${f(x + 8)},${y + 2} ${f(x + 4)},${y} ${f(x + 3)},${y - 2} C${f(x + 2)},${y + 6} ${f(x - 2)},${y + 6} ${f(x)},${y + 14} Z"/>`; }
    if (id === 'caveira') return `<g ${g0} stroke-width="2.2"><path d="M138,206 C138,190 162,190 162,206 C162,212 158,214 158,218 L142,218 C142,214 138,212 138,206 Z"/><circle cx="145" cy="205" r="3" fill="${TINTA}"/><circle cx="155" cy="205" r="3" fill="${TINTA}"/><path d="M146,218 v4 M150,218 v4 M154,218 v4"/></g>`;
    if (id === 'dragao') { const x = 150 + S * 0.5; return `<path ${g0} stroke-width="2.6" d="M${f(x)},168 C${f(x + 14)},182 ${f(x - 14)},198 ${f(x)},212 C${f(x + 14)},226 ${f(150 + W * 0.4)},238 ${f(150 + W * 0.5)},252"/><path ${g0} stroke-width="2" d="M${f(x - 4)},164 l6,-6 l4,6 M${f(x - 6)},190 l-6,2 M${f(x + 6)},204 l6,2 M${f(x - 4)},222 l-6,2"/>`; }
    return '';
  }
  const TAT_PEITO = ['chama', 'caveira', 'dragao'];

  /* ---- cintura ---- */
  function cintura(id, c) {
    const { W, Bx, yc } = c;
    const x1 = 150 - W - Bx * 0.25 - 3, x2 = 150 + W + Bx * 0.25 + 3;
    if (id === 'cinto') return `<rect x="${f(x1)}" y="${f(yc - 12)}" width="${f(x2 - x1)}" height="14" rx="3" fill="#4a3424"/><rect x="141" y="${f(yc - 13)}" width="18" height="16" rx="2" fill="none" stroke="#c6a06a" stroke-width="3"/>`;
    if (id === 'cinturao') return `<rect x="${f(x1)}" y="${f(yc - 13)}" width="${f(x2 - x1)}" height="16" rx="3" fill="#2b2b2b"/><ellipse cx="150" cy="${f(yc - 5)}" rx="24" ry="15" fill="#d4af37" stroke="#94733f" stroke-width="2.5"/><ellipse cx="150" cy="${f(yc - 5)}" rx="13" ry="8" fill="none" stroke="#94733f" stroke-width="2"/><circle cx="150" cy="${f(yc - 5)}" r="3" fill="#a3302a"/>`;
    return '';
  }

  /* ---- pescoço ---- */
  function pescoco(id, c) {
    switch (id) {
      case 'coleira': return `<path d="M126,146 Q150,160 174,146 L174,154 Q150,168 126,154 Z" fill="#b33a3a"/><circle cx="150" cy="166" r="6.5" fill="#d4af37" stroke="#94733f" stroke-width="1.5"/><path d="M150,168 v3" stroke="#5c4520" stroke-width="2"/>`;
      case 'gravata': return `<path d="M150,154 L134,144 L134,166 Z M150,154 L166,144 L166,166 Z" fill="#7a2b24"/><rect x="145" y="149" width="10" height="10" rx="2" fill="#5c1f1a"/>`;
      case 'cachecol': return `<path d="M124,140 Q150,156 176,140 L178,154 Q150,172 122,154 Z" fill="#5f7590"/><path d="M156,158 L170,158 L174,206 L160,206 Z" fill="#5f7590"/><path d="M158,180 h14 M159,192 h14" stroke="#e8e4dd" stroke-width="3"/>`;
      case 'corrente': return `<path d="M130,148 Q150,190 170,148" stroke="#d4af37" stroke-width="3.5" fill="none" stroke-dasharray="4 2"/><rect x="144" y="166" width="12" height="14" rx="2" fill="#d4af37" stroke="#94733f" stroke-width="1.5"/>`;
      case 'medalha': return `<path d="M138,148 L150,194 L162,148" stroke="#7a2b24" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="150" cy="200" r="11" fill="#c6a06a" stroke="#94733f" stroke-width="3"/><path d="M150,194 l2,4 4,.5 -3,3 1,4 -4,-2 -4,2 1,-4 -3,-3 4,-.5z" fill="#f3dc9a"/>`;
      default: return '';
    }
  }
  function toalha(c) {
    const S = c.S;
    return `<path d="M${f(150 + S * 0.35)},144 Q${f(150 + S)},146 ${f(150 + S + 8)},162 L${f(150 + S + 2)},226 L${f(150 + S - 16)},226 L${f(150 + S - 12)},170 Q${f(150 + S * 0.6)},158 ${f(150 + S * 0.3)},156 Z" fill="#ece8e1"/><path d="M${f(150 + S - 14)},212 L${f(150 + S + 1)},212" stroke="#c6a06a" stroke-width="3"/>`;
  }

  /* ---- rosto ---- */
  function rosto(id, c) {
    const cy = c.cy;
    switch (id) {
      case 'oculos_sol': return `<g><path d="M115,${cy - 6} Q131,${cy - 10} 145,${cy - 6} Q146,${cy + 10} 131,${cy + 12} Q116,${cy + 10} 115,${cy - 6} Z M155,${cy - 6} Q169,${cy - 10} 185,${cy - 6} Q184,${cy + 10} 169,${cy + 12} Q154,${cy + 10} 155,${cy - 6} Z" fill="#1a1d22" stroke="#c6a06a" stroke-width="1.6"/><path d="M145,${cy - 4} Q150,${cy - 8} 155,${cy - 4}" stroke="#c6a06a" stroke-width="1.6" fill="none"/><path d="M121,${cy - 3} L128,${cy + 4} M161,${cy - 3} L168,${cy + 4}" stroke="#fff" stroke-width="1.6" opacity=".35"/></g>`;
      case 'oculos_redondo': return `<g fill="rgba(255,255,255,.08)" stroke="#c6a06a" stroke-width="2.6"><circle cx="131" cy="${cy}" r="15"/><circle cx="169" cy="${cy}" r="15"/><path d="M146,${cy - 2} Q150,${cy - 5} 154,${cy - 2}" fill="none"/></g>`;
      case 'visor': return `<path d="M110,${cy - 10} Q150,${cy - 20} 190,${cy - 10} L188,${cy + 8} Q150,${cy + 14} 112,${cy + 8} Z" fill="#2c3e50" opacity=".88" stroke="#1d2024" stroke-width="2"/><path d="M118,${cy - 6} Q150,${cy - 14} 182,${cy - 6}" stroke="#9fc3e0" stroke-width="2" fill="none" opacity=".5"/>`;
      case 'tapa_olho': return `<path d="M108,${cy - 16} L196,${cy - 34}" stroke="#111" stroke-width="2.4"/><ellipse cx="131" cy="${cy}" rx="15" ry="13" fill="#111"/>`;
      case 'cicatriz': return `<path d="M160,${cy - 22} L178,${cy + 14}" stroke="#b5554d" stroke-width="2.6" stroke-linecap="round"/><path d="M163,${cy - 12} l6,-3 M168,${cy - 2} l6,-3 M173,${cy + 8} l6,-3" stroke="#b5554d" stroke-width="1.8" stroke-linecap="round"/>`;
      default: return '';
    }
  }

  /* ---- chapéu ---- */
  function chapeu(id, c) {
    const { rx, cy } = c;
    switch (id) {
      case 'bone': return `<path d="M${f(150 - rx + 10)},${cy - 24} C${f(150 - rx + 14)},${cy - 60} ${f(150 + rx - 14)},${cy - 60} ${f(150 + rx - 10)},${cy - 24} Z" fill="#1d2024"/><path d="M${f(150 - rx + 8)},${cy - 24} Q150,${cy - 32} ${f(150 + rx - 8)},${cy - 24} Q${f(150 + rx + 4)},${cy - 18} ${f(150 + rx + 22)},${cy - 18} Q${f(150 + rx + 8)},${cy - 10} ${f(150 + rx - 8)},${cy - 14} Q150,${cy - 22} ${f(150 - rx + 8)},${cy - 16} Z" fill="#111316"/><path d="M146,${cy - 48} h8" stroke="#c6a06a" stroke-width="3" stroke-linecap="round"/>`;
      case 'snapback': return `<path d="M${f(150 - rx + 8)},${cy - 30} C${f(150 - rx + 12)},${cy - 70} ${f(150 + rx - 12)},${cy - 70} ${f(150 + rx - 8)},${cy - 30} Z" fill="#8a4a2a"/><rect x="${f(150 - rx - 2)}" y="${cy - 34}" width="${f(2 * rx + 4)}" height="9" rx="3" fill="#5a2f1a"/><rect x="143" y="${cy - 56}" width="14" height="11" rx="2" fill="#c6a06a"/>`;
      case 'gorro': return `<path d="M${f(150 - rx + 2)},${cy - 20} C${f(150 - rx + 2)},${cy - 82} ${f(150 + rx - 2)},${cy - 82} ${f(150 + rx - 2)},${cy - 20} Z" fill="#4b5a6e"/><rect x="${f(150 - rx)}" y="${cy - 34}" width="${f(2 * rx)}" height="16" rx="6" fill="#3d4a5c"/>${[-30, -15, 0, 15, 30].map(d => `<path d="M${150 + d},${cy - 32} v12" stroke="#2f3a48" stroke-width="2"/>`).join('')}<circle cx="150" cy="${cy - 78}" r="10" fill="#c6a06a"/>`;
      case 'faixa': return `<path d="M${f(150 - rx + 6)},${cy - 22} Q150,${cy - 38} ${f(150 + rx - 6)},${cy - 22} L${f(150 + rx - 4)},${cy - 13} Q150,${cy - 29} ${f(150 - rx + 4)},${cy - 13} Z" fill="#a8834f"/><path d="M${f(150 + rx - 6)},${cy - 18} Q${f(150 + rx + 16)},${cy - 22} ${f(150 + rx + 22)},${cy - 10} Q${f(150 + rx + 8)},${cy - 14} ${f(150 + rx - 4)},${cy - 12} Z" fill="#c6a06a"/>`;
      case 'bandana': return `<path d="M${f(150 - rx + 6)},${cy - 18} C${f(150 - rx + 8)},${cy - 62} ${f(150 + rx - 8)},${cy - 62} ${f(150 + rx - 6)},${cy - 18} Q150,${cy - 30} ${f(150 - rx + 6)},${cy - 18} Z" fill="#7a2b24"/>${[[-20, -40], [0, -48], [20, -40], [-10, -30], [12, -30]].map(([dx, dy]) => `<circle cx="${150 + dx}" cy="${cy + dy}" r="2" fill="#ece8e1"/>`).join('')}<path d="M${f(150 + rx - 8)},${cy - 24} l18,8 l-4,-14 Z" fill="#5c1f1a"/>`;
      case 'cowboy': return `<ellipse cx="150" cy="${cy - 34}" rx="${f(rx + 30)}" ry="11" fill="#6b4528"/><path d="M118,${cy - 34} C116,${cy - 76} 184,${cy - 76} 182,${cy - 34} Z" fill="#83593a"/><path d="M140,${cy - 68} Q150,${cy - 60} 160,${cy - 68}" stroke="#5c3c24" stroke-width="2" fill="none"/><rect x="118" y="${cy - 46}" width="64" height="7" fill="#3a2618"/>`;
      case 'cartola': return `<ellipse cx="150" cy="${cy - 38}" rx="${f(rx * 0.9)}" ry="7" fill="#1d1d21"/><rect x="124" y="${cy - 92}" width="52" height="56" rx="3" fill="#26262b"/><rect x="124" y="${cy - 50}" width="52" height="8" fill="#7a2b24"/>`;
      case 'viking': return `<path d="M${f(150 - rx + 4)},${cy - 24} C${f(150 - rx + 4)},${cy - 76} ${f(150 + rx - 4)},${cy - 76} ${f(150 + rx - 4)},${cy - 24} Z" fill="#8f949a"/><rect x="${f(150 - rx + 2)}" y="${cy - 34}" width="${f(2 * rx - 4)}" height="11" rx="3" fill="#6b7075"/>${[-30, -15, 0, 15, 30].map(d => `<circle cx="${150 + d}" cy="${cy - 28}" r="1.8" fill="#c4c7ca"/>`).join('')}<path d="M${f(150 - rx + 8)},${cy - 46} Q${f(150 - rx - 22)},${cy - 58} ${f(150 - rx - 16)},${cy - 90} Q${f(150 - rx - 4)},${cy - 64} ${f(150 - rx + 16)},${cy - 58} Z" fill="#ece2cf"/><path d="M${f(150 + rx - 8)},${cy - 46} Q${f(150 + rx + 22)},${cy - 58} ${f(150 + rx + 16)},${cy - 90} Q${f(150 + rx + 4)},${cy - 64} ${f(150 + rx - 16)},${cy - 58} Z" fill="#ece2cf"/>`;
      case 'coroa': return `<path d="M116,${cy - 30} L116,${cy - 62} L131,${cy - 48} L150,${cy - 72} L169,${cy - 48} L184,${cy - 62} L184,${cy - 30} Z" fill="#c6a06a" stroke="#94733f" stroke-width="2"/><circle cx="150" cy="${cy - 42}" r="4" fill="#a3302a"/><circle cx="130" cy="${cy - 40}" r="3" fill="#3f7cc4"/><circle cx="170" cy="${cy - 40}" r="3" fill="#3f8a5a"/>`;
      case 'aureola': return `<ellipse class="aureola" cx="150" cy="${cy - 66}" rx="34" ry="8" fill="none" stroke="#f3dc9a" stroke-width="5"/><ellipse cx="150" cy="${cy - 66}" rx="34" ry="8" fill="none" stroke="#fff6d6" stroke-width="1.5"/>`;
      case 'fone': return `<path d="M${f(150 - rx - 2)},${cy + 4} C${f(150 - rx)},${cy - 76} ${f(150 + rx)},${cy - 76} ${f(150 + rx + 2)},${cy + 4}" stroke="#2b2f35" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="${f(150 - rx - 12)}" y="${cy - 8}" width="16" height="28" rx="6" fill="#3a3f46"/><rect x="${f(150 + rx - 4)}" y="${cy - 8}" width="16" height="28" rx="6" fill="#3a3f46"/>`;
      default: return '';
    }
  }

  window.Acess = { SLOTS, ITENS, costas, costasFrente, pes, maos, tatBraco, tatPeito, TAT_PEITO, cintura, pescoco, toalha, rosto, chapeu };
})();
