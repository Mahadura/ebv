// ============================================
// DATABASE.JS - CONEXÃO COM POSTGRESQL
// ESCOLA BÁSICA DE VATIUA
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// ========== CONFIGURAÇÃO DA CONEXÃO ==========
// URL do banco de dados fornecida
const pool = new Pool({
    connectionString: 'postgresql://ebv_db_user:pqieZAJBivznH63nLEsvgP2TgMgAKGTf@dpg-d9bt39mcjfls73crjp3g-a.singapore-postgres.render.com/ebv_db',
    ssl: {
        rejectUnauthorized: false // Necessário para Render
    }
});

// ========== CRIAR TABELA ==========
async function criarTabela() {
    const query = `
        CREATE TABLE IF NOT EXISTS registos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            funcao VARCHAR(100) NOT NULL,
            sexo VARCHAR(20) NOT NULL,
            calcado INTEGER NOT NULL,
            roupa VARCHAR(200) NOT NULL,
            distancia VARCHAR(50) NOT NULL,
            data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await pool.query(query);
        console.log('✅ Tabela "registos" criada/verificada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error.message);
    }
}

// ========== TESTAR CONEXÃO ==========
async function testarConexao() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
        client.release();
    } catch (error) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
    }
}

// ========== FUNÇÕES DO BANCO DE DADOS ==========
const db = {
    // 1. Salvar registo
    async salvar(dados) {
        const query = `
            INSERT INTO registos (nome, funcao, sexo, calcado, roupa, distancia)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const values = [
            dados.nome,
            dados.funcao,
            dados.sexo,
            dados.calcado,
            dados.roupa,
            dados.distancia
        ];
        
        try {
            const result = await pool.query(query, values);
            return { success: true, id: result.rows[0].id };
        } catch (error) {
            console.error('Erro ao salvar:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    // 2. Buscar todos os registos
    async buscarTodos() {
        try {
            const result = await pool.query(
                'SELECT * FROM registos ORDER BY id ASC'
            );
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar todos:', error.message);
            return [];
        }
    },
    
    // 3. Buscar registos com filtros
    async buscarComFiltros(filtros = {}) {
        let query = 'SELECT * FROM registos WHERE 1=1';
        const values = [];
        let index = 1;
        
        if (filtros.funcao && filtros.funcao !== 'Todos') {
            query += ` AND funcao = $${index}`;
            values.push(filtros.funcao);
            index++;
        }
        
        if (filtros.sexo && filtros.sexo !== 'Todos') {
            query += ` AND sexo = $${index}`;
            values.push(filtros.sexo);
            index++;
        }
        
        if (filtros.busca) {
            query += ` AND nome ILIKE $${index}`;
            values.push(`%${filtros.busca}%`);
            index++;
        }
        
        query += ' ORDER BY id ASC';
        
        try {
            const result = await pool.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar com filtros:', error.message);
            return [];
        }
    },
    
    // 4. Buscar estatísticas
    async getEstatisticas() {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN funcao = 'Director da Escola' THEN 1 END) as directores,
                    COUNT(CASE WHEN funcao = 'Director Adjunto Pedagógico' THEN 1 END) as adjuntos,
                    COUNT(CASE WHEN funcao = 'Professor' THEN 1 END) as professores,
                    COUNT(CASE WHEN funcao = 'Auxiliar' THEN 1 END) as auxiliares,
                    COUNT(CASE WHEN funcao = 'Guarda' THEN 1 END) as guardas,
                    COUNT(CASE WHEN sexo = 'Masculino' THEN 1 END) as masculino,
                    COUNT(CASE WHEN sexo = 'Feminino' THEN 1 END) as feminino
                FROM registos
            `);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error.message);
            return { 
                total: 0, 
                directores: 0, 
                adjuntos: 0,
                professores: 0, 
                auxiliares: 0, 
                guardas: 0, 
                masculino: 0, 
                feminino: 0 
            };
        }
    },
    
    // 5. Buscar registo por ID
    async buscarPorId(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM registos WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Erro ao buscar por ID:', error.message);
            return null;
        }
    },
    
    // 6. Eliminar registo por ID
    async eliminar(id) {
        try {
            const result = await pool.query(
                'DELETE FROM registos WHERE id = $1 RETURNING id',
                [id]
            );
            return { 
                success: true, 
                deleted: result.rowCount > 0 
            };
        } catch (error) {
            console.error('Erro ao eliminar:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    // 7. Limpar todos os registos
    async limpar() {
        try {
            await pool.query('DELETE FROM registos');
            return { success: true };
        } catch (error) {
            console.error('Erro ao limpar:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    // 8. Atualizar registo
    async atualizar(id, dados) {
        const query = `
            UPDATE registos 
            SET nome = $1, funcao = $2, sexo = $3, calcado = $4, roupa = $5, distancia = $6
            WHERE id = $7
            RETURNING id
        `;
        const values = [
            dados.nome,
            dados.funcao,
            dados.sexo,
            dados.calcado,
            dados.roupa,
            dados.distancia,
            id
        ];
        
        try {
            const result = await pool.query(query, values);
            return { success: true, id: result.rows[0]?.id };
        } catch (error) {
            console.error('Erro ao atualizar:', error.message);
            return { success: false, error: error.message };
        }
    }
};

// ========== INICIALIZAR ==========
criarTabela();
testarConexao();

module.exports = db;