/**
 * History UI Module
 * Displays order history with filters
 */

class HistoryUI {
    constructor(storage, analytics) {
        this.storage = storage;
        this.analytics = analytics;

        this.initializeElements();
        this.attachEventListeners();
        this.populateFilters();
        this.refresh();
    }

    initializeElements() {
        this.container = document.getElementById('historyContainer');
        this.dateFrom = document.getElementById('dateFrom');
        this.dateTo = document.getElementById('dateTo');
        this.restaurantFilter = document.getElementById('restaurantFilter');
        this.distributorFilter = document.getElementById('distributorFilter');
        this.productFilter = document.getElementById('productFilter');
        this.applyFilterBtn = document.getElementById('applyHistoryFilter');
        this.exportBtn = document.getElementById('exportHistoryBtn');

        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        if (this.dateFrom) this.dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        if (this.dateTo) this.dateTo.value = today.toISOString().split('T')[0];
    }

    attachEventListeners() {
        if (this.applyFilterBtn) {
            this.applyFilterBtn.addEventListener('click', () => this.refresh());
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.handleExport());
        }
    }

    populateFilters() {
        const orders = this.storage.loadOrders();
        const products = this.storage.loadProducts();
        const distributors = this.storage.loadDistributors();

        // Populate restaurants
        const restaurants = [...new Set(orders.map(o => o.restaurantName))].sort();
        if (this.restaurantFilter) {
            this.restaurantFilter.innerHTML = '<option value="">Todos os Restaurantes</option>';
            restaurants.forEach(r => {
                this.restaurantFilter.innerHTML += `<option value="${r}">${r}</option>`;
            });
        }

        // Populate distributors
        if (this.distributorFilter) {
            this.distributorFilter.innerHTML = '<option value="">Todos os Distribuidores</option>';
            distributors.forEach(d => {
                this.distributorFilter.innerHTML += `<option value="${d.name}">${d.name}</option>`;
            });
        }

        // Populate products
        if (this.productFilter) {
            this.productFilter.innerHTML = '<option value="">Todos os Produtos</option>';
            products.forEach(p => {
                this.productFilter.innerHTML += `<option value="${p.sku}">${p.name}</option>`;
            });
        }
    }

    refresh() {
        const orders = this.storage.loadOrders();
        const filters = {
            dateFrom: this.dateFrom?.value,
            dateTo: this.dateTo?.value,
            restaurant: this.restaurantFilter?.value,
            distributor: this.distributorFilter?.value,
            product: this.productFilter?.value
        };

        const filteredOrders = this.analytics.getOrderHistory(orders, filters);

        this.displayHistory(filteredOrders);
    }

    displayHistory(orders) {
        if (orders.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Nenhum pedido encontrado</h3>
                    <p>Ajuste os filtros ou importe novos pedidos.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px;">
                <strong>Total: ${orders.length} pedido(s)</strong>
            </div>

            <table class="history-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Restaurante</th>
                        <th>Distribuidor</th>
                        <th>Produtos</th>
                        <th>Caixas</th>
                        <th>Kg</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        orders.forEach(order => {
            const date = new Date(order.timestamp).toLocaleDateString('pt-PT');
            const products = order.items.map(i => i.productName || i.productCode).join(', ');

            html += `
                <tr>
                    <td>${date}</td>
                    <td>${order.restaurantName}</td>
                    <td>${order.distributorName || order.distributorInitial}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${products}</td>
                    <td><strong>${order.totalBoxes}</strong></td>
                    <td>${order.totalKg.toFixed(1)}</td>
                    <td>${this.getStatusBadge(order.status)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        this.container.innerHTML = html;
    }

    getStatusBadge(status) {
        const badges = {
            'pending': '<span style="background: #fbbf24; color: #7c2d12; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Pendente</span>',
            'fulfilled': '<span style="background: #86efac; color: #14532d; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Completo</span>',
            'partial': '<span style="background: #fdba74; color: #7c2d12; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Parcial</span>',
            'cancelled': '<span style="background: #fca5a5; color: #7f1d1d; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">Cancelado</span>'
        };

        return badges[status] || status;
    }

    handleExport() {
        const orders = this.storage.loadOrders();
        const filters = {
            dateFrom: this.dateFrom?.value,
            dateTo: this.dateTo?.value,
            restaurant: this.restaurantFilter?.value,
            distributor: this.distributorFilter?.value,
            product: this.productFilter?.value
        };

        const filteredOrders = this.analytics.getOrderHistory(orders, filters);

        if (filteredOrders.length === 0) {
            alert('Nenhum pedido para exportar');
            return;
        }

        const csv = this.analytics.exportToCSV(filteredOrders);

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `historico-pedidos-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}
