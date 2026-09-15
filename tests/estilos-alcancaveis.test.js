import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// O estudante abriu um passo de projeto e encontrou a pergunta e o campo de texto espremidos
// lado a lado. Medido na tela: label.practice-field caía em display:inline, porque nenhuma
// regra batia nele. A classe existe em practice.css, e ProjectStudio.jsx não importava essa
// folha — as telas são lazy(), então o CSS só chega ao navegador se o estudante tiver passado
// antes pela tela que o importa. O mesmo defeito estava em onze componentes, e o layout
// quebrava ou não dependendo do caminho percorrido na sessão.
//
// A regra aqui é simples: se um componente usa uma classe que alguma folha define, a folha
// precisa estar ao alcance dele — importada por ele mesmo ou globalmente, pelo main.jsx.

const raiz = new URL('../src/', import.meta.url);
const ler = arquivo => readFileSync(new URL(arquivo, raiz), 'utf8');
const arquivos = readdirSync(raiz);

const folhasDaClasse = {};
for (const folha of arquivos.filter(f => f.endsWith('.css'))) {
  for (const achado of ler(folha).matchAll(/\.([a-z][a-z0-9-]{2,})/g)) {
    (folhasDaClasse[achado[1]] ||= new Set()).add(folha);
  }
}

const globais = new Set(['styles.css']);
for (const achado of ler('main.jsx').matchAll(/import '\.\/([a-z-]+\.css)'/g)) globais.add(achado[1]);

const classesUsadas = fonte => new Set(
  [...fonte.matchAll(/className=[{"]['"`]?([^"'`}]+)/g)]
    .flatMap(achado => achado[1].split(/[\s$]+/))
    .filter(Boolean)
);

test('toda classe usada num componente tem a folha de estilo ao alcance dele', () => {
  const orfas = [];
  for (const componente of arquivos.filter(f => f.endsWith('.jsx'))) {
    const fonte = ler(componente);
    const importadas = new Set([...fonte.matchAll(/import '\.\/([a-z-]+\.css)'/g)].map(achado => achado[1]));
    for (const classe of classesUsadas(fonte)) {
      const donas = folhasDaClasse[classe];
      if (!donas) continue;
      if ([...donas].some(folha => globais.has(folha) || importadas.has(folha))) continue;
      orfas.push(`${componente} usa .${classe}, definida só em ${[...donas].join('/')}`);
    }
  }
  assert.deepEqual(orfas, [], `classes sem folha ao alcance:\n${orfas.join('\n')}`);
});
