// Gera o PDF que a faculdade pede, sem depender de o estudante acertar a caixa de impressão.
//
// O roteiro é específico: um único arquivo .docx ou .pdf, de no máximo 10 MB, com um print do
// código executado ao menos uma vez e uma breve explicação da lógica. Antes o PyCampus
// entregava um HTML e mandava usar Ctrl+P — o que funciona, mas transfere para o estudante a
// chance de sair com margem errada, sem o gráfico ou em dois arquivos. Aqui o arquivo já nasce
// no formato do envio.
//
// A execução é copiada da saída real guardada no trabalho, nunca reescrita: um relatório com
// um resultado que o programa não produziu seria uma fraude simpática.

const MARGEM = 46;
const LARGURA = 595; // A4 em pontos
const ALTURA = 842;
const UTIL = LARGURA - MARGEM * 2;

const limpo = (valor, vazio = '') => {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || vazio;
};

const dataBrasileira = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return '';
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
};

export function nomeDoPdf(entrega) {
  const base = String(entrega?.titulo || entrega?.id || 'entrega')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${entrega?.id || 'entrega'}-${base || 'entrega'}.pdf`;
}

// jsPDF é pesado e só serve nesta tela, então entra por import dinâmico: quem nunca exporta
// não paga o download.
export async function criarRelatorioPdf({ entrega, trabalho, estudante = {} }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGEM;

  const espaco = (altura) => {
    if (y + altura <= ALTURA - MARGEM) return;
    doc.addPage();
    y = MARGEM;
  };

  const paragrafo = (texto, { tamanho = 10.5, fonte = 'helvetica', estilo = 'normal', cor = [40, 40, 55], recuo = 0 } = {}) => {
    doc.setFont(fonte, estilo);
    doc.setFontSize(tamanho);
    doc.setTextColor(...cor);
    const linhas = doc.splitTextToSize(String(texto), UTIL - recuo);
    const altura = tamanho * 1.45;
    for (const linha of linhas) {
      espaco(altura);
      doc.text(linha, MARGEM + recuo, y + tamanho);
      y += altura;
    }
  };

  const titulo = (texto) => {
    espaco(34);
    y += 12;
    doc.setDrawColor(119, 85, 217);
    doc.setLineWidth(2);
    doc.line(MARGEM, y, MARGEM + 26, y);
    y += 10;
    paragrafo(texto, { tamanho: 13, estilo: 'bold', cor: [25, 25, 40] });
    y += 2;
  };

  // O código e a saída entram em monoespaçada e com fundo: é o bloco que faz as vezes do print
  // exigido, então precisa parecer o que é — texto de terminal, não prosa.
  const bloco = (texto, vazio) => {
    const conteudo = limpo(texto, vazio);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8.6);
    const linhas = doc.splitTextToSize(conteudo, UTIL - 20);
    const alturaLinha = 11.6;
    for (const linha of linhas) {
      espaco(alturaLinha);
      doc.setFillColor(244, 244, 249);
      doc.rect(MARGEM, y, UTIL, alturaLinha, 'F');
      doc.setTextColor(35, 35, 50);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.6);
      doc.text(linha, MARGEM + 10, y + 8.4);
      y += alturaLinha;
    }
    y += 8;
  };

  // Cabeçalho
  doc.setFillColor(119, 85, 217);
  doc.rect(0, 0, LARGURA, 6, 'F');
  y = MARGEM + 6;
  paragrafo('LINGUAGEM DE PROGRAMAÇÃO · ATIVIDADE PRÁTICA', { tamanho: 8.5, estilo: 'bold', cor: [119, 85, 217] });
  paragrafo(limpo(entrega?.titulo, 'Entrega'), { tamanho: 19, estilo: 'bold', cor: [20, 20, 35] });
  y += 4;
  paragrafo(`Estudante: ${limpo(estudante.nome, 'Preencher antes do envio')}`, { tamanho: 10.5 });
  paragrafo(`Identificação (RA): ${limpo(estudante.identificacao, 'Preencher antes do envio')}`, { tamanho: 10.5 });
  const executada = dataBrasileira(trabalho?.executadaEm) || dataBrasileira(trabalho?.executadaNoColabEm);
  paragrafo(`Execução registrada em: ${executada || 'sem execução registrada'}`, { tamanho: 10.5 });

  // O link do notebook substitui anexar o .ipynb: o AVA só aceita Word ou PDF, então mandar o
  // arquivo do Colab junto seria um anexo que a plataforma da faculdade não recebe.
  const link = limpo(trabalho?.linkColab);
  if (link) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(90, 70, 170);
    const linhasLink = doc.splitTextToSize(`Notebook no Google Colab: ${link}`, UTIL);
    for (const linha of linhasLink) {
      espaco(15.2);
      doc.textWithLink(linha, MARGEM, y + 10.5, { url: link });
      y += 15.2;
    }
  }

  // Dizer de onde veio o trabalho é honestidade, não enfeite: o professor precisa saber que a
  // ferramenta é do próprio estudante e que o código foi escrito por ele.
  paragrafo(
    limpo(
      trabalho?.observacao,
      'Atividade desenvolvida e executada no PyCampus, plataforma de estudos criada pelo próprio estudante como apoio à disciplina. O código é de autoria do estudante.',
    ),
    { tamanho: 9.5, cor: [120, 120, 140] },
  );

  // O roteiro pede um print do código executado. A captura do estudante vem primeiro: é ela
  // que o professor procura. O código em texto vem logo abaixo, porque ele pode ser lido,
  // copiado e conferido — coisas que uma imagem não permite.
  const capturas = Array.isArray(trabalho?.capturas)
    ? trabalho.capturas.filter((item) => typeof item === 'string' && item.startsWith('data:image/'))
    : [];
  const desenharImagem = (imagem, alturaMaxima = ALTURA - MARGEM * 2 - 40) => {
    let largura = UTIL;
    let altura = UTIL * 0.6;
    try {
      const propriedades = doc.getImageProperties(imagem);
      altura = (propriedades.height / propriedades.width) * UTIL;
      if (altura > alturaMaxima) {
        altura = alturaMaxima;
        largura = (propriedades.width / propriedades.height) * altura;
      }
    } catch {
      // Uma imagem que o leitor não consegue medir ainda pode ser desenhada no tamanho padrão.
    }
    espaco(altura + 12);
    doc.addImage(imagem, MARGEM, y, largura, altura);
    y += altura + 12;
  };

  if (capturas.length) {
    titulo(capturas.length === 1 ? 'Print do código executado' : 'Prints do código executado');
    for (const captura of capturas) desenharImagem(captura);
  }

  titulo('Código executado');
  bloco(trabalho?.codigo, 'Nenhum código foi salvo nesta entrega.');

  titulo('Saída da execução');
  const saida = entrega?.ambienteEntrega === 'colab'
    ? limpo(trabalho?.saidaExterna)
    : limpo(trabalho?.saida);
  bloco(saida, 'O programa ainda não foi executado.');
  if (entrega?.ambienteEntrega === 'colab') {
    paragrafo('Saída observada na execução do Google Colab, onde o TensorFlow está disponível.', { tamanho: 9, cor: [120, 120, 140] });
  }

  const imagens = Array.isArray(trabalho?.imagens) ? trabalho.imagens.filter((item) => typeof item === 'string' && item.startsWith('data:image/')) : [];
  if (imagens.length) {
    titulo(imagens.length === 1 ? 'Gráfico gerado' : 'Gráficos gerados');
    for (const imagem of imagens) desenharImagem(imagem);
  }

  titulo('Explicação da lógica');
  paragrafo(limpo(trabalho?.logica, 'Escreva no PyCampus, na fase Explicar, como o programa resolve o problema.'));

  titulo('Casos testados');
  paragrafo(limpo(trabalho?.testes, 'Registre no PyCampus quais entradas você testou e o que observou.'));

  if (limpo(trabalho?.insights)) {
    titulo('Insights da análise');
    paragrafo(trabalho.insights);
  }

  titulo('Conclusão');
  paragrafo(limpo(trabalho?.conclusao, 'Escreva sua conclusão no PyCampus antes de enviar.'));

  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 165);
    doc.text(`${limpo(entrega?.titulo, 'Entrega')} · página ${pagina} de ${paginas}`, MARGEM, ALTURA - 24);
  }

  return doc.output('blob');
}
