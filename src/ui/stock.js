/**
 * Stock UI Module
 * Manages product stock levels
 */

class StockUI {
    constructor(storage) {
        this.storage = storage;

        this.initializeElements();
        this.attachEventListeners();
        this.refresh();
    }

    initializeElements() {
        this.container = document.getElementById('stockContainer');
        this.addProductBtn = document.getElementById('addProductBtn');
    }

    attachEventListeners() {
        if (this.addProductBtn) {
            this.addProductBtn.addEventListener('click', () => this.handleAddProduct());
        }
    }

    refresh() {
        const products = this.storage.loadProducts();

        // Sort by zone, then by name
        products.sort((a, b) => {
            if (a.zone !== b.zone) {
                const zones = ['FROZEN_SEAFOOD', 'FROZEN_MEAT', 'FROZEN_PRECOOKED', 'DRY_GOODS'];
                return zones.indexOf(a.zone) - zones.indexOf(b.zone);
            }
            return a.name.localeCompare(b.name);
        });

        this.displayStock(products);
    }

    displayStock(products) {
        if (products.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Nenhum produto cadastrado</h3>
                    <p>Adicione produtos para começar.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="stock-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Produto</th>
                        <th>Zona</th>
                        <th>Stock</th>
                        <th>Ponto Reposição</th>
                        <th>Kg/Caixa</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(product => {
            const status = product.getStockStatus();
            const statusClass = status === 'OUT_OF_STOCK' || status === 'LOW_STOCK' ? 'stock-low' : 'stock-ok';

            html += `
                <tr>
                    <td><strong>${product.sku}</strong></td>
                    <td>${product.name}</td>
                    <td>${this.getZoneName(product.zone)}</td>
                    <td class="${statusClass}"><strong>${product.currentStock}</strong></td>
                    <td>${product.reorderPoint}</td>
                    <td>${product.kgPerBox}</td>
                    <td>${this.getStatusBadge(status)}</td>
                    <td>
                        <button onclick="window.stockUI.editStock('${product.sku}')" class="btn-secondary" style="padding: 4px 12px; font-size: 0.9rem;">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        this.container.innerHTML = html;
    }

    getZoneName(zoneId) {
        const zoneNames = {
            'FROZEN_SEAFOOD': 'Seafood Congelado',
            'FROZEN_MEAT': 'Carne Congelada',
            'FROZEN_PRECOOKED': 'Pré-Cozinhados',
            'DRY_GOODS': 'Secos'
        };
        return zoneNames[zoneId] || zoneId;
    }

    getStatusBadge(status) {
        const badges = {
            'OUT_OF_STOCK': '<span style="background: #fca5a5; color: #7f1d1d; padding: 4px 8px; border-radius: 4px;">ESGOTADO</span>',
            'LOW_STOCK': '<span style="background: #fdba74; color: #7c2d12; padding: 4px 8px; border-radius: 4px;">BAIXO</span>',
            'OK': '<span style="background: #86efac; color: #14532d; padding: 4px 8px; border-radius: 4px;">OK</span>'
        };
        return badges[status] || status;
    }

    editStock(sku) {
        const products = this.storage.loadProducts();
        const product = products.find(p => p.sku === sku);

        if (!product) return;

        const newStock = prompt(
            `Atualizar stock de ${product.name}\n\nStock atual: ${product.currentStock} caixas\n\nNovo stock:`,
            product.currentStock
        );

        if (newStock === null) return;

        const stockValue = parseInt(newStock, 10);

        if (isNaN(stockValue) || stockValue < 0) {
            alert('Stock inválido');
            return;
        }

        product.currentStock = stockValue;
        this.storage.saveProducts(products);

        this.refresh();

        // Refresh forecast if available
        if (window.forecastUI) {
            window.forecastUI.refresh();
        }
    }

    handleAddProduct() {
        alert('Funcionalidade disponível em Configurações → Produtos');
    }
}
