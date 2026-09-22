// Conferências funcionais das entregas: rodam o código do estudante contra valores conhecidos.
//
// Existe porque a plataforma dizia "Deu certo!" para qualquer programa que não levantasse
// exceção. Um código com `soma =+ nota` executa sem erro e devolve 2.25 onde a média é 7.5 —
// e era comemorado. Isso não é só inútil: ensina errado, porque confirma o engano na hora em
// que o estudante estava procurando o erro.
//
// Conferir a saída contra um texto fixo não serve aqui: a entrega pede que o estudante troque
// as notas e teste outros casos, então não existe uma saída única. O que existe é o
// comportamento: `calcular_media([6, 7, 8, 9])` precisa dar 7.5, seja qual for a lista que ele
// deixou no arquivo. Por isso cada conferência chama o que ele escreveu.

const MARCA = '__CAMPUS_CONFERENCIAS__';

// Uma conferência é um trecho Python que enxerga o que o estudante definiu e precisa deixar
// `ok` (deu certo?) e `detalhe` (o que foi observado, para ele ler quando falhar).
export const conferencia = (id, descricao, passo, codigo) => ({ id, descricao, passo, codigo });

// O arnês roda cada conferência isolada: uma que quebre não pode derrubar as outras nem o
// programa do estudante, e o erro dela vira texto legível em vez de traceback.
export const programaComConferencias = (codigo, conferencias = []) => {
  if (!conferencias.length) return String(codigo || '');
  const fontes = JSON.stringify(
    JSON.stringify(conferencias.map(({ id, descricao, codigo: fonte }) => ({ id, descricao, codigo: fonte }))),
  );
  return [
    String(codigo || ''),
    '',
    '# --- conferência automática do PyCampus (não faz parte da sua entrega) ---',
    'import json as _campus_json',
    '_campus_saida = []',
    `_campus_fontes = _campus_json.loads(${fontes})`,
    'for _campus_item in _campus_fontes:',
    '    _campus_ambiente = dict(globals())',
    '    try:',
    '        exec(_campus_item["codigo"], _campus_ambiente)',
    '        _campus_saida.append({',
    '            "id": _campus_item["id"],',
    '            "descricao": _campus_item["descricao"],',
    '            "ok": bool(_campus_ambiente.get("ok")),',
    '            "detalhe": str(_campus_ambiente.get("detalhe", "")),',
    '        })',
    '    except Exception as _campus_erro:',
    '        _campus_saida.append({',
    '            "id": _campus_item["id"],',
    '            "descricao": _campus_item["descricao"],',
    '            "ok": False,',
    '            "detalhe": "%s: %s" % (type(_campus_erro).__name__, _campus_erro),',
    '        })',
    `print("${MARCA}" + _campus_json.dumps(_campus_saida))`,
  ].join('\n');
};

// Separa o que o estudante escreveu do que o arnês imprimiu. A marca nunca aparece na tela:
// ver a própria conferência no meio da saída confundiria quem está lendo o resultado.
export const lerConferencias = (saida = '') => {
  const linhas = String(saida).split('\n');
  const restantes = [];
  let resultados = null;
  for (const linha of linhas) {
    const posicao = linha.indexOf(MARCA);
    if (posicao < 0) { restantes.push(linha); continue; }
    const antes = linha.slice(0, posicao);
    if (antes) restantes.push(antes);
    try {
      const lido = JSON.parse(linha.slice(posicao + MARCA.length));
      if (Array.isArray(lido)) resultados = lido;
    } catch {
      // Uma conferência ilegível não pode virar "reprovado": ela simplesmente não aconteceu.
    }
  }
  return { saida: restantes.join('\n').replace(/\n+$/, ''), resultados };
};

export const conferenciasDoPasso = (entrega, passoId) =>
  (entrega?.conferencias || []).filter(({ passo }) => passo === passoId);

// Sem resultado não se afirma nada. Um programa que nem chegou às conferências — porque parou
// antes — não está aprovado nem reprovado: está por conferir, e a tela precisa dizer isso.
export const situacaoDasConferencias = (resultados) => {
  if (!Array.isArray(resultados) || !resultados.length) return 'sem-conferencia';
  return resultados.every(({ ok }) => ok) ? 'aprovada' : 'reprovada';
};
