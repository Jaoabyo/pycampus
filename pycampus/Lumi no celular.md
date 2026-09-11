# Lumi no celular

O Lumi conversa com um modelo que roda **no seu computador**. O celular abrindo o site
publicado não alcança `127.0.0.1` — aquele endereço é o próprio celular.

Isto **funciona**, e foi testado de ponta a ponta: o Lumi respondeu em
`https://jaoabyo.github.io/pycampus/` com o modelo rodando no computador.

## O caminho

1. **Ollama aberto** no computador, com o modelo `qwen2.5-coder:14b`.
2. **Duplo clique em `iniciar-lumi-online.cmd`**, na pasta do projeto. Ele abre um endereço
   https temporário apontando para o Ollama e deixa a janela aberta.
3. Copie o endereço terminado em `trycloudflare.com` que aparecer.
4. No celular: **Configurações → Onde a IA do Lumi mora**, cole, **Testar conexão**.

## Por que precisa de tudo isso

| Obstáculo | Por quê | Como é resolvido |
| --- | --- | --- |
| O site é `https` | Um navegador bloqueia página https chamando endereço http, antes de tentar | O túnel entrega um endereço `https` |
| O Ollama recusa origem estranha | Proteção dele: só aceita origens declaradas | `OLLAMA_ORIGINS` inclui o endereço do site |
| O Ollama recusa `Host` estranho | Mesma proteção, no cabeçalho `Host` | `--http-host-header 127.0.0.1:11434` reescreve |

Os três já estão configurados no `.cmd`. Sem qualquer um deles o resultado é o mesmo: o Lumi
mostra as dicas escritas e avisa que não está conversando.

> [!warning] O endereço muda a cada vez
> O túnel gratuito sorteia um endereço novo sempre que é iniciado. Toda vez que abrir o
> `.cmd`, cole o endereço novo em Configurações. Endereço fixo exigiria uma conta Cloudflare
> com domínio, o que não vale a pena para uso pessoal.

> [!note] Sem o computador ligado, não há conversa
> E está tudo bem: os quatro degraus de ajuda escrita, o quebra-cabeça, as aulas, os
> exercícios e o Python funcionam em qualquer aparelho, sem IA nenhuma.

Relacionado: [[Lumi · Como ele ajuda]] · [[Publicação e hospedagem]]
