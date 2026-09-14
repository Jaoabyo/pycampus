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
export function explanationPrompt({ subject, reference, explanation }) {
  const system = [
    'Você é o Lumi e está lendo a explicação de um estudante brasileiro iniciante em Python.',
    'Seu papel é ajudar a explicar melhor, não dar nota nem aprovar.',
    'Escreva em português do Brasil, com frases curtas e sem jargão.',
    'Comece pelo que ele acertou, com sinceridade: se acertou pouco, diga pouco.',
    'Em "faltou", aponte o que uma explicação completa precisaria dizer e que ele não disse. Não escreva a explicação pronta no lugar dele.',
    'Se a explicação já cobre o essencial do assunto, devolva "suficiente": true e "faltou": [] — dizer que está boa é uma resposta válida e esperada.',
    'Não invente cobrança para preencher espaço, e não peça detalhe que o assunto não exige. Explicação de iniciante não precisa citar tudo que existe sobre o tema.',
    'Nunca cobre de novo algo que ele já disse com outras palavras.',
    'Termine com UMA pergunta curta que o faça pensar no ponto mais fraco.',
    'Responda APENAS um JSON: {"suficiente":true,"acertou":["até duas frases"],"faltou":[],"pergunta":"uma pergunta"}'
  ].join('\n');
  const user = [
    `Assunto: ${subject}`,
    reference ? `Código ou trecho em questão:\n${reference}` : '',
    `Explicação escrita pelo estudante:\n${explanation}`
  ].filter(Boolean).join('\n\n');
  return { system, user };
}

const list = value => (Array.isArray(value) ? value : []).slice(0, 2).map(item => String(item).trim().slice(0, 240)).filter(Boolean);

export function parseExplanationReview(raw) {
  const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null;
  if (!match) throw new Error('Não consegui ler a resposta da leitura.');
  const data = JSON.parse(match[0]);
  const faltou = list(data.faltou);
  // Coerência decidida aqui, não no modelo: dizer que está suficiente e listar faltas ao mesmo
  // tempo é a contradição que fazia o alvo se mover a cada leitura.
  const review = { suficiente: data.suficiente === true && !faltou.length, acertou: list(data.acertou), faltou, pergunta: String(data.pergunta || '').trim().slice(0, 240) };
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
  const { system, user } = explanationPrompt({ subject, reference, explanation });
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      options: { temperature: 0.2, num_predict: 420 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}.`);
  return parseExplanationReview((await response.json()).message?.content);
}
