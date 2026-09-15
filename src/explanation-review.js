import { MENTOR_MODEL, ollamaUrl } from './mentor.js';

// A plataforma pede explicação escrita em quatro lugares e nunca respondia nada a nenhuma
// delas. Não era mentira — o texto sempre disse que não havia julgamento automático — mas
// escrever no vazio não ensina. O Lumi lê e comenta; ele nunca marca nada como concluído,
// nem concede XP: os requisitos continuam sendo prova respondida e código com a saída certa.
// Medido na bancada: copiar o enunciado e colar no campo de explicação passava como completa,
// nas três tentativas. Repetir a pergunta não é explicar, e pedir ao modelo para perceber isso
// não resolveu — ele vê um texto correto sobre o assunto e aprova.
//
// Aqui é contado: se quase toda palavra da explicação já estava no enunciado, ela não
// acrescentou nada. A conta é feita antes de chamar o modelo, e o veredito não depende dele.
const palavras = texto => String(texto || "").toLowerCase()
  .normalize("NFD").replace(/[^a-z0-9 ]/g, " ").split(/[ ]+/).filter(palavra => palavra.length > 3);

export function repeteOEnunciado(explicacao, assunto) {
  const dela = palavras(explicacao);
  if (dela.length < 4) return true;
  const doEnunciado = new Set(palavras(assunto));
  if (!doEnunciado.size) return false;
  const repetidas = dela.filter(palavra => doEnunciado.has(palavra)).length;
  return repetidas / dela.length >= 0.8;
}

const normalizaTrecho = texto => String(texto || '').toLowerCase().replace(/\s+/g, ' ').trim();
const semInvocacaoExterna = linha => {
  const limpa = String(linha || '').trim();
  const chamada = limpa.match(/^[a-z_]\w*\((.*)\)$/i);
  return chamada ? chamada[1].trim() : limpa;
};

// Em reflexões do tipo "escolha uma linha", o arquivo inteiro é referência visual, não uma
// lista de obrigações. Se a resposta cita a linha escolhida, isolamos esse alvo antes da IA:
// assim ela não transforma as outras linhas do exemplo em novas perguntas obrigatórias.
export function referenciaDaLinhaEscolhida(reference, explanation, enunciado = '') {
  if (!/escolh[ae].*uma linha/i.test(enunciado)) return reference;
  const explicacao = normalizaTrecho(explanation);
  const linhas = String(reference || '').split(/\r?\n/).map(linha => linha.trim()).filter(Boolean);
  const candidatas = linhas
    .map(linha => ({ linha, trecho: semInvocacaoExterna(linha) }))
    .filter(item => item.trecho.length >= 5 && !/^\w+\s*=\s*[^=]/.test(item.trecho))
    .filter(item => explicacao.includes(normalizaTrecho(item.trecho)))
    .sort((a, b) => b.trecho.length - a.trecho.length);
  if (!candidatas.length) return reference;
  const escolhida = candidatas[0].linha;
  const valores = linhas.filter(linha => /^\w+\s*=\s*[^=]/.test(linha));
  return [`Valores usados:`, ...valores, 'Linha escolhida pelo estudante:', escolhida].join('\n');
}

export function explanationPrompt({ subject, reference, explanation, enunciado = '' }) {
  const escolheUmaLinha = /escolh[ae].*uma linha/i.test(enunciado);
  const referenciaAvaliada = referenciaDaLinhaEscolhida(reference, explanation, enunciado);
  const system = [
    'Você é o Lumi e está lendo a explicação de um estudante brasileiro iniciante em Python.',
    'Seu papel é ajudar a explicar melhor, não dar nota nem aprovar.',
    'Escreva em português do Brasil, com frases curtas e sem jargão.',
    'Comece pelo que ele acertou, com sinceridade: se acertou pouco, diga pouco.',
    'Em "faltou", aponte o que uma explicação completa precisaria dizer e que ele não disse. Não escreva a explicação pronta no lugar dele.',
    'Se a explicação já cobre o essencial do assunto, devolva "suficiente": true e "faltou": [] — dizer que está boa é uma resposta válida e esperada.',
    'Não invente cobrança para preencher espaço, e não peça detalhe que o assunto não exige. Explicação de iniciante não precisa citar tudo que existe sobre o tema.',
    'Leia a explicação inteira antes de decidir. Considere sinônimos e exemplos do estudante: nunca cobre de novo algo que ele já disse com outras palavras.',
    'Em "acertou", reconheça somente ideias realmente escritas pelo estudante. Não atribua a ele algo que você apenas inferiu ao ler o código.',
    'Avalie somente o que o enunciado pede. O código completo serve de contexto, mas não transforma cada linha dele numa obrigação.',
    'Se o enunciado manda escolher uma linha, basta explicar uma linha e uma mudança nela. Ignore as outras linhas ao procurar faltas.',
    'Exemplo da regra anterior: se o código tem uma linha com "and" e outra com "or", e o estudante escolheu a linha com "and", nunca cobre a linha com "or".',
    'Quando o enunciado pergunta o que a linha faz E o que mudaria, são duas partes: a explicação só é suficiente se disser o comportamento atual da linha escolhida e o efeito da mudança.',
    'Exemplo de avaliação: para print(a > 5 and ativo), escrever apenas "se trocar 5 por 3 dá True" explica a mudança, mas NÃO explica o comportamento atual nem como o and decide o resultado; portanto é insuficiente.',
    'Cada item de "faltou" precisa apontar uma ideia realmente ausente da explicação e necessária para responder ao enunciado.',
    'Se faltou algo, termine com UMA pergunta curta sobre um dos itens de "faltou". Não pergunte sobre uma ideia que aparece na explicação.',
    'Se a explicação está suficiente, use "faltou": [] e "pergunta": "". Não invente uma pergunta adicional.',
    'Em "acertou" escreva no máximo duas frases, sobre a explicação dele. Nunca devolva o texto de exemplo abaixo.',
    'Responda APENAS um JSON neste formato: {"suficiente":true,"acertou":["<frase sua>"],"faltou":["<frase sua>"],"pergunta":"<sua pergunta>"}'
  ].join('\n');
  const user = [
    `Assunto: ${subject}`,
    enunciado ? `O que a atividade pediu para explicar:\n${enunciado}` : '',
    escolheUmaLinha ? 'Critério desta atividade: avalie somente a linha que o estudante escolheu. As demais linhas são apenas contexto e não podem aparecer em "faltou" nem na pergunta final.' : '',
    referenciaAvaliada ? `Código ou trecho em questão:\n${referenciaAvaliada}` : '',
    `Explicação escrita pelo estudante:\n${explanation}`
  ].filter(Boolean).join('\n\n');
  return { system, user };
}

// O modelo copiava o espaço reservado do formato e a tela imprimia "até duas frases" como se
// fosse elogio — reproduzido 3 de 3 vezes com uma explicação real do estudante. O molde é
// conhecido aqui, então o eco dele é descartado antes de chegar à tela.
const MOLDE = ['até duas frases', 'uma pergunta', 'uma pergunta curta', 'frase sua', 'sua pergunta', '...', '…'];
const ecoDoMolde = texto => MOLDE.includes(texto.toLowerCase().replace(/^[<"']|[>"']$/g, '').trim());
const list = value => (Array.isArray(value) ? value : []).slice(0, 2)
  .map(item => String(item).trim().slice(0, 240)).filter(item => item && !ecoDoMolde(item));

export function parseExplanationReview(raw) {
  const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null;
  if (!match) throw new Error('Não consegui ler a resposta da leitura.');
  const data = JSON.parse(match[0]);
  const faltou = list(data.faltou);
  // Coerência decidida aqui, não no modelo: dizer que está suficiente e listar faltas ao mesmo
  // tempo é a contradição que fazia o alvo se mover a cada leitura.
  const suficiente = data.suficiente === true && !faltou.length;
  const pergunta = String(data.pergunta || '').trim().slice(0, 240);
  // Se nada ficou faltando, uma pergunta de correção contradiz o próprio veredito. O modelo
  // era obrigado pelo prompt antigo a inventar uma e acabava repetindo exatamente o que o
  // estudante já tinha explicado. Esta coerência fica garantida no produto, não na sorte.
  const review = { suficiente, acertou: list(data.acertou), faltou, pergunta: suficiente || ecoDoMolde(pergunta) ? '' : pergunta };
  if (!review.acertou.length && !review.faltou.length) throw new Error('A leitura voltou vazia. Tente pedir de novo.');
  return review;
}

export async function reviewExplanation({ subject, reference, explanation, enunciado = "", signal }) {
  if (!String(explanation || '').trim()) throw new Error('Escreva sua explicação antes de pedir a leitura.');
  // Cópia do enunciado nem chega ao modelo: o veredito já é conhecido e a cobrança é a certa.
  if (repeteOEnunciado(explanation, [subject, enunciado].join(" "))) return {
    suficiente: false,
    acertou: [],
    faltou: ['Sua explicação repete o enunciado com as mesmas palavras. Explicar é dizer, com as suas, o que o código faz e por quê.'],
    pergunta: 'Se alguém que nunca viu esse código perguntasse por que ele funciona, o que você responderia?'
  };
  const { system, user } = explanationPrompt({ subject, reference, explanation, enunciado });
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      // A mesma explicação não deve receber um alvo diferente a cada clique em "outra
      // leitura". A avaliação é estruturada; temperatura zero e semente fixa a deixam estável.
      options: { temperature: 0, seed: 42, num_predict: 420 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}.`);
  return parseExplanationReview((await response.json()).message?.content);
}
