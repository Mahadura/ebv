// ============================================
// GERARPDF.JS - GERAÇÃO DE PDF
// ESCOLA BÁSICA DE VATIUA
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPDF(registos, estatisticas) {
    // ========== ORIENTAÇÃO HORIZONTAL ==========
    const MARGEM = 57; // 2cm em pontos
    
    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
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

    // ========== FUNÇÃO PARA FORMATAR TEXTO (Primeira Maiúscula) ==========
    function formatarTexto(texto) {
        if (!texto) return '-';
        let resultado = removerAcentos(String(texto))
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        return resultado.replace(/\b\w/g, (letra) => letra.toUpperCase());
    }

    // ========== FUNÇÃO PARA FORMATAR NOME ==========
    function formatarNome(texto) {
        if (!texto) return '-';
        let resultado = removerAcentos(String(texto))
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        return resultado.replace(/\b\w/g, (letra) => letra.toUpperCase());
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
    doc.font('Helvetica')
       .fontSize(12)
       .text('REPÚBLICA DE MOÇAMBIQUE', { align: 'center' });

    doc.font('Helvetica')
       .fontSize(11)
       .text('PROVINCIA DO NIASSA', { align: 'center' })
       .text('GOVERNO DO DISTRITO DE MAÚA', { align: 'center' })
       .text('POSTO ADMINISTRATIVO DE MAIACA', { align: 'center' })
       .text('ZIP Nº 08 DE VATIUA', { align: 'center' });

    doc.font('Helvetica')
       .fontSize(14)
       .text('Escola Básica de Vatiua', { align: 'center' });

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

    // Área disponível para a tabela
    const larguraDisponivel = doc.page.width - (MARGEM * 2);

    const colunas = [
        { label: 'ORD.', width: 40 },
        { label: 'NOME COMPLETO', width: larguraDisponivel * 0.22 },
        { label: 'FUNÇÃO', width: larguraDisponivel * 0.17 },
        { label: 'SEXO', width: larguraDisponivel * 0.08 },
        { label: 'ROUPA', width: larguraDisponivel * 0.20 },
        { label: 'CALÇADO', width: larguraDisponivel * 0.08 },
        { label: 'DISTÂNCIA', width: larguraDisponivel * 0.10 }
    ];

    let somaAtual = colunas.reduce((sum, col) => sum + col.width, 0);
    const diferenca = larguraDisponivel - somaAtual;
    
    if (diferenca !== 0) {
        const ultimaColuna = colunas[colunas.length - 1];
        ultimaColuna.width = ultimaColuna.width + diferenca;
    }

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

    // ========== CABEÇALHO DA TABELA (Centralizado) ==========
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

    // ========== PREENCHER DADOS (Alinhamento à Esquerda) ==========
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

        const ordemNumero = String(index + 1).padStart(2, '0');
        const nome = formatarNome(item.nome);
        const funcao = formatarTexto(item.funcao);
        const sexo = formatarTexto(item.sexo);
        const roupa = formatarTexto(item.roupa);
        const calcado = item.calcado || '-';
        const distancia = formatarTexto(item.distancia);

        desenharGrade(startX, currentY, larguraTotal, colunas, alturaLinha);

        const dadosLinha = [
            { text: ordemNumero, width: colunas[0].width },
            { text: nome, width: colunas[1].width },
            { text: funcao, width: colunas[2].width },
            { text: sexo, width: colunas[3].width },
            { text: roupa, width: colunas[4].width },
            { text: String(calcado), width: colunas[5].width },
            { text: distancia, width: colunas[6].width }
        ];

        currentX = startX;
        const padding = 3;
        dadosLinha.forEach((item) => {
            doc.text(
                item.text,
                currentX + padding,
                currentY + (alturaLinha / 2) - 4,
                { width: item.width - padding, align: 'left' }
            );
            currentX += item.width;
        });

        currentY += alturaLinha;
    });

    // ========== RODAPÉ (Centralizado) ==========
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
