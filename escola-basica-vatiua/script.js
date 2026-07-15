// ============================================
// SCRIPT.JS - FUNÇÕES JAVASCRIPT DO SISTEMA
// ESCOLA BÁSICA DE VATIUA
// ============================================

// ========== 1. FORMULÁRIO - DINÂMICO ==========

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const sexo = document.getElementById('sexo');
    const roupaHomem = document.getElementById('roupa-homem');
    const roupaMulher = document.getElementById('roupa-mulher');
    const tipoRoupa = document.getElementById('tipo-roupa');
    const roupaVestido = document.getElementById('roupa-vestido');
    const roupaBlusaSaia = document.getElementById('roupa-blusa-saia');

    // Função para mostrar campos conforme sexo
    if (sexo) {
        sexo.addEventListener('change', function() {
            // Limpar campos anteriores
            resetarCampos();

            if (this.value === 'Masculino') {
                roupaHomem.style.display = 'block';
                roupaMulher.style.display = 'none';
            } else if (this.value === 'Feminino') {
                roupaHomem.style.display = 'none';
                roupaMulher.style.display = 'block';
            } else {
                roupaHomem.style.display = 'none';
                roupaMulher.style.display = 'none';
            }
        });
    }

    // Função para mostrar campos conforme tipo de roupa (mulher)
    if (tipoRoupa) {
        tipoRoupa.addEventListener('change', function() {
            if (this.value === 'Vestido') {
                roupaVestido.style.display = 'block';
                roupaBlusaSaia.style.display = 'none';
                // Limpar campos Blusa/Saia
                document.getElementById('tamanho-blusa').value = '';
                document.getElementById('tamanho-saia').value = '';
            } else if (this.value === 'Blusa' || this.value === 'Saia') {
                roupaVestido.style.display = 'none';
                roupaBlusaSaia.style.display = 'block';
                document.getElementById('tamanho-vestido').value = '';
            } else {
                roupaVestido.style.display = 'none';
                roupaBlusaSaia.style.display = 'none';
            }
        });
    }

    // Resetar campos
    function resetarCampos() {
        document.getElementById('camisa').value = '';
        document.getElementById('calca').value = '';
        document.getElementById('tipo-roupa').value = '';
        document.getElementById('tamanho-vestido').value = '';
        document.getElementById('tamanho-blusa').value = '';
        document.getElementById('tamanho-saia').value = '';
        roupaVestido.style.display = 'none';
        roupaBlusaSaia.style.display = 'none';
    }
});

// ========== 2. FORMULÁRIO - ENVIO ==========

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formulario');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Coletar dados (ordem: Nome, Função, Sexo, Calçado, Roupa, Distância)
            const dados = {
                nome: document.getElementById('nome').value.toUpperCase(),
                funcao: document.getElementById('funcao').value,
                sexo: document.getElementById('sexo').value,
                calcado: parseInt(document.getElementById('calcado').value),
                distancia: document.getElementById('distancia').value
            };

            // Validação
            if (!dados.nome || !dados.funcao || !dados.sexo || !dados.calcado || !dados.distancia) {
                alert('Por favor, preencha todos os campos obrigatórios!');
                return;
            }

            // Roupa - Homem
            if (dados.sexo === 'Masculino') {
                const camisa = document.getElementById('camisa').value;
                const calca = document.getElementById('calca').value;
                if (!camisa || !calca) {
                    alert('Por favor, selecione o tamanho da Camisa e da Calça!');
                    return;
                }
                dados.roupa = `Camisa: ${camisa} / Calça: ${calca}`;
                dados.tamanhoCamisa = camisa;
                dados.tamanhoCalca = calca;
            }

            // Roupa - Mulher
            if (dados.sexo === 'Feminino') {
                const tipo = document.getElementById('tipo-roupa').value;
                if (!tipo) {
                    alert('Por favor, selecione o Tipo de Roupa!');
                    return;
                }
                dados.tipoRoupa = tipo;

                if (tipo === 'Vestido') {
                    const tamanho = document.getElementById('tamanho-vestido').value;
                    if (!tamanho) {
                        alert('Por favor, selecione o tamanho do Vestido!');
                        return;
                    }
                    dados.roupa = `Vestido: ${tamanho}`;
                    dados.tamanhoVestido = tamanho;
                } else if (tipo === 'Blusa' || tipo === 'Saia') {
                    const blusa = document.getElementById('tamanho-blusa').value;
                    const saia = document.getElementById('tamanho-saia').value;
                    if (!blusa || !saia) {
                        alert('Por favor, selecione o tamanho da Blusa e da Saia!');
                        return;
                    }
                    dados.roupa = `Blusa: ${blusa} / Saia: ${saia}`;
                    dados.tamanhoBlusa = blusa;
                    dados.tamanhoSaia = saia;
                }
            }

            // Enviar para o servidor
            fetch('/api/enviar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('dadosEnviados', JSON.stringify(dados));
                    localStorage.setItem('numeroRegisto', data.numero || '001');
                    window.location.href = 'confirmacao.html';
                } else {
                    alert('Erro ao enviar dados: ' + (data.error || 'Tente novamente.'));
                }
            })
            .catch(error => {
                alert('Erro de conexão. Tente novamente.');
                console.error(error);
            });
        });
    }
});

// ========== 3. CONFIRMAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
    const dadosStr = localStorage.getItem('dadosEnviados');

    if (dadosStr) {
        const dados = JSON.parse(dadosStr);
        
        // Preencher campos de confirmação (nova ordem)
        document.getElementById('confirmar-nome').textContent = dados.nome || '-';
        document.getElementById('confirmar-funcao').textContent = dados.funcao || '-';
        document.getElementById('confirmar-sexo').textContent = dados.sexo || '-';
        document.getElementById('confirmar-calcado').textContent = dados.calcado || '-';
        document.getElementById('confirmar-roupa').textContent = dados.roupa || '-';
        document.getElementById('confirmar-distancia').textContent = dados.distancia || '-';
    }

    // Botão Confirmar
    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function() {
            const dados = JSON.parse(localStorage.getItem('dadosEnviados'));

            fetch('/api/confirmar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'sucesso.html';
                } else {
                    alert('Erro ao confirmar dados. Tente novamente.');
                }
            })
            .catch(error => {
                alert('Erro de conexão. Tente novamente.');
                console.error(error);
            });
        });
    }

    // Botão Corrigir
    const btnCorrigir = document.getElementById('btn-corrigir');
    if (btnCorrigir) {
        btnCorrigir.addEventListener('click', function() {
            window.location.href = 'formulario.html';
        });
    }

    // Botão Cancelar
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            localStorage.removeItem('dadosEnviados');
            window.location.href = 'index.html';
        });
    }
});

// ========== 4. SUCESSO ==========

document.addEventListener('DOMContentLoaded', function() {
    const numero = localStorage.getItem('numeroRegisto') || '001';
    document.getElementById('numero-registo').textContent = '#' + numero;

    // Data atual
    const data = new Date();
    const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + 
                         data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('data-envio').textContent = dataFormatada;
});

// ========== 5. ADMIN - CARREGAR DADOS (SEM LOGIN) ==========

function carregarDados() {
    fetch('/api/admin/dados')
        .then(response => response.json())
        .then(data => {
            // Atualizar estatísticas
            document.getElementById('total').textContent = data.total || 0;
            document.getElementById('prof').textContent = data.professores || 0;
            document.getElementById('aux').textContent = data.auxiliares || 0;
            document.getElementById('guarda').textContent = data.guardas || 0;
            document.getElementById('masc').textContent = data.masculino || 0;
            document.getElementById('fem').textContent = data.feminino || 0;
            document.getElementById('qtd-registros').textContent = data.registos ? data.registos.length : 0;

            // Atualizar tabela
            const tbody = document.getElementById('lista-registros');
            if (tbody) {
                tbody.innerHTML = '';
                
                if (data.registos && data.registos.length > 0) {
                    data.registos.forEach((item, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${String(index + 1).padStart(2, '0')}</td>
                            <td>${item.nome || '-'}</td>
                            <td>${item.funcao || '-'}</td>
                            <td>${item.sexo || '-'}</td>
                            <td>${item.calcado || '-'}</td>
                            <td>${item.roupa || '-'}</td>
                            <td>${item.distancia || '-'}</td>
                            <td>
                                <img src="../img/icons/edit.svg" alt="Editar" class="icon-edit" onclick="editarRegisto(${item.id})">
                                <img src="../img/icons/trash.svg" alt="Eliminar" class="icon-delete" onclick="eliminarRegisto(${item.id})">
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhum registo encontrado</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
}

// ========== 6. ADMIN - ELIMINAR REGISTO ==========

function eliminarRegisto(id) {
    if (!confirm('Tem certeza que deseja eliminar este registo? Esta ação não pode ser desfeita!')) {
        return;
    }

    fetch(`/api/admin/eliminar/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Registo eliminado com sucesso!');
            carregarDados();
        } else {
            alert('Erro ao eliminar registo: ' + (data.error || 'Tente novamente.'));
        }
    })
    .catch(error => {
        alert('Erro de conexão. Tente novamente.');
        console.error(error);
    });
}

// ========== 7. ADMIN - LIMPAR REGISTOS ==========

function limparRegistos() {
    if (!confirm('⚠️ Tem certeza que deseja eliminar TODOS os registos? Esta ação não pode ser desfeita!')) {
        return;
    }

    if (!confirm('Última chance! Confirmar eliminação de todos os registos?')) {
        return;
    }

    fetch('/api/admin/limpar', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Todos os registos foram eliminados com sucesso!');
            carregarDados();
        } else {
            alert('Erro ao limpar registos: ' + (data.error || 'Tente novamente.'));
        }
    })
    .catch(error => {
        alert('Erro de conexão. Tente novamente.');
        console.error(error);
    });
}

// ========== 8. ADMIN - GERAR PDF ==========

function gerarPDF() {
    window.open('/api/admin/pdf', '_blank');
}

// ========== 9. ADMIN - FILTROS ==========

document.addEventListener('DOMContentLoaded', function() {
    const buscar = document.getElementById('buscar');
    const filtroFuncao = document.getElementById('filtro-funcao');
    const filtroSexo = document.getElementById('filtro-sexo');

    if (buscar) {
        buscar.addEventListener('input', filtrarTabela);
    }
    if (filtroFuncao) {
        filtroFuncao.addEventListener('change', filtrarTabela);
    }
    if (filtroSexo) {
        filtroSexo.addEventListener('change', filtrarTabela);
    }

    // Carregar dados automaticamente se estiver na página admin
    if (window.location.pathname.includes('admin/index.html') || window.location.pathname.includes('admin/')) {
        carregarDados();
    }
});

function filtrarTabela() {
    const busca = document.getElementById('buscar').value.toLowerCase();
    const funcao = document.getElementById('filtro-funcao').value;
    const sexo = document.getElementById('filtro-sexo').value;

    const linhas = document.querySelectorAll('#lista-registros tr');
    let visiveis = 0;

    linhas.forEach(linha => {
        const nome = linha.children[1]?.textContent.toLowerCase() || '';
        const funcaoLinha = linha.children[2]?.textContent || '';
        const sexoLinha = linha.children[3]?.textContent || '';

        let mostrar = true;

        if (busca && !nome.includes(busca)) {
            mostrar = false;
        }
        if (funcao !== 'Todos' && funcao !== funcaoLinha) {
            mostrar = false;
        }
        if (sexo !== 'Todos' && sexo !== sexoLinha) {
            mostrar = false;
        }

        linha.style.display = mostrar ? '' : 'none';
        if (mostrar) visiveis++;
    });

    document.getElementById('qtd-registros').textContent = visiveis;
}

// ========== 10. ADMIN - EDITAR REGISTO ==========

function editarRegisto(id) {
    alert('Função de edição em desenvolvimento. ID: ' + id);
}