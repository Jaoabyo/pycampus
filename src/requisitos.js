// Comparar só a saída aceita atalho. Na aula de entrada, o enunciado mandava converter o texto
// em inteiro, mas a saída esperada era o próprio valor digitado: `print(input())` passava sem
// converter nada. Em 21 das 47 aulas dava para escrever `print("resposta")` e concluir.
//
// A regra aqui é deliberadamente **cega ao formato do código**. Nome de variável, ordem das
// linhas, laço em vez de soma, função em vez de expressão: tudo livre. O estudante resolve do
// jeito dele. O que se mede é outra coisa — se a resposta foi calculada ou apenas digitada.
//
// Nada disto é julgado por modelo de linguagem. São medidas em JavaScript, com o mesmo
// resultado sempre, porque um "está certo" errado é pior do que não conferir.

const NL = String.fromCharCode(10);

// Comentário não é código executado: o enunciado pode citar o valor ali sem ser trapaça.
// Isso também deixa o próprio início do exercício (que é só comentário) sempre válido.
const semComentarios = codigo => String(codigo || '').split(NL).map(linha => linha.split('#')[0]).join(NL);

const solucaoGuardada = lesson => (lesson?.puzzle?.blocks || []).map(bloco => bloco.code).join(NL);

// Procurar `int(` como texto solto casa dentro de `print(` — foi assim que `print(input())`
// passou pela exigência de conversão sem converter nada. A chamada só conta quando o nome
// começa de verdade: nada de letra, dígito, sublinhado ou ponto grudado antes dele.
const chama = (codigo, nome) => new RegExp('(?<![\\w.])' + nome + '\\s*\\(').test(codigo);

// Aulas cujo assunto é a própria conversão: sem ela o exercício perde o sentido, mesmo que a
// saída batesse por outro caminho. Só entra aqui o que a solução guardada comprovadamente usa.
const EXIGE_CHAMADA = {
  entrada: [['int', 'transformar em número o texto que veio do input()']]
};

export function requisitosDaAula(lesson) {
  if (!lesson) return [];
  const lista = [];
  const solucao = semComentarios(solucaoGuardada(lesson));

  for (const [nome, motivo] of EXIGE_CHAMADA[lesson.id] || []) {
    lista.push({
      id: `chama-${nome}`,
      descricao: `usar ${nome}() para ${motivo}`,
      atende: codigo => chama(semComentarios(codigo), nome)
    });
  }

  // Se a aula fornece uma resposta para input(), o valor tem de entrar por ali.
  if (String(lesson.stdin || '').trim()) {
    lista.push({
      id: 'usa-input',
      descricao: 'ler o valor com input(), em vez de escrevê-lo no código',
      atende: codigo => chama(semComentarios(codigo), 'input')
    });
  }

  // A saída esperada não pode estar escrita no código — a não ser quando a própria solução
  // guardada a escreve, como na primeira aula, cujo desafio é literalmente mostrar uma frase.
  // Essa isenção automática é o que garante que a regra nunca recuse um caminho legítimo.
  const linhas = String(lesson.expected || '').split(NL).map(linha => linha.trim()).filter(Boolean);
  if (solucao) {
    for (const valor of linhas) {
      if (solucao.includes(valor)) continue;
      lista.push({
        id: `sem-literal:${valor}`,
        descricao: `chegar a ${valor} calculando, e não escrevendo esse valor direto no código`,
        atende: codigo => !semComentarios(codigo).includes(valor)
      });
    }
  }
  return lista;
}

// O que ainda falta no código do estudante. Lista vazia significa que o exercício foi cumprido.
export function requisitosFaltando(lesson, codigo) {
  return requisitosDaAula(lesson).filter(item => !item.atende(codigo));
}
