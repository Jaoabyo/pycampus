// Bancada de avaliação do Lumi.
//
// Não é fine-tuning: o modelo local não é retreinado aqui. O que esta bancada faz é o que de
// fato melhora a ajuda dele — medir cada tarefa com casos de resposta conhecida, repetir cada
// caso várias vezes para pegar oscilação, e transformar falha em correção de prompt ou de
// código. Modelo que acerta "quase sempre" é o mesmo que erra bem na aula do estudante.
//
// A conferência de cada caso é feita em JavaScript, nunca por outro modelo: julgar modelo com
// modelo só empilha incerteza.
//
// Rode com o Ollama aberto:  npm run avaliar:lumi
// PASSADAS=5 npm run avaliar:lumi        repete mais vezes
// npm run avaliar:lumi "ler explicação"  roda só um grupo
import { askMentor, mentorAvailable, taughtUpTo, MENTOR_MODEL } from '../src/mentor.js';
import { reviewCode } from '../src/code-review.js';
import { reviewExplanation } from '../src/explanation-review.js';

const PASSADAS = Number(process.env.PASSADAS || 3);
const NL = String.fromCharCode(10);
const FILTRO = process.argv[2] || '';

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}). Abra o aplicativo e rode de novo.`);
  process.exit(1);
}

const aulaTipos = {
  id: 'tipos',
  title: 'Tipos e conversões',
  objective: 'Converter um texto em número inteiro e mostrar o resultado.',
  challenge: 'Guarde "30" em texto, converta com int e mostre o número.'
};
const aulaFor = {
  id: 'for',
  title: 'Repetição com for',
  objective: 'Percorrer range e acompanhar a atualização de um acumulador.',
  challenge: 'Some os números de 1 a 5 usando um laço e mostre apenas o total.'
};

const comentado = ['# minha versão', 'texto = "30" # chega como texto', 'numero = int(texto) # vira inteiro', 'print(numero) # mostra 30'].join(NL);
const semComentario = ['texto = "30"', 'numero = int(texto)', 'print(numero)'].join(NL);
const lacoProprio = ['acumulado = 0', 'for valor in range(1, 6):', '    acumulado += valor', 'print(acumulado)'].join(NL);

const erroDeTipo = {
  title: 'Tipos e conversões',
  challenge: aulaTipos.challenge,
  expected: '30',
  code: ['texto = "30"', 'print(texto + 1)'].join(NL),
  output: 'TypeError: can only concatenate str (not "int") to str',
  taught: taughtUpTo('tipos')
};

const casos = [
  {
    grupo: 'degrau 1',
    nome: 'só pergunta, nunca a resposta',
    executar: () => askMentor({ level: 1, context: erroDeTipo }),
    conferir: texto => {
      const limpo = String(texto || "");
      if (!limpo.trim()) return 'veio vazio depois da limpeza';
      if (!limpo.trim().endsWith('?')) return 'não terminou em pergunta';
      if (/(?<![\w.])int\s*\(/.test(limpo)) return 'entregou a solução int() no primeiro degrau';
      if (limpo.includes('```')) return 'mostrou bloco de código no primeiro degrau';
      return null;
    }
  },
  {
    grupo: 'degrau 2',
    nome: 'explica a ideia sem mostrar código',
    executar: () => askMentor({ level: 2, context: erroDeTipo }),
    conferir: texto => {
      const limpo = String(texto || "");
      if (limpo.length < 25) return 'resposta curta demais para explicar a ideia';
      if (limpo.includes('```')) return 'mostrou bloco de código no segundo degrau';
      return null;
    }
  },
  {
    grupo: 'degrau 4',
    nome: 'aí sim entrega a correção',
    executar: () => askMentor({ level: 4, context: erroDeTipo }),
    conferir: texto => (/(?<![\w.])int\s*\(/.test(texto) ? null : 'no último degrau ainda não mostrou a conversão')
  },
  {
    grupo: 'conferir código',
    nome: 'código já comentado não recebe pedido de comentário',
    executar: () => reviewCode({ lesson: aulaTipos, codigo: comentado, saida: '30' }),
    conferir: r => {
      if (!r.cumpre) return 'reprovou um código correto';
      const pede = r.melhorias.find(m => /coment[áa]ri/i.test(m));
      return pede ? `pediu comentário num código comentado: "${pede.slice(0, 70)}"` : null;
    }
  },
  {
    grupo: 'conferir código',
    nome: 'não cobra o que o enunciado não pediu',
    executar: () => reviewCode({ lesson: aulaTipos, codigo: semComentario, saida: '30' }),
    conferir: r => {
      if (!r.cumpre) return 'reprovou um código correto';
      const fora = r.melhorias.find(m => /valida|try|except|exce[çc]|fun[çc]|classe/i.test(m));
      return fora ? `cobrou fora do escopo: "${fora.slice(0, 70)}"` : null;
    }
  },
  {
    grupo: 'conferir código',
    nome: 'recusa a resposta digitada à mão',
    executar: () => reviewCode({ lesson: aulaFor, codigo: 'print(15)', saida: '15' }),
    conferir: r => (r.cumpre ? 'aprovou print(15) num exercício que pede um laço' : null)
  },
  {
    grupo: 'conferir código',
    nome: 'aceita outro caminho que cumpre o objetivo',
    executar: () => reviewCode({ lesson: aulaFor, codigo: lacoProprio, saida: '15' }),
    conferir: r => (r.cumpre ? null : 'reprovou um laço correto escrito com outros nomes')
  },
  {
    grupo: 'ler explicação',
    nome: 'explicação completa é reconhecida',
    executar: () => reviewExplanation({
      subject: 'Conversão de texto para inteiro',
      reference: comentado,
      explanation: 'A linha numero = int(texto) converte o texto "30", que é str, em inteiro. Sem isso não dá para fazer contas: "30" + 1 dá erro e 30 + 1 dá 31. Trocando o valor para "45", a saída vira 45.'
    }),
    conferir: r => (r.suficiente ? null : `cobrou algo de uma explicação completa: "${(r.faltou[0] || '').slice(0, 70)}"`)
  },
  {
    grupo: 'ler explicação',
    nome: 'explicação de uma palavra ainda é apontada',
    executar: () => reviewExplanation({ subject: 'Conversão de texto para inteiro', reference: comentado, explanation: 'converte' }),
    conferir: r => (r.suficiente ? 'disse que "converte" é explicação suficiente' : null)
  },
  {
    grupo: 'ler explicação',
    nome: 'conceito errado não passa por completo',
    executar: () => reviewExplanation({
      subject: 'Conversão de texto para inteiro',
      reference: comentado,
      explanation: 'int() arredonda o número para o inteiro mais próximo, por isso 30 continua 30.'
    }),
    conferir: r => (r.suficiente ? 'aprovou como completa uma explicação com conceito errado' : null)
  }
];

const escolhidos = casos.filter(caso => !FILTRO || `${caso.grupo} ${caso.nome}`.toLowerCase().includes(FILTRO.toLowerCase()));
console.log(`Modelo: ${MENTOR_MODEL} · ${escolhidos.length} casos · ${PASSADAS} passadas cada${NL}`);

let acertos = 0;
let total = 0;
for (const caso of escolhidos) {
  const resultados = [];
  for (let i = 0; i < PASSADAS; i++) {
    total++;
    try {
      const problema = caso.conferir(await caso.executar());
      resultados.push(problema);
      if (!problema) acertos++;
    } catch (erro) {
      resultados.push('erro: ' + erro.message);
    }
  }
  const ok = resultados.filter(problema => !problema).length;
  const oscilou = new Set(resultados.map(String)).size > 1;
  const marca = ok === PASSADAS ? 'ok   ' : ok === 0 ? 'FALHA' : 'OSCILA';
  console.log(`${marca} ${caso.grupo} · ${caso.nome} (${ok}/${PASSADAS}${oscilou ? ', oscilou' : ''})`);
  for (const problema of [...new Set(resultados.filter(Boolean))]) console.log('         ' + problema);
}

console.log(`${NL}${acertos} de ${total} respostas corretas (${Math.round((acertos / total) * 100)}%).`);
process.exitCode = acertos === total ? 0 : 1;
