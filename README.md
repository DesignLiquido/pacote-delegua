# pacote-delegua

Ferramenta de linha de comando da Pacoteca, escrita em Delégua e compilada com o [delegua-llvm](https://github.com/DesignLiquido/delegua-llvm). Substitui o [pacote-go](https://github.com/DesignLiquido/pacote-go).

## Módulos

| Arquivo | Conteúdo |
| --- | --- |
| `fontes/pacote.delegua` | Ponto de entrada do programa `pacote` |
| `fontes/cli.delegua` | Comandos `instalar`, `buscar`, `info`, `autenticar`, `publicar`, `sincronizar` e `publicar-versao`, com análise das opções e textos de ajuda |
| `fontes/instalador.delegua` | Resolução e instalação em `pacotes/<realizacao>/<nome>`, `npm install` para pacotes com `pacoteNpm`, e gravação do `pacoteca.lock` |
| `fontes/resolvedor.delegua` | Resolução de dependências transitivas |
| `fontes/registro.delegua` | Cliente HTTP da pacoteca-api; o resolvedor pode usá-lo como fonte (`fonteDoRegistro`) |
| `fontes/git.delegua` | Instalação a partir do repositório git, fixada em um commit |
| `fontes/autenticacao.delegua` | Token em `~/.delegua/token` e retorno local do login pelo GitHub |
| `fontes/trava.delegua` | Leitura e gravação do `pacoteca.lock` |
| `fontes/modelos.delegua` | `pacoteca.jsonc` e respostas da pacoteca-api |
| `fontes/semver.delegua` | Versões semânticas: análise, comparação e texto |
| `fontes/restricao.delegua` | Restrições no estilo do npm (`^1.2`, `~1`, `>=1 <2`, `1.x`, `\|\|`) |
| `fontes/jsonc.delegua` | JSON com comentários, mais leitura tolerante de campos |

## Compilação

```sh
delegua-llvm fontes/pacote.delegua -o pacote
```

O binário fica em `fontes/pacote` (`fontes/pacote.exe` no Windows).

A URL da pacoteca-api vem da variável `PACOTECA_URL` (padrão: `https://pacoteca-api.herokuapp.com`). O `git` precisa estar instalado e no PATH, e o `npm` para pacotes com `pacoteNpm`.

## Testes

```sh
testes/executar.sh
```

O script compila e executa cada `testes/*.teste.delegua`. Ele também inicia uma pacoteca-api falsa (`testes/servidor-registro.js`, que precisa do Node.js) para os testes do cliente do registro. A variável `ILC` escolhe o compilador; o padrão é o comando `delegua-llvm`, instalado pelo pacote npm. Para usar um delegua-llvm local:

```sh
ILC="npx ts-node /caminho/delegua-llvm/fontes/ilc.ts" testes/executar.sh
```
