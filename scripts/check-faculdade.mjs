// Executa no Pyodide real todo código da trilha da faculdade: exemplo, starter e solução de
// cada aula. A regra do projeto vale aqui igual: conteúdo que a plataforma promete é executado,
// nunca inspecionado. Quando MEDIR=1, imprime a saída medida para preencher os `esperado`.
//
//   node scripts/check-faculdade.mjs        confere
//   MEDIR=1 node scripts/check-faculdade.mjs   mostra a saída real de cada programa
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { aulasDaFaculdade, unidades } from '../src/faculdade.js';
import { entregaDaFaculdade, entregasDaFaculdade } from '../src/faculdade-entregas.js';
import { exemploDaEntrega } from '../src/faculdade-exemplos.js';
import { solucoesDaFaculdade } from '../tests/faculdade-reference.js';
import { ensinoDaFaculdade } from '../src/faculdade-ensino.js';
import { projetosDaFaculdade } from '../src/faculdade-projetos.js';
import { solucoesProjetosFaculdade } from '../tests/faculdade-projetos-reference.js';
import { solucoesEntregasFaculdade } from '../tests/faculdade-entregas-reference.js';

const NL = String.fromCharCode(10);
const BASE = process.env.PYCAMPUS_TEST_URL || 'http://127.0.0.1:5176/';
const MEDIR = process.env.MEDIR === '1';

const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);

// Um worker por programa: pandas e matplotlib deixam estado global, e um exemplo não pode
// depender do que o anterior carregou.
const rodar = async (codigo, stdin = '') =>
  page.evaluate(
    async ([src, entrada]) => {
      const worker = new Worker('/python-worker.js');
      return await new Promise((resolve) => {
        const prazo = setTimeout(() => {
          worker.terminate();
          resolve({ ok: false, output: '(passou de 240s)' });
        }, 240000);
        worker.onmessage = (evento) => {
          if (evento.data.type !== 'result') return;
          clearTimeout(prazo);
          worker.terminate();
          resolve({
            ok: evento.data.ok,
            output: String(evento.data.output || ''),
          });
        };
        worker.postMessage({ type: 'run', code: src, stdin: entrada });
      });
    },
    [codigo, stdin],
  );

// Roda o mesmo programa duas vezes no MESMO worker. É assim que o estudante executa na
// plataforma — usePython reaproveita um worker por aula —, então o sistema de arquivos
// virtual sobrevive entre as execuções. Um programa que grava em disco, como a análise da
// Unidade 3, só prova que é reexecutável aqui: em workers separados o arquivo nasce vazio
// nas duas vezes e a duplicação passaria despercebida.
const rodarDuasVezes = async (codigo) =>
  page.evaluate(
    async (src) => {
      const worker = new Worker('/python-worker.js');
      const executar = () =>
        new Promise((resolve) => {
          const aoReceber = (evento) => {
            if (evento.data.type !== 'result') return;
            worker.removeEventListener('message', aoReceber);
            resolve({ ok: evento.data.ok, output: String(evento.data.output || '') });
          };
          worker.addEventListener('message', aoReceber);
          worker.postMessage({ type: 'run', code: src, stdin: '' });
        });
      const prazo = new Promise((resolve) =>
        setTimeout(() => resolve(null), 240000));
      const saidas = await Promise.race([
        (async () => [await executar(), await executar()])(),
        prazo,
      ]);
      worker.terminate();
      return saidas || [{ ok: false, output: '(passou de 240s)' }, { ok: false, output: '' }];
    },
    codigo,
  );

// Avisos de infraestrutura não são a saída do estudante.
const limpar = (texto) =>
  texto
    .split(NL)
    .filter(
      (linha) =>
        !/^(Loading |Loaded |packaging already|Matplotlib is building)/.test(
          linha.trim(),
        ),
    )
    .join(NL)
    .trim();

const problemas = [];
let programas = 0;

for (const entrega of entregasDaFaculdade) {
  for (const passo of entrega.passos.filter(p => p.fase === 'entender')) {
    const exemplo = exemploDaEntrega(entrega, passo);
    assert.ok(exemplo, `${passo.id}: falta declarar o ambiente do exemplo`);
    if (exemplo.ambiente === 'colab') continue;
    programas++;
    const resultado = await rodar(exemplo.codigo);
    if (!resultado.ok || limpar(resultado.output) !== exemplo.saida) {
      problemas.push(`${passo.id}: exemplo isolado não produz a saída ensinada — ${limpar(resultado.output)}`);
    }
  }
}

for (const aula of aulasDaFaculdade) {
  programas++;
  const exemplo = await rodar(aula.exemplo);
  const saidaExemplo = limpar(exemplo.output);
  if (!exemplo.ok)
    problemas.push(
      `${aula.id}: o exemplo não executou — ${saidaExemplo.split(NL).pop()}`,
    );
  if (MEDIR) console.log(`### ${aula.id} · exemplo${NL}${saidaExemplo}${NL}`);

  // O starter é o ponto de partida do estudante: ele pode estar incompleto, mas nunca pode
  // explodir num erro que pareça culpa dele antes de escrever qualquer coisa.
  programas++;
  const inicio = await rodar(aula.starter);
  if (!inicio.ok && !/SyntaxError/.test(inicio.output)) {
    problemas.push(
      `${aula.id}: o starter já começa com erro — ${limpar(inicio.output).split(NL).pop()}`,
    );
  }

  const solucao = solucoesDaFaculdade[aula.id];
  if (!solucao) {
    problemas.push(
      `${aula.id}: sem solução de referência em tests/faculdade-reference.js`,
    );
    continue;
  }
  programas++;
  const resultado = await rodar(solucao);
  const medido = limpar(resultado.output);
  if (MEDIR) {
    console.log(`### ${aula.id} · solução${NL}${medido}${NL}`);
    continue;
  }
  if (!resultado.ok)
    problemas.push(
      `${aula.id}: a solução guardada não executou — ${medido.split(NL).pop()}`,
    );
  else if (!aula.esperado)
    problemas.push(`${aula.id}: o desafio não tem saída esperada`);
  else if (medido !== aula.esperado.trim())
    problemas.push(
      `${aula.id}: a solução produz ${JSON.stringify(medido)} e o desafio espera ${JSON.stringify(aula.esperado.trim())}`,
    );
}

// A lista e a primeira aula precisam continuar utilizáveis, além de o conteúdo executar isolado.
for (const [id, ensino] of Object.entries(ensinoDaFaculdade)) {
  programas += 2;
  const exemplo = await rodar(ensino.codigo);
  if (!exemplo.ok)
    problemas.push(`${id}: exemplo guiado falhou — ${limpar(exemplo.output)}`);
  const alterado = await rodar(
    ensino.codigo.replace(ensino.treino.antes, ensino.treino.depois),
  );
  if (!alterado.ok || limpar(alterado.output) !== ensino.treino.saida)
    problemas.push(
      `${id}: treino guiado não produz a saída ensinada — ${limpar(alterado.output)}`,
    );
}
for (const projeto of projetosDaFaculdade) {
  programas++;
  const resultado = await rodar(solucoesProjetosFaculdade[projeto.id]);
  if (!resultado.ok || limpar(resultado.output) !== projeto.esperado)
    problemas.push(
      `${projeto.id}: projeto não produz a saída esperada — ${limpar(resultado.output)}`,
    );
}
const evidenciasDasEntregas = {
  'entrega-u1': ['Média da turma:', 'Aprovado', 'Reprovado'],
  'entrega-u2': ['Livro encontrado:', 'Busca inexistente: não encontrado', 'Livros por gênero:', 'Barras: 3'],
  // As quatorze vendas e as três categorias são as do roteiro oficial da Unidade 3.
  'entrega-u3': ['Total de vendas: 14', 'Receita total:', 'Produto de maior valor: Produto A', 'Gráfico:', 'Barras: 3'],
};
for (const [id, evidencias] of Object.entries(evidenciasDasEntregas)) {
  programas++;
  const resultado = await rodar(solucoesEntregasFaculdade[id]);
  const saida = limpar(resultado.output);
  if (!resultado.ok) problemas.push(`${id}: solução oficial não executou — ${saida}`);
  for (const evidencia of evidencias) {
    if (!saida.includes(evidencia)) problemas.push(`${id}: saída não contém ${JSON.stringify(evidencia)}`);
  }
  if (id === 'entrega-u3') {
    // A Unidade 3 grava em dados_vendas.db. Reexecutar no mesmo worker é o que acontece
    // quando o estudante clica em Executar de novo, e é o que o Colab faz em "Executar tudo".
    programas += 2;
    const [primeira, segunda] = await rodarDuasVezes(solucoesEntregasFaculdade[id]);
    if (!primeira.ok || !segunda.ok) {
      problemas.push(`${id}: reexecutar no mesmo ambiente falhou — ${limpar(segunda.output)}`);
    } else if (limpar(segunda.output) !== limpar(primeira.output)) {
      problemas.push(
        `${id}: a segunda execução no mesmo ambiente mudou o resultado ou duplicou registros — ${limpar(segunda.output)}`,
      );
    }
  }
}
programas++;
const praticaU4 = entregaDaFaculdade('entrega-u4').praticaLocal;
const resultadoU4 = await rodar(praticaU4.codigo);
if (!resultadoU4.ok || limpar(resultadoU4.output) !== praticaU4.esperado) {
  problemas.push(`entrega-u4: prática local não produz a saída ensinada — ${limpar(resultadoU4.output)}`);
}
await page.goto(BASE, { waitUntil: 'networkidle' });
await page
  .getByRole('button', { name: 'Minha faculdade', exact: true })
  .click();
await page.getByText(/O conteúdo da sua/).waitFor();
assert.equal(await page.locator('.faculdade-mapa-unidade').count(), unidades.length);
await page.getByText('PLANO ATÉ 27 DE SETEMBRO · PROVA 30 DE SETEMBRO').waitFor();
await page.getByText('PRÓXIMA AÇÃO').waitFor();
assert.equal(await page.locator('.prova-proxima').count(), 1);
assert.equal(await page.locator('.prova-acao').count(), 1);
await page.getByText('SEU PLANO DE HOJE').waitFor();
assert.equal(await page.locator('.plano-hoje-item').count(), 2);
assert.equal(await page.locator('.como-estudar').count(), 1);
assert.equal(
  await page.locator('.faculdade-mapa-aula').count(),
  aulasDaFaculdade.length,
);
await page.locator('.faculdade-mapa-aula').first().click();
// A aula é uma etapa por vez: o código do professor fica na etapa "Professor", já aberto.
await page.locator('.aula-etapas button').filter({ hasText: 'Professor' }).click();
await page.getByText('Ampliar: conceitos e exemplo completo do material').waitFor();
// Executar exige um palpite antes: prever a saída é o exercício de leitura de código.
const executarExemplo = page.getByRole('button', { name: 'Executar exemplo', exact: true });
assert.equal(await executarExemplo.isDisabled(), true, 'o exemplo só roda depois do palpite');
await page.getByLabel(/o que este código vai mostrar/).first().fill('um palpite qualquer');
await executarExemplo.click();
await page.locator('.previsao-veredito').first().waitFor({ timeout: 120000 });
// O editor do exemplo é o de dentro do "Ampliar": os degraus vêm antes e têm editor próprio.
await page
  .locator('details')
  .filter({ hasText: 'Ampliar: conceitos e exemplo completo do material' })
  .locator('.code-workspace')
  .first()
  .getByText('✓ Executado')
  .waitFor({ timeout: 120000 });

const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(BASE, { waitUntil: 'networkidle' });
await mobile.getByRole('button', { name: 'Mais', exact: true }).click();
await mobile
  .getByRole('button', { name: 'Minha faculdade', exact: true })
  .click();
await mobile.getByText(/O conteúdo da sua/).waitFor();
assert.equal(
  await mobile.locator('.faculdade-mapa-aula').count(),
  aulasDaFaculdade.length,
);
assert.ok(
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth + 1,
  ),
  'Minha faculdade criou rolagem horizontal no celular',
);

await browser.close();
if (MEDIR) {
  console.log(`${programas} programas executados.`);
  process.exit(0);
}
console.log(
  problemas.length
    ? `${programas} programas executados · ${problemas.length} problemas:${NL}${problemas.join(NL)}`
    : `${programas} programas da trilha da faculdade executaram no Python real e bateram com o prometido.`,
);
process.exitCode = problemas.length ? 1 : 0;
