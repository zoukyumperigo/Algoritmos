/**
 * Invoice Confirmation App - Frontend JavaScript
 * Comunicação com API REST
 */

// Configuração
const API_URL = window.location.origin; // Mesma origem (FastAPI serve frontend)
const SESSION_ID = generateSessionId();

// Estado da aplicação
const appState = {
    whatsappLoaded: false,
    invoiceLoaded: false,
    comparisonDone: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('App iniciada - Sessão:', SESSION_ID);
    setupTabs();
    checkApiHealth();
});

/**
 * Gera ID único de sessão
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Verifica se API está disponível
 */
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('API Health:', data);
    } catch (error) {
        console.error('API não disponível:', error);
        showToast('⚠️ Erro ao conectar com servidor', 'error');
    }
}

/**
 * Setup de tabs (Colar vs Ficheiro)
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            // Remover active de todos
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Adicionar active ao clicado
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
}

/**
 * Upload de texto WhatsApp (colado)
 */
async function uploadWhatsAppText() {
    const text = document.getElementById('whatsapp-text').value.trim();

    if (!text) {
        showToast('⚠️ Cole o texto do pedido WhatsApp', 'warning');
        return;
    }

    showLoading('whatsapp-status', 'A processar pedido...');

    try {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('session_id', SESSION_ID);

        const response = await fetch(`${API_URL}/api/upload/whatsapp`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appState.whatsappLoaded = true;
            showSuccess('whatsapp-status', `✅ Pedido importado: ${data.data.customer}`);
            showDataPreview('whatsapp-status', data.data, 'pedido');
            updateCompareButton();
            showToast('✅ Pedido WhatsApp carregado!');
        } else {
            throw new Error(data.detail || 'Erro ao processar');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('whatsapp-status', `❌ Erro: ${error.message}`);
        showToast('❌ Erro ao processar pedido', 'error');
    }
}

/**
 * Upload de ficheiro WhatsApp
 */
async function uploadWhatsAppFile() {
    const fileInput = document.getElementById('whatsapp-file');
    const file = fileInput.files[0];

    if (!file) return;

    showLoading('whatsapp-status', 'A processar ficheiro...');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', SESSION_ID);

        const response = await fetch(`${API_URL}/api/upload/whatsapp`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appState.whatsappLoaded = true;
            showSuccess('whatsapp-status', `✅ Ficheiro importado: ${data.data.customer}`);
            showDataPreview('whatsapp-status', data.data, 'pedido');
            updateCompareButton();
            showToast('✅ Pedido WhatsApp carregado!');
        } else {
            throw new Error(data.detail || 'Erro ao processar');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('whatsapp-status', `❌ Erro: ${error.message}`);
        showToast('❌ Erro ao processar ficheiro', 'error');
    }
}

/**
 * Upload de fatura
 */
async function uploadInvoiceFile() {
    const fileInput = document.getElementById('invoice-file');
    const file = fileInput.files[0];

    if (!file) return;

    // Verificar extensão
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'pdf'].includes(ext)) {
        showToast('⚠️ Formato não suportado. Use Excel, CSV ou PDF', 'warning');
        return;
    }

    showLoading('invoice-status', 'A processar fatura...');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', SESSION_ID);

        const response = await fetch(`${API_URL}/api/upload/invoice`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appState.invoiceLoaded = true;
            showSuccess('invoice-status', `✅ Fatura importada: ${data.data.customer}`);
            showDataPreview('invoice-status', data.data, 'fatura');
            updateCompareButton();
            showToast('✅ Fatura carregada!');
        } else {
            throw new Error(data.detail || 'Erro ao processar');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('invoice-status', `❌ Erro: ${error.message}`);
        showToast('❌ Erro ao processar fatura', 'error');
    }
}

/**
 * Executar comparação
 */
async function compareData() {
    if (!appState.whatsappLoaded || !appState.invoiceLoaded) {
        showToast('⚠️ Importe pedido e fatura primeiro', 'warning');
        return;
    }

    // Mostrar loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('compare-btn').disabled = true;

    // Scroll suave para loading
    document.getElementById('loading').scrollIntoView({ behavior: 'smooth' });

    try {
        const formData = new FormData();
        formData.append('session_id', SESSION_ID);

        const response = await fetch(`${API_URL}/api/compare`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            appState.comparisonDone = true;
            displayResults(data.data);
            showToast('✅ Comparação concluída!');

            // Scroll para resultados
            setTimeout(() => {
                document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            throw new Error(data.detail || 'Erro na comparação');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro na comparação: ' + error.message, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('compare-btn').disabled = false;
    }
}

/**
 * Mostrar resultados da comparação
 */
function displayResults(data) {
    const resultsSection = document.getElementById('results-section');
    const statusDiv = document.getElementById('result-status');
    const summaryDiv = document.getElementById('result-summary');
    const divergencesList = document.getElementById('divergences-list');

    // Mostrar seção
    resultsSection.style.display = 'block';

    // Status badge
    let statusClass = 'status-ok';
    let statusText = '✅ TUDO CORRETO';

    if (data.status === 'ERRO_CRITICO' || data.status === 'ERRO') {
        statusClass = 'status-error';
        statusText = '❌ ERROS DETETADOS';
    } else if (data.status === 'AVISO') {
        statusClass = 'status-warning';
        statusText = '⚠️ AVISOS ENCONTRADOS';
    }

    statusDiv.className = `result-status ${statusClass}`;
    statusDiv.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 10px;">${statusText.split(' ')[0]}</div>
        <div>${statusText}</div>
        <div style="font-size: 14px; margin-top: 5px;">Confiança: ${data.confidence_score.toFixed(0)}%</div>
    `;

    // Resumo
    summaryDiv.innerHTML = `
        <p><strong>Total de divergências:</strong> ${data.divergences.length}</p>
        ${data.critical_count > 0 ? `<p style="color: #C62828;">🔴 Críticos: ${data.critical_count}</p>` : ''}
        ${data.error_count > 0 ? `<p style="color: #F44336;">🔴 Erros: ${data.error_count}</p>` : ''}
        ${data.warning_count > 0 ? `<p style="color: #F57C00;">🟡 Avisos: ${data.warning_count}</p>` : ''}
    `;

    // Lista de divergências
    if (data.divergences.length === 0) {
        divergencesList.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #E8F5E9; border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <h3 style="color: #2E7D32;">Pedido e fatura estão 100% corretos!</h3>
                <p style="color: #666; margin-top: 10px;">Nenhuma divergência encontrada.</p>
            </div>
        `;
    } else {
        divergencesList.innerHTML = '<h3 style="margin-bottom: 15px;">📋 Divergências Encontradas:</h3>';

        data.divergences.forEach((div, index) => {
            const severityClass = div.severity.toLowerCase();

            const divItem = document.createElement('div');
            divItem.className = `divergence-item ${severityClass}`;

            divItem.innerHTML = `
                <div class="divergence-header">
                    <span>${div.severity_icon}</span>
                    <span>Divergência #${index + 1}: ${div.type}</span>
                </div>
                <div class="divergence-body">
                    <p><strong>Descrição:</strong> ${div.description}</p>
                    ${div.product_name ? `<p><strong>Produto:</strong> ${div.product_name}</p>` : ''}
                    ${div.expected_value !== null ? `<p><strong>Esperado:</strong> ${div.expected_value}</p>` : ''}
                    ${div.actual_value !== null ? `<p><strong>Obtido:</strong> ${div.actual_value}</p>` : ''}
                    <p><strong>Severidade:</strong> ${div.severity}</p>
                </div>
            `;

            divergencesList.appendChild(divItem);
        });
    }
}

/**
 * Download relatório PDF
 */
async function downloadPDF() {
    if (!appState.comparisonDone) {
        showToast('⚠️ Execute a comparação primeiro', 'warning');
        return;
    }

    showToast('📄 A gerar PDF...');

    try {
        const response = await fetch(`${API_URL}/api/report/pdf/${SESSION_ID}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${Date.now()}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            showToast('✅ PDF descarregado!');
        } else {
            throw new Error('Erro ao gerar PDF');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao gerar PDF', 'error');
    }
}

/**
 * Download relatório Excel
 */
async function downloadExcel() {
    if (!appState.comparisonDone) {
        showToast('⚠️ Execute a comparação primeiro', 'warning');
        return;
    }

    showToast('📊 A gerar Excel...');

    try {
        const response = await fetch(`${API_URL}/api/report/excel/${SESSION_ID}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${Date.now()}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);

            showToast('✅ Excel descarregado!');
        } else {
            throw new Error('Erro ao gerar Excel');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao gerar Excel', 'error');
    }
}

/**
 * Reset da aplicação
 */
async function resetApp() {
    if (!confirm('Deseja iniciar uma nova comparação? Os dados atuais serão perdidos.')) {
        return;
    }

    // Limpar sessão no servidor
    try {
        await fetch(`${API_URL}/api/session/${SESSION_ID}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Erro ao limpar sessão:', error);
    }

    // Recarregar página
    location.reload();
}

/**
 * Atualizar botão de comparar
 */
function updateCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    compareBtn.disabled = !(appState.whatsappLoaded && appState.invoiceLoaded);

    if (!compareBtn.disabled) {
        compareBtn.style.animation = 'pulse 2s infinite';
    }
}

/**
 * Mostrar loading
 */
function showLoading(elementId, message) {
    const el = document.getElementById(elementId);
    el.style.display = 'block';
    el.className = 'status-message';
    el.innerHTML = `<div class="loading"><div class="spinner"></div><p>${message}</p></div>`;
}

/**
 * Mostrar sucesso
 */
function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    el.style.display = 'block';
    el.className = 'status-message status-success';
    el.innerHTML = message;
}

/**
 * Mostrar erro
 */
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.style.display = 'block';
    el.className = 'status-message status-error';
    el.innerHTML = message;
}

/**
 * Mostrar preview de dados
 */
function showDataPreview(elementId, data, type) {
    const el = document.getElementById(elementId);
    const currentContent = el.innerHTML;

    const preview = `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #E0E0E0; font-size: 13px;">
            <p><strong>Distribuidor:</strong> ${data.distributor}</p>
            <p><strong>Cliente:</strong> ${data.customer}</p>
            <p><strong>Produtos:</strong> ${data.unique_products} (Total: ${data.total_items} itens)</p>
        </div>
    `;

    el.innerHTML = currentContent + preview;
}

/**
 * Mostrar toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Mostrar sobre
 */
function showAbout() {
    alert(`Invoice Confirmation App v1.0

Sistema de validação automática de faturas SAGE contra pedidos WhatsApp.

Desenvolvido com:
- Backend: Python FastAPI
- Frontend: HTML5 + CSS3 + JavaScript
- Compatível com Android, iOS e Desktop

© 2024 Todos os direitos reservados`);
}

// Adicionar animação de pulse para botão comparar
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
