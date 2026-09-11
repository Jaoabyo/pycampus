# Lumi · Avaliação de projeto

Arquivo: `src/project-grading.js`. Tela: `src/ProjectGrade.jsx`, dentro da fase "Entregar".

Depois de publicar no GitHub e salvar o link, o Lumi **lê os arquivos do repositório** pela
API pública (até 4 arquivos, 12000 caracteres, `.py` primeiro e raiz antes de subpasta) e dá
uma nota de 0 a 10, com um veredito por requisito.

## Aprovação

`nota >= 7`, decidida **no código**, nunca pelo campo que o modelo declara sobre si mesmo —
e recalculada por `normalizeState` ao restaurar backup. Aprovado vale 250 XP, o emblema
"Aprovado na revisão" e atividade do dia.

## `codeFacts` — a lição mais importante deste módulo

O modelo afirmou, três vezes seguidas e com o arquivo inteiro à frente, que um código com dez
comentários não tinha nenhum. Obrigá-lo a citar a linha não resolveu.

O que resolveu foi **medir em JavaScript e entregar o número pronto**: `codeFacts` conta
comentários, variáveis criadas, funções chamadas e uso de f-string, e o prompt diz que esses
fatos são verdadeiros. Passou de 4/5 para 5/5 requisitos, estável.

> [!important] Regra geral que vale para qualquer parte do projeto
> Quando o modelo erra um fato verificável, **meça o fato**. Reforçar o prompt não corrige
> esse tipo de erro.

## Limite honesto

A nota é a leitura de um modelo. Ela **não executa** o programa e pode variar entre execuções.

Relacionado: [[Conteúdo · Projetos]] · [[Estado e progresso]] · [[Liberação de etapas]]
