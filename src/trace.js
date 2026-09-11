// Pede ao worker um rastro da execução: cada linha percorrida, com as variáveis daquele
// instante e o que já tinha sido impresso. Usa um worker próprio e descartável, para a
// visualização nunca aparecer no diário de tentativas do estudante.
export function tracePython(code, stdin = '') {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`${import.meta.env.BASE_URL}python-worker.js`);
    const encerrar = () => { clearTimeout(limite); worker.terminate(); };
    const limite = setTimeout(() => { encerrar(); reject(new Error('A visualização demorou demais. Tente um exemplo menor.')); }, 120000);
    worker.onmessage = ({ data }) => {
      if (data.type === 'trace') { encerrar(); resolve(data); }
      else if (data.type === 'result' && !data.ok) { encerrar(); reject(new Error(data.output || 'Não consegui executar este código.')); }
    };
    worker.onerror = () => { encerrar(); reject(new Error('Não foi possível carregar o Python. Verifique sua conexão.')); };
    worker.postMessage({ code, stdin, trace: true });
  });
}
