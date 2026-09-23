// Diagnóstico dos erros de classes com os nomes do código do estudante.
//
// O histórico mostrou 94 das 95 execuções com erro dele em classes e objetos, quase sempre os
// mesmos enganos: método sem self ("takes 0 positional arguments but 1 was given", 14 vezes),
// método chamado na lista em vez do objeto, a classe Pessoa usada no lugar do objeto pessoa1,
// um método que a classe não tem. A ajuda genérica por tipo ("confira o tipo com type()")
// não ajudava a achar nenhum deles. Aqui o código é lido para dizer qual é a causa, com o nome
// da classe, do método e do objeto que ele mesmo escreveu.

const recuo = (linha) => linha.length - linha.trimStart().length;

// Classes (com métodos, parâmetros e atributos), objetos criados a partir delas, funções soltas
// e em que linha cada nome recebe valor pela primeira vez.
export function lerEstrutura(codigo) {
  const linhas = String(codigo || '').split('\n');
  const classes = {};
  const objetos = {};
  const funcoes = new Set();
  const atribuicoes = {};
  let atual = null;
  linhas.forEach((linha, i) => {
    const limpa = linha.replace(/#.*$/, '');
    if (!limpa.trim()) return;
    const nivel = recuo(limpa);
    if (nivel === 0) atual = null;
    const classe = limpa.match(/^class\s+(\w+)\s*(?:\(\s*(\w+)\s*\))?\s*:/);
    if (classe) {
      atual = classe[1];
      classes[atual] = { base: classe[2] || null, metodos: {}, atributos: new Set() };
      return;
    }
    const def = limpa.match(/^\s*def\s+(\w+)\s*\(([^)]*)\)/);
    if (def) {
      const params = def[2].split(',').map((p) => p.split('=')[0].trim()).filter(Boolean);
      if (atual && nivel > 0) classes[atual].metodos[def[1]] = params;
      else funcoes.add(def[1]);
      return;
    }
    if (atual) for (const m of limpa.matchAll(/self\.(\w+)\s*(?:[+\-*/]?=)(?!=)/g)) classes[atual].atributos.add(m[1]);
    const atribuicao = limpa.match(/^(\w+)\s*=(?!=)\s*(\w+)?\s*(\()?/);
    if (atribuicao && nivel === 0) {
      if (!(atribuicao[1] in atribuicoes)) atribuicoes[atribuicao[1]] = i + 1;
      if (atribuicao[3] && atribuicao[2]) objetos[atribuicao[1]] = atribuicao[2];
    }
  });
  // Um objeto só conta se veio de uma classe do próprio código.
  for (const [nome, classe] of Object.entries(objetos)) if (!classes[classe]) delete objetos[nome];
  return { classes, objetos, funcoes, atribuicoes };
}

const objetoDe = (estrutura, classe) => Object.keys(estrutura.objetos).find((nome) => estrutura.objetos[nome] === classe);
const classeDoMetodo = (estrutura, metodo) => Object.keys(estrutura.classes).find((c) => metodo in estrutura.classes[c].metodos);
const lista = (itens) => (itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`);

// Distância de edição pequena: "satus" e "status", "comprimentar" e "cumprimentar".
const distancia = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
};
const parecido = (nome, opcoes) => opcoes.find((o) => o !== nome && distancia(nome.toLowerCase(), o.toLowerCase()) <= 2);

const guia = (title, meaning, steps) => ({ title, meaning, steps });
const EM_PORTUGUES = { list: 'lista', dict: 'dicionário', str: 'texto', int: 'número inteiro', float: 'número', tuple: 'tupla', set: 'conjunto', NoneType: 'None' };
const tipoLegivel = (t) => EM_PORTUGUES[t] || t;

export function diagnosticoDeClasses(tipo, mensagem, codigo, linhaDoErro) {
  const msg = String(mensagem || '');
  const e = lerEstrutura(codigo);
  let m;

  if (tipo === 'TypeError' && (m = msg.match(/^(\w+)\.(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/))) {
    const [, classe, metodo, recebe, veio] = m;
    const params = e.classes[classe]?.metodos[metodo];
    if (metodo !== '__init__' && params && params[0] !== 'self') {
      return guia(`O método ${metodo} está sem o self`,
        `Todo método precisa do self como primeiro parâmetro. O Python entrega o objeto nele sozinho. Sem o self, esse objeto não tem onde entrar, e o Python reclama.`,
        [`Escreva def ${metodo}(${['self', ...params].join(', ')}):`, `Dentro do método, leia o que o objeto guardou com self, como self.${[...(e.classes[classe]?.atributos || [])][0] || 'nome'}.`, 'Na chamada, não passe o objeto: o Python faz isso sozinho.']);
    }
    const extras = Number(veio) - Number(recebe);
    return guia(`${metodo} recebeu valores a mais`,
      `${Number(recebe) - 1 === 0 ? `${metodo} não recebe nenhum valor` : `${metodo} recebe ${Number(recebe) - 1} valor(es)`}, e a chamada mandou ${Number(veio) - 1}. O self não conta: o Python passa o objeto sozinho.`,
      [`Confira os parênteses da chamada: se ${metodo} não recebe nada, chame ${metodo}() vazio.`, extras > 0 ? `Tire ${extras} valor(es) da chamada, ou acrescente o parâmetro no def ${metodo}.` : 'Confira a quantidade de valores na chamada.']);
  }

  if (tipo === 'TypeError' && (m = msg.match(/^(\w+)\.(\w+)\(\) missing 1 required positional argument: 'self'/))) {
    const [, classe, metodo] = m;
    const objeto = objetoDe(e, classe);
    return guia(`${metodo} foi chamado pela classe, e não por um objeto`,
      `${classe}.${metodo}() chama o método pelo molde. O Python não sabe de qual objeto é, então falta o self. Métodos são chamados pelo objeto criado com a classe.`,
      [objeto ? `Use o seu objeto: ${objeto}.${metodo}()` : `Crie o objeto primeiro, por exemplo ${classe.toLowerCase()} = ${classe}(...), e chame ${classe.toLowerCase()}.${metodo}().`, 'A classe (com maiúscula) é o molde; o objeto (a variável) é quem tem os dados.']);
  }

  if (tipo === 'TypeError' && (m = msg.match(/^(\w+)\.__init__\(\) missing (\d+) required positional arguments?: (.+)$/))) {
    const [, classe, , faltam] = m;
    const params = (e.classes[classe]?.metodos.__init__ || []).filter((p) => p !== 'self');
    return guia(`Faltaram dados na criação de ${classe}`,
      `O __init__ de ${classe} pede ${params.length ? lista(params) : 'dados'} (o self o Python passa sozinho). Na criação, faltou ${faltam.replace(/'/g, '')}.`,
      [`Passe todos, na mesma ordem: ${classe}(${params.join(', ')}).`, 'Cada valor da criação vai para o parâmetro na mesma posição do __init__.']);
  }

  if (tipo === 'AttributeError' && (m = msg.match(/^'(\w+)' object has no attribute '(\w+)'/))) {
    const [, tipoDoObjeto, nome] = m;
    const classe = e.classes[tipoDoObjeto];
    if (classe) {
      const metodos = Object.keys(classe.metodos).filter((n) => n !== '__init__');
      const tem = [...classe.atributos, ...metodos];
      const quase = parecido(nome, tem);
      if (quase) {
        return guia(`${nome} está escrito diferente: é ${quase}`,
          `A classe ${tipoDoObjeto} tem ${quase}, e o código pediu ${nome}. Para o Python, uma letra a mais ou a menos já é outro nome.`,
          [`Troque ${nome} por ${quase}.`, 'Copie o nome direto do def ou do self. para não errar a grafia.']);
      }
      const outra = classeDoMetodo(e, nome);
      return guia(`A classe ${tipoDoObjeto} não tem ${nome}`,
        outra ? `${nome} é da classe ${outra}, não de ${tipoDoObjeto}. Cada objeto só tem o que a sua própria classe define.` : `Um objeto só tem o que a classe dele define. ${tipoDoObjeto} tem ${tem.length ? lista(tem) : 'só o __init__'}; ${nome} não está entre eles.`,
        [tem.length ? `Use um dos nomes que existem: ${lista(tem)}.` : `Crie ${nome} dentro da classe, com self.${nome} = ... no __init__ ou def ${nome}(self):.`, 'Se o nome é de um atributo, confira se o __init__ guarda self.' + nome + '.']);
    }
    if (e.classes[nome]) {
      return guia(`${nome} é uma classe: crie o objeto sem ponto`,
        `${nome} é uma classe do seu código, não algo de dentro de um(a) ${tipoLegivel(tipoDoObjeto)}. Para criar um objeto, chame a classe sozinha.`,
        [`Escreva ${nome.toLowerCase()} = ${nome}(...), sem nada antes de ${nome}.`, `Depois use o objeto: ${nome.toLowerCase()}.nome_do_metodo().`]);
    }
    const dono = classeDoMetodo(e, nome);
    if (dono) {
      const objeto = objetoDe(e, dono);
      return guia(`${nome} é do objeto ${dono}, não de um(a) ${tipoLegivel(tipoDoObjeto)}`,
        `${nome} foi chamado num(a) ${tipoLegivel(tipoDoObjeto)}. Só os objetos da classe ${dono} sabem fazer ${nome}.`,
        [objeto ? `Chame no seu objeto: ${objeto}.${nome}().` : `Crie um objeto de ${dono} e chame ${nome} nele.`, 'Antes do ponto vai o objeto que tem o método, não os dados que ele guarda.']);
    }
  }

  if (tipo === 'AttributeError' && (m = msg.match(/^type object '(\w+)' has no attribute '(\w+)'/))) {
    const [, classe, nome] = m;
    const naClasse = e.classes[classe] && (e.classes[classe].atributos.has(nome) || nome in e.classes[classe].metodos);
    if (e.classes[classe] && !naClasse) {
      const tem = [...e.classes[classe].atributos, ...Object.keys(e.classes[classe].metodos).filter((n) => n !== '__init__')];
      return guia(`A classe ${classe} não tem ${nome}`, `${classe} tem ${tem.length ? lista(tem) : 'só o __init__'}; ${nome} não está entre eles.`, [tem.length ? `Use um dos nomes que existem: ${lista(tem)}.` : `Crie ${nome} dentro da classe.`]);
    }
    if (naClasse) {
      const objeto = objetoDe(e, classe);
      return guia(`${classe} é o molde; ${nome} fica no objeto`,
        `${nome} fica guardado em cada objeto, não na classe. Use o nome do objeto antes do ponto.`,
        [objeto ? `Use o objeto: ${objeto}.${nome}.` : `Crie um objeto, por exemplo ${classe.toLowerCase()} = ${classe}(...), e use ${classe.toLowerCase()}.${nome}.`]);
    }
  }

  if (tipo === 'NameError' && (m = msg.match(/^name '(\w+)' is not defined(?:\. Did you mean: '(\w+)'\?)?/))) {
    const [, nome, sugestao] = m;
    if (sugestao && e.classes[sugestao] && nome.toLowerCase() === sugestao.toLowerCase()) {
      const objeto = objetoDe(e, sugestao);
      return guia(`${sugestao} é a classe; o objeto tem outro nome`,
        `${sugestao}, com maiúscula, é o molde. ${nome} não foi criado. O objeto é a variável que recebe ${sugestao}(...).`,
        [objeto ? `O seu objeto se chama ${objeto}: use ${objeto}.` : `Crie o objeto antes: ${nome} = ${sugestao}(...).`]);
    }
    const dono = classeDoMetodo(e, nome);
    if (dono) {
      const objeto = objetoDe(e, dono);
      return guia(`${nome} é um método: chame pelo objeto`,
        `${nome} está dentro da classe ${dono}, então não existe sozinho no programa. Métodos são chamados com o objeto na frente e um ponto.`,
        [objeto ? `Escreva ${objeto}.${nome}().` : `Crie um objeto de ${dono} e escreva objeto.${nome}().`]);
    }
    const linhaCriada = e.atribuicoes[nome];
    if (linhaCriada && linhaDoErro && linhaCriada > linhaDoErro) {
      return guia(`${nome} foi usado antes de ser criado`,
        `O Python lê de cima para baixo. ${nome} só é criado na linha ${linhaCriada}, e a linha ${linhaDoErro} já tentou usar.`,
        [`Mova ${nome} = ... para antes da linha ${linhaDoErro}.`]);
    }
    const conhecidos = [...Object.keys(e.atribuicoes), ...e.funcoes, ...Object.keys(e.classes)];
    const igualSemCaixa = conhecidos.find((n) => n !== nome && n.toLowerCase() === nome.toLowerCase());
    if (igualSemCaixa) {
      return guia(`${nome} e ${igualSemCaixa} são nomes diferentes`,
        `Maiúsculas contam: o código criou ${igualSemCaixa}, e esta linha pediu ${nome}.`,
        [`Troque ${nome} por ${igualSemCaixa}.`]);
    }
  }
  if (tipo === 'NameError' && /^name 'self' is not defined/.test(msg)) {
    return guia('self só existe dentro de um método',
      'self é o objeto dentro dos métodos da classe (def nome(self)). Fora da classe, ele não existe.',
      ['Fora da classe, use o nome do seu objeto no lugar de self.', 'Se a linha devia estar dentro de um método, confira o recuo dela.']);
  }
  // O próprio Python sugere o nome certo: "Did you mean: 'sqrt'?".
  if ((m = msg.match(/'(\w+)'(?: is not defined)?\. Did you mean: '(\w+)'\?/))) {
    return guia(`O nome certo é ${m[2]}`, `O código escreveu ${m[1]}, e o Python achou ${m[2]} parecido. Uma letra trocada já muda o nome.`, [`Troque ${m[1]} por ${m[2]}.`]);
  }
  return null;
}
