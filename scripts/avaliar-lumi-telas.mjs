// Terceira bancada: as telas que a Lumi atende e que nunca foram medidas.
//
// As duas primeiras bancadas usam sempre um objetivo de aula bem escrito. Mas cada tela entrega
// um objetivo de formato diferente: a ponte manda um conceito, o miniprojeto manda a HISTÓRIA
// ("Mostre seu nome em um cartão feito com código"), o passo de projeto manda o porquê. Um
// objetivo vago é o caminho mais curto para ela aprovar qualquer coisa ou reprovar um acerto.
//
// O mesmo vale para a leitura de explicação, que recebe cinco formatos de assunto diferentes.
//
//   npm run avaliar:telas
import { mentorAvailable, MENTOR_MODEL } from '../src/mentor.js';
import { reviewCode } from '../src/code-review.js';
import { reviewExplanation } from '../src/explanation-review.js';
import { practiceProjects } from '../src/practice-content.js';
import { functionBridges } from '../src/function-bridges.js';
import { projectSteps } from '../src/project-steps.js';
import { patterns } from '../src/diagnosis.js';

const NL = String.fromCharCode(10);
const PASSADAS = Number(process.env.PASSADAS || 3);
const FILTRO = process.argv[2] || '';

const disponivel = await mentorAvailable();
if (!disponivel.ok) {
  console.error(`Ollama não respondeu (${disponivel.reason}).`);
  process.exit(1);
}

const cartao = practiceProjects.find(p => p.id === 'cartao');
const poupanca = practiceProjects.find(p => p.id === 'poupanca');
const ponte = functionBridges[0];
const passo = projectSteps.calculadora.find(s => s.id === 'total');
const engano = patterns.find(p => p.id === 'limite-range');

// Como cada tela monta o objetivo hoje. Se um deles mudar, a bancada mede o novo.
const comoMiniprojeto = p => ({ id: p.id, title: p.title, objective: p.story, challenge: p.create });
const comoPonte = b => ({ ...b, objective: b.concept });
const comoPasso = s => ({ id: s.id, title: s.title, objective: s.why || s.instruction, challenge: s.instruction });

const casos = [
  {
    grupo: 'miniprojeto',
    nome: 'história vaga não vira aprovação de qualquer coisa',
    executar: () => reviewCode({ lesson: comoMiniprojeto(poupanca), codigo: 'print(15)', saida: '15' }),
    conferir: r => (r.cumpre ? 'aprovou print(15) num miniprojeto que pede um laço somando depósitos' : null)
  },
  {
    grupo: 'miniprojeto',
    nome: 'e não reprova a solução correta',
    executar: () => reviewCode({ lesson: comoMiniprojeto(poupanca), codigo: poupanca.solution, saida: poupanca.expected }),
    conferir: r => (r.cumpre ? null : `reprovou a própria solução guardada: ${r.porque.slice(0, 80)}`)
  },
  {
    grupo: 'miniprojeto',
    nome: 'objetivo de uma linha só continua sendo julgado',
    executar: () => reviewCode({ lesson: comoMiniprojeto(cartao), codigo: cartao.solution, saida: cartao.expected }),
    conferir: r => (r.cumpre ? null : 'reprovou a solução guardada do miniprojeto mais simples do curso')
  },
  {
    grupo: 'ponte',
    nome: 'conceito como objetivo aceita a solução guardada',
    executar: () => reviewCode({
      lesson: comoPonte(ponte),
      codigo: ponte.puzzle.blocks.map(b => '    '.repeat(b.indent) + b.code).join(NL),
      saida: ponte.expected
    }),
    conferir: r => (r.cumpre ? null : `reprovou a solução guardada da ponte: ${r.porque.slice(0, 80)}`)
  },
  {
    grupo: 'ponte',
    nome: 'e recusa o resultado escrito à mão',
    executar: () => reviewCode({ lesson: comoPonte(ponte), codigo: `print("${ponte.expected}")`, saida: ponte.expected }),
    conferir: r => (r.cumpre ? 'aprovou um print literal numa ponte que pede chamar a função' : null)
  },
  {
    grupo: 'passo de projeto',
    nome: 'o porquê como objetivo aceita o passo feito',
    executar: () => reviewCode({
      lesson: comoPasso(passo),
      codigo: ['renda = 3000.0', 'despesa_1 = 1200.0', 'despesa_2 = 450.0', 'despesa_3 = 300.0', 'total_despesas = despesa_1 + despesa_2 + despesa_3', 'print(total_despesas)'].join(NL),
      saida: '1950.0'
    }),
    conferir: r => (r.cumpre ? null : `reprovou um passo corretamente feito: ${r.porque.slice(0, 80)}`)
  },
  {
    grupo: 'passo de projeto',
    nome: 'e recusa o total digitado à mão',
    executar: () => reviewCode({ lesson: comoPasso(passo), codigo: 'print(1950.0)', saida: '1950.0' }),
    conferir: r => (r.cumpre ? 'aprovou o total digitado, sem somar as despesas' : null)
  },
  {
    grupo: 'explicação',
    nome: 'assunto de investigação: explicação boa é reconhecida',
    executar: () => reviewExplanation({
      subject: `Explicar a linha ${cartao.investigate.line} do miniprojeto ${cartao.title}`,
      enunciado: cartao.investigate.question,
      reference: cartao.example,
      explanation: 'Sem aspas, nome é o nome da variável, então o Python busca o valor guardado nela e mostra Ana. Com aspas seria o texto literal.'
    }),
    conferir: r => (r.suficiente ? null : `cobrou algo de uma explicação completa: ${(r.faltou[0] || '').slice(0, 70)}`)
  },
  {
    grupo: 'explicação',
    nome: 'caso real: não pergunta de novo sobre os 18 anos já explicados',
    executar: () => reviewExplanation({
      subject: 'Explicar a linha if idade >= 18:',
      enunciado: 'O que acontece acima, abaixo ou exatamente em 18 anos?',
      reference: ['idade = 20', 'if idade >= 18:', '    print("Pode entrar")', 'else:', '    print("Ainda não")'].join(NL),
      explanation: 'O if verifica se a idade é maior ou igual a 18. Se for 18 ou mais, mostra Pode entrar. Se for menor de 18, cai no else e mostra Ainda não.'
    }),
    conferir: r => !r.suficiente
      ? `não reconheceu a explicação completa: ${(r.faltou[0] || '').slice(0, 70)}`
      : r.pergunta ? `perguntou de novo algo já explicado: ${r.pergunta.slice(0, 70)}` : null
  },
  {
    grupo: 'explicação',
    nome: 'caso real: escolher a linha do and não obriga explicar também o or',
    executar: () => reviewExplanation({
      subject: 'Reflexão sobre o miniprojeto Ingresso e idade',
      enunciado: 'Escolha uma linha do código acima e explique o que ela faz. O que mudaria na saída se você trocasse um valor?',
      reference: ['idade = 16', 'ingresso = True', 'print(idade >= 18 and ingresso)', 'print(idade >= 18 or ingresso)'].join(NL),
      explanation: 'Se trocarmos idade >= 18 and ingresso para idade >= 16 and ingresso, o resultado nesse exemplo muda para True.'
    }),
    conferir: r => {
      const texto = [...r.faltou, r.pergunta].join(' ');
      if (/segund|\bor\b/i.test(texto)) return `cobrou a linha do or que o estudante não escolheu: ${texto.slice(0, 90)}`;
      if (/não (?:disse|mencionou).*(?:true|resultado.*mudan)/i.test(texto)) return `ignorou que ele escreveu o novo resultado: ${texto.slice(0, 90)}`;
      if (r.suficiente) return 'declarou completa sem ele explicar por que a expressão original dava False';
      return null;
    }
  },
  {
    grupo: 'explicação',
    nome: 'assunto de reflexão: resposta vazia de conteúdo é apontada',
    executar: () => reviewExplanation({
      subject: `Reflexão sobre o miniprojeto ${cartao.title}`,
      enunciado: cartao.create,
      reference: cartao.solution,
      explanation: 'foi tranquilo, gostei'
    }),
    conferir: r => (r.suficiente ? 'aceitou "foi tranquilo, gostei" como reflexão suficiente' : null)
  },
  {
    grupo: 'explicação',
    nome: 'assunto de engano: explicação certa do treino dirigido passa',
    executar: () => reviewExplanation({
      subject: `Explicar o engano: ${engano.title}`,
      enunciado: engano.summary,
      reference: engano.summary,
      explanation: 'O range para antes do segundo número, então range(1, 5) dá 1, 2, 3 e 4. Para incluir o 5 eu preciso escrever 6 como limite.'
    }),
    conferir: r => (r.suficiente ? null : `cobrou algo de uma explicação correta do engano: ${(r.faltou[0] || '').slice(0, 70)}`)
  }
];

const escolhidos = casos.filter(caso => !FILTRO || `${caso.grupo} ${caso.nome}`.toLowerCase().includes(FILTRO.toLowerCase()));
console.log(`Modelo: ${MENTOR_MODEL} · ${escolhidos.length} casos de tela · ${PASSADAS} passadas cada${NL}`);

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
