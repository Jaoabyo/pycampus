// Sobe o túnel https para o Ollama e imprime o link do campus já apontando para ele.
//
// Por que existe: o site publicado é https e o Ollama é http no seu computador. O navegador
// bloqueia essa mistura antes mesmo de tentar, então o Lumi só conversa no celular através de
// um endereço https. O túnel dá esse endereço — e ele muda toda vez que sobe, o que torna
// digitá-lo no celular um castigo. Daí o link: abrir o campus por ele já configura tudo.
//
// Enquanto esta janela estiver aberta, o Lumi funciona no celular. Fechou, o Lumi volta a ser
// só as dicas escritas — que funcionam sempre, em qualquer aparelho.
import { spawn } from 'node:child_process';

const SITE = process.env.PYCAMPUS_SITE || 'https://jaoabyo.github.io/pycampus/';
const OLLAMA = process.env.OLLAMA_LOCAL || 'http://127.0.0.1:11434';
const CLOUDFLARED = process.env.CLOUDFLARED || 'cloudflared';

const modelos = await fetch(`${OLLAMA}/api/tags`).then(r => r.json()).catch(() => null);
if (!modelos) {
  console.error(`Ollama não respondeu em ${OLLAMA}. Abra o aplicativo Ollama e rode de novo.`);
  process.exit(1);
}
console.log(`Ollama respondendo. Modelos: ${modelos.models.map(m => m.name).join(', ')}`);

// --http-host-header: sem isso o Ollama recusa a requisição que chega com o host do túnel.
const tunel = spawn(CLOUDFLARED, ['tunnel', '--url', OLLAMA, '--http-host-header', 'localhost:11434'], { stdio: ['ignore', 'pipe', 'pipe'] });
tunel.on('error', erro => {
  console.error(`Não consegui iniciar o cloudflared (${erro.message}). Instale-o ou aponte a variável CLOUDFLARED para o executável.`);
  process.exit(1);
});

let anunciado = false;
const procurarEndereco = texto => {
  const achado = String(texto).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!achado || anunciado) return;
  anunciado = true;
  const endereco = achado[0];
  console.log(`
Túnel no ar: ${endereco}

Abra este link no celular (ou mande para ele) — o campus já vai com o Lumi configurado:

  ${SITE}?ia=${encodeURIComponent(endereco)}

Deixe esta janela aberta enquanto estiver estudando. Ctrl+C encerra o túnel.`);
};
tunel.stdout.on('data', procurarEndereco);
tunel.stderr.on('data', procurarEndereco);

const encerrar = () => { tunel.kill(); process.exit(0); };
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
tunel.on('exit', codigo => {
  console.log(anunciado ? 'Túnel encerrado. O Lumi volta a funcionar só no computador.' : `cloudflared saiu com código ${codigo} antes de dar um endereço.`);
  process.exit(codigo || 0);
});
