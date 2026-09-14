# Resposta ao mediador

Rascunho pronto para enviar. Cada item afirma só o que já está no ar em
https://jaoabyo.github.io/pycampus — sem promessa de coisa futura.

---

Boa tarde, muito obrigado pela resposta detalhada. Levei ponto a ponto e já apliquei o que dava
para aplicar. Segue o que mudou:

**Material complementar.** A plataforma abre com uma página "Sobre e limites" que diz, na
primeira linha, que ela não substitui o roteiro, o material nem as aulas da disciplina, e que
quando algo divergir, o material da disciplina é o que vale. Também deixa claro que não há
diploma, certificado nem correção docente.

**Versão do Python e limites do ambiente.** A mesma página informa Python 3.12.7 e SQLite
3.39.0, rodando no navegador via Pyodide (CPython de verdade, não simulador), e lista o que o
ambiente não faz: sem `pip install`, sem pacotes externos, sem acesso à rede, arquivos
temporários e limite de 15 segundos por execução. Há um aviso explícito de que diferenças entre
versões existem e que, para a prova, vale a versão da disciplina.

**Mensagens de erro.** O senhor tinha razão em alertar sobre simplificação. A plataforma mostra
o traceback real do Python, sem traduzir nem resumir; o que ela acrescenta é um roteiro de
leitura ao lado (comece pela última linha, identifique o tipo, vá até a linha indicada) e o que
aquele tipo de erro costuma significar. A mensagem original nunca é substituída.

**Conceitos difíceis.** Essa foi a observação mais útil. Faltavam mesmo: acabei de acrescentar
mutabilidade ("duas variáveis, uma lista só" — atribuir uma lista a outro nome não copia) e
escopo ("o que existe dentro da função"), cada um com três níveis: reconhecer sem executar,
corrigir um programa quebrado e escrever do zero. Escopo já aparecia também na explicação do
`UnboundLocalError`, e listas versus tuplas está no conteúdo de estruturas de dados.

**Exercícios com verificação.** Cada exercício compara a saída do programa com a esperada, no
Python real. Aqui vale uma ressalva que a própria plataforma faz ao estudante: isso mostra que
um caso funciona, não que ele domina o assunto. Por isso ela também confere o código, não só a
saída — havia exercícios que passavam com a resposta escrita à mão, e isso foi corrigido.

**Relatar problemas e changelog.** A página "Sobre" tem um botão que abre uma issue no GitHub,
com orientação do que informar, e um "Histórico de melhorias" com data de cada correção.

**Compartilhar com a turma.** Vou seguir sua sugestão e oferecer como recurso opcional, dizendo
que é um projeto em desenvolvimento e pedindo que reportem o que estiver errado.

Uma pergunta, se puder: o senhor teria o roteiro ou a lista de tópicos na ordem em que a
disciplina os aborda? Sua última sugestão foi alinhar os exercícios a esses passos, e é o que
eu não consigo fazer sozinho sem chutar a ordem.

Obrigado de novo pelo tempo e pelo retorno.
