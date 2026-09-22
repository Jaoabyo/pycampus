import { useEffect, useMemo, useState } from 'react';
import { Icon, Progress, irAoTopo } from './ui.jsx';
import CodeEditor from './CodeEditor.jsx';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { localDate } from './progress.js';
import { aulasDaFaculdade, PRAZO_TRABALHO, emNumeros } from './faculdade.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import {
  entregaDaFaculdade,
  entregaLiberadaParaExportacao,
  entregaProntaParaExportar,
  capturasValidas,
  normalizarTrabalhoDaEntrega,
  requisitosFaltandoDaEntrega,
  situacaoDosPreRequisitos,
} from './faculdade-entregas.js';
import {
  criarNotebookColab,
  criarRelatorioHtml,
  nomeDoArquivoDaEntrega,
} from './faculdade-exportacao.js';
import {
  conferenciasDoPasso,
  lerConferencias,
  programaComConferencias,
  situacaoDasConferencias,
} from './faculdade-conferencias.js';
import './faculdade-entrega.css';
import { exemploDaEntrega } from './faculdade-exemplos.js';
import { XP_FACULDADE, bonusDaEntrega } from './faculdade-recompensas.js';

const FASES = [
  { id: 'entender', titulo: 'Entender', icone: 'BookOpenCheck' },
  { id: 'construir', titulo: 'Construir', icone: 'Code2' },
  { id: 'testar', titulo: 'Testar', icone: 'FlaskConical' },
  { id: 'explicar', titulo: 'Explicar', icone: 'Brain' },
  { id: 'exportar', titulo: 'Exportar', icone: 'Download' },
];

const nomeDoPreRequisito = (id) =>
  [...aulasDaFaculdade, ...projetosDaFaculdade].find((item) => item.id === id)?.titulo || id;

const primeiroPassoPendente = (entrega, trabalho) => {
  const concluidos = new Set(trabalho.passosConcluidos);
  const indice = entrega.passos.findIndex(({ id }) => !concluidos.has(id));
  return indice < 0 ? entrega.passos.length - 1 : indice;
};

const podeConcluirPasso = (passo, entrega, trabalho, conferencias = null) => {
  if (trabalho.passosConcluidos.includes(passo.id)) return { ok: true, motivo: '' };
  if (passo.fase === 'entender') return { ok: true, motivo: '' };
  if (passo.fase === 'construir') {
    const mudou = trabalho.codigo.trim().length > 30 && trabalho.codigo.trim() !== entrega.codigoInicial.trim();
    if (!mudou) return { ok: false, motivo: 'Escreva ou adapte o código antes de concluir este passo.' };
    // Código escrito não é código que funciona. Quando este passo tem conferência, ela precisa
    // ter passado: marcar "construído" com a média errada foi exatamente o que levou um
    // estudante a concluir quatro passos em cima de um acumulador quebrado.
    const doPasso = conferenciasDoPasso(entrega, passo.id);
    if (!doPasso.length) return { ok: true, motivo: '' };
    if (!Array.isArray(conferencias)) {
      return { ok: false, motivo: 'Execute o código: este passo é confirmado pelo resultado, não pela escrita.' };
    }
    const ids = new Set(doPasso.map(({ id }) => id));
    const falhas = conferencias.filter(({ id, ok }) => ids.has(id) && !ok);
    if (falhas.length) {
      return { ok: false, motivo: `Ainda não confere: ${falhas[0].descricao}. Veja o detalhe abaixo da saída.` };
    }
    const conferidos = conferencias.filter(({ id }) => ids.has(id));
    if (!conferidos.length) {
      return { ok: false, motivo: 'Execute o código de novo para conferir este passo.' };
    }
    return { ok: true, motivo: '' };
  }
  if (passo.fase === 'testar') {
    const temSaida = trabalho.saida.trim().length > 0;
    const descreveu = trabalho.testes.trim().length >= 30;
    return { ok: temSaida && descreveu, motivo: 'Execute a prática e registre quais casos você testou.' };
  }
  if (passo.fase === 'explicar') {
    const explicou = trabalho.logica.trim().length >= 60 && trabalho.conclusao.trim().length >= 30;
    const temInsights = entrega.unidade !== 'u3' || trabalho.insights.trim().length >= 100;
    return { ok: explicou && temInsights, motivo: 'Complete a explicação, a conclusão e, na U3, os três insights.' };
  }
  const pronta = entregaProntaParaExportar(entrega, trabalho);
  return { ok: pronta, motivo: 'Conclua os itens pendentes do checklist antes de exportar.' };
};

export default function FaculdadeEntrega({ entregaId, state, update, navigate, download }) {
  const entrega = entregaDaFaculdade(entregaId);
  const salvo = entrega ? state.faculdade?.entregas?.[entrega.id] : null;
  const trabalho = useMemo(() => {
    if (!entrega) return null;
    const inicial = salvo && Object.hasOwn(salvo, 'codigo')
      ? salvo
      : { ...salvo, codigo: entrega.codigoInicial };
    return normalizarTrabalhoDaEntrega(inicial, entrega);
  }, [entrega, salvo]);
  const [passoIndice, setPassoIndice] = useState(() => entrega && trabalho
    ? primeiroPassoPendente(entrega, trabalho)
    : 0);
  const [mensagem, setMensagem] = useState('');
  const [celebrar, setCelebrar] = useState(0);
  // null = ainda não houve execução conferida nesta sessão. Diferente de lista vazia, que
  // significaria "conferi e não achei nada" — aqui o certo é não afirmar nada.
  const [conferencias, setConferencias] = useState(null);
  // O exemplo é editável: trocar um valor e ver o efeito é o que o passo pede.
  const [exemploEditavel, setExemploEditavel] = useState('');

  useEffect(() => {
    if (!entrega || !trabalho) return;
    setPassoIndice(primeiroPassoPendente(entrega, trabalho));
    setMensagem('');
  }, [entregaId]);

  const python = usePython({
    source: 'playground',
    title: entrega ? `Entrega · ${entrega.titulo}` : 'Entrega da faculdade',
    onRecord: (tentativa) => update((atual) => appendAttempt(atual, tentativa)),
  });
  const praticaPython = usePython({
    source: 'playground',
    title: entrega ? `Preparação · ${entrega.titulo}` : 'Preparação da faculdade',
    expected: entrega?.praticaLocal?.esperado,
    onRecord: (tentativa) => update((atual) => appendAttempt(atual, tentativa)),
  });
  // Os passos de "Entender" mandam prever a saída, executar e trocar um valor — e o editor só
  // existia nas fases Construir e Testar. A instrução era impossível de cumprir na tela em que
  // aparecia. Aqui o exemplo pequeno roda de verdade, que é o que ela sempre pediu.
  const exemploPython = usePython({
    source: 'playground',
    title: entrega ? `Exemplo · ${entrega.titulo}` : 'Exemplo da faculdade',
  });

  // Trocar de passo recarrega o exemplo daquele passo: o estudante volta a ver o original, e
  // o que ele experimentou no passo anterior não vaza para o seguinte.
  const exemploPreparado = entrega && exemploDaEntrega(entrega, entrega.passos[passoIndice]);
  const exemploDoPasso = exemploPreparado?.codigo || '';
  useEffect(() => {
    setExemploEditavel(exemploDoPasso);
    exemploPython.reset();
  }, [exemploDoPasso]);

  if (!entrega || !trabalho) {
    return (
      <section className="faculdade-entrega-vazia card">
        <Icon name="TriangleAlert" size={28} aria-hidden="true" />
        <h1>Entrega não encontrada</h1>
        <p>Volte à faculdade e escolha uma das quatro atividades oficiais.</p>
        <button className="button primary" onClick={() => navigate('faculdade')}>Voltar para Minha faculdade</button>
      </section>
    );
  }

  const salvar = (mudancas) => update((atual) => {
    const existente = normalizarTrabalhoDaEntrega(
      atual.faculdade?.entregas?.[entrega.id] || { codigo: entrega.codigoInicial },
      entrega,
    );
    const proximo = normalizarTrabalhoDaEntrega({ ...existente, ...mudancas }, entrega);
    return {
      ...atual,
      faculdade: {
        ...atual.faculdade,
        entregas: { ...atual.faculdade?.entregas, [entrega.id]: proximo },
      },
    };
  });

  // Executar não é aprovar. O programa roda junto das conferências da entrega, que chamam o
  // que o estudante escreveu com valores conhecidos: sem isso, um código que devolve 2.25 onde
  // a média é 7.5 terminava com "Deu certo!" só por não ter levantado exceção.
  const executar = () => {
    setMensagem('');
    setConferencias(null);
    python.run(programaComConferencias(trabalho.codigo, entrega.conferencias), '', (resultado) => {
      const { saida, resultados } = lerConferencias(resultado.output);
      setConferencias(resultados);
      if (!resultado.ok) {
        setMensagem('A execução parou. Leia a última linha da saída, corrija uma causa por vez e tente novamente.');
        return;
      }
      salvar({ saida, executadaEm: localDate(), imagens: resultado.imagens || [] });
      if (situacaoDasConferencias(resultados) === 'reprovada') {
        setMensagem('O programa rodou, mas o resultado não confere. Leia abaixo o que foi observado e compare com o que deveria sair.');
        return;
      }
      setCelebrar((valor) => valor + 1);
      setMensagem('Execução conferida. Agora descreva o caso testado para transformar resultado em aprendizado.');
    });
  };

  const executarPraticaLocal = () => {
    setMensagem('');
    praticaPython.run(entrega.praticaLocal.codigo, '', (resultado) => {
      if (resultado.ok) {
        salvar({ saida: resultado.output, executadaEm: localDate() });
        setMensagem('Prática local concluída. Ela ensina o pipeline; a rede TensorFlow ainda precisa ser executada no Colab.');
      }
    });
  };

  const passoAtual = entrega.passos[passoIndice];
  // Um exemplo só vira laboratório quando é Python de verdade. Alguns passos de exportar
  // trazem uma frase no lugar do código ("Execute tudo novamente antes de exportar"), e um
  // botão Executar ali só produziria erro de sintaxe.
  // Só nos passos de Entender: em Construir e Testar o editor principal já é o lugar de
  // experimentar, e dois editores na mesma tela dividiriam a atenção sem motivo.
  const ehExemploExecutavel = exemploPreparado?.ambiente === 'pycampus';
  const concluidos = new Set(trabalho.passosConcluidos);
  const preRequisitos = situacaoDosPreRequisitos(entrega, state);
  const preRequisitosPendentes = preRequisitos.filter(({ concluido }) => !concluido);
  // A identificação não é burocracia: é por ela que o professor sabe de quem é o trabalho. Um
  // arquivo gerado sem ela sai com "Preencher antes do envio" impresso no lugar do nome — um
  // recado do sistema virando conteúdo do trabalho entregue. Por isso ela trava a exportação.
  const nomeDoEstudante = state.name === 'Estudante' ? '' : String(state.name || '').trim();
  const identificado = nomeDoEstudante.length >= 3 && String(state.registroAcademico || '').trim().length >= 3;
  const podeExportar = entregaLiberadaParaExportacao(entrega, trabalho, state) && identificado;
  const faltando = requisitosFaltandoDaEntrega(entrega, trabalho);
  const progresso = (trabalho.passosConcluidos.length / entrega.passos.length) * 100;
  const faseAtual = passoAtual.fase;
  const passosDaFase = entrega.passos.filter(({ fase }) => fase === faseAtual);

  const abrirFase = (fase) => {
    const indice = entrega.passos.findIndex((passo) => passo.fase === fase
      && !concluidos.has(passo.id));
    setPassoIndice(indice >= 0 ? indice : entrega.passos.findIndex((passo) => passo.fase === fase));
    setMensagem('');
    irAoTopo();
  };

  const concluirPasso = () => {
    if (passoAtual.fase !== 'entender' && preRequisitosPendentes.length) {
      setMensagem(`Conclua primeiro ${preRequisitosPendentes.length === 1 ? 'a aula-base pendente' : `as ${preRequisitosPendentes.length} aulas-base pendentes`}. Os atalhos estão no quadro “Antes de começar”.`);
      return;
    }
    const evidencia = podeConcluirPasso(passoAtual, entrega, trabalho, conferencias);
    if (!evidencia.ok) {
      setMensagem(evidencia.motivo);
      return;
    }
    const hoje = localDate();
    update((atual) => {
      const existente = normalizarTrabalhoDaEntrega(
        atual.faculdade?.entregas?.[entrega.id] || { codigo: entrega.codigoInicial },
        entrega,
      );
      const passosConcluidos = [...new Set([...existente.passosConcluidos, passoAtual.id])];
      const trabalhoAtualizado = normalizarTrabalhoDaEntrega({
        ...existente,
        passosConcluidos,
        concluidaEm: passoAtual.fase === 'exportar' ? hoje : existente.concluidaEm,
      }, entrega);
      const atividade = `faculdade-entrega:${entrega.id}:${passoAtual.id}`;
      return {
        ...atual,
        faculdade: {
          ...atual.faculdade,
          entregas: { ...atual.faculdade?.entregas, [entrega.id]: trabalhoAtualizado },
        },
        activities: {
          ...atual.activities,
          [hoje]: [...new Set([...(atual.activities?.[hoje] || []), atividade])],
        },
      };
    });
    const proximo = Math.min(entrega.passos.length - 1, passoIndice + 1);
    setPassoIndice(proximo);
    // O passo não abre celebração (seriam até treze por entrega), então o XP dele precisa
    // aparecer aqui — senão ele entraria na conta sem o estudante ver de onde veio.
    const jaContava = trabalho.passosConcluidos.includes(passoAtual.id);
    const ganho = jaContava ? '' : ` +${XP_FACULDADE.passo} XP.`;
    setMensagem(passoAtual.fase === 'exportar'
      ? `Entrega conferida.${ganho} Abra os arquivos e revise antes de enviar manualmente ao AVA.`
      : `Passo registrado.${ganho} Continue para a próxima ideia quando estiver pronto.`);
    irAoTopo();
  };

  const baixarNotebook = () => {
    if (!podeExportar) {
      setMensagem('Conclua as aulas-base e os itens pendentes antes de exportar.');
      return;
    }
    download(
      criarNotebookColab({ entrega, trabalho, estudante: { nome: state.name, identificacao: state.registroAcademico } }),
      nomeDoArquivoDaEntrega(entrega, 'ipynb'),
      'application/x-ipynb+json',
    );
    setMensagem('Notebook baixado. Abra no Google Colab e execute todas as células em ordem.');
  };

  const baixarRascunho = () => {
    download(criarNotebookColab({ entrega, trabalho, estudante: { nome: state.name, identificacao: state.registroAcademico } }),
      `rascunho-${nomeDoArquivoDaEntrega(entrega, 'ipynb')}`, 'application/x-ipynb+json');
    setMensagem('Rascunho baixado. No Colab, escolha Arquivo → Fazer upload de notebook e execute as células. Volte para registrar os resultados; baixar o rascunho não conclui a entrega.');
  };

  // A captura fica guardada como data URL junto do trabalho, no navegador: o PyCampus não tem
  // servidor, e uma imagem que dependesse de arquivo no disco sumiria na hora de gerar o PDF.
  const anexarCapturas = async (evento) => {
    const arquivos = [...(evento.target.files || [])];
    evento.target.value = '';
    if (!arquivos.length) return;
    const lidas = await Promise.all(arquivos.map((arquivo) => new Promise((resolver) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(String(leitor.result || ''));
      leitor.onerror = () => resolver('');
      leitor.readAsDataURL(arquivo);
    })));
    const novas = capturasValidas([...trabalho.capturas, ...lidas.filter(Boolean)]);
    if (novas.length === trabalho.capturas.length) {
      setMensagem('Nenhuma imagem entrou. Use PNG ou JPEG de até 2 MB, no máximo três.');
      return;
    }
    salvar({ capturas: novas });
    setMensagem('Print anexado. Ele aparece na primeira página do PDF.');
  };

  const removerCaptura = (indice) => {
    salvar({ capturas: trabalho.capturas.filter((_, posicao) => posicao !== indice) });
  };

  // O AVA aceita .docx ou .pdf, então o arquivo já sai em PDF: mandar o estudante imprimir um
  // HTML transferia para ele a chance de errar a margem, perder o gráfico ou salvar em dois
  // arquivos na véspera da entrega.
  const baixarPdf = async () => {
    if (!podeExportar) {
      setMensagem('Conclua as aulas-base e os itens pendentes antes de exportar.');
      return;
    }
    setMensagem('Gerando o PDF…');
    try {
      const { criarRelatorioPdf, nomeDoPdf } = await import('./faculdade-pdf.js');
      const blob = await criarRelatorioPdf({ entrega, trabalho, estudante: { nome: state.name, identificacao: state.registroAcademico } });
      const url = URL.createObjectURL(blob);
      const ancora = document.createElement('a');
      ancora.href = url;
      ancora.download = nomeDoPdf(entrega);
      // O PDF é montado depois de um await, então o clique já não está na mesma interação do
      // estudante. Um link solto na memória pode ser ignorado nessa situação; anexado ao
      // documento, o download acontece.
      ancora.style.display = 'none';
      document.body.appendChild(ancora);
      ancora.click();
      ancora.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      const mb = (blob.size / (1024 * 1024)).toFixed(2);
      setMensagem(`PDF salvo com ${mb} MB — o AVA aceita até 10 MB. Abra o arquivo e confira antes de enviar.`);
    } catch {
      setMensagem('Não consegui gerar o PDF aqui. Use "Abrir relatório" e salve com Ctrl+P → Salvar como PDF.');
    }
  };

  const abrirRelatorio = () => {
    if (!podeExportar) {
      setMensagem('Conclua as aulas-base e os itens pendentes antes de exportar.');
      return;
    }
    const html = criarRelatorioHtml({ entrega, trabalho, estudante: { nome: state.name, identificacao: state.registroAcademico } });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const janela = window.open(url, '_blank');
    if (janela) janela.opener = null;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setMensagem(janela
      ? 'Relatório aberto. Revise e use “Imprimir / salvar como PDF”.'
      : 'O navegador bloqueou a nova aba. Libere pop-ups para abrir o relatório imprimível.');
  };

  return (
    <div className="faculdade-entrega">
      <button className="text-button entrega-voltar" onClick={() => navigate('faculdade')}>
        <Icon name="ArrowLeft" size={17} aria-hidden="true" /> Voltar para Minha faculdade
      </button>

      <header className="entrega-hero">
        <div className="entrega-hero-copy">
          <div className="eyebrow">UNIDADE {entrega.unidade.slice(1)} · ENTREGA PRÁTICA</div>
          <h1>{entrega.titulo}</h1>
          <p>{entrega.resumo}</p>
          <p>+{XP_FACULDADE.passo} XP por passo · +{bonusDaEntrega(entrega)} XP ao concluir a entrega</p>
          <div className="entrega-meta">
            <span><Icon name="Clock3" size={16} aria-hidden="true" /> {entrega.minutos} min em blocos</span>
            <span><Icon name="CalendarDays" size={16} aria-hidden="true" /> Prazo {emNumeros(PRAZO_TRABALHO)}</span>
            <span><Icon name={entrega.ambienteEntrega === 'colab' ? 'Globe' : 'SquareTerminal'} size={16} aria-hidden="true" /> Final em {entrega.ambienteEntrega === 'colab' ? 'Google Colab' : 'PyCampus + Colab'}</span>
          </div>
        </div>
        <div className="entrega-progresso" aria-label={`${trabalho.passosConcluidos.length} de ${entrega.passos.length} passos concluídos`}>
          <strong>{trabalho.passosConcluidos.length}<span>/{entrega.passos.length}</span></strong>
          <small>passos concluídos</small>
          <Progress value={progresso} label="Progresso da entrega" />
        </div>
      </header>

      <nav className="entrega-fases" aria-label="Fases da entrega">
        {FASES.map((fase) => {
          const passos = entrega.passos.filter((passo) => passo.fase === fase.id);
          const completos = passos.filter((passo) => concluidos.has(passo.id)).length;
          return (
            <button
              key={fase.id}
              className={faseAtual === fase.id ? 'ativa' : ''}
              aria-current={faseAtual === fase.id ? 'step' : undefined}
              onClick={() => abrirFase(fase.id)}
            >
              <Icon name={completos === passos.length ? 'CheckCircle2' : fase.icone} size={19} aria-hidden="true" />
              <span>{fase.titulo}<small>{completos}/{passos.length}</small></span>
            </button>
          );
        })}
      </nav>

      <div className="entrega-layout">
        <main className="entrega-conteudo">
          <section className="entrega-orientacao card">
            <div className="entrega-passo-topo">
              <div>
                <div className="eyebrow">{FASES.find(({ id }) => id === faseAtual).titulo.toUpperCase()} · PASSO {passoIndice + 1} DE {entrega.passos.length}</div>
                <h2>{passoAtual.titulo}</h2>
              </div>
              <span className={concluidos.has(passoAtual.id) ? 'entrega-status feito' : 'entrega-status'}>
                <Icon name={concluidos.has(passoAtual.id) ? 'Check' : 'Circle'} size={15} aria-hidden="true" />
                {concluidos.has(passoAtual.id) ? 'Concluído' : 'Em estudo'}
              </span>
            </div>
            <p className="entrega-explicacao">{passoAtual.explicacao}</p>
            {ehExemploExecutavel ? (
              <div className="entrega-exemplo-vivo">
                <div className="entrega-exemplo-titulo">
                  <Icon name="Lightbulb" size={17} aria-hidden="true" /> Exemplo pequeno
                  <small>Preveja a saída antes de executar</small>
                </div>
                <p className="small">O editor inclui a preparação necessária. Execute, altere um valor e compare a saída. As primeiras linhas retomam os conceitos dos passos anteriores.</p>
                {exemploPreparado.preparacao && <p><strong>Como ler este exemplo: </strong>{exemploPreparado.preparacao}</p>}
                <CodeEditor
                  key={passoAtual.id}
                  code={exemploEditavel}
                  onChange={setExemploEditavel}
                  busy={exemploPython.busy}
                  onRun={() => exemploPython.run(exemploEditavel, '')}
                  onStop={exemploPython.stop}
                  output={exemploPython.output}
                  imagens={exemploPython.imagens}
                  success={exemploPython.success}
                  filename="exemplo.py"
                  runLabel="Executar o exemplo"
                  emptyOutput="Preveja o que vai aparecer e clique em Executar o exemplo."
                />
              </div>
            ) : (
              <div className="entrega-exemplo">
                <div><Icon name="Lightbulb" size={17} aria-hidden="true" /> Exemplo pequeno</div>
                <pre>{passoAtual.exemplo}</pre>
              </div>
            )}
            {exemploPreparado?.ambiente === 'colab' && <p className="entrega-aviso">Este trecho pertence ao notebook no Google Colab e usa os dados preparados nas células anteriores. Na fase Construir, você pode baixar seu rascunho para executar lá e praticar o pipeline local aqui.</p>}
            <div className="entrega-evidencia">
              <Icon name="Target" size={18} aria-hidden="true" />
              <div><strong>Faça agora</strong><p>{passoAtual.evidencia}</p></div>
            </div>
            {passosDaFase.length > 1 && (
              <div className="entrega-subpassos" aria-label="Passos desta fase">
                {passosDaFase.map((passo) => {
                  const indice = entrega.passos.indexOf(passo);
                  return <button key={passo.id} className={indice === passoIndice ? 'ativo' : ''} onClick={() => setPassoIndice(indice)} aria-label={`Abrir ${passo.titulo}`}><span>{concluidos.has(passo.id) ? '✓' : indice + 1}</span>{passo.titulo}</button>;
                })}
              </div>
            )}
          </section>

          {(faseAtual === 'construir' || faseAtual === 'testar') && (
            <section className="entrega-editor card">
              <div className="entrega-section-head">
                <div><div className="eyebrow">SEU CÓDIGO</div><h2>Construa e confira</h2></div>
                {entrega.ambienteEntrega === 'colab' && <span className="pill orange">Execução final no Colab</span>}
              </div>
              {entrega.avisoAmbiente && <div className="entrega-aviso"><Icon name="Info" size={18} aria-hidden="true" /><p>{entrega.avisoAmbiente}</p></div>}
              {entrega.ambienteEntrega === 'colab' && <div className="entrega-colab-rascunho"><p>Escreva seu código abaixo. Para testar no Colab, baixe o rascunho e use <strong>Arquivo → Fazer upload de notebook</strong>. Execute as células de cima para baixo e volte à fase Testar para registrar a saída.</p><button className="button outline" onClick={baixarRascunho}><Icon name="Download" size={17} aria-hidden="true" /> Baixar rascunho para o Colab</button></div>}
              {entrega.contrato && (
                <div className="entrega-contrato">
                  <Icon name="CheckCheck" size={18} aria-hidden="true" />
                  <div>
                    <strong>O que o seu código precisa fazer</strong>
                    <p>{entrega.contrato}</p>
                  </div>
                </div>
              )}
              <CodeEditor
                code={trabalho.codigo}
                onChange={(codigoAtualizado) => { salvar({ codigo: codigoAtualizado }); setConferencias(null); }}
                busy={python.busy}
                onRun={executar}
                onStop={python.stop}
                output={python.output || trabalho.saida}
                imagens={python.imagens?.length ? python.imagens : trabalho.imagens}
                success={python.success}
                celebrate={celebrar && situacaoDasConferencias(conferencias) !== 'reprovada' ? celebrar : 0}
                inputRequest={python.inputRequest}
                onReply={python.reply}
                filename={`${entrega.id}.py`}
                runDisabled={entrega.ambienteEntrega === 'colab'}
                runLabel={entrega.ambienteEntrega === 'colab' ? 'Execute no Colab' : 'Executar código'}
                emptyOutput="Execute o código para registrar uma saída real."
              />
              {Array.isArray(conferencias) && conferencias.length > 0 && (
                <div
                  className={`entrega-conferencias ${situacaoDasConferencias(conferencias) === 'aprovada' ? 'aprovada' : 'reprovada'}`}
                  role="status"
                >
                  <div className="entrega-section-head">
                    <div>
                      <div className="eyebrow">CONFERÊNCIA DO RESULTADO</div>
                      <h3>
                        {conferencias.filter(({ ok }) => ok).length} de {conferencias.length} conferem
                      </h3>
                    </div>
                  </div>
                  <p className="small">
                    Cada item chama o seu código com valores conhecidos. Executar sem erro não
                    prova que a conta está certa — isto prova.
                  </p>
                  <ul>
                    {conferencias.map(({ id, descricao, ok, detalhe }) => (
                      <li key={id} className={ok ? 'confere' : 'falha'}>
                        <Icon name={ok ? 'CheckCircle2' : 'TriangleAlert'} size={17} aria-hidden="true" />
                        <div>
                          <strong>{descricao}</strong>
                          {detalhe && <span>{detalhe}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entrega.praticaLocal && (
                <div className="entrega-pratica-local">
                  <div className="entrega-section-head"><div><div className="eyebrow">PRÁTICA EXECUTÁVEL</div><h3>Treine o pipeline aqui</h3></div></div>
                  <p>{entrega.praticaLocal.aviso}</p>
                  <CodeEditor
                    code={entrega.praticaLocal.codigo}
                    readOnly
                    busy={praticaPython.busy}
                    onRun={executarPraticaLocal}
                    onStop={praticaPython.stop}
                    output={praticaPython.output || trabalho.saida}
                    success={praticaPython.success}
                    filename="u4-pipeline-local.py"
                    runLabel="Executar prática local"
                    emptyOutput="Execute para observar treino, teste e acurácia sem fingir uma rede neural."
                  />
                </div>
              )}
            </section>
          )}

          {(faseAtual === 'testar' || faseAtual === 'explicar' || faseAtual === 'exportar') && (
            <section className="entrega-caderno card">
              <div className="entrega-section-head"><div><div className="eyebrow">CADERNO DO ESTUDANTE</div><h2>Registre o que você comprovou</h2></div></div>
              <label className="entrega-campo">
                <span>Casos testados</span>
                <small>Quais entradas usou, qual resultado esperava e o que observou?</small>
                <textarea value={trabalho.testes} maxLength={4000} onChange={(evento) => salvar({ testes: evento.target.value })} />
              </label>
              <label className="entrega-campo">
                <span>Explique a lógica com suas palavras</span>
                <small>Descreva entrada, processamento e saída. Evite apenas repetir as linhas.</small>
                <textarea value={trabalho.logica} maxLength={4000} onChange={(evento) => salvar({ logica: evento.target.value })} />
              </label>
              {entrega.unidade === 'u3' && <label className="entrega-campo"><span>Três insights da análise</span><small>Para cada um: evidência numérica → interpretação → ação sugerida.</small><textarea value={trabalho.insights} maxLength={4000} onChange={(evento) => salvar({ insights: evento.target.value })} /></label>}
              {entrega.ambienteEntrega === 'colab' && (
                <div className="entrega-colab-registro">
                  <label className="entrega-campo"><span>Saída real observada no Colab</span><small>Cole a acurácia e as predições exibidas pela execução.</small><textarea value={trabalho.saidaExterna} maxLength={12000} onChange={(evento) => salvar({ saidaExterna: evento.target.value })} /></label>
                  <label className="entrega-campo data"><span>Data da execução no Colab</span><input type="date" max={PRAZO_TRABALHO} value={trabalho.executadaNoColabEm} onChange={(evento) => salvar({ executadaNoColabEm: evento.target.value })} /></label>
                </div>
              )}
              <label className="entrega-campo">
                <span>Conclusão</span>
                <small>O que os testes permitem concluir e qual limitação ainda existe?</small>
                <textarea value={trabalho.conclusao} maxLength={4000} onChange={(evento) => salvar({ conclusao: evento.target.value })} />
              </label>
            </section>
          )}

          {faseAtual === 'exportar' && (
            <section className="entrega-exportar card">
              <div className="entrega-section-head"><div><div className="eyebrow">ARQUIVOS DA ENTREGA</div><h2>Revise antes de enviar ao AVA</h2></div></div>
              <p>O PyCampus prepara os arquivos, mas não envia por você. Abra cada um, execute o notebook no Colab e confira se o PDF ficou abaixo de 10 MB.</p>
              {/* O roteiro pede "um print do código executado pelo menos uma vez". O PyCampus
                  não fotografa a tela do estudante, então ele anexa a própria captura. */}
              <div className="entrega-capturas">
                <div className="entrega-section-head">
                  <div>
                    <div className="eyebrow">PRINT EXIGIDO PELO ROTEIRO</div>
                    <h3>Anexe a captura do código executado</h3>
                  </div>
                </div>
                <p className="small">
                  No Windows, use <strong>Win + Shift + S</strong>, recorte a área com o código e a
                  saída, e escolha o arquivo aqui. Ele entra na primeira página do PDF.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  aria-label="Anexar print do código executado"
                  onChange={anexarCapturas}
                />
                {trabalho.capturas.length > 0 && (
                  <div className="entrega-capturas-lista">
                    {trabalho.capturas.map((captura, indice) => (
                      <figure key={captura.slice(-32)}>
                        <img src={captura} alt={`Print anexado ${indice + 1}`} />
                        <figcaption>
                          <button type="button" onClick={() => removerCaptura(indice)}>
                            <Icon name="Trash2" size={14} aria-hidden="true" /> Remover
                          </button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                {trabalho.capturas.length === 0 && (
                  <div className="entrega-aviso">
                    <Icon name="TriangleAlert" size={18} aria-hidden="true" />
                    <p>
                      Sem o print, o PDF sai com o código em texto — o que o roteiro pede é uma
                      captura de tela da execução.
                    </p>
                  </div>
                )}
              </div>
              {/* O nome e o RA vão impressos no arquivo que o professor recebe. Ficavam como
                  "Preencher antes do envio", o que sairia assim no PDF entregue. */}
              <div className="entrega-identificacao">
                <label className="entrega-campo">
                  <span>Seu nome completo</span>
                  <small>Aparece no topo do PDF e do notebook.</small>
                  <input
                    type="text"
                    maxLength={60}
                    value={state.name === 'Estudante' ? '' : state.name}
                    placeholder="Como está na matrícula"
                    onChange={(evento) => update((atual) => ({ ...atual, name: evento.target.value || 'Estudante' }))}
                  />
                </label>
                <label className="entrega-campo">
                  <span>Identificação (RA)</span>
                  <small>Fica salvo e vale para as quatro entregas.</small>
                  <input
                    type="text"
                    maxLength={40}
                    value={state.registroAcademico || ''}
                    placeholder="Seu registro acadêmico"
                    onChange={(evento) => update((atual) => ({ ...atual, registroAcademico: evento.target.value }))}
                  />
                </label>
                <label className="entrega-campo">
                  <span>Link do notebook no Colab</span>
                  <small>Vira um link clicável no PDF. O AVA só aceita Word ou PDF, então o .ipynb não vai anexo.</small>
                  <input
                    type="url"
                    maxLength={400}
                    value={trabalho.linkColab || ''}
                    placeholder="https://colab.research.google.com/drive/..."
                    onChange={(evento) => salvar({ linkColab: evento.target.value })}
                  />
                </label>
              </div>
              <label className="entrega-campo">
                <span>Observação impressa no PDF</span>
                <small>Deixe vazio para usar a frase padrão, que declara que a plataforma é sua e o código é de sua autoria.</small>
                <textarea
                  maxLength={600}
                  rows={2}
                  value={trabalho.observacao || ''}
                  placeholder="Atividade desenvolvida e executada no PyCampus, plataforma de estudos criada pelo próprio estudante como apoio à disciplina. O código é de autoria do estudante."
                  onChange={(evento) => salvar({ observacao: evento.target.value })}
                />
              </label>
              {trabalho.linkColab && !/^https:\/\/(colab\.research\.google\.com|drive\.google\.com)/.test(trabalho.linkColab) && (
                <div className="entrega-aviso">
                  <Icon name="Info" size={18} aria-hidden="true" />
                  <p>Este endereço não parece ser do Google Colab. Confira antes de gerar o PDF.</p>
                </div>
              )}
              {!identificado && (
                <div className="entrega-aviso">
                  <Icon name="TriangleAlert" size={18} aria-hidden="true" />
                  <p>
                    Preencha <strong>{nomeDoEstudante.length >= 3 ? 'a identificação (RA)' : 'o nome e a identificação (RA)'}</strong>{' '}
                    nos campos logo acima para liberar o download. Sem eles o arquivo sairia com
                    “Preencher antes do envio” impresso no lugar da sua identificação — e é por
                    ela que o professor sabe de quem é o trabalho.
                  </p>
                </div>
              )}
              <div className="entrega-arquivos">
                <button className="entrega-arquivo" disabled={!podeExportar} onClick={baixarNotebook}><Icon name="Download" size={22} aria-hidden="true" /><span><strong>Baixar notebook</strong><small>Arquivo .ipynb para Google Colab</small></span></button>
                <button className="entrega-arquivo principal" disabled={!podeExportar} onClick={baixarPdf}><Icon name="CheckCheck" size={22} aria-hidden="true" /><span><strong>Baixar PDF da entrega</strong><small>Pronto para enviar no AVA</small></span></button>
                <button className="entrega-arquivo" disabled={!podeExportar} onClick={abrirRelatorio}><Icon name="BookOpenCheck" size={22} aria-hidden="true" /><span><strong>Abrir relatório</strong><small>Versão para ler na tela</small></span></button>
              </div>
            </section>
          )}

          <div className="entrega-navegacao">
            <button className="button outline" disabled={passoIndice === 0} onClick={() => setPassoIndice((indice) => Math.max(0, indice - 1))}><Icon name="ChevronLeft" size={17} aria-hidden="true" /> Passo anterior</button>
            <button className="button primary" onClick={concluirPasso}>{concluidos.has(passoAtual.id) ? 'Continuar' : 'Registrar este passo'} <Icon name="ArrowRight" size={17} aria-hidden="true" /></button>
          </div>
          <p className="entrega-mensagem" aria-live="polite">{mensagem}</p>
        </main>

        <aside className="entrega-lateral">
          <section className="card entrega-preparo">
            <div className="eyebrow">ANTES DE COMEÇAR</div>
            <h2>O que você já precisa saber</h2>
            <ul>{preRequisitos.map(({ id, concluido }) => (
              <li key={id} className={concluido ? 'feito' : 'pendente'}>
                <Icon name={concluido ? 'CheckCircle2' : 'BookOpen'} size={16} aria-hidden="true" />
                <button type="button" onClick={() => navigate('faculdade', { facultyItem: id })}>
                  <span>{nomeDoPreRequisito(id)}</span>
                  <small>{concluido ? 'Estudada' : 'Abrir aula-base'}</small>
                </button>
              </li>
            ))}</ul>
          </section>
          <section className="card entrega-checklist">
            <div className="eyebrow">CHECKLIST REAL</div>
            <h2>{faltando.length ? `${faltando.length} itens pendentes` : 'Tudo conferido'}</h2>
            <ul>{entrega.criterios.map((criterio) => {
              const pendente = faltando.some(({ id }) => id === criterio.id);
              // "concluir os passos guiados" pendente sem dizer QUAL passo falta manda o
              // estudante procurar às cegas entre dez. O item passa a nomear o passo e a
              // levar até ele.
              const passosPendentes = criterio.id === 'passos-guiados' && pendente
                ? entrega.passos.filter(({ id, fase }) => fase !== 'exportar' && !concluidos.has(id))
                : [];
              return (
                <li key={criterio.id} className={pendente ? '' : 'feito'}>
                  <Icon name={pendente ? 'Circle' : 'CheckCircle2'} size={17} aria-hidden="true" />
                  <span>
                    {criterio.descricao}
                    {passosPendentes.length > 0 && (
                      <span className="entrega-pendentes">
                        {passosPendentes.map((passo) => (
                          <button
                            key={passo.id}
                            type="button"
                            onClick={() => { irAoTopo(); setPassoIndice(entrega.passos.indexOf(passo)); }}
                          >
                            {FASES.find(({ id }) => id === passo.fase)?.titulo}: {passo.titulo}
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}</ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
