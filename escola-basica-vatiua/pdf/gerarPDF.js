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
    
    // ========== CABEÇALHO COM EMBLEMA ==========
    const imagemPath = path.join(__dirname, '..', 'img', 'Emblema da republica.png');
    
    if (fs.existsSync(imagemPath)) {
        try {
            doc.image(imagemPath, {
                fit: [80, 80],
                align: 'center',
                valign: 'top'
            });
            doc.y = 100;
        } catch (error) {
            console.log('Erro ao carregar o Emblema:', error);
            doc.y = 50;
        }
    } else {
        doc.y = 50;
    }
    
    // Cabeçalho
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('REPÚBLICA DE MOÇAMBIQUE', { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(12)
       .text('PROVÍNCIA DO NIASSA', { align: 'center' })
       .text('GOVERNO DO DISTRITO DE MAÚA', { align: 'center' })
       .text('POSTO ADMINISTRATIVO DE MAIACA', { align: 'center' })
       .text('ZIP Nº 08 DE VATIUA', { align: 'center' });
    
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('ESCOLA BÁSICA DE VATIUA', { align: 'center' });
    
    doc.moveDown(1);
    
    // Título
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text('LISTA DE PROFESSORES E FUNCIONÁRIOS NÃO DOCENTES ABRANGIDOS PELA NOTA Nº 611/DPE/DAT2026/310', { 
           align: 'center',
           underline: true 
       });
    
    doc.moveDown(1);
    
    // Estatísticas
    doc.font('Helvetica')
       .fontSize(10)
       .text(`Total: ${estatisticas.total || 0}    Professores: ${estatisticas.professores || 0}    Auxiliares: ${estatisticas.auxiliares || 0}    Guardas: ${estatisticas.guardas || 0}    Masculino: ${estatisticas.masculino || 0}    Feminino: ${estatisticas.feminino || 0}`, { align: 'center' });
    
    doc.moveDown(1);
    
    // Tabela
    const colunas = [35, 140, 70, 50, 100, 50, 60];
    const headers = ['Ord', 'Nome Completo', 'Função', 'Sexo', 'Roupa', 'Calçado', 'Distância'];
    
    let y = doc.y;
    let x = 40;
    
    doc.font('Helvetica-Bold').fontSize(12);
    headers.forEach((h, i) => {
        doc.text(h, x, y, { width: colunas[i], align: 'center' });
        x += colunas[i];
    });
    
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(540, doc.y).stroke();
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
    
    doc.font('Helvetica').fontSize(12);
    
    dadosOrdenados.forEach((item, index) => {
        if (doc.y > 700) {
            doc.addPage();
            // Redesenhar cabeçalho
            y = doc.y;
            x = 40;
            doc.font('Helvetica-Bold').fontSize(12);
            headers.forEach((h, i) => {
                doc.text(h, x, y, { width: colunas[i], align: 'center' });
                x += colunas[i];
            });
            doc.moveDown(0.5);
            doc.moveTo(40, doc.y).lineTo(540, doc.y).stroke();
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12);
        }
        
        y = doc.y;
        x = 40;
        
        const ordemNumero = String(index + 1).padStart(2, '0');
        const linha = [
            ordemNumero,
            item.nome || '-',
            item.funcao || '-',
            item.sexo || '-',
            item.roupa || '-',
            item.calcado || '-',
            item.distancia || '-'
        ];
        
        linha.forEach((texto, i) => {
            doc.text(String(texto), x, y, { width: colunas[i], align: 'center' });
            x += colunas[i];
        });
        doc.moveDown();
    });
    
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(540, doc.y).stroke();
    doc.moveDown(1);
    
    // Rodapé
    doc.moveDown(4);
    doc.font('Helvetica').fontSize(12).text('Vatiua, 17 de Julho de 2026', { align: 'center' });
    doc.moveDown(3);
    doc.font('Helvetica-Bold').fontSize(12).text('O DIRECTOR DA ESCOLA', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('_____________________', { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(12).text('BENJAMIM JEMUSSE', { align: 'center' });
    doc.font('Helvetica').fontSize(12).text('/DN3/', { align: 'center' });
    
    return doc;
}

module.exports = { gerarPDF };