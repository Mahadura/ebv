// ============================================
// GERARPDF.JS - GERAÇÃO DE PDF
// ESCOLA BÁSICA DE VATIUA
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPDF(registos, estatisticas) {
    // ========== ORIENTAÇÃO HORIZONTAL (LANDSCAPE) ==========
    const MARGEM = 57; // 2cm em pontos
    
    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',  // ← HORIZONTAL
        margin: MARGEM
    });

    // ========== FUNÇÃO PARA REMOVER ACENTOS ==========
    function removerAcentos(texto) {
        if (!texto) return '';
        const acentos = {
            'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'Ç': 'C',
            'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
            'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
            'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
            'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
            'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U'
        };
        let resultado = texto;
        for (let [acentuado, normal] of Object.entries(acentos)) {
            resultado = resultado.replace(new RegExp(acentuado, 'g'), normal);
        }
        return resultado;
    }

    // ========== FUNÇÃO PARA LIMPAR TEXTO ==========
    function limparTexto(texto) {
        if (!texto) return '-';
        return removerAcentos(String(texto))
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
    }

    // ========== EMBLEMA DA REPÚBLICA ==========
    const imagemPath = path.join(__dirname, '..', 'img', 'Emblema da republica.png');
    
    if (fs.existsSync(imagemPath)) {
        try {
            const imagemLargura = 70;
            const imagemAltura = 70;
            const xEmblema = (doc.page.width - imagemLargura) / 2;
            
            doc.image(imagemPath, xEmblema, 30, {
                width: imagemLargura,
                height: imagemAltura
            });
            
            doc.y = 110;
        } catch (error) {
            console.log('Erro ao carregar o Emblema:', error);
            doc.y = 50;
        }
    } else {
        console.log('Arquivo "Emblema da republica.png" não encontrado!');
        doc.y = 50;
    }

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
       .text('ESCOLA BÁSICA DE VATIUA', { align: 'center' });

    doc.moveDown(1);

    // ========== TÍTULO ==========
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

    doc.moveDown(1.5);

    // ========== TABELA ==========
    const startX = MARGEM;
    let startY = doc.y;

    const colunas = [
        { label: 'ORD.', width: 35 },
        { label: 'NOME COMPLETO', width: 155 },
        { label: 'FUNÇÃO', width: 130 },
        { label: 'SEXO', width: 55 },
        { label: 'ROUPA', width: 150 },
        { label: 'CALÇADO', width: 55 },
        { label: 'DISTÂNCIA', width: 70 }
    ];

    const larguraTotal = colunas.reduce((sum, col) => sum + col.width, 0);
    const alturaCabecalho = 22;
    const alturaLinha = 20;

    function desenharGrade(x, y, larguraTotal, colunas, altura) {
        let currentX = x;
        
        colunas.forEach((col) => {
            doc.moveTo(currentX, y)
               .lineTo(currentX, y + altura)
               .stroke();
            currentX += col.width;
        });
        doc.moveTo(currentX, y)
           .lineTo(currentX, y + altura)
           .stroke();
        
        doc.moveTo(x, y)
           .lineTo(x + larguraTotal, y)
           .stroke();
        doc.moveTo(x, y + altura)
           .lineTo(x + larguraTotal, y + altura)
           .stroke();
    }

    // ========== CABEÇALHO DA TABELA ==========
    let currentY = startY;
    let currentX = startX;

    desenharGrade(startX, currentY, larguraTotal, colunas, alturaCabecalho);

    doc.font('Helvetica-Bold').fontSize(9);
    currentX = startX;
    colunas.forEach((col) => {
        doc.text(
            col.label,
            currentX + (col.width / 2) - (doc.widthOfString(col.label) / 2),
            currentY + (alturaCabecalho / 2) - 4,
            { width: col.width, align: 'center' }
        );
        currentX += col.width;
    });

    currentY += alturaCabecalho;

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
        if (hierarquiaA !== hierarquiaB) return hierarquiaA - hierarquiaB;
        return (a.nome || '').localeCompare(b.nome || '');
    });

    // ========== PREENCHER DADOS ==========
    doc.font('Helvetica').fontSize(9);

    dadosOrdenados.forEach((item, index) => {
        if (currentY + alturaLinha > doc.page.height - MARGEM - 80) {
            doc.addPage();
            currentY = MARGEM + 50;
            
            desenharGrade(startX, currentY, larguraTotal, colunas, alturaCabecalho);
            doc.font('Helvetica-Bold').fontSize(9);
            currentX = startX;
            colunas.forEach((col) => {
                doc.text(
                    col.label,
                    currentX + (col.width / 2) - (doc.widthOfString(col.label) / 2),
                    currentY + (alturaCabecalho / 2) - 4,
                    { width: col.width, align: 'center' }
                );
                currentX += col.width;
            });
            currentY += alturaCabecalho;
            doc.font('Helvetica').fontSize(9);
        }

        const nome = limparTexto(item.nome);
        const funcao = limparTexto(item.funcao);
        const sexo = limparTexto(item.sexo);
        const roupa = limparTexto(item.roupa);
        const calcado = limparTexto(item.calcado);
        const distancia = limparTexto(item.distancia);

        desenharGrade(startX, currentY, larguraTotal, colunas, alturaLinha);

        const dadosLinha = [
            { text: String(index + 1).padStart(2, '0'), width: colunas[0].width },
            { text: nome, width: colunas[1].width },
            { text: funcao, width: colunas[2].width },
            { text: sexo, width: colunas[3].width },
            { text: roupa, width: colunas[4].width },
            { text: calcado, width: colunas[5].width },
            { text: distancia, width: colunas[6].width }
        ];

        currentX = startX;
        dadosLinha.forEach((item) => {
            doc.text(
                item.text,
                currentX + (item.width / 2) - (doc.widthOfString(item.text) / 2),
                currentY + (alturaLinha / 2) - 4,
                { width: item.width, align: 'center' }
            );
            currentX += item.width;
        });

        currentY += alturaLinha;
    });

    // ========== RODAPÉ ==========
    doc.moveDown(2);

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
