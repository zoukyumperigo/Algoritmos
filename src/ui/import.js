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
            // Validate file size before reading
            const constants = window.APP_CONSTANTS || { MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024 };
            const maxSize = constants.MAX_FILE_SIZE_BYTES;

            if (file.size > maxSize) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
                reject(new Error(`Ficheiro muito grande! Tamanho: ${sizeMB}MB, Máximo: ${maxMB}MB`));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erro ao ler ficheiro'));

            // Explicitly specify UTF-8 encoding for Portuguese characters
            reader.readAsText(file, 'UTF-8');
        });
    }

    processOrders(text) {
        // Load existing data first (needed for resilient parser)
        const products = this.storage.loadProducts();
        const distributors = this.storage.loadDistributors();
        const existingOrders = this.storage.loadOrders();

        // Use RESILIENT parser (NEVER blocks orders)
        const result = this.parser.parseResilient(text, products, distributors);
        const orders = result.orders;

        // Show global warnings if any
        if (result.warnings && result.warnings.length > 0) {
            console.warn('Resilient parser warnings:', result.warnings);
        }

        // Even if no orders, don't completely fail - show what we got
        if (orders.length === 0) {
            this.showErrors(['Nenhum pedido foi encontrado no texto'], []);
            return;
        }

        // Validate orders (soft validation - warnings only)
        this.validator.validateOrders(orders, existingOrders);

        // Store current orders
        this.currentOrders = orders;

        // Display results with confidence indicators
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
                        ${order.items.map(item => {
                            // Confidence badge
                            let confidenceBadge = '';
                            let confidenceColor = '';

                            if (item.confidence !== undefined) {
                                if (item.confidence >= 80) {
                                    confidenceColor = '#16a34a'; // green
                                    confidenceBadge = '✓';
                                } else if (item.confidence >= 50) {
                                    confidenceColor = '#ea580c'; // orange
                                    confidenceBadge = '⚠';
                                } else {
                                    confidenceColor = '#dc2626'; // red
                                    confidenceBadge = '?';
                                }
                            }

                            return `
                                <div class="order-item" style="display: flex; align-items: center; gap: 8px;">
                                    ${item.confidence !== undefined ? `
                                        <span style="
                                            background: ${confidenceColor};
                                            color: white;
                                            padding: 2px 6px;
                                            border-radius: 4px;
                                            font-size: 0.8rem;
                                            font-weight: bold;
                                            min-width: 40px;
                                            text-align: center;
                                        " title="Confidence: ${item.confidence}% (${item.matchLayer})">
                                            ${confidenceBadge} ${item.confidence}%
                                        </span>
                                    ` : ''}
                                    <span style="flex: 1;">
                                        • ${item.productName || item.productCode} - <strong>${item.quantity}</strong> caixas
                                        ${item.kgPerBox ? ` (${item.getTotalKg()} kg)` : ''}
                                        ${!item.isMapped ? ' <span style="color: red;">❌ NÃO RECONHECIDO</span>' : ''}
                                    </span>
                                </div>
                            `;
                        }).join('')}
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

        // Trigger refresh of route and picking list
        if (window.routeUI) {
            window.routeUI.refresh();
        }
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
