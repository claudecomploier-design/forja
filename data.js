/* Forja: biblioteca de exercícios, grupos e treinos de base científica.
   Animação: a = { v: 's' (lateral) ou 'f' (frente), a: pose inicial, b: pose final }.
   Pose: h = quadril, t = inclinação do tronco (graus), m/mN/mF = mãos, p/pN/pF = pés,
   sA/sK = lado da dobra do cotovelo/joelho, inv = deitado de barriga para cima, mc = mãos na cabeça,
   pt = na ponta dos pés, om = ombros elevados (vista de frente). */
(function () {
  'use strict';

  const GRUPOS = [
    { id: 'peito', nome: 'Peito', attr: 'peito', cor: '#ff8fb1', sig: 'PE' },
    { id: 'costas', nome: 'Costas', attr: 'costas', cor: '#7cb7ff', sig: 'CO' },
    { id: 'ombros', nome: 'Ombros', attr: 'ombros', cor: '#b9a3f2', sig: 'OM' },
    { id: 'biceps', nome: 'Bíceps', attr: 'bracos', cor: '#ffa76b', sig: 'BI' },
    { id: 'triceps', nome: 'Tríceps', attr: 'bracos', cor: '#ffbf80', sig: 'TR' },
    { id: 'quadriceps', nome: 'Quadríceps', attr: 'pernas', cor: '#5fd08a', sig: 'QU' },
    { id: 'posteriores', nome: 'Posteriores e Glúteos', curto: 'Posteriores', attr: 'pernas', cor: '#4cc3a0', sig: 'PG' },
    { id: 'panturrilha', nome: 'Panturrilha', attr: 'pernas', cor: '#8fdc7a', sig: 'PA' },
    { id: 'abdomen', nome: 'Abdômen', attr: 'abdomen', cor: '#ffc94a', sig: 'AB' },
    { id: 'cardio', nome: 'Cardio', attr: 'cardio', cor: '#ff7a7a', sig: 'CA' }
  ];

  const BANCO = [[50, 140, 120, 9], [62, 149, 6, 41], [150, 149, 6, 41]];
  const ASSENTO = [[80, 142, 50, 9], [78, 96, 9, 46], [100, 151, 8, 39]];
  const deitado = { h: [80, 132], t: 90, inv: 1, p: [62, 190] };

  /* tipo: carga (kg e reps), corpo (reps e carga extra opcional), tempo (segundos), cardio (minutos)
     inc: incremento sugerido de carga em kg */
  const EX = [
    // PEITO
    { id: 'supino_reto', nome: 'Supino reto com barra', g: 'peito', sec: ['ombros', 'bracos'], tipo: 'carga', eq: 'barra', inc: 2.5, st: BANCO,
      dica: 'Escápulas encaixadas no banco e pés firmes. Desça a barra até a linha do peito, cotovelos a uns 45 graus do corpo.',
      a: { v: 's', a: Object.assign({}, deitado, { m: [124, 84], sA: -1 }), b: { m: [118, 120] } } },
    { id: 'supino_inclinado_halter', nome: 'Supino inclinado com halteres', g: 'peito', sec: ['ombros', 'bracos'], tipo: 'carga', eq: 'halter', inc: 2,
      st: [[56, 140, 64, 9], [86, 136, 70, 10, -55], [70, 149, 6, 41]],
      dica: 'Banco entre 30 e 45 graus. Desça os halteres ao lado do peito e suba juntando levemente no alto.',
      a: { v: 's', a: { h: [86, 134], t: 55, inv: 1, p: [60, 190], m: [140, 64], sA: -1 }, b: { m: [124, 98] } } },
    { id: 'supino_halter', nome: 'Supino reto com halteres', g: 'peito', sec: ['ombros', 'bracos'], tipo: 'carga', eq: 'halter', inc: 2, st: BANCO,
      dica: 'Mesma técnica do supino com barra, com mais amplitude. Controle a descida em 2 segundos.',
      a: { v: 's', a: Object.assign({}, deitado, { m: [124, 84], sA: -1 }), b: { m: [116, 124] } } },
    { id: 'voador', nome: 'Crucifixo na máquina (voador)', g: 'peito', sec: ['ombros'], tipo: 'carga', inc: 2.5,
      st: [[104, 58, 32, 84, 0, '#2f2b40'], [96, 140, 48, 10]],
      dica: 'Cotovelos levemente flexionados e fixos. Feche os braços contraindo o peito e volte devagar.',
      a: { v: 'f', a: { h: [120, 140], pN: [104, 190], pF: [136, 190], mN: [62, 74], mF: [178, 74], sA: -1 }, b: { mN: [112, 76], mF: [128, 76] } } },
    { id: 'crossover', nome: 'Crossover na polia', g: 'peito', sec: ['ombros'], tipo: 'carga', inc: 2.5, cabo: [14, 22], cabo2: [226, 22],
      dica: 'Tronco levemente inclinado à frente. Traga as mãos para baixo e para o centro, apertando o peito.',
      a: { v: 'f', a: { mN: [62, 66], mF: [178, 66], sA: -1 }, b: { mN: [112, 128], mF: [128, 128] } } },
    { id: 'flexao', nome: 'Flexão de braço', g: 'peito', sec: ['ombros', 'bracos', 'abdomen'], tipo: 'corpo',
      dica: 'Corpo reto da cabeça aos pés. Desça até o peito quase tocar o chão e empurre.',
      a: { v: 's', a: { h: [105, 148], t: 80, m: [152, 188], p: [57, 190] }, b: { h: [112, 180], t: 79 } } },

    // COSTAS
    { id: 'puxada_frente', nome: 'Puxada frontal', g: 'costas', sec: ['bracos'], tipo: 'carga', inc: 2.5, cabo: [124, 0],
      st: [[96, 142, 40, 9], [130, 122, 22, 8], [110, 151, 8, 39]],
      dica: 'Peito para cima, puxe a barra até a parte alta do peito levando os cotovelos para baixo.',
      a: { v: 's', a: { h: [116, 140], t: -8, m: [128, 34], p: [150, 190] }, b: { m: [132, 88] } } },
    { id: 'remada_curvada', nome: 'Remada curvada com barra', g: 'costas', sec: ['bracos', 'ombros'], tipo: 'carga', eq: 'barra', inc: 2.5,
      dica: 'Quadril para trás, coluna neutra. Puxe a barra em direção ao umbigo.',
      a: { v: 's', a: { h: [108, 124], t: 70, m: [155, 170], p: [118, 190] }, b: { m: [138, 132] } } },
    { id: 'remada_baixa', nome: 'Remada baixa sentada', g: 'costas', sec: ['bracos'], tipo: 'carga', inc: 2.5, cabo: [214, 148],
      st: [[62, 166, 56, 8], [170, 146, 8, 44]],
      dica: 'Puxe o cabo até o abdômen, juntando as escápulas. Não balance o tronco.',
      a: { v: 's', a: { h: [92, 160], t: 18, m: [184, 134], p: [150, 176] }, b: { t: -8, m: [114, 140] } } },
    { id: 'remada_unilateral', nome: 'Remada unilateral com halter', g: 'costas', sec: ['bracos'], tipo: 'carga', eq: 'halter', inc: 2,
      st: [[160, 142, 60, 9], [170, 151, 6, 39], [208, 151, 6, 39]],
      dica: 'Apoie uma mão no banco. Puxe o halter em direção ao quadril, cotovelo rente ao corpo.',
      a: { v: 's', a: { h: [104, 122], t: 75, mN: [150, 166], mF: [168, 142], p: [110, 190] }, b: { mN: [132, 128] } } },
    { id: 'barra_fixa', nome: 'Barra fixa', g: 'costas', sec: ['bracos'], tipo: 'corpo', st: [[64, 16, 112, 5]],
      dica: 'Pegada um pouco mais aberta que os ombros. Suba até o queixo passar a barra, desça controlando.',
      a: { v: 's', a: { h: [118, 118], m: [124, 20], p: [112, 178] }, b: { h: [118, 88], p: [110, 148] } } },
    { id: 'pulldown', nome: 'Pulldown com braços estendidos', g: 'costas', sec: [], tipo: 'carga', inc: 2.5, cabo: [200, 8],
      dica: 'Braços quase retos. Leve a barra da altura da cabeça até as coxas usando as costas.',
      a: { v: 's', a: { h: [110, 124], t: 18, m: [170, 56], p: [118, 190] }, b: { m: [132, 134] } } },
    { id: 'terra', nome: 'Levantamento terra', g: 'costas', sec: ['pernas', 'abdomen'], tipo: 'carga', eq: 'barra', inc: 5,
      dica: 'Barra rente às canelas, coluna neutra. Empurre o chão com as pernas e estenda o quadril no final.',
      a: { v: 's', a: { h: [94, 140], t: 70, m: [140, 172], p: [124, 190] }, b: { h: [118, 126], t: 0, m: [124, 128] } } },

    // OMBROS
    { id: 'desenvolvimento_halter', nome: 'Desenvolvimento com halteres', g: 'ombros', sec: ['bracos'], tipo: 'carga', eq: 'halter', inc: 2,
      dica: 'Halteres na altura das orelhas. Empurre para cima sem travar os cotovelos.',
      a: { v: 'f', a: { mN: [88, 76], mF: [152, 76], sA: -1 }, b: { mN: [104, 24], mF: [136, 24] } } },
    { id: 'elevacao_lateral', nome: 'Elevação lateral', g: 'ombros', sec: [], tipo: 'carga', eq: 'halter', inc: 1,
      dica: 'Cotovelos levemente dobrados. Suba até a altura dos ombros, sem impulso.',
      a: { v: 'f', a: { mN: [100, 128], mF: [140, 128], sA: -1 }, b: { mN: [58, 84], mF: [182, 84] } } },
    { id: 'elevacao_frontal', nome: 'Elevação frontal', g: 'ombros', sec: [], tipo: 'carga', eq: 'halter', inc: 1,
      dica: 'Suba o halter à frente até a altura dos ombros e desça devagar.',
      a: { v: 's', a: { m: [124, 128] }, b: { m: [168, 82] } } },
    { id: 'crucifixo_inverso', nome: 'Crucifixo inverso na máquina', g: 'ombros', sec: ['costas'], tipo: 'carga', inc: 2.5,
      st: [[104, 70, 32, 72, 0, '#2f2b40'], [96, 140, 48, 10]],
      dica: 'Abra os braços para trás na altura dos ombros, focando na parte de trás do ombro.',
      a: { v: 'f', a: { h: [120, 140], pN: [104, 190], pF: [136, 190], mN: [112, 96], mF: [128, 96], sA: -1 }, b: { mN: [58, 96], mF: [182, 96] } } },
    { id: 'desenvolvimento_barra', nome: 'Desenvolvimento com barra', g: 'ombros', sec: ['bracos'], tipo: 'carga', eq: 'barra', inc: 2.5,
      dica: 'Abdômen firme. Empurre a barra do queixo até acima da cabeça.',
      a: { v: 's', a: { m: [134, 76] }, b: { m: [124, 26] } } },
    { id: 'encolhimento', nome: 'Encolhimento com halteres', g: 'ombros', sec: ['costas'], tipo: 'carga', eq: 'halter', inc: 2,
      dica: 'Suba os ombros em direção às orelhas, segure 1 segundo e desça.',
      a: { v: 'f', a: { mN: [98, 132], mF: [142, 132] }, b: { om: -9, mN: [98, 123], mF: [142, 123] } } },

    // BÍCEPS
    { id: 'rosca_direta', nome: 'Rosca direta com barra', g: 'biceps', sec: [], tipo: 'carga', eq: 'barra', inc: 2,
      dica: 'Cotovelos colados ao corpo. Suba a barra sem balançar o tronco.',
      a: { v: 's', a: { m: [126, 128] }, b: { m: [136, 84] } } },
    { id: 'rosca_alternada', nome: 'Rosca alternada', g: 'biceps', sec: [], tipo: 'carga', eq: 'halter', inc: 1,
      dica: 'Um braço por vez, girando a palma para cima durante a subida.',
      a: { v: 's', a: { mN: [126, 128], mF: [130, 86] }, b: { mN: [136, 84], mF: [122, 126] } } },
    { id: 'rosca_martelo', nome: 'Rosca martelo', g: 'biceps', sec: [], tipo: 'carga', eq: 'halter', inc: 1,
      dica: 'Palmas viradas uma para a outra, como quem segura um martelo.',
      a: { v: 's', a: { m: [126, 128] }, b: { m: [138, 88] } } },
    { id: 'rosca_scott', nome: 'Rosca Scott', g: 'biceps', sec: [], tipo: 'carga', eq: 'barra', inc: 2,
      st: [[92, 142, 36, 8], [134, 94, 10, 48, -30], [104, 150, 8, 40]],
      dica: 'Braços apoiados no banco. Desça até quase estender e suba contraindo.',
      a: { v: 's', a: { h: [110, 140], p: [140, 190], m: [164, 124] }, b: { m: [136, 80] } } },
    { id: 'rosca_cabo', nome: 'Rosca na polia', g: 'biceps', sec: [], tipo: 'carga', inc: 2.5, cabo: [176, 188],
      dica: 'Tensão constante do cabo. Suba e desça sem mexer os cotovelos.',
      a: { v: 's', a: { m: [126, 128] }, b: { m: [136, 84] } } },

    // TRÍCEPS
    { id: 'triceps_pulley', nome: 'Tríceps na polia (pulley)', g: 'triceps', sec: [], tipo: 'carga', inc: 2.5, cabo: [150, 6],
      dica: 'Cotovelos fixos ao lado do corpo. Estenda até o fim e volte controlando.',
      a: { v: 's', a: { m: [140, 86] }, b: { m: [134, 130] } } },
    { id: 'triceps_corda', nome: 'Tríceps na corda', g: 'triceps', sec: [], tipo: 'carga', inc: 2.5, cabo: [150, 6],
      dica: 'No final, abra a corda para os lados para contrair mais o tríceps.',
      a: { v: 's', a: { m: [138, 88] }, b: { m: [130, 132] } } },
    { id: 'triceps_testa', nome: 'Tríceps testa', g: 'triceps', sec: [], tipo: 'carga', eq: 'barra', inc: 2, st: BANCO,
      dica: 'Deitado, desça a barra em direção à testa dobrando só os cotovelos.',
      a: { v: 's', a: Object.assign({}, deitado, { m: [126, 84], sA: -1 }), b: { m: [148, 110] } } },
    { id: 'triceps_frances', nome: 'Tríceps francês', g: 'triceps', sec: [], tipo: 'carga', eq: 'halter1', inc: 2,
      dica: 'Halter atrás da cabeça com as duas mãos. Estenda os braços para cima.',
      a: { v: 's', a: { m: [108, 58] }, b: { m: [122, 30] } } },
    { id: 'mergulho_banco', nome: 'Mergulho no banco', g: 'triceps', sec: ['peito', 'ombros'], tipo: 'corpo',
      st: [[60, 136, 44, 9], [64, 145, 6, 45], [94, 145, 6, 45]],
      dica: 'Mãos no banco atrás do corpo. Desça até os cotovelos formarem 90 graus.',
      a: { v: 's', a: { h: [104, 140], t: -3, m: [98, 138], p: [144, 190] }, b: { h: [104, 164] } } },

    // QUADRÍCEPS
    { id: 'agachamento', nome: 'Agachamento livre', g: 'quadriceps', sec: ['pernas', 'abdomen'], tipo: 'carga', eq: 'barra', inc: 2.5,
      dica: 'Pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão, joelhos na direção dos pés.',
      a: { v: 's', a: { h: [118, 126], m: [112, 86], p: [124, 190] }, b: { h: [92, 160], t: 42, m: [116, 124] } } },
    { id: 'leg_press', nome: 'Leg press 45', g: 'quadriceps', sec: [], tipo: 'carga', inc: 5, placa: true,
      st: [[36, 150, 62, 9], [28, 112, 9, 44, -35], [60, 159, 8, 31]],
      dica: 'Lombar colada no encosto. Desça até 90 graus nos joelhos sem tirar o quadril do banco.',
      a: { v: 's', a: { h: [70, 150], t: -60, m: [76, 156], p: [122, 108] }, b: { p: [100, 124] } } },
    { id: 'extensora', nome: 'Cadeira extensora', g: 'quadriceps', sec: [], tipo: 'carga', inc: 2.5, st: ASSENTO,
      dica: 'Estenda as pernas até o fim, segure 1 segundo e desça devagar.',
      a: { v: 's', a: { h: [100, 140], t: -8, m: [104, 146], p: [132, 174] }, b: { p: [163, 140] } } },
    { id: 'afundo', nome: 'Afundo (passada)', g: 'quadriceps', sec: ['pernas'], tipo: 'carga', eq: 'halter', inc: 2,
      dica: 'Passo largo à frente. Desça até o joelho de trás quase tocar o chão.',
      a: { v: 's', a: { m: [122, 138], pN: [132, 190], pF: [106, 190] }, b: { h: [116, 158], m: [120, 170], pN: [156, 190], pF: [80, 190] } } },
    { id: 'bulgaro', nome: 'Agachamento búlgaro', g: 'quadriceps', sec: ['pernas'], tipo: 'carga', eq: 'halter', inc: 2,
      st: [[36, 140, 50, 10], [42, 150, 6, 40], [76, 150, 6, 40]],
      dica: 'Pé de trás no banco. Desça na vertical com o tronco firme. Conte as reps de cada perna.',
      a: { v: 's', a: { h: [110, 126], t: 5, m: [116, 140], pN: [136, 190], pF: [72, 140] }, b: { h: [106, 156], m: [112, 168] } } },

    // POSTERIORES E GLÚTEOS
    { id: 'stiff', nome: 'Stiff', g: 'posteriores', sec: ['costas'], tipo: 'carga', eq: 'barra', inc: 2.5,
      dica: 'Joelhos quase retos. Leve o quadril para trás até sentir a parte de trás da coxa alongar.',
      a: { v: 's', a: { m: [124, 128], p: [122, 190] }, b: { h: [100, 124], t: 75, m: [146, 160], p: [118, 190] } } },
    { id: 'elevacao_pelvica', nome: 'Elevação pélvica', g: 'posteriores', sec: [], tipo: 'carga', eq: 'barra', inc: 5,
      st: [[36, 124, 50, 10], [42, 134, 6, 56], [76, 134, 6, 56]],
      dica: 'Costas apoiadas no banco. Suba o quadril até alinhar com o tronco e aperte os glúteos.',
      a: { v: 's', a: { h: [104, 170], t: -55, m: [106, 164], p: [144, 190] }, b: { h: [110, 134], t: -88, m: [112, 130] } } },
    { id: 'mesa_flexora', nome: 'Mesa flexora', g: 'posteriores', sec: [], tipo: 'carga', inc: 2.5,
      st: [[70, 146, 120, 9], [80, 155, 8, 35], [170, 155, 8, 35]],
      dica: 'Deitado de bruços. Traga os calcanhares em direção ao glúteo sem tirar o quadril do banco.',
      a: { v: 's', a: { h: [112, 138], t: 90, m: [176, 152], p: [50, 140] }, b: { p: [86, 104] } } },
    { id: 'cadeira_flexora', nome: 'Cadeira flexora', g: 'posteriores', sec: [], tipo: 'carga', inc: 2.5, st: ASSENTO,
      dica: 'Pernas estendidas, flexione puxando os calcanhares para baixo e para trás.',
      a: { v: 's', a: { h: [100, 140], t: -8, m: [104, 146], p: [163, 140] }, b: { p: [128, 176] } } },
    { id: 'abducao', nome: 'Cadeira abdutora', g: 'posteriores', sec: [], tipo: 'carga', inc: 2.5,
      st: [[104, 74, 32, 70, 0, '#2f2b40'], [92, 140, 56, 10]],
      dica: 'Abra as pernas contra a resistência e volte devagar. Ótimo para o glúteo médio.',
      a: { v: 'f', a: { h: [120, 140], mN: [100, 148], mF: [140, 148], pN: [108, 190], pF: [132, 190] }, b: { pN: [78, 184], pF: [162, 184] } } },
    { id: 'gluteo_cabo', nome: 'Glúteo na polia (coice)', g: 'posteriores', sec: [], tipo: 'carga', inc: 2.5, cabo: [176, 188], caboPe: true,
      st: [[168, 60, 10, 130]],
      dica: 'Tronco levemente inclinado. Leve a perna para trás sem arquear a lombar.',
      a: { v: 's', a: { h: [118, 124], t: 22, m: [162, 96], pN: [118, 188], pF: [124, 190] }, b: { pN: [68, 150] } } },

    // PANTURRILHA
    { id: 'panturrilha_pe', nome: 'Panturrilha em pé', g: 'panturrilha', sec: [], tipo: 'carga', eq: 'halter', inc: 2,
      st: [[98, 182, 54, 8]],
      dica: 'Ponta dos pés no degrau. Desça o calcanhar até alongar e suba o máximo que conseguir.',
      a: { v: 's', a: { h: [118, 116], m: [122, 134], p: [120, 180] }, b: { h: [118, 104], m: [122, 122], p: [120, 168], pt: 1 } } },
    { id: 'panturrilha_sentado', nome: 'Panturrilha sentado', g: 'panturrilha', sec: [], tipo: 'carga', inc: 2.5,
      st: [[76, 142, 50, 9], [118, 128, 34, 8, 0, '#5c5670'], [90, 151, 8, 39]],
      dica: 'Joelhos sob o apoio. Suba e desça o calcanhar com amplitude total.',
      a: { v: 's', a: { h: [100, 140], m: [124, 134], p: [134, 184] }, b: { p: [134, 172], pt: 1 } } },
    { id: 'panturrilha_legpress', nome: 'Panturrilha no leg press', g: 'panturrilha', sec: [], tipo: 'carga', inc: 5, placa: true,
      st: [[36, 150, 62, 9], [28, 112, 9, 44, -35], [60, 159, 8, 31]],
      dica: 'Pernas estendidas, só a ponta dos pés na plataforma. Empurre com a ponta dos pés.',
      a: { v: 's', a: { h: [70, 150], t: -60, m: [76, 156], p: [120, 110] }, b: { p: [126, 102], pt: 1 } } },

    // ABDÔMEN
    { id: 'abdominal', nome: 'Abdominal supra', g: 'abdomen', sec: [], tipo: 'corpo',
      dica: 'Mãos atrás da cabeça sem puxar o pescoço. Tire as escápulas do chão contraindo o abdômen.',
      a: { v: 's', a: { h: [100, 180], t: -88, p: [136, 188], mc: 1 }, b: { t: -52 } } },
    { id: 'prancha', nome: 'Prancha', g: 'abdomen', sec: ['ombros'], tipo: 'tempo', dur: 3,
      dica: 'Antebraços no chão, corpo reto. Contraia abdômen e glúteos e respire.',
      a: { v: 's', a: { h: [100, 160], t: 80, m: [168, 186], p: [46, 190] }, b: { h: [100, 157] } } },
    { id: 'elevacao_pernas', nome: 'Elevação de pernas', g: 'abdomen', sec: [], tipo: 'corpo',
      dica: 'Deitado, lombar colada no chão. Suba as pernas estendidas até 90 graus e desça devagar.',
      a: { v: 's', a: { h: [110, 182], t: -90, m: [84, 186], pN: [172, 186], pF: [168, 186] }, b: { pN: [116, 120], pF: [112, 120] } } },
    { id: 'russian_twist', nome: 'Rotação russa', g: 'abdomen', sec: [], tipo: 'corpo', eq: 'halter1',
      dica: 'Sentado, pés fora do chão. Gire o tronco levando o peso de um lado para o outro.',
      a: { v: 'f', a: { h: [120, 176], pN: [104, 184], pF: [136, 184], mN: [94, 152], mF: [106, 156], sA: -1 }, b: { mN: [134, 156], mF: [146, 152] } } },

    // CARDIO
    { id: 'esteira', nome: 'Corrida na esteira', g: 'cardio', sec: ['pernas'], tipo: 'cardio', dur: 0.8,
      st: [[30, 186, 180, 6, 0, '#4a4560'], [196, 90, 8, 98]],
      dica: 'Ritmo em que você ainda consegue falar frases curtas, ou intervalos fortes e leves.',
      a: { v: 's', a: { h: [118, 124], t: 8, mN: [100, 122], mF: [144, 104], pN: [150, 186], pF: [90, 170] }, b: { h: [118, 119], mN: [144, 104], mF: [100, 122], pN: [92, 170], pF: [150, 186] } } },
    { id: 'bicicleta', nome: 'Bicicleta ergométrica', g: 'cardio', sec: ['pernas'], tipo: 'cardio', dur: 1,
      st: [[92, 112, 26, 6], [102, 118, 6, 64], [152, 88, 6, 94], [80, 182, 90, 6], [146, 86, 24, 6]],
      dica: 'Banco na altura do quadril. Mantenha cadência constante.',
      a: { v: 's', a: { h: [104, 112], t: 24, m: [162, 90], pN: [134, 156], pF: [110, 182] }, b: { pN: [110, 182], pF: [134, 156] } } },
    { id: 'eliptico', nome: 'Elíptico', g: 'cardio', sec: ['pernas'], tipo: 'cardio', dur: 1.2,
      st: [[40, 184, 160, 6, 0, '#4a4560'], [176, 60, 6, 126]],
      dica: 'Baixo impacto. Empurre e puxe as alavancas junto com as pernas.',
      a: { v: 's', a: { h: [118, 118], t: 5, mN: [150, 100], mF: [136, 108], pN: [146, 178], pF: [96, 168] }, b: { mN: [136, 108], mF: [150, 100], pN: [96, 168], pF: [146, 178] } } },
    { id: 'pular_corda', nome: 'Pular corda', g: 'cardio', sec: ['pernas'], tipo: 'cardio', dur: 0.6, corda: true,
      dica: 'Saltos baixos na ponta dos pés, giro da corda pelos punhos.',
      a: { v: 'f', a: { h: [120, 124], mN: [92, 134], mF: [148, 134], pN: [112, 188], pF: [128, 188] }, b: { h: [120, 112], pN: [112, 176], pF: [128, 176] } } },
    { id: 'remo', nome: 'Remo ergômetro', g: 'cardio', sec: ['costas', 'pernas'], tipo: 'cardio', dur: 1.6, cabo: [214, 140],
      st: [[40, 178, 170, 6, 0, '#4a4560'], [178, 150, 6, 32]],
      dica: 'Ordem da remada: pernas, tronco e braços. Volte na ordem inversa.',
      a: { v: 's', a: { h: [120, 168], t: 25, m: [184, 134], p: [176, 176] }, b: { h: [84, 168], t: -15, m: [112, 148] } } },
    { id: 'escada', nome: 'Simulador de escada', g: 'cardio', sec: ['pernas'], tipo: 'cardio', dur: 1.4,
      st: [[138, 170, 64, 20, 0, '#4a4560']],
      dica: 'Postura ereta, sem se apoiar demais nas mãos.',
      a: { v: 's', a: { h: [118, 122], t: 6, m: [126, 134], pN: [148, 170], pF: [114, 190] }, b: { h: [128, 110], pN: [148, 170], pF: [160, 170] } } }
  ];

  /* Treinos de base científica: 4 séries por exercício.
     r = faixa de repetições [mín, máx] (ou minutos/segundos), d = descanso em segundos. */
  const T = (id, nome, g, itens, nota) => ({ id, nome, g, itens: itens.map(([ex, s, r, d]) => ({ ex, series: s, rMin: r[0], rMax: r[1], desc: d })), nota, padrao: true });
  const TREINOS = [
    T('t_peito', 'Peito', 'peito', [['supino_reto', 4, [6, 10], 150], ['supino_inclinado_halter', 4, [8, 12], 120], ['voador', 4, [10, 15], 75], ['crossover', 4, [12, 15], 75]]),
    T('t_costas', 'Costas', 'costas', [['puxada_frente', 4, [8, 12], 120], ['remada_curvada', 4, [6, 10], 150], ['remada_baixa', 4, [8, 12], 120], ['pulldown', 4, [12, 15], 75]]),
    T('t_ombros', 'Ombros', 'ombros', [['desenvolvimento_halter', 4, [8, 12], 120], ['elevacao_lateral', 4, [12, 15], 60], ['crucifixo_inverso', 4, [12, 15], 60], ['encolhimento', 4, [10, 12], 75]]),
    T('t_biceps', 'Bíceps', 'biceps', [['rosca_direta', 4, [8, 12], 90], ['rosca_alternada', 4, [10, 12], 75], ['rosca_martelo', 4, [10, 12], 75], ['rosca_scott', 4, [10, 15], 60]]),
    T('t_triceps', 'Tríceps', 'triceps', [['triceps_testa', 4, [8, 12], 90], ['triceps_pulley', 4, [10, 15], 75], ['triceps_frances', 4, [10, 12], 75], ['mergulho_banco', 4, [10, 15], 60]]),
    T('t_quadriceps', 'Quadríceps', 'quadriceps', [['agachamento', 4, [6, 10], 180], ['leg_press', 4, [8, 12], 150], ['bulgaro', 4, [8, 12], 120], ['extensora', 4, [12, 15], 75]]),
    T('t_posteriores', 'Posteriores e Glúteos', 'posteriores', [['stiff', 4, [8, 10], 150], ['elevacao_pelvica', 4, [8, 12], 120], ['mesa_flexora', 4, [10, 12], 90], ['abducao', 4, [12, 15], 60]]),
    T('t_panturrilha', 'Panturrilha', 'panturrilha', [['panturrilha_pe', 4, [8, 12], 90], ['panturrilha_sentado', 4, [12, 15], 60], ['panturrilha_legpress', 4, [10, 15], 60]]),
    T('t_abdomen', 'Abdômen', 'abdomen', [['abdominal', 4, [12, 20], 60], ['elevacao_pernas', 4, [10, 15], 60], ['prancha', 4, [30, 60], 60], ['russian_twist', 4, [16, 24], 60]]),
    T('t_cardio', 'Cardio 4x4', 'cardio', [['esteira', 4, [4, 4], 180], ['eliptico', 1, [10, 10], 0]], 'Protocolo 4x4: 4 tiros de 4 min em ritmo forte (cerca de 85 a 95% da frequência máxima), com 3 min leves entre eles. Termine com 10 min leves.'),
    T('t_fullbody', 'Full Body iniciante', 'fullbody', [['leg_press', 3, [10, 12], 120], ['supino_halter', 3, [10, 12], 120], ['puxada_frente', 3, [10, 12], 120], ['desenvolvimento_halter', 3, [10, 12], 90], ['elevacao_pelvica', 3, [10, 12], 90], ['prancha', 3, [30, 45], 60]], 'Para quem está começando: 3 séries, 2 a 3 vezes por semana, com um dia de descanso entre os treinos.')
  ];

  const CIENCIA = [
    'Volume: 10 a 20 séries por grupo muscular por semana dão o melhor ganho de massa para a maioria das pessoas. Um treino de 4 exercícios x 4 séries, 1 a 2 vezes por semana, cobre essa faixa.',
    'Intensidade: termine cada série com 1 a 3 repetições de reserva (perto da falha, sem chegar nela sempre).',
    'Repetições: de 6 a 15 funcionam para hipertrofia. Exercícios grandes ficam na faixa baixa; isolados, na alta.',
    'Descanso: 2 a 3 minutos nos exercícios grandes (agachamento, supino, remada) e 60 a 90 segundos nos isolados.',
    'Progressão dupla: quando completar todas as séries no topo da faixa de repetições, aumente a carga. O app sugere o aumento automaticamente.'
  ];

  window.Dados = { GRUPOS, EX, TREINOS, CIENCIA };
})();
