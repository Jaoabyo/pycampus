import { parseRepo } from './project-steps.js';
import { MENTOR_MODEL, ollamaUrl } from './mentor.js';

// A nota vale 7. Abaixo disso o projeto volta para revisão, com o motivo escrito.
export const PASSING = 7;
// Um projeto de estudante cabe folgado nisso. Mandar um repositório inteiro de biblioteca
// só confunde o modelo, que passa a recusar a tarefa em vez de avaliar.
const MAX_FILES = 4;
const MAX_CHARS = 12000;

export const gradeIsApproved = grade => typeof grade?.nota === 'number' && grade.nota >= PASSING;

// O link já é validado na entrega; aqui buscamos o conteúdo pela API pública do GitHub.
// Sem token: 60 consultas por hora, o bastante para avaliar um projeto de cada vez.
export async function fetchRepoFiles(link, signal) {
  const repo = parseRepo(link);
  if (!repo) throw new Error('Esse endereço não parece um repositório do GitHub.');
  const api = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
  const info = await fetch(api, { signal });
  if (info.status === 404) throw new Error('Repositório não encontrado. Se ele for privado, deixe-o público para eu conseguir ler.');
  if (info.status === 403) throw new Error('O GitHub pediu para esperar um pouco (limite de consultas por hora). Tente de novo mais tarde.');
  if (!info.ok) throw new Error(`O GitHub respondeu ${info.status}.`);
  const branch = (await info.json()).default_branch || 'main';
  const treeResponse = await fetch(`${api}/git/trees/${branch}?recursive=1`, { signal });
  if (!treeResponse.ok) throw new Error('Não consegui listar os arquivos do repositório.');
  const wanted = (await treeResponse.json()).tree
    .filter(item => item.type === 'blob' && /\.(py|md)$/i.test(item.path) && item.size < 200000)
    // O projeto de um iniciante fica na raiz. Código antes de texto, e raiz antes de subpasta,
    // para não gastar o orçamento de leitura com exemplos ou documentação em pastas fundas.
    .sort((a, b) => Number(b.path.endsWith('.py')) - Number(a.path.endsWith('.py'))
      || a.path.split('/').length - b.path.split('/').length)
    .slice(0, MAX_FILES);
  if (!wanted.some(item => item.path.endsWith('.py'))) throw new Error('Não achei nenhum arquivo .py nesse repositório. Envie o arquivo do seu projeto.');

  const files = [];
  let budget = MAX_CHARS;
  for (const item of wanted) {
    if (budget <= 0) break;
    const raw = await fetch(`https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}/${item.path}`, { signal });
    if (!raw.ok) continue;
    const content = (await raw.text()).slice(0, budget);
    budget -= content.length;
    files.push({ path: item.path, content });
  }
  return { repo, branch, files };
}

// O modelo erra em fatos que dá para contar. Pedir que ele releia não resolveu: ele insistia
// que um arquivo cheio de comentários não tinha nenhum. Então o que é contável é contado aqui,
// em JavaScript, e entregue pronto — ele julga os requisitos, não os fatos.
export function codeFacts(files) {
  const python = files.filter(file => file.path.endsWith('.py'));
  const code = python.map(file => file.content).join('\n');
  const lines = code.split('\n');
  const comments = lines.filter(line => line.trim().startsWith('#') || /\s#\s*\S/.test(line)).map(line => line.trim());
  const bare = code.replace(/#[^\n]*/g, ' ');
  const calls = [...new Set([...bare.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)].map(match => match[1]))];
  const assigned = [...new Set([...bare.matchAll(/^\s*([A-Za-z_]\w*)\s*=[^=]/gm)].map(match => match[1]))];
  return {
    arquivosPython: python.map(file => file.path),
    linhasDeCodigo: lines.filter(line => line.trim()).length,
    comentarios: comments.length,
    exemplosDeComentario: comments.slice(0, 6),
    funcoesChamadas: calls,
    variaveisCriadas: assigned,
    usaFString: /f"|f'/.test(bare),
    define: [...new Set([...code.matchAll(/\b(?:def|class)\s+(\w+)/g)].map(match => match[1]))]
  };
}

export function gradingPrompt(project, files) {
  const facts = codeFacts(files);
  const system = [
    'Você é o Lumi, avaliador de um projeto de estudante brasileiro iniciante em Python.',
    'Avalie com justiça o que foi entregue, comparando com os requisitos. Seja exigente com o que foi pedido e generoso com estilo: é um iniciante.',
    'Nunca invente trechos de código que não estão nos arquivos. Se algo não aparece, o requisito não foi atendido.',
    'Para cada requisito, copie em "trecho" uma linha exata dos arquivos que comprove sua decisão.',
    'Antes de marcar um requisito como não atendido, releia todos os arquivos procurando por ele. Só marque false se, depois de reler, não encontrar nada — e então escreva em "trecho" o que você procurou.',
    'Responda APENAS um JSON com este formato exato:',
    '{"nota": número de 0 a 10, "resumo": "duas frases em português", "requisitos": [{"atendido": true ou false, "trecho": "linha exata do arquivo", "porque": "uma frase citando o que viu no código"}], "fortes": ["até três pontos"], "melhorar": ["até três pontos concretos"]}',
    `O array requisitos precisa ter exatamente ${project.requirements.length} itens, na mesma ordem em que foram listados.`
  ].join('\n');
  const user = [
    `Projeto: ${project.title}`,
    `Objetivo: ${project.brief}`,
    'Requisitos, em ordem:',
    project.requirements.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    'Arquivos entregues:',
    files.map(file => `--- ${file.path} ---\n${file.content}`).join('\n\n'),
    `Fatos medidos no código por contagem automática — são verdadeiros, não os contradiga:\n${JSON.stringify(facts, null, 1)}`,
    'Avalie agora e responda apenas o JSON no formato combinado.'
  ].join('\n\n');
  return { system, user };
}

// O modelo às vezes embrulha o JSON em texto ou cerca de código; pegamos o objeto de dentro.
export function parseGrade(raw, project) {
  const match = typeof raw === 'string' ? raw.match(/\{[\s\S]*\}/) : null;
  if (!match) throw new Error('Não consegui entender a resposta da avaliação.');
  const data = JSON.parse(match[0]);
  const nota = Math.max(0, Math.min(10, Number(data.nota)));
  // Acontece de o modelo responder outra coisa — inclusive recusar — em vez da avaliação.
  // Melhor dizer isso com todas as letras do que fingir uma nota.
  if (!Number.isFinite(nota)) throw new Error('A avaliação voltou sem uma nota que eu consiga ler. Tente pedir de novo; se continuar, use a autoavaliação para concluir o projeto.');
  const requisitos = project.requirements.map((item, index) => ({
    item,
    atendido: data.requisitos?.[index]?.atendido === true,
    porque: String(data.requisitos?.[index]?.porque || '').slice(0, 300)
  }));
  const list = value => (Array.isArray(value) ? value : []).slice(0, 3).map(text => String(text).slice(0, 200));
  return {
    nota: Math.round(nota * 10) / 10,
    // A aprovação é decidida aqui, pela nota, e não pelo que o modelo declarar sobre si mesmo.
    aprovado: nota >= PASSING,
    resumo: String(data.resumo || '').slice(0, 400),
    requisitos, fortes: list(data.fortes), melhorar: list(data.melhorar)
  };
}

export async function gradeProject({ project, files, signal }) {
  const { system, user } = gradingPrompt(project, files);
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MENTOR_MODEL, stream: false, format: 'json', keep_alive: '30m',
      // A nota precisa ser repetível para os mesmos arquivos; criatividade fica no mentor,
      // não numa avaliação que concede XP e emblema.
      options: { temperature: 0, seed: 42, num_predict: 900 },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}.`);
  return parseGrade((await response.json()).message?.content, project);
}
