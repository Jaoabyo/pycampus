# Regras que não se quebram

Cada uma destas nasceu de um problema real. Antes de mudar alguma, leia por que ela existe.

## 1. Nada é ensinado se estiver atrás de um clique

Toda função usada num exemplo precisa estar explicada no **texto visível** da aula ou de uma
anterior. Nasceu do incidente do `sum()`: o estudante teve que perguntar fora da plataforma.
Protegida por `tests/visible-glossary.test.js`.

## 2. Nenhum exercício exige sintaxe não ensinada

Vale para aulas, miniprojetos e passos de projeto. Protegida por `visible-glossary` e
`project-levelling`. Ver [[Dívidas conhecidas]] para o que ainda não está em conformidade.

## 3. Uma pergunta nunca cobra o que o exemplo não mostrou

Nasceu de uma revisão que perguntava sobre `if` numa aula que não usava `if`.

## 4. Progresso só por verificação mecânica

XP e liberação de etapa vêm de prova comparada com o gabarito ou saída comparada com a
esperada, rodando no Python de verdade. Nunca de um texto escrito, de um clique ou da opinião
de um modelo. Ver [[Estado e progresso]].

## 5. Conteúdo gerado por IA passa por portão executável

Ver [[Lumi · Lições personalizadas]]. Nada gerado aparece sem verificação mecânica.

## 6. A trava do Lumi está no código

`sanitizeReply`. Ver [[Lumi · Como ele ajuda]].

## 7. Backup restaurado não concede nada

`normalizeState` recalcula tudo que libera progresso. Ver [[Estado e progresso]].

## 8. Progresso nunca regride

Aula concluída continua aberta mesmo que a regra mude. Ver [[Liberação de etapas]].

## 9. Interface nova se baseia no visual que já existe

O reset global zera borda e fundo de todo `button`: uma classe sem estilo próprio vira texto
apagado. Já gerou a crítica de etapas "camufladas, quase invisíveis". Reutilize
`.button.outline`, `.pill`, `.icon-tile`, `.hero`, `.project-visual`.

## 10. Toda tela é conferida em 390 px

E com medição de **transbordo horizontal**, não a olho. Foi assim que se descobriu que dois
botões de 100 % dentro de um `.tab-row` empurravam a página 349 px.

## 11. Limites honestos ficam escritos

`VERIFICACAO.md` registra o que foi verificado **e o que não foi**. A plataforma não afirma
domínio do estudante nem substitui revisão de professor.

Relacionado: [[Testes · o que cada um protege]] · [[Decisões e por quês]]
