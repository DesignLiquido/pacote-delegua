#!/usr/bin/env bash
# Compila e executa cada testes/*.teste.delegua. Sai com código 1 se algum falhar.
#
# ILC escolhe o compilador (padrão: ilc do delegua-llvm instalado). Para usar um
# delegua-llvm local:  ILC="npx ts-node /caminho/delegua-llvm/fontes/ilc.ts" testes/executar.sh
set -u
cd "$(dirname "$0")"
ILC="${ILC:-ilc}"
extensao=""
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) extensao=".exe" ;; esac

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
