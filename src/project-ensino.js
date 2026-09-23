// "Como fazer" de cada passo dos projetos da Formação.
//
// Os passos diziam o que fazer, mas nunca como: o campo "why" era uma cópia do enunciado nos 70
// passos, nenhum passo trazia exemplo de código e quase nenhum conferia o resultado. O estudante
// disse do quiz: "não especifica direito, é algo muito raso e não explica nada". Aqui cada passo
// ganha a explicação da ideia e um exemplo pequeno em OUTRO assunto (cores, animais), para ele
// entender o jeito e aplicar no próprio quiz sem copiar a resposta. A saída de cada exemplo é
// medida no Pyodide por scripts/check-project-ensino.mjs, com as entradas indicadas.

// local: o passo roda no computador (servidor), não no navegador; o exemplo não é executado aqui.
const passo = (explica, exemplo, entrada, saida, opcoes = {}) => ({ explica, exemplo, entrada, saida, ...opcoes });

export const ensinoDosProjetos = {
  api: {
    'construcao-1': passo(
      'Antes de pensar em servidor, a lógica vive em funções comuns. criar_meta recebe o nome, monta um dicionário com um id novo e guarda na lista; buscar_meta percorre a lista e devolve a meta com aquele id, ou None. Testar com print mostra que as regras funcionam sem rede nenhuma.',
      'metas = []\n\ndef criar_meta(nome):\n    meta = {"id": len(metas) + 1, "nome": nome}\n    metas.append(meta)\n    return meta\n\ndef buscar_meta(id_meta):\n    for meta in metas:\n        if meta["id"] == id_meta:\n            return meta\n    return None\n\ncriar_meta("Ler 10 páginas")\ncriar_meta("Beber água")\nprint(buscar_meta(2))\nprint(buscar_meta(9))',
      '',
      '{\'id\': 2, \'nome\': \'Beber água\'}\nNone',
    ),
    'construcao-2': passo(
      'raise ValueError("...") recusa um dado inválido e para a função com uma mensagem clara; quem chama pode tratar com try e except. Para páginas, uma fatia da lista devolve só um pedaço: metas[inicio:inicio + limite].',
      'metas = [{"id": 1, "nome": "Ler"}, {"id": 2, "nome": "Correr"}, {"id": 3, "nome": "Dormir cedo"}]\n\ndef criar_meta(nome):\n    if not nome.strip():\n        raise ValueError("O nome não pode ficar vazio.")\n    metas.append({"id": len(metas) + 1, "nome": nome})\n\ndef listar_metas(inicio, limite):\n    return metas[inicio:inicio + limite]\n\ntry:\n    criar_meta("   ")\nexcept ValueError as erro:\n    print("Recusado:", erro)\nprint(listar_metas(0, 2))\nprint(listar_metas(2, 2))',
      '',
      'Recusado: O nome não pode ficar vazio.\n[{\'id\': 1, \'nome\': \'Ler\'}, {\'id\': 2, \'nome\': \'Correr\'}]\n[{\'id\': 3, \'nome\': \'Dormir cedo\'}]',
    ),
    'api-tabela': passo(
      'As funções continuam com o mesmo nome e o mesmo jeito de usar; só muda onde os dados ficam. O append vira um INSERT com ?, e o for de busca vira um SELECT com WHERE id = ?. lastrowid diz qual id o banco acabou de dar.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE metas (id INTEGER PRIMARY KEY, nome TEXT)")\n\ndef criar_meta(nome):\n    cursor = conn.execute("INSERT INTO metas (nome) VALUES (?)", (nome,))\n    conn.commit()\n    return cursor.lastrowid\n\ndef buscar_meta(id_meta):\n    return conn.execute("SELECT id, nome FROM metas WHERE id = ?", (id_meta,)).fetchone()\n\nnovo = criar_meta("Ler 10 páginas")\nprint(novo)\nprint(buscar_meta(novo))',
      '',
      '1\n(1, \'Ler 10 páginas\')',
    ),
    'api-editar': passo(
      'Editar precisa de duas coisas: qual meta (o id, no WHERE) e o valor novo (no SET). Os dois vão como parâmetros, na ordem dos ?. Sem o WHERE, todas as metas ganhariam o nome novo. Mostrar todas depois prova que só uma mudou.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE metas (id INTEGER PRIMARY KEY, nome TEXT)")\nconn.executemany("INSERT INTO metas (nome) VALUES (?)", [("Ler",), ("Correr",)])\n\ndef editar_meta(id_meta, nome_novo):\n    conn.execute("UPDATE metas SET nome = ? WHERE id = ?", (nome_novo, id_meta))\n    conn.commit()\n\neditar_meta(2, "Caminhar")\nprint(conn.execute("SELECT * FROM metas").fetchall())',
      '',
      '[(1, \'Ler\'), (2, \'Caminhar\')]',
    ),
    'construcao-3': passo(
      'DELETE FROM ... WHERE id = ? apaga só a linha daquele id. O cuidado é o mesmo do UPDATE: sem o WHERE, a tabela inteira fica vazia. Os ids que ficaram não mudam.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE metas (id INTEGER PRIMARY KEY, nome TEXT)")\nconn.executemany("INSERT INTO metas (nome) VALUES (?)", [("Ler",), ("Correr",), ("Dormir cedo",)])\n\ndef remover_meta(id_meta):\n    conn.execute("DELETE FROM metas WHERE id = ?", (id_meta,))\n    conn.commit()\n\nremover_meta(2)\nprint(conn.execute("SELECT * FROM metas").fetchall())',
      '',
      '[(1, \'Ler\'), (3, \'Dormir cedo\')]',
    ),
    'construcao-4': passo(
      'Uma rota liga um endereço a uma função: quando alguém abre /metas/1 no navegador, o FastAPI chama a função e devolve o resultado como JSON. O {id_meta} no endereço vira o parâmetro da função. Isso roda no seu computador, não no navegador do PyCampus: instale com pip install "fastapi[standard]", salve como main.py e rode fastapi dev main.py.',
      'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/metas/{id_meta}")\ndef ler_meta(id_meta: int):\n    return {"id": id_meta, "nome": "Ler 10 páginas"}',
      '',
      '{"id":1,"nome":"Ler 10 páginas"}',
      { local: 'No computador, rode fastapi dev main.py e abra http://127.0.0.1:8000/metas/1 no navegador' },
    ),
    'construcao-5': passo(
      'Cada rota chama a função que você já testou: a rota não refaz a regra, só recebe o pedido e devolve a resposta. Quando a função recusa com ValueError, a rota transforma isso num erro HTTP, com HTTPException e status 400, para quem chamou entender o que houve.',
      'from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\nmetas = []\n\ndef criar_meta(nome):\n    if not nome.strip():\n        raise ValueError("O nome não pode ficar vazio.")\n    meta = {"id": len(metas) + 1, "nome": nome}\n    metas.append(meta)\n    return meta\n\n@app.post("/metas")\ndef rota_criar(nome: str):\n    try:\n        return criar_meta(nome)\n    except ValueError as erro:\n        raise HTTPException(status_code=400, detail=str(erro))',
      '',
      '{"detail":"O nome não pode ficar vazio."}',
      { local: 'No computador, rode fastapi dev main.py, abra http://127.0.0.1:8000/docs, escolha POST /metas e envie um nome só com espaços' },
    ),
  },
  'qualidade-projeto': {
    'qualidade-extrair-exemplo': passo(
      'Uma regra dentro de uma função fica fácil de testar: ela recebe os valores e devolve o resultado com return, sem input e sem print dentro. O print fica fora, em quem chamou. Assim a mesma regra serve para qualquer valor.',
      'def valor_do_frete(peso, preco_por_kg):\n    return peso * preco_por_kg\n\nprint(valor_do_frete(3, 5.0))\nprint(valor_do_frete(10, 5.0))',
      '',
      '15.0\n50.0',
    ),
    'construcao-1': passo(
      'No seu programa, procure uma conta ou decisão que hoje está misturada com input e print. Mova só essa regra para uma função: os valores entram como parâmetros e o resultado sai no return. O input e o print continuam do lado de fora.',
      'def frete_gratis(total):\n    return total >= 200\n\ntotal = 250\nif frete_gratis(total):\n    print("Frete grátis")\nelse:\n    print("Frete pago")',
      '',
      'Frete grátis',
    ),
    'construcao-2': passo(
      'assert confere uma afirmação: se ela for verdadeira, nada acontece; se for falsa, o programa para com AssertionError. Um teste é isso: chamar a função com um valor conhecido e afirmar o resultado esperado. Troque o esperado de propósito uma vez para ver a falha acontecer.',
      'def valor_do_frete(peso, preco_por_kg):\n    return peso * preco_por_kg\n\nassert valor_do_frete(3, 5.0) == 15.0\nprint("O teste passou.")',
      '',
      'O teste passou.',
    ),
    'construcao-3': passo(
      'Um bom conjunto de testes olha três lugares: o caso comum, o limite (bem na fronteira da regra) e uma entrada inválida. Nos limites é onde os erros aparecem: se o frete grátis vale a partir de 200, testar exatamente 200 mostra se você usou >= ou >.',
      'def frete_gratis(total):\n    if total < 0:\n        raise ValueError("O total não pode ser negativo.")\n    return total >= 200\n\nassert frete_gratis(250) is True\nassert frete_gratis(200) is True\ntry:\n    frete_gratis(-5)\n    print("Deveria ter recusado")\nexcept ValueError:\n    print("Entrada inválida recusada.")\nprint("Comum e limite passaram.")',
      '',
      'Entrada inválida recusada.\nComum e limite passaram.',
    ),
    'qualidade-nomear-testes': passo(
      'Colocar cada assert numa função com nome deixa claro o que ele confere. O nome começa com test_, que é a convenção das ferramentas de teste. A função só roda quando é chamada, então chame as duas no fim.',
      'def frete_gratis(total):\n    return total >= 200\n\ndef test_caso_comum():\n    assert frete_gratis(250) is True\n\ndef test_limite():\n    assert frete_gratis(200) is True\n\ntest_caso_comum()\ntest_limite()\nprint("Os dois testes passaram.")',
      '',
      'Os dois testes passaram.',
    ),
    'construcao-4': passo(
      'Com vários testes em funções, você roda todos de uma vez chamando cada um no fim do arquivo. Se nenhum assert falhar, a mensagem final aparece; se um falhar, o programa para naquele teste e mostra qual foi.',
      'def frete_gratis(total):\n    return total >= 200\n\ndef test_caso_comum():\n    assert frete_gratis(250) is True\n\ndef test_limite():\n    assert frete_gratis(200) is True\n\ndef test_abaixo():\n    assert frete_gratis(199.99) is False\n\nfor teste in [test_caso_comum, test_limite, test_abaixo]:\n    teste()\n    print("ok:", teste.__name__)\nprint("Todos os testes passaram.")',
      '',
      'ok: test_caso_comum\nok: test_limite\nok: test_abaixo\nTodos os testes passaram.',
    ),
    'construcao-5': passo(
      'Anotações de tipo dizem o que cada função espera e devolve: total: float e -> bool. Elas não mudam o resultado, mas ajudam quem lê. Separar cálculo, leitura e apresentação em funções diferentes deixa cada parte fácil de testar e trocar.',
      'def frete_gratis(total: float) -> bool:\n    return total >= 200\n\ndef mostrar(total: float) -> None:\n    print("Frete grátis" if frete_gratis(total) else "Frete pago")\n\nmostrar(250.0)\nmostrar(80.0)',
      '',
      'Frete grátis\nFrete pago',
    ),
  },
  final: {
    'construcao-1': passo(
      'Todo sistema começa com uma pessoa e um problema, antes de qualquer código. Escreva quem vai usar, o que atrapalha a vida dela e cinco coisas que a primeira versão precisa fazer. Pequeno e real é melhor do que grande e vago.',
      '# Quem: eu, estudando para a prova\n# Problema: esqueço como me senti nos dias de estudo\n# A primeira versão precisa:\n# 1. registrar o humor do dia (1 a 5)\n# 2. recusar valores fora de 1 a 5\n# 3. listar os registros\n# 4. mostrar a média da semana\n# 5. guardar os dados num banco\nprint("Plano escrito.")',
      '',
      'Plano escrito.',
    ),
    'final-uma-entrada': passo(
      'Comece pela menor informação do plano. Uma linha recebe com input, outra mostra o que chegou. Se for número, converta numa linha separada: assim, se der erro, você sabe se foi na leitura ou na conversão.',
      'texto = input("Humor de hoje (1 a 5): ")\nhumor = int(texto)\nprint("Recebi:", humor)',
      '4',
      'Humor de hoje (1 a 5): Recebi: 4',
    ),
    'final-uma-regra': passo(
      'Escreva a regra em português antes do if: "o humor tem de estar entre 1 e 5". O if testa o caso de recusa e o else fica com o caminho normal. Mensagens diferentes nos dois lados mostram qual caminho rodou.',
      'humor = int(input("Humor de hoje (1 a 5): "))\nif humor < 1 or humor > 5:\n    print("Use um número de 1 a 5.")\nelse:\n    print("Humor registrado:", humor)',
      '9',
      'Humor de hoje (1 a 5): Use um número de 1 a 5.',
    ),
    'construcao-2': passo(
      'Uma ação completa tem quatro partes: receber, conferir, fazer e responder. Aqui a ação é registrar o humor numa lista em memória. Uma coisa por vez, e só então a próxima.',
      'registros = []\n\ndef registrar(humor):\n    if humor < 1 or humor > 5:\n        return "Use um número de 1 a 5."\n    registros.append(humor)\n    return f"Registrado. Você tem {len(registros)} registro(s)."\n\nprint(registrar(4))\nprint(registrar(7))\nprint(registrar(3))',
      '',
      'Registrado. Você tem 1 registro(s).\nUse um número de 1 a 5.\nRegistrado. Você tem 2 registro(s).',
    ),
    'final-modelar-tabela': passo(
      'Antes de gravar, desenhe a tabela: quais colunas e o tipo de cada uma. Um id inteiro como chave primária costuma ser a primeira coluna. CREATE TABLE IF NOT EXISTS cria a tabela vazia, sem erro se ela já existir.',
      'import sqlite3\n\n# Colunas: id (INTEGER, chave), dia (TEXT), humor (INTEGER)\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE IF NOT EXISTS humores (id INTEGER PRIMARY KEY, dia TEXT, humor INTEGER)")\nprint([coluna[1] for coluna in conn.execute("PRAGMA table_info(humores)")])',
      '',
      '[\'id\', \'dia\', \'humor\']',
    ),
    'construcao-3': passo(
      'A lista em memória vira a tabela: o append vira um INSERT com ?, e a listagem vira um SELECT. No navegador, o banco vale só enquanto o programa roda; para guardar de verdade, rode no computador com um arquivo .db.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE humores (id INTEGER PRIMARY KEY, dia TEXT, humor INTEGER)")\nconn.execute("INSERT INTO humores (dia, humor) VALUES (?, ?)", ("segunda", 4))\nconn.execute("INSERT INTO humores (dia, humor) VALUES (?, ?)", ("terça", 3))\nconn.commit()\nfor linha in conn.execute("SELECT dia, humor FROM humores").fetchall():\n    print(linha)',
      '',
      '(\'segunda\', 4)\n(\'terça\', 3)',
    ),
    'final-funcao-testada': passo(
      'Tire a regra do meio do input e coloque numa função que recebe valores e devolve o resultado. Aí um assert confere um caso conhecido em uma linha, sem ninguém precisar digitar nada.',
      'def humor_valido(humor):\n    return 1 <= humor <= 5\n\nassert humor_valido(3) is True\nassert humor_valido(0) is False\nprint("A regra passou nos testes.")',
      '',
      'A regra passou nos testes.',
    ),
    'construcao-4': passo(
      'Confiável é o programa que não quebra com uma entrada ruim. Se a pessoa digita "bom" no lugar de um número, int() dá ValueError; try e except capturam isso e mostram uma mensagem que ela entende, em vez de um erro.',
      'def ler_humor(texto):\n    try:\n        humor = int(texto)\n    except ValueError:\n        return "Digite um número, por exemplo 4."\n    if not 1 <= humor <= 5:\n        return "Use um número de 1 a 5."\n    return f"Humor {humor} registrado."\n\nprint(ler_humor("4"))\nprint(ler_humor("bom"))\nprint(ler_humor("8"))',
      '',
      'Humor 4 registrado.\nDigite um número, por exemplo 4.\nUse um número de 1 a 5.',
    ),
    'construcao-5': passo(
      'Entregar é mostrar que funciona e dizer como usar. O README explica o propósito, como instalar e rodar, os testes que você fez de verdade e o que o programa ainda não faz. Registre só o que você testou.',
      'criterios = ["registrar humor", "recusar fora de 1 a 5", "listar registros", "média da semana", "guardar no banco"]\nfor numero, criterio in enumerate(criterios, start=1):\n    print(f"{numero}. {criterio}: testado")',
      '',
      '1. registrar humor: testado\n2. recusar fora de 1 a 5: testado\n3. listar registros: testado\n4. média da semana: testado\n5. guardar no banco: testado',
    ),
  },
  banco: {
    'banco-conta-simples': passo(
      'Uma classe é o molde; cada objeto criado com ela é uma coisa de verdade. __init__ roda sozinho quando o objeto nasce e recebe os dados. self é o próprio objeto: self.dono = dono guarda o nome dentro dele. Para ler depois, use o objeto e um ponto.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n\nmeu = Cofrinho("Bia")\nprint(meu.dono)',
      '',
      'Bia',
    ),
    'construcao-1': passo(
      'Nem todo dado vem de fora. Todo cofrinho nasce vazio, então o __init__ já guarda o saldo como 0 e o histórico como uma lista vazia. Os colchetes criam uma lista nova para cada cofrinho. O saldo fica em centavos, número inteiro, para as contas não errarem na casa decimal.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 0\n        self.historico = []\n\nmeu = Cofrinho("Bia")\nprint(meu.centavos, meu.historico)',
      '',
      '0 []',
    ),
    'banco-guarda-simples': passo(
      'Um método é uma função dentro da classe; o primeiro parâmetro é sempre self. A regra vem primeiro: se o valor não for positivo, return False recusa e a função para ali. Se passou, soma ao saldo e devolve True. Quem chama sabe pelo True ou False se deu certo.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 0\n        self.historico = []\n\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self.centavos += valor\n        return True\n\nmeu = Cofrinho("Bia")\nprint(meu.guardar(500))\nprint(meu.guardar(-100))\nprint(meu.centavos)',
      '',
      'True\nFalse\n500',
    ),
    'construcao-2': passo(
      'O registro no histórico entra no caminho que aceitou, junto da soma. Assim, um valor recusado volta no return False antes de chegar ao append e não deixa rastro. A f-string monta o texto com o valor: f"guardou {valor}".',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 0\n        self.historico = []\n\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self.centavos += valor\n        self.historico.append(f"guardou {valor}")\n        return True\n\nmeu = Cofrinho("Bia")\nmeu.guardar(500)\nmeu.guardar(-100)\nprint(meu.historico)',
      '',
      '[\'guardou 500\']',
    ),
    'banco-duas-regras': passo(
      'Um método pode só responder, sem mudar nada. pode_tirar devolve True quando as duas regras valem ao mesmo tempo: o valor é positivo e cabe no saldo. and exige as duas; se qualquer uma falhar, a resposta é False.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 500\n\n    def pode_tirar(self, valor):\n        return valor > 0 and valor <= self.centavos\n\nmeu = Cofrinho("Bia")\nprint(meu.pode_tirar(200))\nprint(meu.pode_tirar(900))\nprint(meu.pode_tirar(-5))',
      '',
      'True\nFalse\nFalse',
    ),
    'construcao-3': passo(
      'tirar reaproveita pode_tirar em vez de repetir as regras: self.pode_tirar(valor) chama o outro método do mesmo objeto. if not ... quer dizer "se não pode". Só depois de passar pela regra o saldo diminui e o histórico registra.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 500\n        self.historico = []\n\n    def pode_tirar(self, valor):\n        return valor > 0 and valor <= self.centavos\n\n    def tirar(self, valor):\n        if not self.pode_tirar(valor):\n            return False\n        self.centavos -= valor\n        self.historico.append(f"tirou {valor}")\n        return True\n\nmeu = Cofrinho("Bia")\nprint(meu.tirar(900))\nprint(meu.tirar(200))\nprint(meu.centavos, meu.historico)',
      '',
      'False\nTrue\n300 [\'tirou 200\']',
    ),
    'banco-outra-conta': passo(
      'Um método pode receber outro objeto como parâmetro. Dentro dele, self é este cofrinho e outro é o que chegou. O ponto funciona igual nos dois: self.dono e outro.dono.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n\n    def mesmo_dono(self, outro):\n        return self.dono == outro.dono\n\na = Cofrinho("Bia")\nb = Cofrinho("Bia")\nc = Cofrinho("Caio")\nprint(a.mesmo_dono(b))\nprint(a.mesmo_dono(c))',
      '',
      'True\nFalse',
    ),
    'construcao-4': passo(
      'Passar dinheiro de um cofrinho para outro junta o que você já tem: primeiro confere se este pode tirar; se não pode, recusa antes de mexer em qualquer saldo. Se pode, tira daqui e usa o guardar do destino, sem refazer as regras.',
      'class Cofrinho:\n    def __init__(self, dono):\n        self.dono = dono\n        self.centavos = 0\n\n    def guardar(self, valor):\n        if valor <= 0:\n            return False\n        self.centavos += valor\n        return True\n\n    def pode_tirar(self, valor):\n        return valor > 0 and valor <= self.centavos\n\n    def passar(self, destino, valor):\n        if not self.pode_tirar(valor):\n            return False\n        self.centavos -= valor\n        destino.guardar(valor)\n        return True\n\na = Cofrinho("Bia")\nb = Cofrinho("Caio")\na.guardar(1000)\nprint(a.passar(b, 5000))\nprint(a.passar(b, 300))\nprint(a.centavos, b.centavos)',
      '',
      'False\nTrue\n700 300',
    ),
    'banco-mostrar-reais': passo(
      'O programa conta em centavos, número inteiro, para não errar; a pessoa lê em reais. Por isso a divisão por 100 acontece só no print, na hora de mostrar: {centavos / 100:.2f}. A variável continua em centavos para as próximas contas.',
      'centavos = 1250\nprint(f"R$ {centavos / 100:.2f}")\nprint(centavos)',
      '',
      'R$ 12.50\n1250',
    ),
    'construcao-5': passo(
      'Para apresentar, percorra o histórico com for e mostre uma linha por movimento. A demonstração deve provar cada regra: um valor aceito, um recusado e uma passagem entre dois cofrinhos.',
      'historico = ["guardou 1000", "tirou 300", "passou 200 para Caio"]\nfor movimento in historico:\n    print(movimento)',
      '',
      'guardou 1000\ntirou 300\npassou 200 para Caio',
    ),
  },
  estoque: {
    'estoque-memoria': passo(
      'São quatro ações: abrir o banco, criar a tabela, inserir uma linha e ler de volta. ":memory:" cria um banco que só existe enquanto o programa roda. fetchone devolve a primeira linha encontrada, como uma tupla.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (\'Pão\', 10)")\nprint(conn.execute("SELECT * FROM lanches").fetchone())',
      '',
      '(1, \'Pão\', 10)',
    ),
    'construcao-1': passo(
      'Com um nome de arquivo no lugar de ":memory:", o banco fica guardado e sobrevive ao fim do programa. Por isso a tabela pode já existir na segunda execução: CREATE TABLE IF NOT EXISTS só cria quando ela ainda não existe, e não dá erro.',
      'import sqlite3\n\nconn = sqlite3.connect("lanches.db")\nconn.execute("CREATE TABLE IF NOT EXISTS lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("CREATE TABLE IF NOT EXISTS lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nprint("A tabela está pronta, mesmo pedindo duas vezes.")',
      '',
      'A tabela está pronta, mesmo pedindo duas vezes.',
    ),
    'estoque-gravar-de-verdade': passo(
      'commit grava de vez o que foi feito. Sem ele, ao fechar a conexão, o SQLite descarta a mudança. O teste é fechar, abrir o arquivo de novo e procurar: se o lanche está lá, ele foi gravado.',
      'import sqlite3\n\nconn = sqlite3.connect("lanches.db")\nconn.execute("CREATE TABLE IF NOT EXISTS lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (\'Pão\', 10)")\nconn.commit()\nconn.close()\n\nconn = sqlite3.connect("lanches.db")\nprint(conn.execute("SELECT nome, quantidade FROM lanches").fetchone())',
      '',
      '(\'Pão\', 10)',
    ),
    'construcao-2': passo(
      'Os valores não vão escritos dentro do texto do SQL. Cada ? marca um lugar, e os valores vão separados, numa tupla, como segundo argumento do execute. Isso protege o banco contra injeção de SQL, que é alguém digitar um comando no lugar de um dado.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nnome = "Suco"\nquantidade = 5\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", (nome, quantidade))\nconn.commit()\nprint(conn.execute("SELECT nome, quantidade FROM lanches").fetchone())',
      '',
      '(\'Suco\', 5)',
    ),
    'estoque-ler-varias': passo(
      'fetchone devolve uma linha; fetchall devolve a lista com todas. Como é uma lista, dá para percorrer com for e mostrar uma linha por lanche.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Pão", 10))\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Suco", 5))\nfor linha in conn.execute("SELECT * FROM lanches").fetchall():\n    print(linha)',
      '',
      '(1, \'Pão\', 10)\n(2, \'Suco\', 5)',
    ),
    'estoque-calcular-antes': passo(
      'Primeiro leia, depois calcule, e só depois pense em gravar. fetchone devolve uma tupla, mesmo com uma coluna só: o valor fica na posição [0]. A conta é feita em Python, numa variável.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Pão", 10))\natual = conn.execute("SELECT quantidade FROM lanches WHERE id = ?", (1,)).fetchone()[0]\nnovo = atual + 2\nprint(atual, novo)',
      '',
      '10 12',
    ),
    'construcao-3': passo(
      'A regra entra depois de calcular e antes de gravar: se o novo valor ficaria negativo, recuse e não grave. Se passou, UPDATE ... SET quantidade = ? WHERE id = ? grava o novo valor só naquele lanche, com os valores como parâmetros.',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Pão", 10))\n\ndef movimentar(conn, id_lanche, mudanca):\n    atual = conn.execute("SELECT quantidade FROM lanches WHERE id = ?", (id_lanche,)).fetchone()[0]\n    novo = atual + mudanca\n    if novo < 0:\n        print("Recusado: ficaria", novo)\n        return False\n    conn.execute("UPDATE lanches SET quantidade = ? WHERE id = ?", (novo, id_lanche))\n    conn.commit()\n    return True\n\nmovimentar(conn, 1, -15)\nmovimentar(conn, 1, -4)\nprint(conn.execute("SELECT quantidade FROM lanches").fetchone()[0])',
      '',
      'Recusado: ficaria -5\n6',
    ),
    'construcao-4': passo(
      'Um relatório escolhe as colunas no SELECT e mostra uma linha por lanche. No for, cada linha é uma tupla, e dá para separar as três colunas em três nomes: for id_lanche, nome, quantidade in ....',
      'import sqlite3\n\nconn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Pão", 10))\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Suco", 5))\nfor id_lanche, nome, quantidade in conn.execute("SELECT id, nome, quantidade FROM lanches").fetchall():\n    print(f"{id_lanche} - {nome}: {quantidade}")',
      '',
      '1 - Pão: 10\n2 - Suco: 5',
    ),
    'construcao-5': passo(
      'Para provar que os dados sobrevivem, grave, feche a conexão com close(), abra o mesmo arquivo de novo e só então mostre o relatório. Se os lanches aparecem, eles estavam no arquivo, e não só na memória do programa.',
      'import sqlite3\n\nconn = sqlite3.connect("lanches.db")\nconn.execute("DROP TABLE IF EXISTS lanches")\nconn.execute("CREATE TABLE lanches (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)")\nconn.execute("INSERT INTO lanches (nome, quantidade) VALUES (?, ?)", ("Pão", 10))\nconn.commit()\nconn.close()\n\nconn = sqlite3.connect("lanches.db")\nfor linha in conn.execute("SELECT * FROM lanches").fetchall():\n    print(linha)',
      '',
      '(1, \'Pão\', 10)',
    ),
  },
  calculadora: {
    valores: passo(
      'Uma variável é um nome que guarda um valor. O sinal = guarda o valor da direita no nome da esquerda. Cada informação ganha o seu nome, uma por linha. Números com casas decimais usam ponto: 3000.0. print mostra o valor guardado.',
      'dinheiro = 100.0\narroz = 25.0\nfeijao = 10.5\nprint(dinheiro)',
      '',
      '100.0',
    ),
    total: passo(
      'Para somar, use + entre os nomes das variáveis. O resultado vai para uma variável nova, que guarda o total. Assim você pode usar esse total depois, sem somar de novo.',
      'arroz = 25.0\nfeijao = 10.5\nleite = 6.0\ntotal = arroz + feijao + leite\nprint(total)',
      '',
      '41.5',
    ),
    saldo: passo(
      'O que sobra é o dinheiro menos o total: use -. Para mostrar com duas casas decimais, a f-string tem um formato: {sobra:.2f}. O :.2f muda só a aparência do número, não a conta.',
      'dinheiro = 100.0\ntotal = 41.5\nsobra = dinheiro - total\nprint(f"{sobra:.2f}")',
      '',
      '58.50',
    ),
    pergunta: passo(
      'input mostra a pergunta e espera a pessoa digitar. O que ela digita fica guardado na variável da esquerda. Na linha de baixo, print mostra o que foi recebido.',
      'nome = input("Qual é o seu nome? ")\nprint(nome)',
      'Ana',
      'Qual é o seu nome? Ana',
    ),
    conversao: passo(
      'input sempre devolve texto, mesmo quando a pessoa digita um número. Para fazer conta, converta: float(texto) vira um número com casas decimais. Use dois nomes: um para o texto lido e outro para o número.',
      'texto = input("Quanto custa o arroz? ")\npreco = float(texto)\nprint(preco)',
      '25',
      'Quanto custa o arroz? 25.0',
    ),
    entrada: passo(
      'Agora os valores vêm do teclado, e não mais escritos no código. Para cada valor: pergunta com input e converte com float. As contas vêm depois das perguntas, do mesmo jeito que já estavam.',
      'dinheiro = float(input("Quanto você tem? "))\narroz = float(input("Quanto custa o arroz? "))\nsobra = dinheiro - arroz\nprint(f"{sobra:.2f}")',
      '100\n25',
      'Quanto você tem? Quanto custa o arroz? 75.00',
    ),
    relatorio: passo(
      'Um relatório mostra cada valor com o seu nome. Na f-string, o texto fica fora das chaves e a variável fica dentro: f"Sobra: {sobra:.2f}". Um print para cada linha.',
      'dinheiro = 100.0\ntotal = 41.5\nsobra = dinheiro - total\nprint(f"Dinheiro: {dinheiro:.2f}")\nprint(f"Gastos: {total:.2f}")\nprint(f"Sobra: {sobra:.2f}")',
      '',
      'Dinheiro: 100.00\nGastos: 41.50\nSobra: 58.50',
    ),
  },
  tarefas: {
    'tarefas-uma-tarefa': passo(
      'Um dicionário guarda várias informações de uma coisa só, cada uma com um nome, a chave. Ele vai entre chaves { }: "titulo": "Matrix" liga a chave titulo ao valor Matrix. Para ler uma informação, use a chave entre colchetes: filme["titulo"].',
      'filme = {"id": 1, "titulo": "Matrix", "visto": False}\nprint(filme["titulo"])',
      '',
      'Matrix',
    ),
    'construcao-1': passo(
      'Uma lista pode guardar dicionários inteiros. Começa vazia, com [ ], e append coloca o dicionário todo dentro dela, e não só o título. Cada posição da lista passa a ser um filme completo.',
      'filme = {"id": 1, "titulo": "Matrix", "visto": False}\nfilmes = []\nfilmes.append(filme)\nprint(filmes)',
      '',
      '[{\'id\': 1, \'titulo\': \'Matrix\', \'visto\': False}]',
    ),
    'tarefas-ler-chave': passo(
      'for filme in filmes pega um dicionário por volta e guarda na variável filme. Dentro do for, filme["titulo"] lê o título daquele filme. Com um filme na lista, o for dá uma volta só.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nfor filme in filmes:\n    print(filme["titulo"])',
      '',
      'Matrix',
    ),
    'construcao-2': passo(
      'Um segundo filme é outro dicionário, com o mesmo formato e outros valores, colocado com append. Agora o for dá duas voltas, e em cada uma mostra o número e o título daquele filme.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nfilmes.append({"id": 2, "titulo": "Up", "visto": False})\nfor filme in filmes:\n    print(filme["id"], filme["titulo"])',
      '',
      '1 Matrix\n2 Up',
    ),
    'tarefas-achar': passo(
      'Para achar um filme pelo número, o for olha todos e o if escolhe só o que interessa: filme["id"] == id_procurado. Repare: == compara, enquanto = guarda um valor.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nid_procurado = 2\nfor filme in filmes:\n    if filme["id"] == id_procurado:\n        print(filme["titulo"])',
      '',
      'Up',
    ),
    'construcao-3': passo(
      'Ler é filme["visto"]; trocar é filme["visto"] = True. Escrever numa chave que já existe troca o valor guardado. Como o if escolhe só o filme certo, só ele muda. Depois, mostrar todos confirma quem mudou.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nfor filme in filmes:\n    if filme["id"] == 2:\n        filme["visto"] = True\nfor filme in filmes:\n    print(filme["titulo"], filme["visto"])',
      '',
      'Matrix False\nUp True',
    ),
    'tarefas-posicao': passo(
      'Às vezes você quer o lugar do filme na lista, e não o filme. range(len(filmes)) dá as posições 0, 1, 2 e assim por diante. Comece posicao com -1, que quer dizer "não achei"; quando o if encontra, guarda a posição.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nposicao = -1\nfor i in range(len(filmes)):\n    if filmes[i]["id"] == 2:\n        posicao = i\nprint(posicao)',
      '',
      '1',
    ),
    'construcao-4': passo(
      'pop(posicao) tira da lista o item daquela posição. Mas só pode tirar se achou: por isso o if posicao != -1 vem antes. Se o número não existir, posicao continua -1 e nada é removido.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nposicao = -1\nfor i in range(len(filmes)):\n    if filmes[i]["id"] == 2:\n        posicao = i\nif posicao != -1:\n    filmes.pop(posicao)\nprint(len(filmes))\nfor filme in filmes:\n    print(filme["titulo"])',
      '',
      '1\nMatrix',
    ),
    'tarefas-uma-funcao': passo(
      'Uma função dá nome a uma ação. listar recebe a lista e mostra todos; ela não precisa devolver nada, porque o trabalho dela é mostrar. Depois de criada com def, a função só roda quando é chamada: listar(filmes).',
      'def listar(filmes):\n    for filme in filmes:\n        print(filme["id"], filme["titulo"])\n\nfilmes = [{"id": 1, "titulo": "Matrix", "visto": False}, {"id": 2, "titulo": "Up", "visto": False}]\nlistar(filmes)',
      '',
      '1 Matrix\n2 Up',
    ),
    'construcao-5': passo(
      'Um menu é um while que repete até a pessoa escolher sair: cada volta lê a opção com input e o if chama a ação certa. Para dar um número novo a cada cadastro, guarde um contador (proximo_id) e some 1 depois de usar. strip() tira os espaços e evita cadastrar um título vazio.',
      'filmes = [{"id": 1, "titulo": "Matrix", "visto": False}]\nproximo_id = 2\n\ndef listar(filmes):\n    for filme in filmes:\n        print(filme["id"], filme["titulo"])\n\nopcao = ""\nwhile opcao != "0":\n    opcao = input("1 listar, 2 cadastrar, 0 sair: ")\n    if opcao == "1":\n        listar(filmes)\n    elif opcao == "2":\n        titulo = input("Título: ").strip()\n        if titulo:\n            filmes.append({"id": proximo_id, "titulo": titulo, "visto": False})\n            proximo_id += 1\n        else:\n            print("O título não pode ficar vazio.")\nprint("Até logo!")',
      '2\nUp\n1\n0',
      '1 listar, 2 cadastrar, 0 sair: Título: 1 listar, 2 cadastrar, 0 sair: 1 Matrix\n2 Up\n1 listar, 2 cadastrar, 0 sair: Até logo!',
    ),
  },
  quiz: {
    'construcao-1': passo(
      'input mostra a pergunta e espera a pessoa digitar. O que ela digita volta como texto e fica guardado na variável. Depois, if compara esse texto com a resposta certa: se for igual, roda o bloco de baixo; se não, roda o bloco do else. Como input sempre devolve texto, a resposta certa também vai entre aspas: "4", e não 4.',
      'resposta = input("Qual a cor do céu? ")\nif resposta == "azul":\n    print("Acertou!")\nelse:\n    print("Tente de novo.")',
      'azul',
      'Qual a cor do céu? Acertou!',
    ),
    'quiz-ler-em-funcao': passo(
      'Uma função dá nome a uma tarefa. Aqui a tarefa é só perguntar: ela recebe o texto da pergunta no parâmetro enunciado, lê a resposta com input e devolve essa resposta com return. Quem chama guarda o que voltou numa variável. O if ainda fica fora da função, do mesmo jeito que estava.',
      'def perguntar(enunciado):\n    resposta = input(enunciado)\n    return resposta\n\nresposta = perguntar("Qual a cor do céu? ")\nif resposta == "azul":\n    print("Acertou!")\nelse:\n    print("Tente de novo.")',
      'verde',
      'Qual a cor do céu? Tente de novo.',
    ),
    'quiz-segundo-valor': passo(
      'Agora a função recebe duas coisas: a pergunta e a resposta certa. Na chamada, os valores entram na ordem dos parâmetros: o primeiro vai para enunciado, o segundo para correta. Com o if dentro da função, a mesma função serve para qualquer pergunta: você só muda o que passa na chamada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n    else:\n        print("Errou. A resposta era", correta)\n\nperguntar("Qual a cor do céu? ", "azul")\nperguntar("Quantas patas tem um gato? ", "4")',
      'azul\n3',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Errou. A resposta era 4',
    ),
    'construcao-2': passo(
      'print só mostra uma mensagem na tela; o programa não consegue usar o que foi mostrado. return entrega um valor para quem chamou, e esse valor pode ser guardado e somado depois. Por isso a função devolve 1 quando acerta e 0 quando erra: o feedback continua no print, e o ponto sai pelo return.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nponto = perguntar("Qual a cor do céu? ", "azul")\nprint("Ponto:", ponto)',
      'azul',
      'Qual a cor do céu? Acertou!\nPonto: 1',
    ),
    'quiz-duas-perguntas': passo(
      'Cada chamada da função devolve 1 ou 0. Guardando cada retorno numa variável, dá para somar os dois e ter o placar. Repare que se soma o ponto devolvido, e não a resposta digitada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nprimeiro = perguntar("Qual a cor do céu? ", "azul")\nsegundo = perguntar("Quantas patas tem um gato? ", "4")\npontos = primeiro + segundo\nprint("Pontos:", pontos)',
      'azul\n3',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Errou.\nPontos: 1',
    ),
    'construcao-3': passo(
      'Com cinco perguntas, fica mais simples usar um acumulador: pontos começa em 0, e cada chamada soma o seu ponto com pontos += .... No fim, pontos tem o total. É o mesmo acumulador da média de notas.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\npontos = 0\npontos += perguntar("Qual a cor do céu? ", "azul")\npontos += perguntar("Quantas patas tem um gato? ", "4")\npontos += perguntar("Qual animal mia? ", "gato")\nprint("Placar:", pontos, "de 3")',
      'azul\n4\ncachorro',
      'Qual a cor do céu? Acertou!\nQuantas patas tem um gato? Acertou!\nQual animal mia? Errou.\nPlacar: 2 de 3',
    ),
    'quiz-alternativas': passo(
      'Com alternativas, a pessoa digita só uma letra, e a resposta certa da chamada passa a ser essa letra. strip() tira espaços das pontas e lower() deixa tudo minúsculo: assim " B" também vale como "b". A função continua igual, só mudam os valores da chamada.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado).strip().lower()\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou. Era a letra", correta)\n        return 0\n\npontos = 0\npontos += perguntar("Qual a cor do céu? a) verde b) azul c) roxo ", "b")\nprint("Placar:", pontos)',
      ' B',
      'Qual a cor do céu? a) verde b) azul c) roxo Acertou!\nPlacar: 1',
    ),
    'quiz-resposta-invalida': passo(
      'while repete enquanto a condição for verdadeira. Aqui a condição é "a resposta não é a, nem b, nem c". Enquanto for assim, a função avisa e pede de novo. Só quando vier uma letra válida o laço termina e o if corrige. Por isso uma letra inválida não ganha nem perde ponto: ela nem chega ao if.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado).strip().lower()\n    while resposta != "a" and resposta != "b" and resposta != "c":\n        print("Digite só a, b ou c.")\n        resposta = input(enunciado).strip().lower()\n    if resposta == correta:\n        print("Acertou!")\n        return 1\n    else:\n        print("Errou.")\n        return 0\n\nperguntar("Qual a cor do céu? a) verde b) azul c) roxo ", "b")',
      'x\n\nb',
      'Qual a cor do céu? a) verde b) azul c) roxo Digite só a, b ou c.\nQual a cor do céu? a) verde b) azul c) roxo Digite só a, b ou c.\nQual a cor do céu? a) verde b) azul c) roxo Acertou!',
    ),
    'quiz-escolha-rodada': passo(
      'Para saber se a pessoa quer jogar de novo, primeiro é preciso perguntar e guardar a resposta. Ela fica numa variável, jogar, e no próximo passo o programa vai usar essa variável para decidir se repete. Aqui só se pergunta e se guarda.',
      'print("Placar: 3 de 5")\njogar = input("Jogar de novo? (s/n) ")\nprint("Você escolheu:", jogar)',
      's',
      'Placar: 3 de 5\nJogar de novo? (s/n) Você escolheu: s',
    ),
    'construcao-4': passo(
      'while jogar == "s": repete a rodada inteira enquanto a pessoa responder s. Por isso jogar começa valendo "s", para a primeira rodada acontecer. Tudo o que é da rodada vai dentro do while, com quatro espaços: zerar os pontos, as perguntas, o placar e a pergunta final. A pergunta final muda jogar, e é isso que permite o laço terminar. A função fica fora do while: ela é criada uma vez e usada em todas as rodadas.',
      'def perguntar(enunciado, correta):\n    resposta = input(enunciado)\n    if resposta == correta:\n        return 1\n    return 0\n\njogar = "s"\nwhile jogar == "s":\n    pontos = 0\n    pontos += perguntar("Qual a cor do céu? ", "azul")\n    print("Placar:", pontos)\n    jogar = input("Jogar de novo? (s/n) ")\nprint("Fim de jogo.")',
      'azul\ns\nverde\nn',
      'Qual a cor do céu? Placar: 1\nJogar de novo? (s/n) Qual a cor do céu? Placar: 0\nJogar de novo? (s/n) Fim de jogo.',
    ),
    'construcao-5': passo(
      'O quiz já funciona; agora ele fica com a sua cara. Troque as cinco perguntas por assuntos que você estudou e confira a letra certa de cada uma. Para o README, anote o que você testou de verdade: uma rodada sem acertos, uma com todos os acertos, uma letra inválida seguida de uma válida, e duas rodadas para mostrar que o placar recomeça em zero.',
      '# Exemplo de uma pergunta sua, reaproveitando a mesma função:\n# pontos += perguntar("O que print faz? a) mostra na tela b) guarda um valor c) repete ", "a")\nprint("Troque as perguntas e teste cada caso.")',
      '',
      'Troque as perguntas e teste cada caso.',
    ),
  },
};

export const ensinoDoPasso = (projetoId, passoId) => ensinoDosProjetos[projetoId]?.[passoId] || null;
