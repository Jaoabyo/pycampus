// Test fixtures only. These are not imported by the platform.
export const functionBridgeSolutions = {
  'ponte-funcao-chamar': 'def iniciar():\n    print("Vamos estudar")\n\niniciar()',
  'ponte-funcao-retornar': 'def assunto():\n    return "Python"\n\ntexto = assunto()\nprint(texto)',
  'ponte-funcao-parametro': 'def dobro(numero):\n    return numero * 2\n\nresultado = dobro(5)\nprint(resultado)',
  'ponte-funcao-dois-parametros': 'def somar(primeiro, segundo):\n    return primeiro + segundo\n\ntotal = somar(7, 3)\nprint(total)',
  'ponte-funcao-comparar': 'def mesma_cor(recebida, esperada):\n    return recebida == esperada\n\nresultado = mesma_cor("azul", "azul")\nprint(resultado)',
  'ponte-funcao-ponto': 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        return 1\n    else:\n        return 0\n\nponto = ponto_por_cor("azul", "azul")\nprint(ponto)',
  'ponte-funcao-entrada': 'def ler_cor(mensagem):\n    resposta = input(mensagem)\n    return resposta\n\ncor = ler_cor("Qual é sua cor favorita? ")\nprint(cor)',
  'ponte-funcao-reutilizar': 'def ponto_por_cor(recebida, esperada):\n    if recebida == esperada:\n        return 1\n    else:\n        return 0\n\nprimeiro = ponto_por_cor("azul", "azul")\nsegundo = ponto_por_cor("verde", "azul")\ntotal = primeiro + segundo\nprint(total)'
};

export const functionBridgeExampleOutputs = ['A porta abriu', 'Bom dia', '12', 'Bom dia', 'False', '1', 'Ana', '10'];
