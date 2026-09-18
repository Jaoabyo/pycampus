# Estado atual · auditoria

Fotografia do projeto em **18 de setembro de 2026**, nove dias antes da prova presencial.
Cada número abaixo foi medido, não estimado: os roteiros que produzem cada um estão citados.

> [!info] Como esta nota se distingue das outras
> As demais notas do cofre explicam **como uma peça funciona**. Esta diz **em que estado ela
> está hoje** e o que foi verificado. Quando a plataforma mudar, atualize aqui a linha
> correspondente ou apague a afirmação — número velho engana mais que número ausente.

## O que existe

| Peça | Quantidade | Onde conferir |
| --- | --- | --- |
| Etapas da formação | 8 | `src/curriculum.js` |
| Aulas da formação | 48 | `src/curriculum.js` |
| Miniprojetos da oficina | 35 | `src/practice-content.js` |
| Pontes de função | 8 | `src/function-bridges.js` |
| Projetos de portfólio | 8 | `src/project-steps.js` |
| **Unidades da faculdade** | **4** | `src/faculdade.js` |
| **Aulas da faculdade** | **16** | `src/faculdade.js` |
| **Aplicações do professor** | **20** | `src/faculdade.js` |
| **Projetos da faculdade** | **4** | `src/faculdade-projetos.js` |
| Arquivos de teste | 41 | `tests/` |
| Roteiros de verificação | 25 | `scripts/` |

## Verificação desta data

Tudo abaixo passou na árvore publicada:

- **273 testes** de unidade — `npm test`
- **143 programas do currículo** executados no Python real — `npm run test:curriculum`
- **84 programas da faculdade** executados no Python real — `npm run test:faculdade`
- **14 abas** aprovadas em desktop e celular, 28 navegações — `npm run test:abas`
- **26 telas + miniprojeto real** — `npm run test:estudo`
- **8 estúdios de projeto** e 7 soluções de referência — `npm run test:projetos`
- Jornada de quem chega sem saber nada — `npm run test:iniciante`
- Lumi no navegador, fila de revisão e experiência visual — `test:lumi-chat`, `test:revisao`, `test:visual`

Nenhum erro de página em nenhuma das 14 abas.

## Avaliação aba a aba

### Visão geral
Porta de entrada. Mostra a data, a saudação, a próxima ação e o panorama das 8 etapas.
Desde esta versão, a faculdade também aparece aqui — antes ela vivia isolada na própria aba.
**Estado:** cumpre o papel. Com progresso zerado a tela é longa; quem já estuda vê o próximo passo no topo.

### Minha formação
As 8 etapas com as 48 aulas, liberadas em ordem. Agora traz também a **trilha acadêmica
integrada**, com as 4 unidades da disciplina e um botão para o modo de estudo.
**Estado:** o ponto forte é a ordem. O ponto sensível continua sendo a trava sequencial — ela
existe para a formação, e é exatamente por isso que a faculdade ficou fora dela.

### Oficina de prática
35 miniprojetos no formato ler → entender → mudar → escrever.
**Estado:** é a ponte entre a aula e o projeto, e hoje é a parte mais densa da plataforma.

### Projetos
8 projetos de portfólio com passos guiados, mais os **4 miniprojetos da faculdade**, um por
unidade, cada um dizendo quantas aulas daquela unidade já foram estudadas.
**Estado:** os estúdios dão pista e pergunta, nunca o programa pronto — conforme pedido registrado em `ACOMPANHAMENTO.md`.

### Laboratório Python
Editor livre com execução real, entrada para `input()`, download do `.py` e **execução passo a
passo** no visualizador.
**Estado:** o visualizador fecha uma lacuna que a nota de dívidas apontava como aberta.

### Minha faculdade
O conteúdo da disciplina Linguagem de Programação (Anhanguera): 4 unidades × 4 aulas, com o
exemplo do professor executando de verdade, desafio próprio, revisão e registro.
Traz o **plano até 27 de setembro**, com duas aulas por dia e o último dia reservado à revisão.
**Estado:** é a aba mais importante agora, e a mais verificada. Ver a seção seguinte.

### Treino dirigido
Lê as tentativas do Diário, agrupa os enganos repetidos e oferece níveis e uma lição do Lumi
para cada padrão.
**Estado:** depende de haver histórico. Com diário vazio, mostra o estado vazio e explica como preenchê-lo.

### Modo prova
Recall sem consulta sobre o que já foi concluído.
**Estado:** correto no propósito. As revisões ainda são de múltipla escolha — reconhecer é mais fácil que lembrar, e isso segue na lista de dívidas.

### Diário de aprendizagem
Registro das tentativas, com erro, saída e código.
**Estado:** é a matéria-prima do Treino dirigido e da avaliação do Lumi.

### Meu calendário
Agenda de sessões e marcação de constância.
**Estado:** simples e suficiente.

### Conquistas
9 emblemas ligados a marcos reais (primeira aula, 3 dias seguidos, fundamentos completos).
**Estado:** funciona como reforço, não como avaliação.

### Meu perfil · Configurações · Sobre e limites
Identidade, metas, backup manual, instalação como aplicativo, lembrete e — em Sobre — os
limites declarados.
**Estado:** o texto de limites está honesto sobre o que a plataforma **não** é: não há diploma,
certificado nem correção docente, e ela não substitui as aulas do AVA.

## A trilha da faculdade, em detalhe

Quatro unidades, quatro aulas cada, todas rotuladas pela aula de origem na apostila:

| Unidade | Tema | Aulas | Aplicações |
| --- | --- | --- | --- |
| 1 | Introdução à Linguagem Python | 4 | 5 |
| 2 | Explorando Recursos do Python | 4 | 5 |
| 3 | Introdução à Análise de Dados | 4 | 5 |
| 4 | Aplicações com Python | 4 | 5 |

### Duas travas que protegem o estudo

1. **Saída certa não basta.** Cada aula declara os requisitos de código do assunto. Colar
   `print("Media: 7.0")` produz a saída esperada e mesmo assim **não conclui a aula**: a tela
   responde quais técnicas ainda faltam aparecer no código. Um teste cola a saída esperada nas
   16 aulas e exige que a trava recuse todas.
2. **Nenhuma saída esperada foi escrita de cabeça.** `scripts/check-faculdade.mjs` executa
   exemplo, ponto de partida e solução de cada aula no Pyodide real — 84 programas — e falha se
   algum divergir do prometido.

### O que roda aqui e o que não roda

NumPy, pandas e Matplotlib são carregados automaticamente quando a aula os importa.
**KivyMD e TensorFlow não rodam no navegador** — e o material do professor já avisa que o
Colab também não gera o aplicativo. Nessas duas aulas, a plataforma pratica a mesma ideia numa
versão executável e **diz que está fazendo isso**, em vez de fingir que a biblioteca rodou.

## Dívidas que esta auditoria confirma como abertas

- **Progresso preso ao aparelho.** Celular e computador continuam sendo duas jornadas; só o backup manual transfere.
- **Revisões de múltipla escolha.** O objetivo é fluência de prova, e reconhecer não é lembrar.
- **Distância entre exemplo e desafio** em algumas aulas da formação (`while`, `complexidade`, `validacao`).
- **`src/App.jsx` foi reformatado** por uma sessão anterior: 416 → 2273 linhas. O arquivo passa
  em tudo, mas destoa do estilo denso do resto do código e deixa qualquer diff futuro barulhento.

## Dívidas que deixaram de existir

- **O Lumi alcança o celular.** Ollama com `qwen2.5-coder:14b` mais um túnel HTTPS do Cloudflare,
  e o endereço é configurável em Configurações. Ver [[Lumi no celular]].
- **Existe visualizador de execução.** Passo a passo no Laboratório Python.
- **A faculdade não vive mais isolada.** Ela aparece no painel, na formação, nos projetos e na busca.

Relacionado: [[Dívidas conhecidas]] · [[Testes · o que cada um protege]] · [[00 · Comece aqui]]
