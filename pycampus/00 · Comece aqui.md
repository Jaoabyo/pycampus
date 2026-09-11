# 00 · Comece aqui

Este cofre descreve **como o PyCampus é feito por dentro**. Ele existe por dois motivos:
para quem for mexer no código saber onde mexer antes de abrir qualquer arquivo, e para você
entender as decisões de uma plataforma que é sua.

> [!important] Regra para a IA que trabalha neste projeto
> Leia esta nota e o mapa abaixo **antes** de tocar em qualquer arquivo. Depois de mudar
> alguma coisa, atualize a nota correspondente. Documentação desatualizada engana mais do
> que a ausência dela.

## O caminho mais curto

- Quer mexer no **conteúdo** (aulas, exercícios, projetos)? → [[Conteúdo · Aulas]], [[Conteúdo · Oficina de prática]], [[Conteúdo · Pontes de função]], [[Conteúdo · Projetos]]
- Quer mexer no **Lumi**? → [[Lumi · Como ele ajuda]]
- Quer mexer em **XP, emblemas ou progresso**? → [[Estado e progresso]]
- Quer entender por que uma etapa está **travada**? → [[Liberação de etapas]]
- Quer saber **o que não pode ser quebrado**? → [[Regras que não se quebram]]
- Quer publicar? → [[Publicação e hospedagem]]
- Procurando uma receita pronta? → [[Receitas · como fazer]]

## O que é a plataforma

Uma formação de Python em português, feita para complementar a faculdade e chegar a nível de
prova e portfólio. Roda inteiramente no navegador: não há servidor, não há banco de dados,
não há conta de usuário. Todo o progresso vive no `localStorage` do aparelho.

| Peça | Quantidade |
| --- | --- |
| Etapas (módulos) | 8 |
| Aulas | 48 |
| Miniprojetos da oficina | 24 |
| Pontes de função | 8 |
| Projetos | 8 |
| Passos de projeto | 53 |
| Padrões de diagnóstico | 5 |
| Arquivos de teste | 20 |

XP: **100** por aula, **40** por miniprojeto, **250** por projeto. Nível a cada 500 XP.

## As três ideias que explicam quase tudo

1. **Nada é dado como aprendido sem prova de execução.** O que concede XP é sempre uma
   verificação mecânica: resposta de prova comparada com o gabarito, saída de código
   comparada com a esperada rodando no Python de verdade. Ver [[Regras que não se quebram]].
2. **Nenhum exercício exige o que não foi ensinado.** Existe teste automatizado para isso.
   Ver [[Regras que não se quebram]] e [[Testes · o que cada um protege]].
3. **O Lumi apoia, não substitui.** Ele nunca conclui etapa nem concede XP, e nos dois
   primeiros degraus nem sequer pode mostrar código. Ver [[Lumi · Como ele ajuda]].

## Mapa

- [[Arquitetura]] — como as peças se encaixam
- [[Execução de Python]] — o Pyodide no worker
- [[Estado e progresso]] — o que é salvo e como
- [[Liberação de etapas]] — o que destrava o quê
- [[Conteúdo · Aulas]]
- [[Conteúdo · Oficina de prática]]
- [[Conteúdo · Pontes de função]]
- [[Conteúdo · Projetos]]
- [[Quebra-cabeça de código]]
- [[Diário e diagnóstico]]
- [[Lumi · Como ele ajuda]]
- [[Lumi · Avaliação de projeto]]
- [[Lumi · Lições personalizadas]]
- [[Lumi · Leitura de explicações]]
- [[Regras que não se quebram]]
- [[Testes · o que cada um protege]]
- [[Publicação e hospedagem]]
- [[Receitas · como fazer]]
- [[Decisões e por quês]]
- [[Dívidas conhecidas]]
