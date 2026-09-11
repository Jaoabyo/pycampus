import { fileNameFor } from './project-steps.js';

export const readmeFields = [
  ['purpose', '1 · O que seu programa faz?', 'Explique em duas frases quem pode usar e qual problema ele resolve.'],
  ['usage', '2 · Como uma pessoa usa?', 'Quais perguntas aparecem? Em que ordem? Se houver um menu, explique as opções.'],
  ['example', '3 · Mostre um exemplo seu', 'Escreva os valores que você usou e o resultado que realmente apareceu.'],
  ['tests', '4 · Como você conferiu?', 'Conte quais casos testou: um comum, um valor de limite e uma entrada inválida, se o programa já trata isso.'],
  ['limits', '5 · O que ainda falta?', 'Diga o que esta versão ainda não faz e o que pretende estudar depois.']
];

export function buildReadme(project, fields) {
  return `# ${project.title}\n\n${fields.purpose || '[Escreva aqui o propósito do seu projeto.]'}\n\n## Como executar\n\nRequer Python 3 no computador. Salve os arquivos na mesma pasta e abra um terminal nela.\n\n\`\`\`sh\npython ${fileNameFor(project.id)}\n\`\`\`\n\n${project.id === 'api' ? 'Se esta versão já contém rotas FastAPI: instale fastapi e uvicorn no ambiente do projeto e inicie com `python -m uvicorn api:app --reload`. Abra http://127.0.0.1:8000/docs. A execução de funções sem servidor pode usar o comando Python acima.\n\n' : ''}${fields.usage || '[Explique como usar esta versão.]'}\n\n## Exemplo de uso\n\n${fields.example || '[Registre uma entrada e a saída observada.]'}\n\n## Testes realizados\n\n${fields.tests || '[Descreva os testes que você realmente fez.]'}\n\n## Limitações e próximos passos\n\n${fields.limits || '[Descreva o que falta implementar.]'}\n`;
}

