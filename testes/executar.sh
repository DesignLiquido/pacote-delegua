#!/usr/bin/env bash
# Compila e executa cada testes/*.teste.delegua. Sai com código 1 se algum falhar.
#
# ILC escolhe o compilador (padrão: delegua-llvm, o comando instalado pelo pacote npm). Para
# usar um delegua-llvm local:  ILC="npx ts-node /caminho/delegua-llvm/fontes/ilc.ts" testes/executar.sh
set -u
cd "$(dirname "$0")"
ILC="${ILC:-delegua-llvm}"
extensao=""
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) extensao=".exe" ;; esac

# pacoteca-api falsa para registro.teste.delegua (precisa do Node.js).
arquivo_porta="$(mktemp)"
node servidor-registro.js "$arquivo_porta" &
pid_servidor=$!
trap 'kill "$pid_servidor" 2>/dev/null; rm -f "$arquivo_porta"' EXIT
for _ in $(seq 1 50); do
    [ -s "$arquivo_porta" ] && break
    sleep 0.1
done
if [ ! -s "$arquivo_porta" ]; then
    echo "não foi possível iniciar a pacoteca-api falsa (testes/servidor-registro.js)"
    exit 1
fi
export PORTA_REGISTRO="$(cat "$arquivo_porta")"

falhas=0
for fonte in *.teste.delegua; do
    nome="${fonte%.delegua}"
    if ! saida=$($ILC "$fonte" 2>&1); then
        echo "$nome: falha na compilação"
        echo "$saida" | grep -iE "erro|falha" | head -5
        falhas=$((falhas + 1))
        continue
    fi
    if ! "./$nome$extensao"; then
        falhas=$((falhas + 1))
    fi
done

if [ "$falhas" -gt 0 ]; then
    echo "$falhas arquivo(s) de teste falharam"
    exit 1
fi
echo "Todos os testes passaram"
