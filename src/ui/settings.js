/**
 * Settings UI Module
 * Complete CRUD management for products, distributors, and restaurants
 */

class SettingsUI {
    constructor(storage) {
        this.storage = storage;
        this.currentTab = 'products';
        this.editingItem = null;

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
        this.editingItem = null;
    }

    switchTab(tabName) {
        this.currentTab = tabName;

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

    // =============================================
    // PRODUCTS MANAGEMENT
    // =============================================

    displayProducts() {
        const products = this.storage.loadProducts();

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0;">Gestão de Produtos</h3>
                    <p style="color: #64748b; margin: 5px 0;">Total: <strong>${products.length}</strong> produtos</p>
                </div>
                <button onclick="settingsUI.showProductForm()" class="btn-success">➕ Adicionar Produto</button>
            </div>

            <div id="productFormContainer"></div>

            <div style="max-height: 500px; overflow-y: auto; margin-top: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="position: sticky; top: 0; background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">SKU</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Nome</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Kg/Caixa</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Zona</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Aliases</th>
                            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #cbd5e1; width: 150px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        products.forEach(product => {
            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;"><strong>${product.sku}</strong></td>
                    <td style="padding: 12px;">${product.name}</td>
                    <td style="padding: 12px;">${product.kgPerBox} kg</td>
                    <td style="padding: 12px;">
                        <span style="padding: 4px 8px; background: #f1f5f9; border-radius: 4px; font-size: 0.9rem;">
                            ${product.zone}
                        </span>
                    </td>
                    <td style="padding: 12px; font-size: 0.85rem; color: #64748b;">
                        ${product.aliases.join(', ')}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="settingsUI.editProduct('${product.sku}')"
                                style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            ✏️ Editar
                        </button>
                        <button onclick="settingsUI.deleteProduct('${product.sku}')"
                                style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🗑️ Apagar
                        </button>
                    </td>
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

    showProductForm(productSKU = null) {
        const products = this.storage.loadProducts();
        const zones = this.storage.loadZones();
        const product = productSKU ? products.find(p => p.sku === productSKU) : null;
        const isEdit = !!product;

        const formHTML = `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #2563eb;">
                <h4 style="margin-top: 0;">${isEdit ? '✏️ Editar Produto' : '➕ Adicionar Novo Produto'}</h4>
                <form id="productForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">SKU *</label>
                        <input type="text" id="productSKU" value="${product?.sku || ''}"
                               ${isEdit ? 'readonly' : ''}
                               placeholder="Ex: SHRMP-41-50"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px; ${isEdit ? 'background: #e2e8f0;' : ''}" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nome do Produto *</label>
                        <input type="text" id="productName" value="${product?.name || ''}"
                               placeholder="Ex: Camarão 41/50"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Kg por Caixa *</label>
                        <input type="number" step="0.1" id="productKgPerBox" value="${product?.kgPerBox || ''}"
                               placeholder="Ex: 15"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Zona *</label>
                        <select id="productZone" style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                            ${Object.keys(zones).map(zoneId => `
                                <option value="${zoneId}" ${product?.zone === zoneId ? 'selected' : ''}>${zones[zoneId].name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Aliases (separados por vírgula)</label>
                        <input type="text" id="productAliases" value="${product?.aliases.join(', ') || ''}"
                               placeholder="Ex: 41/50, Camarão 41/50, Shrimp 41/50"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;">
                        <small style="color: #64748b;">Os aliases ajudam a reconhecer o produto em diferentes formatos</small>
                    </div>
                    <div style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="settingsUI.cancelProductForm()"
                                style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ❌ Cancelar
                        </button>
                        <button type="submit"
                                style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ✅ ${isEdit ? 'Guardar Alterações' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('productFormContainer').innerHTML = formHTML;
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct(isEdit);
        });
    }

    saveProduct(isEdit) {
        const sku = document.getElementById('productSKU').value.trim();
        const name = document.getElementById('productName').value.trim();
        const kgPerBox = parseFloat(document.getElementById('productKgPerBox').value);
        const zone = document.getElementById('productZone').value;
        const aliasesText = document.getElementById('productAliases').value.trim();
        const aliases = aliasesText ? aliasesText.split(',').map(a => a.trim()).filter(a => a) : [];

        if (!sku || !name || !kgPerBox || !zone) {
            alert('Por favor preencha todos os campos obrigatórios!');
            return;
        }

        const products = this.storage.loadProducts();

        if (!isEdit && products.find(p => p.sku === sku)) {
            alert('Já existe um produto com este SKU!');
            return;
        }

        const productData = {
            sku,
            name,
            kgPerBox,
            zone,
            aliases: aliases.length > 0 ? aliases : [name],
            category: zone.includes('SEAFOOD') ? 'Seafood' : zone.includes('MEAT') ? 'Meat' : 'Other'
        };

        if (isEdit) {
            const index = products.findIndex(p => p.sku === sku);
            products[index] = new Product(productData);
        } else {
            products.push(new Product(productData));
        }

        this.storage.saveProducts(products);
        this.displayProducts();
        alert(isEdit ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
    }

    editProduct(sku) {
        this.showProductForm(sku);
        // Scroll to form
        document.getElementById('productFormContainer').scrollIntoView({ behavior: 'smooth' });
    }

    deleteProduct(sku) {
        if (!confirm('Tem a certeza que deseja apagar este produto?')) {
            return;
        }

        const products = this.storage.loadProducts();
        const filtered = products.filter(p => p.sku !== sku);

        this.storage.saveProducts(filtered);
        this.displayProducts();
        alert('Produto apagado com sucesso!');
    }

    cancelProductForm() {
        document.getElementById('productFormContainer').innerHTML = '';
    }

    // =============================================
    // DISTRIBUTORS MANAGEMENT
    // =============================================

    displayDistributors() {
        const distributors = this.storage.loadDistributors();

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0;">Gestão de Distribuidores</h3>
                    <p style="color: #64748b; margin: 5px 0;">Total: <strong>${distributors.length}</strong> distribuidores</p>
                </div>
                <button onclick="settingsUI.showDistributorForm()" class="btn-success">➕ Adicionar Distribuidor</button>
            </div>

            <div id="distributorFormContainer"></div>

            <div style="display: grid; gap: 15px; margin-top: 20px;">
        `;

        distributors.forEach(dist => {
            html += `
                <div style="padding: 20px; border: 2px solid #e2e8f0; border-radius: 8px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <strong style="font-size: 1.3rem;">${dist.name}</strong>
                                <span style="background: #2563eb; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                                    ${dist.initial}
                                </span>
                            </div>
                            <div style="color: #64748b;">
                                <strong>Rota:</strong> ${dist.routeNumber} |
                                <strong>Prioridade:</strong> ${dist.routePriority}
                            </div>
                        </div>
                        <div>
                            <button onclick="settingsUI.editDistributor('${dist.initial}')"
                                    style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                                ✏️ Editar
                            </button>
                            <button onclick="settingsUI.deleteDistributor('${dist.initial}')"
                                    style="padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                🗑️ Apagar
                            </button>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.95rem;">
                        <div>
                            <strong style="color: #1e293b;">📍 Clientes:</strong>
                            <div style="color: #64748b; margin-top: 5px;">${dist.customers.join(', ')}</div>
                        </div>
                        <div>
                            <strong style="color: #1e293b;">📅 Dias de Entrega:</strong>
                            <div style="color: #64748b; margin-top: 5px;">${dist.deliveryDays.join(', ')}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        this.settingsContent.innerHTML = html;
    }

    showDistributorForm(distInitial = null) {
        const distributors = this.storage.loadDistributors();
        const distributor = distInitial ? distributors.find(d => d.initial === distInitial) : null;
        const isEdit = !!distributor;

        const formHTML = `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #2563eb;">
                <h4 style="margin-top: 0;">${isEdit ? '✏️ Editar Distribuidor' : '➕ Adicionar Novo Distribuidor'}</h4>
                <form id="distributorForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Inicial *</label>
                        <input type="text" id="distInitial" value="${distributor?.initial || ''}"
                               ${isEdit ? 'readonly' : ''}
                               placeholder="Ex: J ou JO" maxlength="2"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px; text-transform: uppercase; ${isEdit ? 'background: #e2e8f0;' : ''}" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nome Completo *</label>
                        <input type="text" id="distName" value="${distributor?.name || ''}"
                               placeholder="Ex: João Silva"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Número da Rota *</label>
                        <input type="number" id="distRouteNumber" value="${distributor?.routeNumber || ''}"
                               placeholder="Ex: 1"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Prioridade da Rota *</label>
                        <input type="number" id="distRoutePriority" value="${distributor?.routePriority || ''}"
                               placeholder="Ex: 1 (menor = primeiro)"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Clientes (separados por vírgula)</label>
                        <input type="text" id="distCustomers" value="${distributor?.customers.join(', ') || ''}"
                               placeholder="Ex: Restaurante Marazul, Sushi Place"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dias de Entrega (separados por vírgula)</label>
                        <input type="text" id="distDeliveryDays" value="${distributor?.deliveryDays.join(', ') || ''}"
                               placeholder="Ex: Segunda, Quarta, Sexta"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;">
                    </div>
                    <div style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="settingsUI.cancelDistributorForm()"
                                style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ❌ Cancelar
                        </button>
                        <button type="submit"
                                style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ✅ ${isEdit ? 'Guardar Alterações' : 'Adicionar Distribuidor'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('distributorFormContainer').innerHTML = formHTML;
        document.getElementById('distributorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDistributor(isEdit);
        });
    }

    saveDistributor(isEdit) {
        const initial = document.getElementById('distInitial').value.trim().toUpperCase();
        const name = document.getElementById('distName').value.trim();
        const routeNumber = parseInt(document.getElementById('distRouteNumber').value);
        const routePriority = parseInt(document.getElementById('distRoutePriority').value);
        const customersText = document.getElementById('distCustomers').value.trim();
        const deliveryDaysText = document.getElementById('distDeliveryDays').value.trim();

        const customers = customersText ? customersText.split(',').map(c => c.trim()).filter(c => c) : [];
        const deliveryDays = deliveryDaysText ? deliveryDaysText.split(',').map(d => d.trim()).filter(d => d) : [];

        if (!initial || !name || !routeNumber || !routePriority) {
            alert('Por favor preencha todos os campos obrigatórios!');
            return;
        }

        const distributors = this.storage.loadDistributors();

        if (!isEdit && distributors.find(d => d.initial === initial)) {
            alert('Já existe um distribuidor com esta inicial!');
            return;
        }

        const distributorData = {
            initial,
            name,
            routeNumber,
            routePriority,
            customers: customers.length > 0 ? customers : [],
            deliveryDays: deliveryDays.length > 0 ? deliveryDays : ['Segunda', 'Quarta', 'Sexta']
        };

        if (isEdit) {
            const index = distributors.findIndex(d => d.initial === initial);
            distributors[index] = new Distributor(distributorData);
        } else {
            distributors.push(new Distributor(distributorData));
        }

        this.storage.saveDistributors(distributors);
        this.displayDistributors();
        alert(isEdit ? 'Distribuidor atualizado com sucesso!' : 'Distribuidor adicionado com sucesso!');
    }

    editDistributor(initial) {
        this.showDistributorForm(initial);
        document.getElementById('distributorFormContainer').scrollIntoView({ behavior: 'smooth' });
    }

    deleteDistributor(initial) {
        if (!confirm('Tem a certeza que deseja apagar este distribuidor?')) {
            return;
        }

        const distributors = this.storage.loadDistributors();
        const filtered = distributors.filter(d => d.initial !== initial);

        this.storage.saveDistributors(filtered);
        this.displayDistributors();
        alert('Distribuidor apagado com sucesso!');
    }

    cancelDistributorForm() {
        document.getElementById('distributorFormContainer').innerHTML = '';
    }

    // =============================================
    // SALES REPS (View Only)
    // =============================================

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

    // =============================================
    // ZONES (View Only)
    // =============================================

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
