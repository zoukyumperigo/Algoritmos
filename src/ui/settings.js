/**
 * Settings UI Module
 * Manages application settings and configuration
 */

class SettingsUI {
    constructor(storage) {
        this.storage = storage;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.modal = document.getElementById('settingsModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeBtn = this.modal?.querySelector('.close');
        this.settingsContent = document.getElementById('settingsContent');
        this.settingsTabs = document.querySelectorAll('.settings-tab');
    }

    attachEventListeners() {
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.open());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        this.settingsTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    open() {
        this.modal.classList.add('active');
        this.switchTab('products');
    }

    close() {
        this.modal.classList.remove('active');
    }

    switchTab(tabName) {
        // Update tab buttons
        this.settingsTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Display tab content
        switch (tabName) {
            case 'products':
                this.displayProducts();
                break;
            case 'distributors':
                this.displayDistributors();
                break;
            case 'salesreps':
                this.displaySalesReps();
                break;
            case 'zones':
                this.displayZones();
                break;
        }
    }

    displayProducts() {
        const products = this.storage.loadProducts();

        let html = `
            <h3>Gestão de Produtos</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Total de produtos: <strong>${products.length}</strong>
            </p>
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="padding: 10px; text-align: left;">SKU</th>
                            <th style="padding: 10px; text-align: left;">Nome</th>
                            <th style="padding: 10px; text-align: left;">Aliases</th>
                            <th style="padding: 10px; text-align: left;">Zona</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        products.forEach(product => {
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px;"><strong>${product.sku}</strong></td>
                    <td style="padding: 10px;">${product.name}</td>
                    <td style="padding: 10px; font-size: 0.85rem; color: #64748b;">${product.aliases.join(', ')}</td>
                    <td style="padding: 10px;">${product.zone}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.settingsContent.innerHTML = html;
    }

    displayDistributors() {
        const distributors = this.storage.loadDistributors();

        let html = `
            <h3>Gestão de Distribuidores</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Total de distribuidores: <strong>${distributors.length}</strong>
            </p>
            <div style="display: grid; gap: 15px;">
        `;

        distributors.forEach(dist => {
            html += `
                <div style="padding: 15px; border: 2px solid #e2e8f0; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 1.2rem;">${dist.name}</strong>
                            <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; margin-left: 10px;">${dist.initial}</span>
                        </div>
                        <div style="color: #64748b;">
                            Rota ${dist.routeNumber} (Prioridade: ${dist.routePriority})
                        </div>
                    </div>
                    <div style="font-size: 0.95rem; color: #64748b;">
                        <strong>Clientes:</strong> ${dist.customers.join(', ')}
                    </div>
                    <div style="font-size: 0.95rem; color: #64748b; margin-top: 5px;">
                        <strong>Dias de entrega:</strong> ${dist.deliveryDays.join(', ')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        this.settingsContent.innerHTML = html;
    }

    displaySalesReps() {
        const salesReps = this.storage.loadSalesReps();

        let html = `
            <h3>Gestão de Vendedores</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Total de vendedores: <strong>${salesReps.length}</strong>
            </p>
            <div style="display: grid; gap: 15px;">
        `;

        salesReps.forEach(rep => {
            html += `
                <div style="padding: 15px; border: 2px solid #e2e8f0; border-radius: 6px;">
                    <div style="margin-bottom: 10px;">
                        <strong style="font-size: 1.2rem;">${rep.name}</strong>
                    </div>
                    <div style="font-size: 0.95rem; color: #64748b;">
                        <strong>Clientes:</strong> ${rep.customers.join(', ')}
                    </div>
                    <div style="font-size: 0.95rem; color: #64748b; margin-top: 5px;">
                        <strong>Email:</strong> ${rep.email} | <strong>Tel:</strong> ${rep.phone}
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        this.settingsContent.innerHTML = html;
    }

    displayZones() {
        const zones = this.storage.loadZones();

        let html = `
            <h3>Zonas do Armazém</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                As zonas determinam a ordem de picking no armazém
            </p>
            <div style="display: grid; gap: 15px;">
        `;

        Object.values(zones).forEach(zone => {
            html += `
                <div style="padding: 20px; border-left: 5px solid ${zone.color}; background: #f8fafc; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="font-size: 1.2rem;">${zone.name}</strong>
                            <div style="color: #64748b; margin-top: 5px;">
                                ID: ${zone.id}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: ${zone.color}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold;">
                                Prioridade: ${zone.pickingPriority}
                            </div>
                            <div style="color: #64748b; margin-top: 5px; font-size: 0.9rem;">
                                ${zone.temperature}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; color: #64748b;">
                        <strong>Localização:</strong> ${zone.location}
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        this.settingsContent.innerHTML = html;
    }
}
