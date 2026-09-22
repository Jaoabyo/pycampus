import { useEffect, useMemo, useState } from 'react';
import { Icon, Progress, irAoTopo } from './ui.jsx';
import CodeEditor from './CodeEditor.jsx';
import { usePython } from './useTrackedPython.js';
import { appendAttempt } from './history.js';
import { localDate } from './progress.js';
import { aulasDaFaculdade } from './faculdade.js';
import { projetosDaFaculdade } from './faculdade-projetos.js';
import {
  entregaDaFaculdade,
  entregaProntaParaExportar,
  normalizarTrabalhoDaEntrega,
  requisitosFaltandoDaEntrega,
} from './faculdade-entregas.js';
import {
  criarNotebookColab,
  criarRelatorioHtml,
  nomeDoArquivoDaEntrega,
} from './faculdade-exportacao.js';
import './faculdade-entrega.css';

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

const podeConcluirPasso = (passo, entrega, trabalho) => {
  if (trabalho.passosConcluidos.includes(passo.id)) return { ok: true, motivo: '' };
  if (passo.fase === 'entender') return { ok: true, motivo: '' };
  if (passo.fase === 'construir') {
    const mudou = trabalho.codigo.trim().length > 30 && trabalho.codigo.trim() !== entrega.codigoInicial.trim();
    return { ok: mudou, motivo: 'Escreva ou adapte o código antes de concluir este passo.' };
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

  const executar = () => {
    setMensagem('');
    python.run(trabalho.codigo, '', (resultado) => {
      if (resultado.ok) {
        salvar({ saida: resultado.output, executadaEm: localDate() });
        setCelebrar((valor) => valor + 1);
        setMensagem('Execução registrada. Agora descreva o caso testado para transformar resultado em aprendizado.');
      } else {
        setMensagem('A execução parou. Leia a última linha da saída, corrija uma causa por vez e tente novamente.');
      }
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
  const concluidos = new Set(trabalho.passosConcluidos);
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
    const evidencia = podeConcluirPasso(passoAtual, entrega, trabalho);
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
    setMensagem(passoAtual.fase === 'exportar'
      ? 'Entrega conferida. Abra os arquivos e revise antes de enviar manualmente ao AVA.'
      : 'Passo registrado. Continue para a próxima ideia quando estiver pronto.');
    irAoTopo();
  };

  const baixarNotebook = () => {
    download(
      criarNotebookColab({ entrega, trabalho, estudante: { nome: state.name } }),
      nomeDoArquivoDaEntrega(entrega, 'ipynb'),
      'application/x-ipynb+json',
    );
    setMensagem('Notebook baixado. Abra no Google Colab e execute todas as células em ordem.');
  };

  const abrirRelatorio = () => {
    const html = criarRelatorioHtml({ entrega, trabalho, estudante: { nome: state.name } });
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
          <div className="entrega-meta">
            <span><Icon name="Clock3" size={16} aria-hidden="true" /> {entrega.minutos} min em blocos</span>
            <span><Icon name="CalendarDays" size={16} aria-hidden="true" /> Prazo 27/09/2026</span>
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
            <div className="entrega-exemplo">
              <div><Icon name="Lightbulb" size={17} aria-hidden="true" /> Exemplo pequeno</div>
              <pre>{passoAtual.exemplo}</pre>
            </div>
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
              <CodeEditor
                code={trabalho.codigo}
                onChange={(codigoAtualizado) => salvar({ codigo: codigoAtualizado })}
                busy={python.busy}
                onRun={executar}
                onStop={python.stop}
                output={python.output || trabalho.saida}
                success={python.success}
                celebrate={celebrar}
                inputRequest={python.inputRequest}
                onReply={python.reply}
                filename={`${entrega.id}.py`}
                runDisabled={entrega.ambienteEntrega === 'colab'}
                runLabel={entrega.ambienteEntrega === 'colab' ? 'Execute no Colab' : 'Executar código'}
                emptyOutput="Execute o código para registrar uma saída real."
              />
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
                  <label className="entrega-campo data"><span>Data da execução no Colab</span><input type="date" max="2026-09-27" value={trabalho.executadaNoColabEm} onChange={(evento) => salvar({ executadaNoColabEm: evento.target.value })} /></label>
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
              <div className="entrega-arquivos">
                <button className="entrega-arquivo" disabled={!entregaProntaParaExportar(entrega, trabalho)} onClick={baixarNotebook}><Icon name="Download" size={22} aria-hidden="true" /><span><strong>Baixar notebook</strong><small>Arquivo .ipynb para Google Colab</small></span></button>
                <button className="entrega-arquivo" disabled={!entregaProntaParaExportar(entrega, trabalho)} onClick={abrirRelatorio}><Icon name="BookOpenCheck" size={22} aria-hidden="true" /><span><strong>Abrir relatório</strong><small>Imprima ou salve em PDF</small></span></button>
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
            <ul>{entrega.preRequisitos.map((id) => <li key={id}><Icon name="CheckCircle2" size={16} aria-hidden="true" />{nomeDoPreRequisito(id)}</li>)}</ul>
          </section>
          <section className="card entrega-checklist">
            <div className="eyebrow">CHECKLIST REAL</div>
            <h2>{faltando.length ? `${faltando.length} itens pendentes` : 'Tudo conferido'}</h2>
            <ul>{entrega.criterios.map((criterio) => {
              const pendente = faltando.some(({ id }) => id === criterio.id);
              return <li key={criterio.id} className={pendente ? '' : 'feito'}><Icon name={pendente ? 'Circle' : 'CheckCircle2'} size={17} aria-hidden="true" /><span>{criterio.descricao}</span></li>;
            })}</ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
