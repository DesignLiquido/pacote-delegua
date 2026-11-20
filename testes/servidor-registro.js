// pacoteca-api falsa para os testes do cliente do registro (testes/registro.teste.delegua).
// Uso: node testes/servidor-registro.js <arquivo-da-porta>
// Escuta numa porta livre de 127.0.0.1 e grava a porta no arquivo indicado.
//
// Rotas, como na pacoteca-api: GET /pacotes[?realizacao=], GET /pacotes/{nome},
// GET /pacotes/{nome}/versoes, POST /pacotes, POST /pacotes/{nome}/versoes e
// POST /pacotes/{nome}/sincronizar. Erros vêm como {"erro": "..."}; os POST exigem
// "Authorization: Bearer token-teste". GET /ultima devolve a última requisição recebida.
const fs = require('fs');
const http = require('http');

const pacotes = {
    mat: { id: 'p1', nome: 'mat', descricao: 'Matemática', urlRepositorio: 'https://github.com/org/mat', realizacoes: ['node', 'llvm'], nivelVerificacao: 'verificado', pacoteNpm: null, pontoDeEntrada: null },
    'a b': { id: 'p2', nome: 'a b', descricao: null, urlRepositorio: 'https://github.com/org/ab', realizacoes: ['node'], nivelVerificacao: 'nao_verificado' },
};
const versoes = {
    mat: [
        { id: 'v1', pacoteId: 'p1', versao: '1.0.0', tagGitHub: 'v1.0.0', hashCommit: 'hash-1.0.0', realizacoes: ['node'], dependencias: {}, nivelVerificacao: 'verificado' },
        { id: 'v2', pacoteId: 'p1', versao: '1.1.0', tagGitHub: 'v1.1.0', hashCommit: 'hash-1.1.0', realizacoes: ['node'], dependencias: { fisica: '^0.5' }, nivelVerificacao: 'verificado' },
        { id: 'v3', pacoteId: 'p1', versao: '2.0.0', tagGitHub: null, hashCommit: null, realizacoes: ['node'], dependencias: {}, nivelVerificacao: 'em_analise' },
    ],
    fisica: [{ id: 'v4', pacoteId: 'p3', versao: '0.5.2', tagGitHub: 'v0.5.2', hashCommit: 'hash-0.5.2', realizacoes: ['node'], dependencias: {}, nivelVerificacao: 'verificado' }],
};
pacotes.fisica = { id: 'p3', nome: 'fisica', urlRepositorio: 'https://github.com/org/fisica', realizacoes: ['node'], nivelVerificacao: 'verificado' };

let ultima = null;

function responder(res, codigo, corpo) {
    res.writeHead(codigo, { 'Content-Type': 'application/json' });
    res.end(corpo === undefined ? '' : JSON.stringify(corpo));
}

const servidor = http.createServer((req, res) => {
    let corpo = '';
    req.on('data', (pedaco) => (corpo += pedaco));
    req.on('end', () => {
        const url = new URL(req.url, 'http://local');
        if (url.pathname === '/ultima') return responder(res, 200, ultima);
        ultima = { metodo: req.method, url: req.url, autorizacao: req.headers['authorization'] || '', tipo: req.headers['content-type'] || '', corpo };

        const partes = url.pathname.split('/').filter((p) => p !== '').map(decodeURIComponent);
        if (partes[0] !== 'pacotes') return responder(res, 404, { erro: 'rota não encontrada' });

        if (req.method === 'POST' && req.headers['authorization'] !== 'Bearer token-teste') {
            return responder(res, 401, { erro: 'token ausente ou inválido' });
        }

        if (req.method === 'GET' && partes[1] === 'quebrado') {
            res.writeHead(500);
            return res.end('<html>erro interno</html>');
        }
        if (req.method === 'GET' && partes.length === 1) {
            const realizacao = url.searchParams.get('realizacao');
            return responder(res, 200, Object.values(pacotes).filter((p) => !realizacao || p.realizacoes.includes(realizacao)));
        }
        if (req.method === 'GET' && partes.length === 2) {
            return pacotes[partes[1]] ? responder(res, 200, pacotes[partes[1]]) : responder(res, 404, { erro: 'pacote não encontrado' });
        }
        if (req.method === 'GET' && partes.length === 3 && partes[2] === 'versoes') {
            return versoes[partes[1]] ? responder(res, 200, versoes[partes[1]]) : responder(res, 404, { erro: 'pacote não encontrado' });
        }
        if (req.method === 'POST' && partes.length === 1) {
            const { urlRepositorio } = JSON.parse(corpo || '{}');
            if (!urlRepositorio) return responder(res, 400, { erro: 'urlRepositorio é obrigatório' });
            const nome = urlRepositorio.split('/').pop();
            return responder(res, 201, { id: 'novo', nome, urlRepositorio, realizacoes: [], nivelVerificacao: 'nao_verificado' });
        }
        if (req.method === 'POST' && partes.length === 3 && partes[2] === 'versoes') {
            const { tag } = JSON.parse(corpo || '{}');
            if (tag === 'v9.9.9') return responder(res, 409, { erro: 'a versão 9.9.9 já foi publicada' });
            return responder(res, 201, { id: 'v-nova', versao: tag.replace(/^v/, ''), tagGitHub: tag, hashCommit: 'hash-nova', nivelVerificacao: 'em_analise' });
        }
        if (req.method === 'POST' && partes.length === 3 && partes[2] === 'sincronizar') {
            return pacotes[partes[1]] ? responder(res, 200, pacotes[partes[1]]) : responder(res, 404, { erro: 'pacote não encontrado' });
        }
        responder(res, 404, { erro: 'rota não encontrada' });
    });
});

servidor.listen(0, '127.0.0.1', () => fs.writeFileSync(process.argv[2], String(servidor.address().port)));
