# Revisão da sequência de aprendizagem

Motivo: o estudante apontou que a aula 3 cobrava multiplicação antes de ensinar a sintaxe dos operadores. O código funcionava, mas o material não preparava suficientemente para escrevê-lo. A revisão foi feita sobre as 48 aulas e os oito projetos.

## Critério usado

Antes do desafio, a aula deve apresentar os nomes, símbolos e padrões necessários para uma solução. Um exemplo precisa mostrar esses padrões em uso, com explicação das partes. Recursos de outra etapa precisam ser ensinados no ponto de uso, removidos do exercício ou identificados como pré-requisitos de uma extensão posterior.

Todas as aulas agora têm objetivo, pré-requisitos com links, passos comentados do exemplo e duas ou mais dicas específicas. O acesso continua aberto: o registro da plataforma não é usado para afirmar que o estudante sabe ou não sabe um assunto aprendido fora dela.

## Lacunas corrigidas

| Ponto | Antes | Agora |
| --- | --- | --- |
| Print e variáveis | Sintaxe pouco detalhada | Explicação de aspas, parênteses, =, ordem das linhas, comentários e acesso sem aspas |
| Tipos | Converter e multiplicar antes de operadores | Converter, imprimir e consultar o tipo; nenhuma conta |
| Operadores | Muitas operações em um exemplo compacto | Valores → subtotal → desconto → print, explicados separadamente |
| Textos | Encadeamento e `.title()` sem introdução | `.strip()` e `.upper()` em linhas separadas; explicação de ponto, chamada e retorno |
| Entrada | Exercício não usava input | Entrada padrão preenchida, leitura real e conversão em passos |
| Condições | Desafio com elif, exemplo só de dois caminhos | Exemplo com os três caminhos, comparações e indentação explicadas; vínculo com PDF preservado no simulador |
| Booleanos | Testar caractere em senha sem ensinar `in` para textos | Combinar idade e ingresso com and, como no exemplo |
| For | Acumulador pedido sem demonstração | Atualização `total = total + numero` e rastreio das três iterações |
| Funções e decomposição | Listas, sum e len antes da etapa de listas | Média com três parâmetros; pass e return explicitados |
| Listas e conjuntos | Novas funções implícitas | sum, len, append, set e sorted explicados no ponto de uso |
| Encapsulamento | Raise antes de exceções | Return antecipado; exceções introduzidas na aula correspondente |
| Dataclasses | Importação e anotações surgiam sem explicação | Sintaxe from/import, @ e campo: tipo antes do exercício |
| JSON, CSV e SQL | Chamadas e valores de ligação pouco explicados | import, StringIO, DictReader, tupla unitária, placeholder, fetchone e coluna explicados |
| REST | next e gerador antes da aula de geradores | Busca usando for/if/return já estudados |
| Validação e autorização | isinstance, truthiness e parâmetro padrão implícitos | Explicação no ponto de uso e exemplo alinhado ao desafio |
| Paginação | Fatiamento e desempacotamento implícitos | inicio e fim separados; fatia com fim exclusivo ensinada |
| Git | Exercício de ordenação, sem relação direta | Revisão do comando como texto; uso real no terminal explicitado |
| Logs | Exercício só montava dicionário | Chamada real de logging.error com configuração fornecida e explicada |
| Avançado | Recursos compactos sem apoio suficiente | Passos de yield, wrapper, argumentos, await/gather, median, getenv e all |

## Projetos

O orçamento inicial não exige mais classificação com if ou tratamento de erro antes dessas aulas. Quiz, tarefas e conta têm roteiro de início com os recursos já apresentados. A conta começa com inteiros em centavos, sem exigir Decimal e datas não ensinados.

Os projetos de persistência, API, qualidade e sistema final separam primeira versão e ampliações. Recursos não cobertos por estas aulas introdutórias — por exemplo autenticação de produção, interface web completa e CI — não são apresentados como se já tivessem sido ensinados. API e testes têm tutoriais preparatórios explícitos antes das ferramentas externas.

## Preservação e limites

IDs e ordem das 48 aulas foram mantidos. Aulas concluídas, XP, emblemas, projetos marcados, código salvo e diário não são apagados. Um aviso informa quando há código salvo de uma versão anterior do exercício; iniciar o novo código é uma escolha explícita do estudante.

Os testes verificam a ordem das dependências declaradas, a correspondência entre passos e código e casos concretos de regressão. Também há soluções de referência para execução no Pyodide. Isso não equivale a uma avaliação docente independente nem prova que todo estudante compreenderá a sequência. Continuar coletando dúvidas e testar retenção sem pistas continua necessário.

Referências técnicas consultadas: [Tutorial oficial de Python](https://docs.python.org/pt-br/3/tutorial/index.html), [controle de fluxo e funções](https://docs.python.org/pt-br/3/tutorial/controlflow.html), [SQLite na biblioteca padrão](https://docs.python.org/3/library/sqlite3.html). As explicações e a organização didática são próprias do projeto.
