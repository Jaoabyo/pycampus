import {
  normalizarTrabalhoDaEntrega,
  requisitosFaltandoDaEntrega,
} from './faculdade-entregas.js';

const EXTENSOES = new Set(['ipynb', 'html']);
const rotulo = (valor, fallback) => typeof valor === 'string' && valor.trim()
  ? valor.trim().slice(0, 120)
  : fallback;

const escaparHtml = (valor = '') => String(valor).replace(/[&<>"']/g, (caractere) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[caractere]));

const linhas = (valor = '') => {
  const partes = String(valor).split('\n');
  return partes.map((linha, indice) => indice < partes.length - 1 ? `${linha}\n` : linha);
};

const markdown = (source) => ({
  cell_type: 'markdown',
  metadata: {},
  source: linhas(source),
});

const codigo = (source) => ({
  cell_type: 'code',
  execution_count: null,
  metadata: {},
  outputs: [],
  source: linhas(source),
});

const celulasDeCodigo = (entrega, source) => {
  if (entrega.unidade !== 'u4') return [codigo(source)];
  const todas = String(source).split('\n');
  const ancora = (teste, inicio = 1) => todas.findIndex((linha, indice) => indice >= inicio && teste.test(linha));
  const cortes = [
    0,
    ancora(/train_test_split\s*\(/),
    ancora(/^\s*\w+\s*=.*tf\.keras(?:\.models)?\.Sequential\s*\(/),
    ancora(/\.evaluate\s*\(/),
    todas.length,
  ];
  if (cortes.slice(1, -1).some((indice) => indice < 1)
    || cortes.some((valor, indice) => indice > 0 && valor <= cortes[indice - 1])) {
    return [codigo(source)];
  }
  const titulos = [
    '1. Ambiente e dados',
    '2. Separação e normalização',
    '3. Modelo e treinamento',
    '4. Avaliação e predição',
  ];
  return titulos.flatMap((titulo, indice) => [
    markdown(`### ${titulo}`),
    codigo(todas.slice(cortes[indice], cortes[indice + 1]).join('\n')),
  ]);
};

// Só as entregas que desenham alguma coisa devem falar em gráfico. A da Unidade 1 é um
// relatório de notas em texto, e mencionar figuras ali manda o estudante procurar o que não
// existe — foi exatamente o que aconteceu.
const temGrafico = (entrega) => ['u2', 'u3'].includes(entrega?.unidade);

const secaoMarkdown = (titulo, conteudo, fallback = 'Preencha esta seção após executar e conferir o código.') =>
  markdown(`## ${titulo}\n\n${conteudo.trim() || fallback}`);

const dataBrasileira = (valor) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) return '';
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
};

const slugSeguro = (valor) => String(valor || '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 80) || 'atividade';

const exigirEntrega = (entrega) => {
  if (!entrega?.id || !Array.isArray(entrega.passos)) {
    throw new Error('Entrega da faculdade inválida para exportação.');
  }
};

export function nomeDoArquivoDaEntrega(entrega, extensao) {
  exigirEntrega(entrega);
  const limpa = String(extensao || '').toLowerCase().replace(/^\./, '');
  if (!EXTENSOES.has(limpa)) throw new Error('Extensão de exportação não permitida.');
  return `${slugSeguro(entrega.id)}-${slugSeguro(entrega.titulo)}.${limpa}`;
}

export function criarNotebookColab({ entrega, trabalho, estudante = {} }) {
  exigirEntrega(entrega);
  const salvo = normalizarTrabalhoDaEntrega(trabalho, entrega);
  const nome = escaparHtml(rotulo(estudante.nome, 'Estudante'));
  const identificacao = escaparHtml(rotulo(estudante.identificacao, 'Preencher antes do envio'));
  const listaTestes = entrega.testesOrientados.map((item) => `- [ ] ${item}`).join('\n');
  const objetivos = entrega.criterios.map(({ descricao }) => `- ${descricao}`).join('\n');
  const resultado = entrega.ambienteEntrega === 'colab'
    ? salvo.saidaExterna
    : salvo.saida;
  const rotuloResultado = entrega.ambienteEntrega === 'colab'
    ? 'Resultado informado após execução no Colab'
    : 'Saída observada';

  const cells = [
    // Sem o prazo: ele é o controle de estudo do estudante, não informação para quem corrige, e
    // a data do PyCampus é a da prova presencial — o AVA tem janela própria para o trabalho.
    // Imprimir uma data que contradiz o sistema da faculdade só cria dúvida na correção.
    markdown(`# ${entrega.titulo}\n\n**Estudante:** ${nome}  \n**Identificação:** ${identificacao}  \n**Origem:** ${entrega.origem}`),
    markdown(`## Objetivo\n\n${entrega.resumo}\n\n### Critérios do roteiro\n\n${objetivos}`),
    // Falar de gráficos numa entrega que não tem gráfico faz o estudante procurar o que não
    // existe e desconfiar do resto do texto. Só as Unidades 2 e 3 produzem figuras.
    markdown(`## Como executar\n\nExecute as células em ordem. Se alterar dados, execute tudo novamente para que ${temGrafico(entrega) ? 'a saída e os gráficos correspondam' : 'a saída corresponda'} ao código final.${entrega.ambienteEntrega === 'colab' ? '\n\nEste trabalho usa TensorFlow/scikit-learn e precisa da execução final no Google Colab.' : ''}`),
    ...celulasDeCodigo(entrega, salvo.codigo || entrega.codigoInicial),
    secaoMarkdown('Testes planejados', `${listaTestes}\n\n### Registro do estudante\n\n${salvo.testes}`),
    secaoMarkdown(rotuloResultado, resultado),
    secaoMarkdown('Explicação da lógica', salvo.logica),
  ];
  if (entrega.unidade === 'u3') cells.push(secaoMarkdown('Insights da análise', salvo.insights));
  cells.push(secaoMarkdown('Conclusão', salvo.conclusao));

  return JSON.stringify({
    cells,
    metadata: {
      colab: { name: nomeDoArquivoDaEntrega(entrega, 'ipynb'), provenance: [] },
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python', version: '3' },
    },
    nbformat: 4,
    nbformat_minor: 5,
  }, null, 2);
}

const bloco = (titulo, conteudo, classe = '') => `
  <section class="bloco ${classe}">
    <h2>${escaparHtml(titulo)}</h2>
    <div class="conteudo">${escaparHtml(conteudo || 'Ainda não preenchido.').replace(/\n/g, '<br>')}</div>
  </section>`;

export function criarRelatorioHtml({ entrega, trabalho, estudante = {} }) {
  exigirEntrega(entrega);
  const salvo = normalizarTrabalhoDaEntrega(trabalho, entrega);
  const faltando = new Set(requisitosFaltandoDaEntrega(entrega, salvo).map(({ id }) => id));
  const nome = rotulo(estudante.nome, 'Estudante');
  const identificacao = rotulo(estudante.identificacao, 'Preencher antes do envio');
  const resultado = entrega.ambienteEntrega === 'colab' ? salvo.saidaExterna : salvo.saida;
  const tituloResultado = entrega.ambienteEntrega === 'colab'
    ? 'Resultado informado após execução no Colab'
    : 'Saída da execução';
  const dataExecucao = entrega.ambienteEntrega === 'colab'
    ? dataBrasileira(salvo.executadaNoColabEm)
    : dataBrasileira(salvo.executadaEm);
  const checklist = entrega.criterios.map((criterio) => `
    <li class="${faltando.has(criterio.id) ? 'pendente' : 'atendido'}">
      <span aria-hidden="true">${faltando.has(criterio.id) ? '○' : '✓'}</span>
      ${escaparHtml(criterio.descricao)}
    </li>`).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escaparHtml(entrega.titulo)} · Relatório</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Arial, sans-serif; color: #211a35; background: #f4f2f8; }
    * { box-sizing: border-box; }
    body { margin: 0; line-height: 1.55; }
    main { width: min(900px, calc(100% - 32px)); margin: 32px auto; background: white; padding: 48px; border-radius: 20px; box-shadow: 0 12px 40px #291c4420; }
    .topo { border-bottom: 4px solid #7650dc; padding-bottom: 24px; }
    .eyebrow { color: #6842c2; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { font-size: clamp(28px, 5vw, 44px); line-height: 1.08; margin: 8px 0 16px; }
    h2 { font-size: 19px; margin: 0 0 10px; }
    .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px; }
    .bloco { break-inside: avoid; border-top: 1px solid #e5dff0; padding-top: 22px; margin-top: 22px; }
    .conteudo { white-space: normal; }
    pre { overflow-wrap: anywhere; white-space: pre-wrap; background: #241f2e; color: #f7f3ff; padding: 20px; border-radius: 12px; font: 13px/1.55 Consolas, monospace; }
    ul { padding-left: 0; list-style: none; }
    li { display: flex; gap: 10px; margin: 8px 0; }
    .atendido { color: #16775a; } .pendente { color: #8a5b13; }
    .acoes { position: sticky; bottom: 16px; display: flex; justify-content: end; margin-top: 28px; }
    button { min-height: 44px; border: 0; border-radius: 10px; padding: 0 18px; color: white; background: #6842c2; font-weight: 750; cursor: pointer; }
    button:focus-visible { outline: 3px solid #f2ca52; outline-offset: 3px; }
    @page { size: A4; margin: 16mm; }
    @media print { :root { background: white; } main { width: auto; margin: 0; padding: 0; box-shadow: none; } .acoes { display: none; } }
    @media (max-width: 600px) { main { width: 100%; margin: 0; padding: 24px 18px; border-radius: 0; } .meta { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<main>
  <header class="topo">
    <div class="eyebrow">Linguagem de Programação · ${escaparHtml(entrega.unidade.toUpperCase())}</div>
    <h1>${escaparHtml(entrega.titulo)}</h1>
    <div class="meta">
      <div><strong>Estudante:</strong> ${escaparHtml(nome)}</div>
      <div><strong>Identificação:</strong> ${escaparHtml(identificacao)}</div>
      <div><strong>Execução:</strong> ${escaparHtml(dataExecucao || 'registrar antes do envio')}</div>
    </div>
  </header>
  ${bloco('Objetivo', entrega.resumo)}
  <section class="bloco"><h2>Código final</h2><pre><code>${escaparHtml(salvo.codigo || entrega.codigoInicial)}</code></pre></section>
  ${bloco(tituloResultado, resultado)}
  ${bloco('Testes realizados', salvo.testes)}
  ${bloco('Explicação da lógica', salvo.logica)}
  ${entrega.unidade === 'u3' ? bloco('Insights da análise', salvo.insights) : ''}
  ${bloco('Conclusão', salvo.conclusao)}
  <section class="bloco"><h2>Conferência antes do envio</h2><ul>${checklist}</ul><p>Abra o PDF depois de salvar e confirme que ele tem no máximo 10 MB.</p></section>
  <div class="acoes"><button type="button" onclick="window.print()">Imprimir / salvar como PDF</button></div>
</main>
</body>
</html>`;
}
