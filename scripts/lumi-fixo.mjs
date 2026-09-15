// Configura um endereço FIXO para o Lumi no celular, uma vez só.
//
// O túnel rápido não exige conta nenhuma, mas sorteia um endereço novo a cada vez que sobe.
// Isso obriga a mandar o link para o celular toda sessão. Um túnel nomeado resolve: o endereço
// passa a ser seu e não muda, e o campus no celular pode ficar salvo na tela inicial.
//
// O que isto faz sozinho: confere o cloudflared, descobre seus domínios na Cloudflare, cria o
// túnel, aponta o DNS e grava a configuração que o `npm run lumi:celular` passa a usar.
// O que depende de você: ter uma conta Cloudflare com um domínio, e autorizar no navegador.
//
//   npm run lumi:fixo
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const NL = String.fromCharCode(10);
const CLOUDFLARED = process.env.CLOUDFLARED || 'cloudflared';
const PASTA = join(homedir(), '.cloudflared');
const CONFIG = join(process.cwd(), '.pycampus-tunel.json');

const rodar = (...args) => spawnSync(CLOUDFLARED, args, { encoding: 'utf8' });
const mostrar = (...args) => spawnSync(CLOUDFLARED, args, { stdio: 'inherit' });
const parar = mensagem => { console.error(NL + mensagem); process.exit(1); };

const versao = rodar('--version');
if (versao.error) parar(`Não achei o cloudflared. Instale com "winget install Cloudflare.cloudflared" e rode de novo.${NL}Se ele estiver em outro lugar, aponte a variável CLOUDFLARED para o executável.`);
console.log(`cloudflared: ${versao.stdout.trim()}`);

// O login abre o navegador e pede para escolher um domínio da sua conta. O certificado que ele
// grava é o que autoriza criar túneis e mexer no DNS daquele domínio.
if (!existsSync(join(PASTA, 'cert.pem'))) {
  console.log(`${NL}Você ainda não autorizou este computador na sua conta Cloudflare.`);
  console.log('Vou abrir o navegador. Entre na sua conta e escolha o domínio que vai hospedar o endereço do Lumi.');
  console.log(`${NL}Se você não tem domínio nenhum na Cloudflare, feche a janela e continue usando "npm run lumi:celular".`);
  console.log('O túnel rápido funciona igual; só o endereço é que muda a cada sessão.' + NL);
  mostrar('tunnel', 'login');
  if (!existsSync(join(PASTA, 'cert.pem'))) parar('O login não concluiu. Nada foi alterado.');
}
console.log('Conta autorizada neste computador.');

const leitor = createInterface({ input: process.stdin, output: process.stdout });
const perguntar = async (texto, padrao) => {
  const resposta = (await leitor.question(`${texto}${padrao ? ` [${padrao}]` : ''}: `)).trim();
  return resposta || padrao || '';
};

const NOME = process.env.PYCAMPUS_TUNEL || 'pycampus';
const existentes = rodar('tunnel', 'list', '--output', 'json');
let tunel = null;
try { tunel = (JSON.parse(existentes.stdout || '[]') || []).find(item => item.name === NOME) || null; } catch { /* lista vazia ou formato novo */ }

if (tunel) {
  console.log(`Túnel "${NOME}" já existe (${tunel.id}). Vou reaproveitá-lo.`);
} else {
  console.log(`${NL}Criando o túnel "${NOME}"…`);
  const criado = rodar('tunnel', 'create', NOME);
  if (criado.status !== 0) parar(`Não consegui criar o túnel:${NL}${(criado.stderr || criado.stdout || '').trim()}`);
  console.log((criado.stdout || '').trim());
}

const host = await perguntar(`${NL}Endereço que você quer usar (subdomínio do SEU domínio na Cloudflare)`, 'lumi.seu-dominio.com');
if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(host) || host.includes('seu-dominio')) {
  leitor.close();
  parar('Preciso de um endereço real, como lumi.exemplo.com.br. Nada foi apontado no DNS.');
}
leitor.close();

console.log(`${NL}Apontando ${host} para o túnel…`);
const rota = rodar('tunnel', 'route', 'dns', NOME, host);
const saidaRota = `${rota.stdout || ''}${rota.stderr || ''}`;
// Refazer a rota de um endereço que já aponta para o mesmo túnel não é erro: é o caso de quem
// roda isto duas vezes. Só "already exists" apontando para OUTRO destino é problema real.
if (rota.status !== 0 && !/already (exists|configured)/i.test(saidaRota)) parar(`O DNS não foi apontado:${NL}${saidaRota.trim()}`);
console.log(saidaRota.trim() || 'DNS apontado.');

const credencial = readdirSync(PASTA).find(arquivo => arquivo.endsWith('.json') && arquivo !== 'config.json');
writeFileSync(CONFIG, JSON.stringify({ nome: NOME, host: `https://${host}`, credencial: credencial ? join(PASTA, credencial) : '' }, null, 2) + NL);

console.log(`${NL}Pronto. Guardei a configuração em ${CONFIG}.`);
console.log(`Daqui em diante, "npm run lumi:celular" sobe o túnel neste endereço fixo:${NL}`);
console.log(`  https://${host}${NL}`);
console.log('O link do celular para de mudar. Dá para salvá-lo na tela inicial e esquecer.');
console.log(`${NL}Este arquivo não vai para o GitHub: ele está no .gitignore, porque diz onde fica a sua IA.`);

// Aviso honesto: o endereço passa a ser público. Quem souber dele alcança o seu Ollama enquanto
// o túnel estiver no ar. É o mesmo risco do túnel rápido, só que agora o endereço é adivinhável.
console.log(`${NL}Atenção: enquanto o túnel estiver no ar, quem souber esse endereço alcança o Ollama do seu computador.`);
console.log('Com o túnel rápido isso já valia, mas o endereço sorteado era difícil de adivinhar; um endereço fixo, não.');
console.log('Feche a janela do túnel quando não estiver estudando, e não divulgue o endereço.');
if (readFileSync(join(process.cwd(), '.gitignore'), 'utf8').includes('.pycampus-tunel.json') === false) {
  console.log(`${NL}Falta acrescentar .pycampus-tunel.json ao .gitignore.`);
}
