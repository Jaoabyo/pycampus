// Dicas de legibilidade mostradas depois de uma execução bem-sucedida, no espírito do style50 do CS50:
// nunca bloqueiam a conclusão do exercício e só apontam hábitos que a documentação oficial recomenda (PEP 8).
const stripLiterals = line => line.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, '""').replace(/#.*$/, '');

function assignmentWithoutSpaces(line) {
  const code = stripLiterals(line);
  const index = code.indexOf('=');
  if (index <= 0 || code.includes('(') && code.indexOf('(') < index) return false;
  if (code[index + 1] === '=' || '=!<>+-*/%:&|^'.includes(code[index - 1])) return false;
  return code[index - 1] !== ' ' || code[index + 1] !== ' ';
}

export function styleTips(code) {
  if (typeof code !== 'string' || !code.trim()) return [];
  const lines = code.split('\n'), tips = [];
  const add = (id, message) => tips.push({ id, message });

  if (code.includes('\t')) add('tabs', 'Você usou tabulação para indentar. Em Python o padrão é quatro espaços por nível: misturar os dois é a causa mais comum de IndentationError.');

  const longIndex = lines.findIndex(line => line.length > 79);
  if (longIndex >= 0) add('long-line', `A linha ${longIndex + 1} tem ${lines[longIndex].length} caracteres. O guia oficial de estilo (PEP 8) sugere até 79, para a linha caber na tela sem rolar.`);

  const spacingIndex = lines.findIndex(assignmentWithoutSpaces);
  if (spacingIndex >= 0) add('assignment-spacing', `Na linha ${spacingIndex + 1}, escreva um espaço antes e depois do =, como em total = 10. Dentro dos parênteses de uma chamada é o contrário: reverse=True fica sem espaços.`);

  const booleanIndex = lines.findIndex(line => /==\s*(True|False)\b/.test(stripLiterals(line)));
  if (booleanIndex >= 0) add('boolean-comparison', `Na linha ${booleanIndex + 1}, comparar com True não é necessário: uma condição já é um booleano. Prefira if ativo: em vez de if ativo == True:.`);

  const semicolonIndex = lines.findIndex(line => stripLiterals(line).trim().endsWith(';'));
  if (semicolonIndex >= 0) add('semicolon', `A linha ${semicolonIndex + 1} termina com ponto e vírgula. Python não precisa dele: a quebra de linha já encerra a instrução.`);

  return tips;
}
