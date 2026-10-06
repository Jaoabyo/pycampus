import { useEffect, useMemo, useState } from 'react';
import { Icon, irAoTopo } from './ui.jsx';
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
import NovidadesDoCodigo from './FaculdadeNovidades.jsx';
import FaculdadeDegraus from './FaculdadeDegraus.jsx';
import { ErrorHelp } from './RunFeedback.jsx';
import { degrausDaFaculdade } from './faculdade-degraus.js';
import { pontesDasEntregas } from './faculdade-pontes.js';
import './project-studio.css';
import './faculdade.css';
import './faculdade-entrega.css';
import { exemploDaEntrega } from './faculdade-exemplos.js';
import { XP_FACULDADE } from './faculdade-recompensas.js';

const FASES = [
  { id: 'entender', titulo: 'Entender', icone: 'BookOpenCheck', dica: 'Leia e experimente o exemplo.' },
  { id: 'construir', titulo: 'Construir', icone: 'Code2', dica: 'Escreva o código, um passo por vez.' },
  { id: 'testar', titulo: 'Testar', icone: 'FlaskConical', dica: 'Confira se o resultado está certo.' },
  { id: 'explicar', titulo: 'Explicar', icone: 'Brain', dica: 'Escreva com suas palavras.' },
  { id: 'exportar', titulo: 'Exportar', icone: 'Download', dica: 'Baixe o PDF e envie no AVA.' },
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
    // Código escrito não é código que funciona. Quando este passo tem conferência, ela precisa
    // ter passado: marcar "construído" com a média errada foi exatamente o que levou um
    // estudante a concluir quatro passos em cima de um acumulador quebrado. E quando há
    // conferência, ela basta: o Passo 1 da U3 é o código do roteiro rodado como está.
    const doPasso = conferenciasDoPasso(entrega, passo.id);
    if (!doPasso.length) {
      const mudou = trabalho.codigo.trim().length > 30 && trabalho.codigo.trim() !== entrega.codigoInicial.trim();
      return mudou ? { ok: true, motivo: '' } : { ok: false, motivo: 'Escreva ou adapte o código antes de concluir este passo.' };
    }
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
  // Enquanto o reforço não termina, a tela mostra só ele: reforço e trabalho juntos davam dois
  // editores e a entrega inteira na mesma página, e o estudante disse que era coisa demais.
  const reforco = entrega ? degrausDaFaculdade[entrega.id] : null;
  const [mostrarReforco, setMostrarReforco] = useState(() => Boolean(reforco
    && (state.faculdade?.degraus?.[entrega.id]?.feitos || 0) < reforco.degraus.length));
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
  // Só as conferências dos passos até o atual: quem está no cadastro não pode ver "reprovado"
  // por causa da busca, que ainda nem foi pedida.
  const atePassoAtual = (resultados) => (Array.isArray(resultados) ? resultados.filter(({ id }) => {
    const passoDaConferencia = (entrega.conferencias || []).find((item) => item.id === id)?.passo;
    const indice = entrega.passos.findIndex((item) => item.id === passoDaConferencia);
    return indice < 0 || indice <= passoIndice;
  }) : resultados);
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
      if (situacaoDasConferencias(atePassoAtual(resultados)) === 'reprovada') {
        setMensagem('O programa rodou, mas o resultado não confere. Leia abaixo o que foi observado e compare com o que deveria sair.');
        return;
      }
      setCelebrar((valor) => valor + 1);
      setMensagem(passoAtual.fase === 'testar'
        ? 'Conferido. Agora escreva abaixo o que você testou.'
        : 'Conferido. Clique em Registrar este passo para seguir.');
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
  const faseAtual = passoAtual.fase;

  const abrirFase = (fase) => {
    const indice = entrega.passos.findIndex((passo) => passo.fase === fase
      && !concluidos.has(passo.id));
    setPassoIndice(indice >= 0 ? indice : entrega.passos.findIndex((passo) => passo.fase === fase));
    setMensagem('');
    irAoTopo();
  };

  // O código salvo tem prioridade sobre o inicial, então quem começou antes de o código inicial
  // mudar nunca o via. Recomeçar devolve o código inicial e reabre os passos de construir em
  // diante, porque eles foram concluídos em cima do código que está sendo descartado.
  const recomecar = () => {
    if (!window.confirm('Trocar o seu código pelo código inicial? O que você escreveu aqui será apagado.')) return;
    salvar({
      codigo: entrega.codigoInicial,
      saida: '',
      imagens: [],
      passosConcluidos: trabalho.passosConcluidos.filter((id) => (
        entrega.passos.find((passo) => passo.id === id)?.fase === 'entender'
      )),
    });
    setConferencias(null);
    python.reset();
    setMensagem('');
    setPassoIndice(Math.max(0, entrega.passos.findIndex(({ fase }) => fase === 'construir')));
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

  // Mesmo formato da aula: título simples, barra de etapas e um cartão só com a tarefa em
  // cima. A versão anterior tinha banner, abas, três cartões e uma coluna lateral com oito
  // itens, e o estudante disse que não dava para entender nada.
  const faseInfo = FASES.find(({ id }) => id === faseAtual);
  const indiceDaFase = FASES.indexOf(faseInfo);
  const conferidas = atePassoAtual(conferencias);
  const temEditor = faseAtual === 'construir' || faseAtual === 'testar';

  return (
    <div className="faculdade-entrega">
      <button className="text-button entrega-voltar" onClick={() => navigate('faculdade')}>
        <Icon name="ArrowLeft" size={17} aria-hidden="true" /> Voltar para Minha faculdade
      </button>

      <div className="page-heading">
        <div>
          <div className="eyebrow">UNIDADE {entrega.unidade.slice(1)} · ENTREGA PRÁTICA</div>
          <h1>{entrega.titulo}</h1>
          <p className="entrega-contagem" aria-label={`${trabalho.passosConcluidos.length} de ${entrega.passos.length} passos concluídos`}>
            {trabalho.passosConcluidos.length} de {entrega.passos.length} passos feitos · prazo {emNumeros(PRAZO_TRABALHO)}
          </p>
        </div>
      </div>

      {reforco && mostrarReforco && (
        <section className="entrega-reforco">
          <FaculdadeDegraus aulaId={entrega.id} state={state} update={update} />
          <div className="button-row">
            <button className="button primary" onClick={() => { setMostrarReforco(false); irAoTopo(); }}>
              Ir para o trabalho <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </section>
      )}

      {!mostrarReforco && (<>
      <nav className="aula-etapas entrega-fases" aria-label="Fases da entrega">
        <p className="aula-etapas-onde">
          Etapa {indiceDaFase + 1} de {FASES.length}: <strong>{faseInfo.titulo}</strong> · {faseInfo.dica}
        </p>
        <ol>
          {FASES.map((fase, i) => {
            const passos = entrega.passos.filter((passo) => passo.fase === fase.id);
            const completa = passos.every((passo) => concluidos.has(passo.id));
            return (
              <li key={fase.id}>
                <button
                  type="button"
                  className={faseAtual === fase.id ? 'atual' : completa ? 'feita' : ''}
                  aria-current={faseAtual === fase.id ? 'step' : undefined}
                  onClick={() => abrirFase(fase.id)}
                >
                  <span>{completa && faseAtual !== fase.id ? <Icon name="Check" size={13} aria-hidden="true" /> : i + 1}</span>
                  {fase.titulo}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {preRequisitosPendentes.length > 0 && (
        <div className="entrega-aviso entrega-preparo">
          <Icon name="BookOpen" size={18} aria-hidden="true" />
          <div>
            <p>Antes deste trabalho, estude {preRequisitosPendentes.length === 1 ? 'esta aula' : 'estas aulas'}:</p>
            <ul>{preRequisitosPendentes.map(({ id }) => (
              <li key={id}>
                <button type="button" className="text-button" onClick={() => navigate('faculdade', { facultyItem: id })}>
                  <span>{nomeDoPreRequisito(id)}</span> <small>Abrir aula-base</small>
                </button>
              </li>
            ))}</ul>
          </div>
        </div>
      )}

      <main className="entrega-conteudo">
        <section className="card faculdade-passo entrega-orientacao">
          <div className="step-head">
            <span className="icon-tile orange">
              <Icon name={concluidos.has(passoAtual.id) ? 'Check' : faseInfo.icone} size={21} />
            </span>
            <div>
              <div className="eyebrow">PASSO {passoIndice + 1} DE {entrega.passos.length}{concluidos.has(passoAtual.id) ? ' · FEITO' : ''}</div>
              <h3>{passoAtual.titulo}</h3>
            </div>
          </div>
          <p className="coach-task">{passoAtual.evidencia}</p>
          <p className="entrega-explicacao">{passoAtual.explicacao}</p>
          <NovidadesDoCodigo pontes={pontesDasEntregas[passoAtual.id]} />
          {ehExemploExecutavel ? (
            <div className="entrega-exemplo-vivo">
              <div className="entrega-exemplo-titulo">
                <Icon name="Lightbulb" size={17} aria-hidden="true" /> Exemplo
                <small>Preveja a saída antes de executar</small>
              </div>
              {exemploPreparado.preparacao && <p>{exemploPreparado.preparacao}</p>}
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
          ) : faseAtual !== 'exportar' && !trabalho.codigo.includes(passoAtual.exemplo.trim()) && (
            <div className="entrega-exemplo">
              <div><Icon name="Lightbulb" size={17} aria-hidden="true" /> Exemplo</div>
              <pre>{passoAtual.exemplo}</pre>
            </div>
          )}
          {exemploPreparado?.ambiente === 'colab' && <p className="entrega-aviso">Este trecho roda no Google Colab, junto com as células anteriores.</p>}

          {temEditor && (
            <div className="entrega-editor">
              {entrega.avisoAmbiente && <div className="entrega-aviso"><Icon name="Info" size={18} aria-hidden="true" /><p>{entrega.avisoAmbiente}</p></div>}
              {entrega.ambienteEntrega === 'colab' && <div className="entrega-colab-rascunho"><p>Escreva aqui e teste no Colab: baixe o rascunho e use <strong>Arquivo → Fazer upload de notebook</strong>.</p><button className="button outline" onClick={baixarRascunho}><Icon name="Download" size={17} aria-hidden="true" /> Baixar rascunho para o Colab</button></div>}
              {entrega.contrato && (
                <details className="coach-expected">
                  <summary>O que o seu código precisa ter</summary>
                  <p>{entrega.contrato}</p>
                </details>
              )}
              <CodeEditor
                code={trabalho.codigo}
                onChange={(codigoAtualizado) => { salvar({ codigo: codigoAtualizado }); setConferencias(null); }}
                busy={python.busy}
                onRun={executar}
                onStop={python.stop}
                output={python.output ? lerConferencias(python.output).saida : trabalho.saida}
                imagens={python.imagens?.length ? python.imagens : trabalho.imagens}
                success={python.success}
                celebrate={celebrar && situacaoDasConferencias(conferidas) !== 'reprovada' ? celebrar : 0}
                inputRequest={python.inputRequest}
                onReply={python.reply}
                filename={`${entrega.id}.py`}
                runDisabled={entrega.ambienteEntrega === 'colab'}
                runLabel={entrega.ambienteEntrega === 'colab' ? 'Execute no Colab' : 'Executar código'}
                emptyOutput={python.success ? 'Rodou sem erro. Este código não tem print, por isso nada aparece aqui.' : 'Clique em Executar código para ver o resultado aqui.'}
              />
              {/* A entrega não tinha ajuda de erro: os 14 erros da biblioteca apareciam só como traceback. */}
              {python.success === false && <ErrorHelp output={lerConferencias(python.output).saida} code={trabalho.codigo} />}
              {Array.isArray(conferidas) && conferidas.length > 0 && (
                <div
                  className={`entrega-conferencias ${situacaoDasConferencias(conferidas) === 'aprovada' ? 'aprovada' : 'reprovada'}`}
                  role="status"
                >
                  <h3>{conferidas.filter(({ ok }) => ok).length} de {conferidas.length} conferem</h3>
                  <ul>
                    {conferidas.map(({ id, descricao, ok, detalhe }) => (
                      <li key={id} className={ok ? 'confere' : 'falha'}>
                        <Icon name={ok ? 'CheckCircle2' : 'TriangleAlert'} size={17} aria-hidden="true" />
                        <div>
                          <strong>{descricao}</strong>
                          {!ok && detalhe && <span>{detalhe}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {trabalho.codigo.trim() !== entrega.codigoInicial.trim() && (
                <button className="text-button entrega-recomecar" onClick={recomecar}>
                  <Icon name="RotateCcw" size={15} aria-hidden="true" /> Recomeçar do código inicial
                </button>
              )}
              {entrega.praticaLocal && (
                <div className="entrega-pratica-local">
                  <h3>Treine o pipeline aqui</h3>
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
            </div>
          )}

          {/* Cada fase mostra só o campo dela: antes, Testar, Explicar e Exportar mostravam
              os cinco campos do caderno juntos. */}
          {faseAtual === 'testar' && (
            <label className="entrega-campo">
              <span>O que você testou</span>
              <small>Quais testes escreveu e o que aconteceu ao executar de novo?</small>
              <textarea value={trabalho.testes} maxLength={4000} onChange={(evento) => salvar({ testes: evento.target.value })} />
            </label>
          )}
          {faseAtual === 'explicar' && (<>
            <label className="entrega-campo">
              <span>Explique a lógica com suas palavras</span>
              <small>O que entra, o que o código faz e o que sai.</small>
              <textarea value={trabalho.logica} maxLength={4000} onChange={(evento) => salvar({ logica: evento.target.value })} />
            </label>
            {entrega.unidade === 'u3' && <label className="entrega-campo"><span>Três insights</span><small>Para cada um: o número, o que ele quer dizer e uma sugestão para a empresa.</small><textarea value={trabalho.insights} maxLength={4000} onChange={(evento) => salvar({ insights: evento.target.value })} /></label>}
            {entrega.ambienteEntrega === 'colab' && (
              <div className="entrega-colab-registro">
                <label className="entrega-campo"><span>Saída do Colab</span><small>Cole a acurácia e as predições que apareceram.</small><textarea value={trabalho.saidaExterna} maxLength={12000} onChange={(evento) => salvar({ saidaExterna: evento.target.value })} /></label>
                <label className="entrega-campo data"><span>Data da execução no Colab</span><input type="date" max={PRAZO_TRABALHO} value={trabalho.executadaNoColabEm} onChange={(evento) => salvar({ executadaNoColabEm: evento.target.value })} /></label>
              </div>
            )}
            <label className="entrega-campo">
              <span>Conclusão</span>
              <small>O que deu para concluir e o que ainda tem limite?</small>
              <textarea value={trabalho.conclusao} maxLength={4000} onChange={(evento) => salvar({ conclusao: evento.target.value })} />
            </label>
          </>)}

          {faseAtual === 'exportar' && (
            <div className="entrega-exportar">
              <div className="entrega-checklist">
                <h3>{faltando.length ? `Faltam ${faltando.length} itens` : 'Tudo conferido'}</h3>
                {faltando.length > 0 && (
                  <ul>{faltando.map((criterio) => {
                    // "concluir os passos guiados" sem dizer QUAL passo falta manda procurar às
                    // cegas entre dez; o item nomeia o passo e leva até ele.
                    const passosPendentes = criterio.id === 'passos-guiados'
                      ? entrega.passos.filter(({ id, fase }) => fase !== 'exportar' && !concluidos.has(id))
                      : [];
                    return (
                      <li key={criterio.id}>
                        <Icon name="Circle" size={17} aria-hidden="true" />
                        <span>
                          {criterio.descricao}
                          {passosPendentes.length > 0 && (
                            <span className="entrega-pendentes">
                              {passosPendentes.map((passo) => (
                                <button key={passo.id} type="button" onClick={() => { irAoTopo(); setPassoIndice(entrega.passos.indexOf(passo)); }}>
                                  {FASES.find(({ id }) => id === passo.fase)?.titulo}: {passo.titulo}
                                </button>
                              ))}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}</ul>
                )}
              </div>
              <div className="entrega-identificacao">
                <label className="entrega-campo">
                  <span>Seu nome completo</span>
                  <input
                    type="text"
                    maxLength={60}
                    value={state.name === 'Estudante' ? '' : state.name}
                    placeholder="Como está na matrícula"
                    onChange={(evento) => update((atual) => ({ ...atual, name: evento.target.value || 'Estudante' }))}
                  />
                </label>
                <label className="entrega-campo">
                  <span>RA</span>
                  <input
                    type="text"
                    maxLength={40}
                    value={state.registroAcademico || ''}
                    placeholder="Seu registro acadêmico"
                    onChange={(evento) => update((atual) => ({ ...atual, registroAcademico: evento.target.value }))}
                  />
                </label>
                <label className="entrega-campo">
                  <span>Link do Colab (opcional)</span>
                  <input
                    type="url"
                    maxLength={400}
                    value={trabalho.linkColab || ''}
                    placeholder="https://colab.research.google.com/drive/..."
                    onChange={(evento) => salvar({ linkColab: evento.target.value })}
                  />
                </label>
              </div>
              {/* O roteiro pede "um print do código executado pelo menos uma vez". O PyCampus
                  não fotografa a tela do estudante, então ele anexa a própria captura. */}
              <label className="entrega-campo entrega-capturas">
                <span>Print do código executado</span>
                <small>O roteiro pede. Use Win + Shift + S, recorte o código com a saída e escolha o arquivo aqui.</small>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  aria-label="Anexar print do código executado"
                  onChange={anexarCapturas}
                />
              </label>
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
              <details className="coach-expected">
                <summary>Mudar a frase de autoria impressa no PDF</summary>
                <textarea
                  maxLength={600}
                  rows={2}
                  aria-label="Observação impressa no PDF"
                  value={trabalho.observacao || ''}
                  placeholder="Atividade desenvolvida e executada no PyCampus, plataforma de estudos criada pelo próprio estudante como apoio à disciplina. O código é de autoria do estudante."
                  onChange={(evento) => salvar({ observacao: evento.target.value })}
                />
              </details>
              {trabalho.linkColab && !/^https:\/\/(colab\.research\.google\.com|drive\.google\.com)/.test(trabalho.linkColab) && (
                <div className="entrega-aviso"><Icon name="Info" size={18} aria-hidden="true" /><p>Este link não parece ser do Google Colab.</p></div>
              )}
              {!identificado && (
                <div className="entrega-aviso"><Icon name="TriangleAlert" size={18} aria-hidden="true" /><p>Preencha o nome e o RA para liberar o download.</p></div>
              )}
              {/* Os gráficos do PDF são os da última execução que deu certo. Sem este aviso, quem
                  rodou um código com erro baixava um PDF sem gráfico e só via isso no AVA. */}
              {entrega.unidade === 'u3' && !trabalho.imagens.length && (
                <div className="entrega-aviso"><Icon name="TriangleAlert" size={18} aria-hidden="true" /><p>O PDF vai sair <strong>sem gráficos</strong>. Volte em <strong>Testar</strong>, clique em Executar código e espere os gráficos aparecerem.</p></div>
              )}
              <div className="entrega-arquivos">
                <button className="entrega-arquivo principal" disabled={!podeExportar} onClick={baixarPdf}><Icon name="Download" size={22} aria-hidden="true" /><span><strong>Baixar PDF da entrega</strong><small>É este arquivo que vai para o AVA</small></span></button>
                <button className="entrega-arquivo" disabled={!podeExportar} onClick={baixarNotebook}><Icon name="Download" size={22} aria-hidden="true" /><span><strong>Baixar notebook</strong><small>Para abrir no Google Colab</small></span></button>
                <button className="entrega-arquivo" disabled={!podeExportar} onClick={abrirRelatorio}><Icon name="BookOpenCheck" size={22} aria-hidden="true" /><span><strong>Abrir relatório</strong><small>Para ler na tela</small></span></button>
              </div>
            </div>
          )}
        </section>

        <div className="button-row aula-etapas-navegacao entrega-navegacao">
          <button className="button outline" disabled={passoIndice === 0} onClick={() => setPassoIndice((indice) => Math.max(0, indice - 1))}><Icon name="ArrowLeft" size={16} aria-hidden="true" /> Voltar</button>
          <button className="button primary" onClick={concluirPasso}>{concluidos.has(passoAtual.id) ? 'Continuar' : 'Registrar este passo'} <Icon name="ArrowRight" size={16} aria-hidden="true" /></button>
        </div>
        <p className="entrega-mensagem" aria-live="polite">{mensagem}</p>
        {reforco && (
          <button className="text-button entrega-reforco-abrir" onClick={() => { setMostrarReforco(true); irAoTopo(); }}>
            <Icon name="Footprints" size={16} /> Rever a biblioteca em {reforco.degraus.length} degraus
          </button>
        )}
      </main>
      </>)}
    </div>
  );
}
