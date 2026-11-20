# pacote-delegua

Reimplementação em Delégua do [pacote-go](https://github.com/DesignLiquido/pacote-go), a ferramenta de linha de comando da Pacoteca, compilada com o [delegua-llvm](https://github.com/DesignLiquido/delegua-llvm).

## Situação

Portado até agora, dos pacotes `interno/*` do pacote-go, com os testes em Go como especificação:

| Arquivo | Origem no pacote-go | Conteúdo |
| --- | --- | --- |
| `fontes/semver.delegua` | `interno/semver/semver.go` | Versões semânticas: análise, comparação e texto |
| `fontes/restricao.delegua` | `interno/semver/restricao.go` | Restrições no estilo do npm (`^1.2`, `~1`, `>=1 <2`, `1.x`, `\|\|`) |
| `fontes/jsonc.delegua` | `interno/jsonc/analisador.go` | JSON com comentários, mais leitura tolerante de campos |
| `fontes/modelos.delegua` | `interno/modelos/pacoteca.go` | `pacoteca.jsonc` e respostas da pacoteca-api |
| `fontes/trava.delegua` | `interno/trava/trava.go` | Leitura e gravação do `pacoteca.lock`, no mesmo formato do Go |
| `fontes/resolvedor.delegua` | `interno/resolvedor/resolvedor.go` | Resolução de dependências transitivas |
| `fontes/git.delegua` | `interno/git/repositorio.go` | Instalação a partir do repositório git, fixada em um commit |
| `fontes/registro.delegua` | `interno/registro/cliente.go` | Cliente HTTP da pacoteca-api; o resolvedor pode usá-lo como fonte (`fonteDoRegistro`) |
| `fontes/instalador.delegua` | `interno/instalador/` | Resolução e instalação em `pacotes/<realizacao>/<nome>`, `npm install` para pacotes com `pacoteNpm`, e o `pacoteca.lock` |
| `fontes/autenticacao.delegua` | `interno/autenticacao/token.go`, `interno/comandos/autenticar.go` | Token em `~/.delegua/token` e retorno local do login pelo GitHub |
| `fontes/cli.delegua` | `interno/comandos/` | Comandos `instalar`, `buscar`, `info`, `autenticar`, `publicar`, `sincronizar` e `publicar-versao` |
| `fontes/pacote.delegua` | `main.go` | Ponto de entrada do programa `pacote` |

Todo o pacote-go está portado.

## Compilação

```sh
delegua-llvm fontes/pacote.delegua -o pacote
```

O binário fica em `fontes/pacote` (`fontes/pacote.exe` no Windows).

A URL da pacoteca-api vem da variável `PACOTECA_URL` (padrão: `https://pacoteca-api.herokuapp.com`). O `git` precisa estar instalado e no PATH, e o `npm` para pacotes com `pacoteNpm`.

## Diferenças em relação ao pacote-go

- MAIOR, MENOR e CORRECAO são `inteiro` e aceitam até 9 dígitos (o Go usa inteiros de 64 bits).
- Campos opcionais (ponteiros no Go) usam `""` para ausente ou nulo.
- No `pacoteca.lock`, uma lista de realizações vazia é gravada como `[]` (o Go grava `null` para lista nula). Fora isso, a serialização é idêntica à do Go, byte a byte.
- `Fonte` (resolvedor) é uma classe concreta que guarda os pacotes em memória; o cliente da pacoteca-api preencherá a mesma estrutura.
- Os campos JSON `tipo` de símbolos e argumentos viram `categoria` e `tipoDado`, porque `tipo` é palavra reservada.
- O git é usado pelo programa `git` (precisa estar instalado e no PATH), e não por uma biblioteca como o go-git.
- Nos testes, o pacote-go troca o clone, o npm e a saída por funções; aqui o `Instalador` tem um modo `simulado`, que registra os clones e as chamadas ao npm em vez de executá-los.
- As opções da linha de comando são analisadas pelo próprio `fontes/cli.delegua` (o pacote-go usa a biblioteca cobra), com as mesmas opções e textos de ajuda. Erros saem como `Erro: <mensagem>` (o cobra escreve `Error: <mensagem>`).
- No Windows, os argumentos chegam na página de código ANSI, não em UTF-8, então nomes com acentos passados na linha de comando podem chegar alterados. Nomes lidos do `pacoteca.jsonc` não são afetados.

## Testes

```sh
testes/executar.sh
```

O script compila e executa cada `testes/*.teste.delegua`. Ele também inicia uma pacoteca-api falsa (`testes/servidor-registro.js`, que precisa do Node.js) para os testes do cliente do registro. A variável `ILC` escolhe o compilador; o padrão é o comando `delegua-llvm`, instalado pelo pacote npm. Para usar um delegua-llvm local:

```sh
ILC="npx ts-node /caminho/delegua-llvm/fontes/ilc.ts" testes/executar.sh
```

O porte exige um delegua-llvm com [delegua-llvm#29](https://github.com/DesignLiquido/delegua-llvm/pull/29) e [delegua-llvm#30](https://github.com/DesignLiquido/delegua-llvm/pull/30), que usa o núcleo `@designliquido/delegua` 1.28.6 ou posterior.
