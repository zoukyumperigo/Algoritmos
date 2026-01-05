/**
 * Route Management UI Module
 * Allows viewing and manually reassigning orders to different couriers
 */

class RouteUI {
    constructor(storage) {
        this.storage = storage;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.container = document.getElementById('routeContainer');
        this.dateFilter = document.getElementById('routeDateFilter');
        this.refreshBtn = document.getElementById('refreshRoutesBtn');
    }

    attachEventListeners() {
        if (this.dateFilter) {
            this.dateFilter.addEventListener('change', () => this.refresh());
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }
    }

    refresh() {
        const orders = this.storage.loadOrders();
        const distributors = this.storage.loadDistributors();

        // Filter pending orders
        const pendingOrders = orders.filter(o => o.status === 'pending');

        this.displayRoutes(pendingOrders, distributors);
    }

    displayRoutes(orders, distributors) {
        if (orders.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Nenhum pedido pendente</h3>
                    <p>Importe novos pedidos para gerir rotas.</p>
                </div>
            `;
            return;
        }

        // Group orders by courier
        const ordersByCourier = this.groupByCourier(orders);

        let html = `
            <div style="margin-bottom: 20px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                <h3 style="margin-top: 0;">📊 Resumo de Rotas</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Total Pedidos</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${orders.length}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Distribuidores Ativos</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${Object.keys(ordersByCourier).length}</div>
                    </div>
                </div>
            </div>
        `;

        // Display each courier's route
        Object.entries(ordersByCourier).forEach(([courierKey, courierOrders]) => {
            html += this.renderCourierRoute(courierKey, courierOrders, distributors);
        });

        this.container.innerHTML = html;

        // Attach event listeners for reassignment buttons
        this.attachReassignListeners();
    }

    groupByCourier(orders) {
        const grouped = {};

        orders.forEach(order => {
            const key = order.distributorName || order.distributorInitial;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(order);
        });

        return grouped;
    }

    renderCourierRoute(courierKey, orders, distributors) {
        // Calculate totals
        const totalBoxes = orders.reduce((sum, o) => sum + o.totalBoxes, 0);
        const totalKg = orders.reduce((sum, o) => sum + o.totalKg, 0);
        const totalRestaurants = new Set(orders.map(o => o.restaurantName)).size;

        // Find distributor details
        const distributor = distributors.find(d =>
            d.name === courierKey || d.initial === courierKey
        );

        const routeNumber = distributor ? distributor.routeNumber : '?';
        const routePriority = distributor ? distributor.routePriority : '?';

        let html = `
            <div class="courier-route-section" style="margin-bottom: 30px; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0; font-size: 1.5rem;">🚚 ${courierKey}</h3>
                            <div style="margin-top: 5px; opacity: 0.9;">
                                Rota ${routeNumber} | Prioridade: ${routePriority}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.2rem; font-weight: bold;">${orders.length} pedidos</div>
                            <div style="opacity: 0.9;">${totalRestaurants} restaurantes</div>
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 30px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div>
                            <span style="opacity: 0.8;">Total Caixas:</span>
                            <strong style="font-size: 1.2rem;">${totalBoxes}</strong>
                        </div>
                        <div>
                            <span style="opacity: 0.8;">Total Kg:</span>
                            <strong style="font-size: 1.2rem;">${totalKg.toFixed(1)}</strong>
                        </div>
                    </div>
                </div>

                <div style="padding: 20px;">
                    <table class="route-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Restaurante</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Produtos</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Caixas</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Kg</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        orders.forEach(order => {
            const products = order.items
                .map(item => `${item.quantity}x ${item.productName || item.productCode}`)
                .join(', ');

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;" data-order-id="${order.id}">
                    <td style="padding: 12px;">
                        <strong>${order.restaurantName}</strong>
                    </td>
                    <td style="padding: 12px; color: #64748b; font-size: 0.95rem;">
                        ${products}
                    </td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: #2563eb;">
                        ${order.totalBoxes}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        ${order.totalKg.toFixed(1)}
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        <button
                            class="btn-reassign"
                            data-order-id="${order.id}"
                            style="padding: 6px 12px; font-size: 0.9rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🔄 Mudar Rota
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return html;
    }

    attachReassignListeners() {
        const buttons = document.querySelectorAll('.btn-reassign');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.handleReassign(orderId);
            });
        });
    }

    handleReassign(orderId) {
        const orders = this.storage.loadOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            alert('Pedido não encontrado');
            return;
        }

        const distributors = this.storage.loadDistributors();

        // Create selection dialog
        let options = 'Selecione o novo distribuidor:\n\n';
        distributors.forEach((dist, index) => {
            options += `${index + 1}. ${dist.name} (${dist.initial}) - Rota ${dist.routeNumber}\n`;
        });

        const selection = prompt(
            `MUDAR ROTA\n\n` +
            `Pedido: ${order.restaurantName}\n` +
            `Distribuidor atual: ${order.distributorName || order.distributorInitial}\n\n` +
            options +
            `\nDigite o número (1-${distributors.length}):`
        );

        if (!selection) return;

        const index = parseInt(selection, 10) - 1;

        if (isNaN(index) || index < 0 || index >= distributors.length) {
            alert('Seleção inválida');
            return;
        }

        const newDistributor = distributors[index];

        // Confirm change
        const confirmed = confirm(
            `Confirma mudança de rota?\n\n` +
            `${order.restaurantName}\n` +
            `DE: ${order.distributorName || order.distributorInitial}\n` +
            `PARA: ${newDistributor.name} (Rota ${newDistributor.routeNumber})`
        );

        if (!confirmed) return;

        // Update order
        order.distributorInitial = newDistributor.initial;
        order.distributorName = newDistributor.name;

        // Save changes
        this.storage.saveOrders(orders);

        alert(`✅ Rota alterada com sucesso!\n\n${order.restaurantName} → ${newDistributor.name}`);

        // Refresh display
        this.refresh();

        // Refresh picking list if open
        if (window.pickingUI) {
            window.pickingUI.refresh();
        }
    }
}
