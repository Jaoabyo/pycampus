# Lumi · Lições personalizadas

Arquivos: `src/custom-lesson.js` e `src/CustomLesson.jsx`. Vivem no [[Diário e diagnóstico|Treino dirigido]],
no botão "Lição do Lumi para este engano".

O Lumi escreve uma lição curta — explicação, exemplo, desafio — sobre um engano que o diário
registrou de verdade.

## Três portões antes de aparecer na tela

1. **Formato** — todas as partes presentes (`parseCustomLesson`).
2. **Vocabulário** — só o que já foi ensinado até a aula de origem do padrão (`untaughtCallables`).
3. **Execução no Python real** — o exemplo e a solução do desafio precisam produzir
   exatamente as saídas que a própria lição promete.

São três tentativas. Falhando as três, a lição é **recusada com o motivo**, em vez de mostrar
algo não verificado.

> [!note] O portão 3 pega erro de verdade
> No padrão "nome escrito de dois jeitos", o modelo insistia num exemplo que levanta
> `NameError` enquanto prometia imprimir `Python`. Foi corrigido instruindo que o exemplo
> mostra o jeito **certo** e o engano se explica em palavras.

## Outras regras

- Um desafio não pode dizer "corrija o código abaixo": o editor começa vazio. Há teste.
- Lições com `input()` precisam declarar as respostas, senão não haveria como verificar.
- **Não valem XP** — gerar é um clique. Contam como atividade do dia, e só quando o desafio é resolvido.

Relacionado: [[Lumi · Como ele ajuda]] · [[Execução de Python]] · [[Regras que não se quebram]]
