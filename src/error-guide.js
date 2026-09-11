// Leitura de erro como habilidade ensinável: primeiro o método (última linha, tipo, número da linha),
// depois um roteiro específico para o tipo que apareceu.
export const readingSteps = [
  'Comece pela última linha. Ela traz o tipo do erro e a explicação — é a informação mais útil.',
  'Identifique o tipo antes de mexer no código. Cada tipo tem uma causa típica diferente.',
  'Procure o número da linha no traceback e vá até ela. O erro costuma estar ali ou na linha anterior.',
  'Diga em voz alta o que você acha que está errado antes de editar. Quem descreve o problema primeiro conserta com uma mudança; quem apaga linhas no escuro piora.'
];

const guides = {
  SyntaxError: { title: 'Python não conseguiu ler a instrução', meaning: 'A frase está escrita de um jeito que Python não entende, então nada foi executado.', steps: ['Confira aspas e parênteses abertos e não fechados.', 'Verifique se falta os dois-pontos no fim do if, for, while, def ou class.', 'Confira se usou = (atribuir) onde precisava de == (comparar).', 'O erro pode estar na linha anterior à indicada, quando algo ficou aberto.'] },
  IndentationError: { title: 'Os espaços do início da linha não fecham', meaning: 'Python usa a indentação para saber o que está dentro de cada bloco.', steps: ['Use sempre quatro espaços por nível, nunca tabulação misturada com espaços.', 'Depois de uma linha terminada em dois-pontos, a próxima precisa estar indentada.', 'Linhas do mesmo bloco precisam ter exatamente o mesmo recuo.'] },
  TabError: { title: 'Tabulação misturada com espaços', meaning: 'O arquivo usa os dois tipos de recuo, e Python não consegue decidir os níveis.', steps: ['Troque todas as tabulações por quatro espaços.', 'Reescreva a indentação das linhas do bloco afetado.'] },
  NameError: { title: 'Esse nome não existe (ainda)', meaning: 'Python chegou a um nome que nunca foi criado até essa linha.', steps: ['Confira se escreveu o nome igual à criação: idade e Idade são diferentes.', 'Verifique se a linha que cria a variável está antes de onde ela é usada.', 'Se era um texto, ele precisa de aspas: print("Ana"), não print(Ana).', 'Se era uma função, confira o nome e se ela foi definida antes da chamada.'] },
  UnboundLocalError: { title: 'A variável existe fora, mas não dentro da função', meaning: 'Dentro da função, o nome é tratado como local porque recebe um valor ali.', steps: ['Receba o valor como parâmetro em vez de depender de uma variável de fora.', 'Ou crie a variável dentro da função antes de usá-la.'] },
  TypeError: { title: 'Tipos incompatíveis na operação', meaning: 'A operação não faz sentido para os tipos envolvidos, como somar texto com número.', steps: ['Converta antes de calcular: int("21") vira número; str(21) vira texto.', 'Lembre que input() sempre devolve texto.', 'Confira a quantidade de argumentos que a função espera.', 'Se aparecer NoneType, alguma função devolveu None — métodos como append e sort não devolvem a lista.'] },
  ValueError: { title: 'O tipo está certo, mas o valor não serve', meaning: 'A função recebeu algo do tipo esperado, porém com conteúdo inválido.', steps: ['int("abc") falha porque o texto não representa um número inteiro.', 'Verifique o valor que chegou imprimindo-o antes da conversão.', 'Trate a possibilidade com try e except ValueError quando a entrada vem de fora.'] },
  ZeroDivisionError: { title: 'Divisão por zero', meaning: 'Nenhum número pode ser dividido por zero.', steps: ['Verifique o divisor com if antes de dividir.', 'Em médias, confira se a quantidade de itens não é zero.'] },
  IndexError: { title: 'Essa posição não existe na sequência', meaning: 'O índice pedido está fora do tamanho da lista ou do texto.', steps: ['A contagem começa em zero: uma lista de 3 itens vai de 0 a 2.', 'Use len(lista) para conferir o tamanho antes de acessar.', 'lista[-1] é uma forma segura de pegar o último item de uma lista não vazia.'] },
  KeyError: { title: 'Essa chave não existe no dicionário', meaning: 'O dicionário não tem a chave pedida entre colchetes.', steps: ['Confira a grafia exata da chave, incluindo maiúsculas.', 'Use dicionario.get("chave") quando a ausência é um caso esperado.', 'Imprima o dicionário para ver quais chaves existem de fato.'] },
  AttributeError: { title: 'Esse objeto não tem esse método ou atributo', meaning: 'O nome depois do ponto não existe para esse tipo de objeto.', steps: ['Confira o tipo do objeto com type(valor).', 'Verifique a grafia do método: .upper(), não .Upper().', 'Se aparecer NoneType, o objeto veio de uma função que devolveu None.'] },
  ModuleNotFoundError: { title: 'Esse módulo não foi encontrado', meaning: 'O import pede um módulo que não está disponível neste ambiente.', steps: ['Confira o nome do módulo.', 'Neste laboratório existe a biblioteca padrão do Python; pacotes externos precisam do seu ambiente local com pip.'] },
  ImportError: { title: 'O módulo existe, mas o recurso importado não', meaning: 'O nome pedido no from ... import ... não foi encontrado no módulo.', steps: ['Confira a grafia do recurso importado.', 'Verifique na documentação oficial em qual módulo esse nome vive.'] },
  RecursionError: { title: 'A função chamou a si mesma sem parar', meaning: 'Faltou um caso de parada na recursão.', steps: ['Garanta uma condição que devolva um valor sem chamar a função de novo.', 'Confira se o argumento realmente caminha para esse caso de parada.'] },
  EOFError: { title: 'O programa pediu uma entrada que não existe', meaning: 'input() tentou ler uma linha, mas não havia mais nada para ler.', steps: ['Preencha o campo "Entradas para input()", uma resposta por linha, antes de executar.', 'Cada chamada de input() consome uma linha dessas entradas.'] },
  KeyboardInterrupt: { title: 'A execução foi interrompida', meaning: 'O programa parou antes de terminar.', steps: ['Se havia um laço infinito, confira o que deveria encerrar a condição.'] }
};

const fallback = { title: 'Erro durante a execução', meaning: 'O programa começou a rodar e parou nesta linha.', steps: ['Leia a última linha da mensagem: ela nomeia o tipo do erro.', 'Vá até a linha indicada e confira os valores envolvidos com um print pequeno.', 'Consulte a documentação oficial pelo nome exato do erro.'] };

export function readError(output) {
  if (typeof output !== 'string' || !output.trim()) return null;
  const lines = output.split('\n').map(line => line.trim()).filter(Boolean);
  const last = lines[lines.length - 1] || '';
  const match = last.match(/^([A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception|Interrupt|Exit))\s*(?::\s*(.*))?$/);
  if (!match) return null;
  const type = match[1].split('.').pop();
  const numbers = [...output.matchAll(/line (\d+)/g)].map(m => Number(m[1]));
  const guide = type === 'SyntaxError' && /cannot assign to function call/.test(match[2] || '') ? { title: 'Separe a leitura e a conversão em duas linhas', meaning: 'Uma chamada como input() não pode ficar à esquerda de =.', steps: ['Primeira linha: texto = input("Quanto é sua despesa? ")', 'Segunda linha: despesa_1 = float(texto)', 'Terceira linha, se quiser mostrar: print(despesa_1)', 'Não junte as duas ações como despesa_1 = input() = float(despesa_1).'] } : guides[type] || fallback;
  return { type, message: match[2] || '', line: numbers.length ? numbers[numbers.length - 1] : null, ...guide };
}
