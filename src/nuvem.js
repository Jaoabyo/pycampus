// Guardar o progresso num Gist privado do próprio estudante. Não é servidor nosso, não é
// conta nova: é a conta do GitHub que ele já usa para publicar os projetos. O token fica no
// navegador dele e nunca no repositório — por isso o escopo pedido é só "gist".
const CHAVE_TOKEN = 'pycampus.github';
const CHAVE_GIST = 'pycampus.gist';
const ARQUIVO = 'pycampus.json';
const API = 'https://api.github.com';

const ler = chave => { try { return localStorage.getItem(chave) || ''; } catch { return ''; } };
const gravar = (chave, valor) => { try { valor ? localStorage.setItem(chave, valor) : localStorage.removeItem(chave); } catch { /* sem armazenamento */ } };

export const token = () => ler(CHAVE_TOKEN);
export const gistId = () => ler(CHAVE_GIST);
export const definirToken = valor => gravar(CHAVE_TOKEN, String(valor || '').trim());
export const definirGist = valor => gravar(CHAVE_GIST, String(valor || '').trim());
export const conectado = () => Boolean(token());

// Mensagens de erro que dizem o que fazer, em vez de repetir o código HTTP.
export function explicarFalha(status) {
  if (status === 401) return 'O token não foi aceito. Gere outro no GitHub e cole de novo.';
  if (status === 403) return 'O GitHub recusou por limite de uso. Espere alguns minutos.';
  if (status === 404) return 'O Gist do progresso não foi encontrado. Ele pode ter sido apagado; salve de novo para criar outro.';
  if (status === 422) return 'O GitHub recusou o conteúdo enviado.';
  return `O GitHub respondeu ${status}.`;
}

async function chamar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...opcoes.headers
    }
  });
  if (!resposta.ok) throw new Error(explicarFalha(resposta.status));
  return resposta.json();
}

export async function conferirToken() {
  const usuario = await chamar('/user');
  return usuario.login;
}

// Um único arquivo, sempre o mesmo: o estado inteiro, legível, para dar para conferir a olho.
export const corpoDoGist = estado => ({
  description: 'PyCampus — meu progresso de estudos (privado)',
  files: { [ARQUIVO]: { content: JSON.stringify(estado, null, 1) } }
});

export async function salvarNaNuvem(estado) {
  const id = gistId();
  const corpo = corpoDoGist(estado);
  if (id) {
    const gist = await chamar(`/gists/${id}`, { method: 'PATCH', body: JSON.stringify(corpo) });
    return { id: gist.id, criado: false, quando: gist.updated_at };
  }
  const gist = await chamar('/gists', { method: 'POST', body: JSON.stringify({ ...corpo, public: false }) });
  definirGist(gist.id);
  return { id: gist.id, criado: true, quando: gist.updated_at };
}

export async function baixarDaNuvem() {
  const id = gistId();
  if (!id) throw new Error('Ainda não há progresso salvo na nuvem neste aparelho.');
  const gist = await chamar(`/gists/${id}`);
  const arquivo = gist.files?.[ARQUIVO];
  if (!arquivo) throw new Error('O Gist existe, mas não tem o arquivo do progresso.');
  // Gist grande vem truncado: nesse caso o conteúdo real está numa URL separada.
  const texto = arquivo.truncated ? await (await fetch(arquivo.raw_url)).text() : arquivo.content;
  return { estado: JSON.parse(texto), quando: gist.updated_at };
}

// Evita conversar com o GitHub a cada tecla digitada: só sobe quando algo mudou de verdade
// e depois de um tempo parado.
export function precisaSalvar(estadoAtual, ultimoEnviado) {
  if (!conectado()) return false;
  return JSON.stringify(estadoAtual) !== ultimoEnviado;
}
