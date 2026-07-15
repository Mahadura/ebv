// ============================================
// SERVER.JS - SERVIDOR PRINCIPAL
// ESCOLA BÁSICA DE VATIUA
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '..')));

// ========== ROTAS ==========
app.use('/', routes);

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 SERVIDOR INICIADO COM SUCESSO!');
    console.log('========================================');
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📋 Página Inicial: http://localhost:${PORT}`);
    console.log(`📋 Formulário: http://localhost:${PORT}/formulario`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log('========================================');
    console.log('✅ Servidor pronto para uso!');
    console.log('========================================');
});