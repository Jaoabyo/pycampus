# Mapa do PyCampus

Este documento registra de onde vem cada tela, o que ela altera e como as partes se conectam.
Ele serve para manutenção: mudar uma regra numa aba não pode contradizer o progresso, o backup
ou o texto mostrado em outra.

## Fluxo principal

`src/App.jsx` mantém o estado da aplicação e escolhe a tela. `src/progress.js` cria e normaliza
o estado salvo em `localStorage`; a mesma normalização protege importações, nuvem e backups.
Execuções Python passam por `src/useTrackedPython.js` e pelo worker descartável
`public/python-worker.js`. Tentativas entram no diário por `src/history.js`.

## Abas

| Aba | Responsabilidade | Fonte principal | Progresso alterado |
| --- | --- | --- | --- |
| Visão geral | Próxima ação válida, missão diária, resumo e nível | `App.jsx`, `daily-mission.js`, `progression.js` | Não altera; resume o restante |
| Minha formação | 8 etapas, 48 aulas e pontes de funções | `curriculum.js`, `curriculum-review.js`, `FunctionBridges.jsx` | aulas, códigos, pontes, XP e atividades |
| Oficina de prática | 24 miniprojetos no fluxo prever–investigar–mudar–criar | `PracticeStudio.jsx`, `practice-content.js`, `practice-flow.js` | prática, revisão espaçada, domínio e XP |
| Projetos | 8 projetos de portfólio com construção e entrega | `ProjectStudio.jsx`, `project-steps.js`, `project-grading.js` | código, passos, README, avaliação e XP |
| Laboratório Python | Área livre para executar e visualizar Python | `App.jsx`, `CodeEditor.jsx`, `Visualizador.jsx` | código livre e histórico; não concede XP |
| Minha faculdade | 16 aulas das 4 unidades dos 8 PDFs e plano até 27/09 | `Faculdade.jsx`, `faculdade.js` | aulas da faculdade, códigos e calendário; sem XP da formação |
| Treino dirigido | Detecta padrões de dificuldade a partir do diário | `TargetedPractice.jsx`, `diagnosis.js` | escada de treino e domínio |
| Modo prova | Questões sem dicas sorteadas entre aulas concluídas | `Prova.jsx`, `exam.js` | tentativas de prova e atividade; não concede XP |
| Diário de aprendizagem | Código, saída, erro, reflexão e relatório | `HistoryView.jsx`, `history.js`, `relatorio.js` | reflexões e data do relatório |
| Meu calendário | Atividades realizadas e sessões planejadas | `App.jsx`, `progress.js` | sessões e atividades do dia |
| Conquistas | Emblemas derivados do progresso real | `progress.js`, `App.jsx` | Não altera; todos os emblemas são derivados |
| Meu perfil | Nome, avatar, bio, nível e mapa de atividade | `App.jsx`, `progress.js` | perfil |
| Configurações | Metas, backup, nuvem, PWA, Lumi e reinício | `Preferencias.jsx`, `nuvem.js`, `merge-progress.js` | preferências e estado importado/mesclado |
| Sobre e limites | Versões, limites reais e histórico público | `Sobre.jsx`, `sobre.js` | Não altera |

## Regras que atravessam telas

- XP é derivado de aulas, práticas e projetos; não deve ser salvo como número editável.
- Uma atividade concluída entra no calendário uma vez. Revisar não duplica recompensa.
- A formação geral é sequencial; a trilha da faculdade permanece aberta porque segue o prazo
  da instituição, não as travas das oito etapas.
- Saída correta é apenas uma parte da conferência. A formação e a faculdade também verificam
  requisitos mínimos da técnica pedida, sem exigir nomes de variáveis específicos.
- O Lumi orienta e registra a conversa, mas não concede domínio sozinho. Aprovações dele que
  afetam progresso ficam auditáveis no relatório.
- O modo prova geral só cobra aulas já concluídas. A trilha da faculdade mantém perguntas de
  revisão dentro de cada aula e suas aplicações maiores como roteiro para estudo sem consulta.
- Backup, Gist e junção sempre passam por `normalizeState`; IDs desconhecidos e campos
  malformados não entram no progresso.

## Ambientes e limites

- Python roda em Pyodide num Web Worker com limite de tempo e saída.
- NumPy, pandas e Matplotlib são carregados automaticamente quando uma aula compatível os
  importa. Não existe `pip install` livre no navegador.
- KivyMD, TensorFlow, servidores e arquivos persistentes pertencem ao ambiente local. As aulas
  correspondentes praticam no navegador a lógica e os conceitos, deixando essa diferença clara.
- O progresso padrão pertence ao navegador. Backup e Gist privado são as rotas de recuperação.

## Verificação

- `npm test`: regras puras, conteúdo, migração, segurança do progresso e requisitos.
- `npm run test:curriculum`: exemplos e soluções das 48 aulas no Python real.
- `npm run test:faculdade`: exemplos, inícios e soluções das 16 aulas da faculdade no Python real.
- `npm run test:abas`: abre todas as abas em sessão isolada e procura erros e estouro horizontal.
- `npm run test:visual`: missão, mapa, foco, celular e movimento reduzido.
- `npm run build`: garante que a versão de produção é gerável.
