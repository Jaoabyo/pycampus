// Só o que o XP, os emblemas e a validação do backup precisam saber dos exercícios de unidade.
//
// Esses três rodam no carregamento inicial do site; o banco completo (faculdade-exercicios.js,
// com enunciados, alternativas e explicações das 20 questões) não precisa ir junto — e ia,
// ocupando quase todo o limite do bundle inicial. Um teste garante que esta lista e o banco
// continuam dizendo a mesma coisa.
export const exerciciosResumidos = Object.freeze([
  { id: 'ex-u1', unidade: 'u1', titulo: 'Exercício da Unidade 1' },
  { id: 'ex-u2', unidade: 'u2', titulo: 'Exercício da Unidade 2' },
  { id: 'ex-u3', unidade: 'u3', titulo: 'Exercício da Unidade 3' },
  { id: 'ex-u4', unidade: 'u4', titulo: 'Exercício da Unidade 4' },
]);
