# Diário e diagnóstico

Toda execução vira um registro. `src/history.js` guarda até 150 tentativas com código,
entradas, saída, se bateu com o esperado e a reflexão escrita.

`src/diagnosis.js` lê esse diário e procura **cinco enganos recorrentes**, por regras
(não por IA):

| Padrão | O engano |
| --- | --- |
| `input-pergunta` | o que vai dentro de `input()` |
| `duas-atribuicoes` | duas atribuições na mesma linha |
| `falta-igual` | o sinal de igual que faltou |
| `nome-diferente` | o mesmo nome escrito de dois jeitos |
| `limite-range` | onde o `range` para |

Cada padrão mostra **a linha do próprio estudante** que o disparou, com data, e tem três
níveis: reconhecer → corrigir → criar do zero.

## Domínio

Considerar "dominado" exige os três níveis, retenção (voltar depois de 3 dias), explicação
escrita e revisão externa. A plataforma **não** afirma domínio sozinha.

A aba é `src/TargetedPractice.jsx`, e é onde vivem as [[Lumi · Lições personalizadas]].

Relacionado: [[Estado e progresso]] · [[Lumi · Leitura de explicações]]
