// ============================================
// GERARPDF.JS - GERAÇÃO DE PDF
// ESCOLA BÁSICA DE VATIUA
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPDF(registos, estatisticas) {
    const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 40
    });
    
    // ========== CABEÇALHO ==========
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('REPÚBLICA DE MOÇAMBIQUE', { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(12)
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
       .fontSize(12)
       .text('Lista de professores e funcionários não docentes abrangidos pela', { 
           align: 'center',
           underline: true 
       });
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
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
    
    // ========== TABELA (COMO NO EXEMPLO) ==========
    
    // Posições das colunas
    const colunas = {
        ord: 40,
        nome: 75,
        funcao: 220,
        sexo: 290,
        roupa: 340,
        calcado: 460,
        distancia: 510
    };
    
    // Cabeçalho da tabela (tudo junto como no exemplo)
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('Ord.', colunas.ord, doc.y);
    
    doc.text('Nome Completo', colunas.nome, doc.y);
    doc.text('Função', colunas.funcao, doc.y);
    doc.text('Sexo', colunas.sexo, doc.y);
    doc.text('Roupa', colunas.roupa, doc.y);
    doc.text('Calçado', colunas.calcado, doc.y);
    doc.text('Distância', colunas.distancia, doc.y);
    
    // Linha separadora após o cabeçalho
    doc.moveDown(0.5);
    const yLinha = doc.y;
    doc.moveTo(40, yLinha).lineTo(540, yLinha).stroke();
    doc.moveDown(0.5);
    
    // Ordenar dados
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
    
    // Preencher dados
    doc.font('Helvetica')
       .fontSize(12);
    
    dadosOrdenados.forEach((item, index) => {
        // Verificar se cabe na página
        if (doc.y > 730) {
            doc.addPage();
            // Redesenhar cabeçalho na nova página
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('Ord.', colunas.ord, doc.y);
            doc.text('Nome Completo', colunas.nome, doc.y);
            doc.text('Função', colunas.funcao, doc.y);
            doc.text('Sexo', colunas.sexo, doc.y);
            doc.text('Roupa', colunas.roupa, doc.y);
            doc.text('Calçado', colunas.calcado, doc.y);
            doc.text('Distância', colunas.distancia, doc.y);
            doc.moveDown(0.5);
            const yLinhaNova = doc.y;
            doc.moveTo(40, yLinhaNova).lineTo(540, yLinhaNova).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12);
        }
        
        const ordemNumero = String(index + 1).padStart(2, '0');
        const y = doc.y;
        
        doc.text(ordemNumero, colunas.ord, y);
        doc.text(item.nome || '-', colunas.nome, y);
        doc.text(item.funcao || '-', colunas.funcao, y);
        doc.text(item.sexo || '-', colunas.sexo, y);
        doc.text(item.roupa || '-', colunas.roupa, y);
        doc.text(String(item.calcado || '-'), colunas.calcado, y);
        doc.text(item.distancia || '-', colunas.distancia, y);
        
        doc.moveDown();
    });
    
    // Linha separadora final
    doc.moveDown(0.5);
    const yLinhaFinal = doc.y;
    doc.moveTo(40, yLinhaFinal).lineTo(540, yLinhaFinal).stroke();
    doc.moveDown(1);
    
    // ========== RODAPÉ ==========
    doc.moveDown(4);
    
    doc.font('Helvetica')
       .fontSize(12)
       .text('Vatiua, aos 17 de Julho de 2026', { align: 'center' });
    
    doc.moveDown(3);
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('O Director da Escola', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.text('_____________________', { align: 'center' });
    
    doc.moveDown(1);
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('Benjamim Jemusse', { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(12)
       .text('/DN3/', { align: 'center' });
    
    return doc;
}

module.exports = { gerarPDF };
