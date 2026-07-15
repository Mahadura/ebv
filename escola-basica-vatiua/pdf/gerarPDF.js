// ============================================
// GERARPDF.JS - GERAÇÃO DE PDF
// ESCOLA BÁSICA DE VATIUA
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPDF(registos, estatisticas) {
    // ========== ORIENTAÇÃO HORIZONTAL (LANDSCAPE) ==========
    const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',  // ← HORIZONTAL
        margin: 30
    });
    
    // ========== CABEÇALHO ==========
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('REPÚBLICA DE MOÇAMBIQUE', { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(11)
       .text('PROVINCIA DO NIASSA', { align: 'center' })
       .text('GOVERNO DO DISTRITO DE MAÚA', { align: 'center' })
       .text('POSTO ADMINISTRATIVO DE MAIACA', { align: 'center' })
       .text('ZIP Nº 08 DE VATIUA', { align: 'center' });
    
    doc.font('Helvetica-Bold')
       .fontSize(14)
       .text('Escola Básica de Vatiua', { align: 'center' });
    
    doc.moveDown(1);
    
    // ========== TÍTULO (SUBLINHADO) ==========
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .text('Lista de professores e funcionários não docentes abrangidos pela', { 
           align: 'center',
           underline: true 
       });
    
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .text('Nota Nº 611/DPE/DAT2026/310', { 
           align: 'center',
           underline: true 
       });
    
    doc.moveDown(1);
    
    // ========== ESTATÍSTICAS ==========
    doc.font('Helvetica')
       .fontSize(10)
       .text(`Total: ${estatisticas.total || 0}    Professores: ${estatisticas.professores || 0}    Auxiliares: ${estatisticas.auxiliares || 0}    Guardas: ${estatisticas.guardas || 0}    Masculino: ${estatisticas.masculino || 0}    Feminino: ${estatisticas.feminino || 0}`, { 
           align: 'center' 
       });
    
    doc.moveDown(1);
    
    // ========== TABELA (HORIZONTAL) ==========
    
    // Posições das colunas (ajustadas para landscape)
    const colunas = {
        ord: 35,
        nome: 80,
        funcao: 200,
        sexo: 290,
        roupa: 340,
        calcado: 480,
        distancia: 540
    };
    
    // Cabeçalho da tabela
    doc.font('Helvetica-Bold')
       .fontSize(11);
    
    const yCabecalho = doc.y;
    doc.text('Ord.', colunas.ord, yCabecalho);
    doc.text('Nome Completo', colunas.nome, yCabecalho);
    doc.text('Função', colunas.funcao, yCabecalho);
    doc.text('Sexo', colunas.sexo, yCabecalho);
    doc.text('Roupa', colunas.roupa, yCabecalho);
    doc.text('Calçado', colunas.calcado, yCabecalho);
    doc.text('Distância', colunas.distancia, yCabecalho);
    
    // Linha separadora após o cabeçalho
    doc.moveDown(0.3);
    const yLinha = doc.y;
    doc.moveTo(30, yLinha).lineTo(770, yLinha).stroke();
    doc.moveDown(0.5);
    
    // ========== ORDENAR DADOS ==========
    const ordem = { 
        'Director da Escola': 1, 
        'Director Adjunto Pedagógico': 2, 
        'Professor': 3, 
        'Auxiliar': 4, 
        'Guarda': 5 
    };
    
    const dadosOrdenados = [...registos].sort((a, b) => {
        const hierarquiaA = ordem[a.funcao] || 99;
        const hierarquiaB = ordem[b.funcao] || 99;
        if (hierarquiaA !== hierarquiaB) {
            return hierarquiaA - hierarquiaB;
        }
        return a.nome.localeCompare(b.nome);
    });
    
    // ========== PREENCHER DADOS ==========
    doc.font('Helvetica')
       .fontSize(11);
    
    dadosOrdenados.forEach((item, index) => {
        // Verificar se cabe na página
        if (doc.y > 480) {
            doc.addPage();
            // Redesenhar cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(11);
            const yNovo = doc.y;
            doc.text('Ord.', colunas.ord, yNovo);
            doc.text('Nome Completo', colunas.nome, yNovo);
            doc.text('Função', colunas.funcao, yNovo);
            doc.text('Sexo', colunas.sexo, yNovo);
            doc.text('Roupa', colunas.roupa, yNovo);
            doc.text('Calçado', colunas.calcado, yNovo);
            doc.text('Distância', colunas.distancia, yNovo);
            doc.moveDown(0.3);
            const yLinhaNova = doc.y;
            doc.moveTo(30, yLinhaNova).lineTo(770, yLinhaNova).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11);
        }
        
        const ordemNumero = String(index + 1).padStart(2, '0');
        const y = doc.y;
        
        // ========== LIMPAR DADOS ==========
        // Remover espaços extras e caracteres especiais
        const nomeLimpo = (item.nome || '-').trim().replace(/\s+/g, ' ');
        const funcaoLimpa = (item.funcao || '-').trim();
        const sexoLimpo = (item.sexo || '-').trim();
        const roupaLimpa = (item.roupa || '-').trim().replace(/\s+/g, ' ');
        const calcadoLimpo = String(item.calcado || '-').trim();
        const distanciaLimpa = (item.distancia || '-').trim().replace(/\s+/g, ' ');
        
        // ========== ESCREVER DADOS ==========
        doc.text(ordemNumero, colunas.ord, y);
        doc.text(nomeLimpo, colunas.nome, y);
        doc.text(funcaoLimpa, colunas.funcao, y);
        doc.text(sexoLimpo, colunas.sexo, y);
        doc.text(roupaLimpa, colunas.roupa, y);
        doc.text(calcadoLimpo, colunas.calcado, y);
        doc.text(distanciaLimpa, colunas.distancia, y);
        
        doc.moveDown();
    });
    
    // Linha separadora final
    doc.moveDown(0.3);
    const yLinhaFinal = doc.y;
    doc.moveTo(30, yLinhaFinal).lineTo(770, yLinhaFinal).stroke();
    doc.moveDown(1);
    
    // ========== RODAPÉ ==========
    doc.moveDown(3);
    
    doc.font('Helvetica')
       .fontSize(12)
       .text('Vatiua, aos 17 de Julho de 2026', { align: 'center' });
    
    doc.moveDown(2);
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('O Director da Escola', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.text('_____________________', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('Benjamim Jemusse', { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(11)
       .text('/DN3/', { align: 'center' });
    
    return doc;
}

module.exports = { gerarPDF };
