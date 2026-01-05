/**
 * Import UI Module
 * Handles WhatsApp order import interface
 */

class ImportUI {
    constructor(storage, parser, normalizer, validator) {
        this.storage = storage;
        this.parser = parser;
        this.normalizer = normalizer;
        this.validator = validator;
        this.currentOrders = [];

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.whatsappTextArea = document.getElementById('whatsappText');
        this.fileUpload = document.getElementById('fileUpload');
        this.parseBtn = document.getElementById('parseBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.parsedContainer = document.getElementById('parsedOrdersContainer');
        this.errorSummary = document.getElementById('errorSummary');
        this.parsedOrdersList = document.getElementById('parsedOrdersList');
        this.confirmBtn = document.getElementById('confirmOrdersBtn');
        this.cancelBtn = document.getElementById('cancelOrdersBtn');

        // Load sample text for demo
        if (this.whatsappTextArea && !this.whatsappTextArea.value) {
            this.whatsappTextArea.placeholder = SAMPLE_WHATSAPP_TEXT;
        }
    }

    attachEventListeners() {
        if (this.parseBtn) {
            this.parseBtn.addEventListener('click', () => this.handleParse());
        }

        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => this.handleFileUpload());
        }

        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => this.handleConfirm());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.handleCancel());
        }
    }

    async handleParse() {
        const text = this.whatsappTextArea.value.trim();

        if (!text) {
            alert('Por favor, cole o texto do WhatsApp');
            return;
        }

        this.processOrders(text);
    }

    async handleFileUpload() {
        const file = this.fileUpload.files[0];

        if (!file) {
            alert('Por favor, selecione um ficheiro');
            return;
        }

        try {
            const text = await this.readFile(file);
            this.processOrders(text);
        } catch (error) {
            alert('Erro ao ler ficheiro: ' + error.message);
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erro ao ler ficheiro'));
            reader.readAsText(file);
        });
    }

    processOrders(text) {
        // Parse orders
        const orders = this.parser.parse(text);

        if (this.parser.hasErrors() && orders.length === 0) {
            this.showErrors(this.parser.getErrors(), []);
            return;
        }

        // Load existing data
        const products = this.storage.loadProducts();
        const distributors = this.storage.loadDistributors();
        const existingOrders = this.storage.loadOrders();

        // Normalize orders
        this.normalizer = new ProductNormalizer(products);
        orders.forEach(order => this.normalizer.normalizeOrder(order, distributors));

        // Validate orders
        this.validator.validateOrders(orders, existingOrders);

        // Store current orders
        this.currentOrders = orders;

        // Display results
        this.displayParsedOrders(orders);
    }

    displayParsedOrders(orders) {
        // Show container
        this.parsedContainer.style.display = 'block';

        // Display error/warning summary
        const summary = this.validator.getValidationSummary(orders);
        this.displaySummary(summary);

        // Display individual orders
        this.displayOrdersList(orders);

        // Scroll to results
        this.parsedContainer.scrollIntoView({ behavior: 'smooth' });
    }

    displaySummary(summary) {
        let html = '';

        // Errors
        if (summary.ordersWithErrors > 0) {
            html += `
                <div class="error-alert">
                    ❌ ${summary.ordersWithErrors} pedido(s) com ERROS (${summary.totalErrors} erro(s) total)
                    <br>Estes pedidos NÃO serão guardados.
                </div>
            `;
        }

        // Warnings
        if (summary.ordersWithWarnings > 0) {
            html += `
                <div class="warning-alert">
                    ⚠️ ${summary.ordersWithWarnings} pedido(s) com AVISOS (${summary.totalWarnings} aviso(s) total)
                    <br>Reveja cuidadosamente antes de confirmar.
                </div>
            `;
        }

        // Success
        if (summary.validOrders > 0) {
            html += `
                <div class="success-alert">
                    ✅ ${summary.validOrders} pedido(s) válido(s)
                </div>
            `;
        }

        // Unmapped products
        if (summary.unmappedProducts.length > 0) {
            html += `
                <div class="error-alert">
                    ❌ Produtos não reconhecidos: ${summary.unmappedProducts.join(', ')}
                    <br>Adicione estes produtos ao catálogo em Configurações.
                </div>
            `;
        }

        this.errorSummary.innerHTML = html;
    }

    displayOrdersList(orders) {
        let html = '';

        orders.forEach((order, index) => {
            const cardClass = order.hasErrors() ? 'has-error' :
                             order.hasWarnings() ? 'has-warning' : '';

            html += `
                <div class="order-card ${cardClass}">
                    <div class="order-header">
                        <div>
                            <strong>Pedido ${index + 1}:</strong>
                            ${order.restaurantName}
                        </div>
                        <div>
                            <strong>Distribuidor:</strong> ${order.distributorName || order.distributorInitial}
                        </div>
                    </div>

                    ${order.errors.length > 0 ? `
                        <div style="color: #dc2626; margin-top: 10px;">
                            ${order.errors.map(e => `<div>❌ ${e}</div>`).join('')}
                        </div>
                    ` : ''}

                    ${order.warnings.length > 0 ? `
                        <div style="color: #ea580c; margin-top: 10px;">
                            ${order.warnings.map(w => `<div>⚠️ ${w}</div>`).join('')}
                        </div>
                    ` : ''}

                    <div class="order-items">
                        <strong>Items:</strong>
                        ${order.items.map(item => `
                            <div class="order-item">
                                • ${item.productName || item.productCode} - <strong>${item.quantity}</strong> caixas
                                ${item.kgPerBox ? ` (${item.getTotalKg()} kg)` : ''}
                                ${!item.isMapped ? ' <span style="color: red;">❌ NÃO MAPEADO</span>' : ''}
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 10px; font-weight: bold;">
                        Total: ${order.totalBoxes} caixas (${order.totalKg.toFixed(1)} kg)
                    </div>
                </div>
            `;
        });

        this.parsedOrdersList.innerHTML = html;
    }

    showErrors(errors, warnings) {
        this.parsedContainer.style.display = 'block';

        let html = '';

        if (errors.length > 0) {
            html += `
                <div class="error-alert">
                    <strong>Erros de Parsing:</strong><br>
                    ${errors.map(e => `• ${e}`).join('<br>')}
                </div>
            `;
        }

        if (warnings.length > 0) {
            html += `
                <div class="warning-alert">
                    <strong>Avisos:</strong><br>
                    ${warnings.map(w => `• ${w}`).join('<br>')}
                </div>
            `;
        }

        this.errorSummary.innerHTML = html;
        this.parsedOrdersList.innerHTML = '<p>Nenhum pedido válido encontrado.</p>';
    }

    handleConfirm() {
        // Filter out orders with errors
        const validOrders = this.currentOrders.filter(order => order.isValid());

        if (validOrders.length === 0) {
            alert('Nenhum pedido válido para guardar');
            return;
        }

        // Confirm with user
        const ordersWithWarnings = validOrders.filter(o => o.hasWarnings());
        if (ordersWithWarnings.length > 0) {
            const confirmed = confirm(
                `${ordersWithWarnings.length} pedido(s) têm avisos.\n\n` +
                `Deseja continuar e guardar ${validOrders.length} pedido(s)?`
            );

            if (!confirmed) return;
        }

        // Save orders
        this.storage.addOrders(validOrders);

        // Success message
        alert(`✅ ${validOrders.length} pedido(s) guardado(s) com sucesso!`);

        // Clear form
        this.whatsappTextArea.value = '';
        this.parsedContainer.style.display = 'none';
        this.currentOrders = [];

        // Trigger refresh of picking list
        if (window.pickingUI) {
            window.pickingUI.refresh();
        }
    }

    handleCancel() {
        this.parsedContainer.style.display = 'none';
        this.currentOrders = [];
    }

    loadSampleData() {
        this.whatsappTextArea.value = SAMPLE_WHATSAPP_TEXT;
    }
}
