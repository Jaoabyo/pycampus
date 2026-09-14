// Diagnóstico a partir do diário: procura padrões de engano nas tentativas já registradas.
// Cada padrão vem de um erro real e tem uma escada de três níveis, do reconhecer ao criar.
const predict = (instruction, code, options, answer, why) => ({ id: 'ver', level: 1, kind: 'predict', title: 'Reconhecer', instruction, code, options, answer, why });
const fix = (instruction, broken, expected, stdin = '') => ({ id: 'corrigir', level: 2, kind: 'fix', title: 'Corrigir', instruction, broken, expected, stdin });
const create = (instruction, expected, stdin = '') => ({ id: 'criar', level: 3, kind: 'create', title: 'Criar', instruction, expected, stdin });

export const patterns = [
  {
    id: 'input-pergunta',
    title: 'O que vai dentro de input()',
    summary: 'O texto entre os parênteses de input() é a pergunta que aparece na tela, não o valor a ser lido. Quem responde é quem usa o programa.',
    lesson: 'entrada',
    detect: ({ code, output }) => /input\(\s*[-\d.]/.test(code) || (/could not convert string to float: ''/.test(output) && /input\(/.test(code)),
    levels: [
      predict('Sem executar: o que fica guardado em idade quando a pessoa digita 21?', 'idade = input("Qual sua idade? ")\nprint(idade)',
        ['O texto 21, que a pessoa digitou', 'A pergunta "Qual sua idade? "', 'O número 21, já convertido'], 0,
        'input() devolve o que foi digitado, sempre como texto. A frase entre parênteses só aparece na tela.'),
      fix('Este programa deveria mostrar a renda digitada, mas o valor foi colocado dentro do input(). Corrija.', 'renda = float(input(3000.0))\nprint(renda)', '3000.0', '3000'),
      create('Do zero: pergunte o preço, transforme a resposta em número e mostre o preço mais 10.', '15.5', '5.5')
    ]
  },
  {
    id: 'duas-atribuicoes',
    title: 'Uma atribuição por linha',
    summary: 'Cada linha guarda um valor em um nome. Ler e converter na mesma linha se faz com uma função dentro da outra, nunca com dois sinais de igual.',
    lesson: 'entrada',
    detect: ({ code, output }) => /cannot assign to function call/.test(output) || code.split('\n').some(line => {
      const clean = line.replace(/'[^']*'|"[^"]*"/g, "''").replace(/[=!<>]=/g, '');
      return (clean.match(/=/g) || []).length >= 2;
    }),
    levels: [
      predict('Sem executar: o que o Python faz com esta linha?', 'preco = input("Preço: ") = float(preco)',
        ['Para com SyntaxError: não é possível atribuir a uma chamada de função', 'Lê e converte de uma vez, guardando o número', 'Guarda o texto e converte na linha seguinte'], 0,
        'O sinal de igual guarda um valor em um nome. Dois deles na mesma linha pedem para guardar algo dentro de uma chamada, o que não existe.'),
      fix('Conserte a leitura para o programa mostrar o preço digitado como número.', 'preco = input("Preço: ") = float(preco)\nprint(preco)', '10.5', '10.5'),
      create('Do zero: leia dois números digitados, um por linha, e mostre a soma dos dois.', '5.0', '2\n3')
    ]
  },
  {
    id: 'falta-igual',
    title: 'O sinal de igual que faltou',
    summary: 'Escrever um nome seguido de um valor não guarda nada. Sem o sinal de igual, o Python não entende a linha e para com SyntaxError.',
    lesson: 'variaveis',
    detect: ({ code, output }) => /SyntaxError/.test(output) && code.split('\n').some(line => /^\s*[a-z_]\w*\s+[a-z_]\w*\s*\(/i.test(line)),
    levels: [
      predict('Sem executar: o que acontece com esta linha?', 'despesa float(300.00)',
        ['SyntaxError: falta o sinal de igual para guardar o valor', 'Guarda 300.0 dentro de despesa', 'Mostra 300.0 na tela'], 0,
        'Um nome seguido de um valor não é uma instrução. Guardar exige nome = valor.'),
      fix('Faça este programa guardar e mostrar a despesa.', 'despesa float(300.00)\nprint(despesa)', '300.0'),
      create('Do zero: guarde 12.5 em preco e 3 em quantidade, depois mostre o total da multiplicação.', '37.5')
    ]
  },
  {
    id: 'nome-diferente',
    title: 'O nome escrito de dois jeitos',
    summary: 'O Python não corrige nome parecido: liguagem e linguagem são variáveis diferentes. A última linha do NameError diz qual nome ele não encontrou.',
    lesson: 'variaveis',
    detect: ({ output }) => /NameError/.test(output),
    levels: [
      predict('Sem executar: por que esta linha gera NameError?', 'linguagem = Python\nprint(linguagem)',
        ['Sem aspas, Python é lido como o nome de uma variável que não existe', 'Porque Python é uma palavra reservada da linguagem', 'Porque falta o print na primeira linha'], 0,
        'Com aspas você escreve um texto. Sem aspas, o Python procura uma variável com aquele nome.'),
      fix('Este programa tem um nome escrito de dois jeitos. Corrija para mostrar Python.', 'liguagem = "Python"\nprint(linguagem)', 'Python'),
      create('Do zero: guarde o texto Python em curso e o número 1 em nivel, depois mostre os dois, um por linha.', 'Python\n1')
    ]
  },
  {
    id: 'limite-range',
    title: 'Onde o range para',
    summary: 'range(1, 5) começa em 1 e para antes do 5: devolve 1, 2, 3 e 4. O segundo número fica de fora, e é aí que a conta perde um valor.',
    lesson: 'comprehensions',
    detect: ({ code, matched, source }) => /range\(/.test(code) && matched === false && source === 'lesson',
    levels: [
      predict('Sem executar: quais números range(1, 5) produz?', 'for n in range(1, 5):\n    print(n)',
        ['1, 2, 3 e 4', '1, 2, 3, 4 e 5', '0, 1, 2, 3 e 4'], 0,
        'O primeiro número entra, o segundo fica de fora. É por isso que o último valor esperado costuma faltar na conta.'),
      fix('Esta soma deveria dar 10, o total de 1 a 4, mas está perdendo um valor. Corrija o range.', 'total = 0\nfor n in range(1, 4):\n    total = total + n\nprint(total)', '10'),
      create('Do zero: monte uma compreensão de lista com os quadrados dos números de 1 a 5 e mostre a lista.', '[1, 4, 9, 16, 25]')
    ]
  },
  {
    id: 'lista-compartilhada',
    title: 'Duas variáveis, uma lista só',
    summary: 'Atribuir uma lista a outro nome não cria uma cópia: os dois nomes passam a apontar para a mesma lista, e mexer por um muda o que o outro mostra. Número e texto não têm esse comportamento, porque não podem ser alterados no lugar.',
    lesson: 'listas',
    detect: ({ code, matched, source }) => /^\s*[a-z_]\w*\s*=\s*[a-z_]\w*\s*$/m.test(code) && /\.append\(|\.sort\(|\.remove\(/.test(code) && matched === false && source === 'lesson',
    levels: [
      predict('Sem executar: o que este programa mostra?', 'originais = [1, 2]\ncopia = originais\ncopia.append(3)\nprint(originais)',
        ['[1, 2, 3], porque os dois nomes apontam para a mesma lista', '[1, 2], porque copia é uma cópia independente', '[3], porque append substitui o conteúdo'], 0,
        'O sinal de igual entre duas listas dá um segundo nome à mesma lista, não uma cópia. Para copiar de verdade: copia = originais[:] ou list(originais).'),
      fix('Este programa deveria manter originais intacta e mostrar [1, 2], mas a lista foi alterada junto. Corrija a cópia.', 'originais = [1, 2]\ncopia = originais\ncopia.append(3)\nprint(originais)', '[1, 2]'),
      create('Do zero: crie precos com 10 e 20, faça uma cópia de verdade, acrescente 30 só na cópia e mostre a lista original.', '[10, 20]')
    ]
  },
  {
    id: 'escopo-da-funcao',
    title: 'O que existe dentro da função',
    summary: 'Uma variável criada dentro de uma função só existe ali. Quem está fora não a enxerga. Para o valor sair, a função precisa devolvê-lo com return e alguém precisa guardá-lo.',
    lesson: 'funcoes',
    detect: ({ code, output }) => /NameError/.test(output) && /\bdef\b/.test(code),
    levels: [
      predict('Sem executar: o que acontece na última linha?', 'def calcular():\n    total = 10\n\ncalcular()\nprint(total)',
        ['NameError: total só existe dentro da função', 'Mostra 10, porque a função já rodou', 'Mostra None, porque a função não devolveu nada'], 0,
        'Chamar a função executa o corpo dela, mas os nomes criados lá dentro somem ao terminar. O que sai é só o que o return devolve.'),
      fix('Este programa deveria mostrar 10, mas a variável não existe fora da função. Faça a função devolver o valor.', 'def calcular():\n    total = 10\n\ncalcular()\nprint(total)', '10'),
      create('Do zero: escreva dobro(numero) que devolve o dobro, guarde o resultado de dobro(21) em uma variável e mostre essa variável.', '42')
    ]
  }
];

export const levelKey = (patternId, levelId) => `${patternId}:${levelId}`;
export const levelsById = Object.fromEntries(patterns.flatMap(p => p.levels.map(l => [levelKey(p.id, l.id), { ...l, pattern: p.id }])));
export const RETENTION_DAYS = 3;

// Uma tentativa conta uma vez por padrão; o resultado é ordenado pelo que mais apareceu.
export function diagnose(history = []) {
  const attempts = (history || []).filter(item => item && typeof item.code === 'string');
  return patterns
    .map(pattern => {
      const hits = attempts.filter(attempt => {
        try {
          return pattern.detect({ code: attempt.code || '', output: attempt.output || '', matched: attempt.matched, source: attempt.source });
        } catch { return false; }
      });
      const last = hits.at(-1);
      return {
        ...pattern,
        count: hits.length,
        evidence: last ? { at: last.startedAt, title: last.title, line: offendingLine(last, pattern) } : null
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

// A evidência precisa apontar a linha do código, então usa só regras de linha:
// regras baseadas na mensagem de erro casariam com qualquer linha, inclusive um comentário.
const lineRules = {
  'input-pergunta': line => /input\(\s*[-\d.]/.test(line),
  'duas-atribuicoes': line => ((line.replace(/'[^']*'|"[^"]*"/g, "''").replace(/[=!<>]=/g, '').match(/=/g) || []).length >= 2),
  'falta-igual': line => /^\s*[a-z_]\w*\s+[a-z_]\w*\s*\(/i.test(line),
  'limite-range': line => /range\(/.test(line)
};
function offendingLine(attempt, pattern) {
  const lines = (attempt.code || '').split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  const missing = pattern.id === 'nome-diferente' ? (attempt.output || '').match(/name '([^']+)' is not defined/)?.[1] : null;
  const rule = missing ? line => line.includes(missing) : lineRules[pattern.id];
  const guilty = rule ? lines.find(line => rule(line)) : null;
  return (guilty || lines[0] || '').trim().slice(0, 160);
}

// ---- Escada de níveis e critério de domínio ----
const record = (state, patternId) => state.mastery?.[patternId] || {};
export const levelDate = (state, patternId, levelId) => record(state, patternId).levels?.[levelId] || '';
export const levelsDone = (state, patternId) => patterns.find(p => p.id === patternId).levels.filter(level => levelDate(state, patternId, level.id)).length;
// O nível seguinte abre quando o anterior foi resolvido: começa no básico e sobe.
export const levelOpen = (state, patternId, level) => level.level === 1 || Boolean(levelDate(state, patternId, patterns.find(p => p.id === patternId).levels[level.level - 2].id));
export const retainedAt = (state, patternId) => record(state, patternId).retained || '';

const daysBetween = (from, to) => Math.round((Date.parse(`${to}T12:00:00`) - Date.parse(`${from}T12:00:00`)) / 86400000);
// Refazer o nível 3 alguns dias depois é o que separa "resolveu uma vez" de "ainda sei".
export function completeLevel(state, patternId, levelId, today) {
  const current = record(state, patternId);
  const levels = { ...current.levels, [levelId]: current.levels?.[levelId] || today };
  const first = current.levels?.[levelId];
  const retained = levelId === 'criar' && first && daysBetween(first, today) >= RETENTION_DAYS ? today : current.retained || '';
  return { ...state, mastery: { ...state.mastery, [patternId]: { ...current, levels, retained } } };
}
export const saveExplanation = (state, patternId, note) => ({ ...state, mastery: { ...state.mastery, [patternId]: { ...record(state, patternId), note } } });
export const saveReview = (state, patternId, verdict, at) => ({ ...state, mastery: { ...state.mastery, [patternId]: { ...record(state, patternId), review: verdict ? { verdict, at } : null } } });

// Domínio exige as quatro coisas. A plataforma sabe verificar três; a quarta é a revisão externa,
// que ela apenas registra: nenhum texto escrito aqui é julgado automaticamente.
export function masteryState(state, patternId) {
  const item = record(state, patternId);
  const pattern = patterns.find(p => p.id === patternId);
  const steps = [
    { id: 'niveis', label: `Três níveis resolvidos (${levelsDone(state, patternId)} de ${pattern.levels.length})`, done: levelsDone(state, patternId) === pattern.levels.length },
    { id: 'retencao', label: `Nível Criar refeito ${RETENTION_DAYS} dias depois, sem consultar`, done: Boolean(item.retained) },
    { id: 'explicacao', label: 'Explicação escrita com suas palavras', done: Boolean(item.note?.trim()) },
    { id: 'revisao', label: 'Revisão externa registrada como dominado', done: item.review?.verdict === 'dominado' }
  ];
  return { steps, mastered: steps.every(step => step.done), review: item.review || null, note: item.note || '' };
}
export const masteredCount = state => patterns.filter(p => masteryState(state, p.id).mastered).length;
export const readyForReview = state => patterns.filter(p => {
  const { steps, review } = masteryState(state, p.id);
  return steps[0].done && steps[1].done && steps[2].done && review?.verdict !== 'dominado';
});

export function normalizeMastery(input) {
  const result = {};
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : '';
  for (const pattern of patterns) {
    const item = input?.mastery?.[pattern.id];
    if (!item || typeof item !== 'object') continue;
    const levels = {};
    for (const level of pattern.levels) if (date(item.levels?.[level.id])) levels[level.id] = item.levels[level.id];
    const verdict = ['dominado', 'praticar'].includes(item.review?.verdict) && date(item.review?.at) ? { verdict: item.review.verdict, at: item.review.at } : null;
    result[pattern.id] = {
      levels,
      retained: levels.criar ? date(item.retained) : '',
      note: typeof item.note === 'string' ? item.note.slice(0, 2000) : '',
      review: verdict
    };
  }
  return result;
}
