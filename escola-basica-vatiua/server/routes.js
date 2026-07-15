// ============================================
// ROUTES.JS - ROTAS DA API
// ESCOLA BÁSICA DE VATIUA
// ============================================

const express = require('express');
const path = require('path');
const db = require('./database');
const { gerarPDF } = require('../pdf/gerarPDF');
const router = express.Router();

// ============================================
// ROTAS PÚBLICAS (Páginas HTML)
// ============================================

// Página inicial
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Formulário
router.get('/formulario', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'formulario.html'));
});

// Confirmação
router.get('/confirmacao', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'confirmacao.html'));
});

// Sucesso
router.get('/sucesso', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'sucesso.html'));
});

// Admin (acesso direto, sem login)
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// ============================================
// ROTAS DA API (Back-end)
// ============================================

// ========== 1. ENVIAR DADOS ==========
router.post('/api/enviar', async (req, res) => {
    try {
        const dados = req.body;
        
        // Validar dados
        if (!dados.nome || !dados.funcao || !dados.sexo || !dados.calcado || !dados.distancia) {
            return res.status(400).json({ 
                success: false, 
                error: 'Todos os campos são obrigatórios!' 
            });
        }
        
        // Validar função
        const funcoesValidas = [
            'Director da Escola',
            'Director Adjunto Pedagógico',
            'Professor',
            'Auxiliar',
            'Guarda'
        ];
        if (!funcoesValidas.includes(dados.funcao)) {
            return res.status(400).json({
                success: false,
                error: 'Função inválida!'
            });
        }
        
        // Salvar no banco
        const result = await db.salvar(dados);
        
        if (result.success) {
            res.json({ 
                success: true, 
                numero: result.id,
                message: 'Dados enviados com sucesso!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== 2. CONFIRMAR ENVIO ==========
router.post('/api/confirmar', async (req, res) => {
    try {
        // O registro já foi feito em /api/enviar
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== 3. BUSCAR TODOS OS DADOS (ADMIN) ==========
router.get('/api/admin/dados', async (req, res) => {
    try {
        const { funcao, sexo, busca } = req.query;
        
        const filtros = {};
        if (funcao && funcao !== 'Todos') filtros.funcao = funcao;
        if (sexo && sexo !== 'Todos') filtros.sexo = sexo;
        if (busca) filtros.busca = busca;
        
        let registos = [];
        if (Object.keys(filtros).length > 0) {
            registos = await db.buscarComFiltros(filtros);
        } else {
            registos = await db.buscarTodos();
        }
        
        const estatisticas = await db.getEstatisticas();
        
        res.json({
            registos,
            total: estatisticas.total || 0,
            directores: estatisticas.directores || 0,
            adjuntos: estatisticas.adjuntos || 0,
            professores: estatisticas.professores || 0,
            auxiliares: estatisticas.auxiliares || 0,
            guardas: estatisticas.guardas || 0,
            masculino: estatisticas.masculino || 0,
            feminino: estatisticas.feminino || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== 4. GERAR PDF ==========
router.get('/api/admin/pdf', async (req, res) => {
    try {
        const registos = await db.buscarTodos();
        const estatisticas = await db.getEstatisticas();
        
        const doc = gerarPDF(registos, estatisticas);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=lista_professores_funcionarios.pdf');
        
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

// ========== 5. BUSCAR ESTATÍSTICAS ==========
router.get('/api/admin/estatisticas', async (req, res) => {
    try {
        const estatisticas = await db.getEstatisticas();
        res.json(estatisticas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== 6. ELIMINAR REGISTO ==========
router.delete('/api/admin/eliminar/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID inválido!' 
            });
        }
        
        const result = await db.eliminar(id);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Registo eliminado com sucesso!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== 7. LIMPAR TODOS OS REGISTOS ==========
router.delete('/api/admin/limpar', async (req, res) => {
    try {
        const result = await db.limpar();
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Todos os registos foram eliminados!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== 8. ATUALIZAR REGISTO ==========
router.put('/api/admin/atualizar/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dados = req.body;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID inválido!' 
            });
        }
        
        const result = await db.atualizar(id, dados);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Registo atualizado com sucesso!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;