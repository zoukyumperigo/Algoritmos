/**
 * Route Management UI Module
 * Full CRUD for orders - Add, Edit, Delete, and Reassign routes
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
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">📊 Gestão de Rotas</h3>
                <button onclick="routeUI.showAddOrderForm()" class="btn-success">➕ Adicionar Pedido</button>
            </div>

            <div id="orderFormContainer"></div>
        `;

        if (orders.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: #64748b; background: white; border-radius: 8px;">
                    <h3>Nenhum pedido pendente</h3>
                    <p>Importe novos pedidos via WhatsApp ou clique em "Adicionar Pedido" acima.</p>
                </div>
            `;
            this.container.innerHTML = html;
            return;
        }

        // Group orders by courier
        const ordersByCourier = this.groupByCourier(orders);

        html += `
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
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <div style="text-align: right; margin-right: 15px;">
                                <div style="font-size: 1.2rem; font-weight: bold;">${orders.length} pedidos</div>
                                <div style="opacity: 0.9;">${totalRestaurants} restaurantes</div>
                            </div>
                            <button onclick="routeUI.printRoute('${courierKey}')"
                                    style="padding: 10px 16px; background: white; color: #2563eb; border: 2px solid white; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                🖨️ Imprimir
                            </button>
                            <button onclick="routeUI.exportRouteCSV('${courierKey}')"
                                    style="padding: 10px 16px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                💾 Exportar CSV
                            </button>
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
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; width: 200px;">Ações</th>
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
                            onclick="routeUI.editOrder('${order.id}')"
                            style="padding: 6px 12px; font-size: 0.85rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            ✏️ Editar
                        </button>
                        <button
                            onclick="routeUI.handleReassign('${order.id}')"
                            style="padding: 6px 12px; font-size: 0.85rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            🔄 Rota
                        </button>
                        <button
                            onclick="routeUI.deleteOrder('${order.id}')"
                            style="padding: 6px 12px; font-size: 0.85rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🗑️
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

    // =============================================
    // ADD ORDER
    // =============================================

    showAddOrderForm() {
        const distributors = this.storage.loadDistributors();
        const products = this.storage.loadProducts();

        const formHTML = `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #16a34a;">
                <h4 style="margin-top: 0;">➕ Adicionar Novo Pedido</h4>
                <form id="addOrderForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Distribuidor *</label>
                        <select id="orderDistributor" style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                            <option value="">Selecione...</option>
                            ${distributors.map(d => `<option value="${d.initial}">${d.name} (${d.initial})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nome do Restaurante *</label>
                        <input type="text" id="orderRestaurant" placeholder="Ex: Restaurante Marazul"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Produtos *</label>
                        <div id="orderProductsList"></div>
                        <button type="button" onclick="routeUI.addProductRow()"
                                style="margin-top: 10px; padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            + Adicionar Produto
                        </button>
                    </div>
                    <div style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="routeUI.cancelOrderForm()"
                                style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ❌ Cancelar
                        </button>
                        <button type="submit"
                                style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ✅ Adicionar Pedido
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('orderFormContainer').innerHTML = formHTML;

        // Add initial product row
        this.addProductRow();

        document.getElementById('addOrderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewOrder();
        });
    }

    addProductRow() {
        const products = this.storage.loadProducts();
        const container = document.getElementById('orderProductsList');
        const rowIndex = container.children.length;

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';
        row.innerHTML = `
            <select class="product-select" style="flex: 2; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                <option value="">Selecione produto...</option>
                ${products.map(p => `<option value="${p.sku}">${p.name}</option>`).join('')}
            </select>
            <input type="number" class="product-quantity" placeholder="Qtd" min="1" value="1"
                   style="width: 80px; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
            <button type="button" onclick="this.parentElement.remove()"
                    style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🗑️
            </button>
        `;

        container.appendChild(row);
    }

    saveNewOrder() {
        const distributorInitial = document.getElementById('orderDistributor').value;
        const restaurantName = document.getElementById('orderRestaurant').value.trim();

        const productSelects = document.querySelectorAll('.product-select');
        const productQuantities = document.querySelectorAll('.product-quantity');

        const items = [];
        productSelects.forEach((select, index) => {
            if (select.value) {
                const product = this.storage.loadProducts().find(p => p.sku === select.value);
                items.push(new OrderItem({
                    productCode: product.name,
                    productSKU: product.sku,
                    productName: product.name,
                    quantity: parseInt(productQuantities[index].value),
                    zone: product.zone,
                    kgPerBox: product.kgPerBox,
                    isMapped: true
                }));
            }
        });

        if (!distributorInitial || !restaurantName || items.length === 0) {
            alert('Por favor preencha todos os campos obrigatórios!');
            return;
        }

        const distributor = this.storage.loadDistributors().find(d => d.initial === distributorInitial);

        const order = new Order({
            distributorInitial,
            distributorName: distributor ? distributor.name : '',
            restaurantName,
            items,
            rawText: `Pedido manual: ${restaurantName}`
        });

        const orders = this.storage.loadOrders();
        orders.push(order);
        this.storage.saveOrders(orders);

        alert('✅ Pedido adicionado com sucesso!');
        this.cancelOrderForm();
        this.refresh();

        if (window.pickingUI) {
            window.pickingUI.refresh();
        }
    }

    // =============================================
    // EDIT ORDER
    // =============================================

    editOrder(orderId) {
        const orders = this.storage.loadOrders();
        const order = orders.find(o => o.id === orderId);
        const distributors = this.storage.loadDistributors();
        const products = this.storage.loadProducts();

        if (!order) return;

        const formHTML = `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #2563eb;">
                <h4 style="margin-top: 0;">✏️ Editar Pedido</h4>
                <form id="editOrderForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <input type="hidden" id="editOrderId" value="${orderId}">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Distribuidor *</label>
                        <select id="orderDistributor" style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                            ${distributors.map(d => `<option value="${d.initial}" ${order.distributorInitial === d.initial ? 'selected' : ''}>${d.name} (${d.initial})</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nome do Restaurante *</label>
                        <input type="text" id="orderRestaurant" value="${order.restaurantName}"
                               style="width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Produtos *</label>
                        <div id="orderProductsList">
                            ${order.items.map(item => `
                                <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                                    <select class="product-select" style="flex: 2; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                                        ${products.map(p => `<option value="${p.sku}" ${item.productSKU === p.sku ? 'selected' : ''}>${p.name}</option>`).join('')}
                                    </select>
                                    <input type="number" class="product-quantity" value="${item.quantity}" min="1"
                                           style="width: 80px; padding: 8px; border: 2px solid #cbd5e1; border-radius: 4px;" required>
                                    <button type="button" onclick="this.parentElement.remove()"
                                            style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        🗑️
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="routeUI.addProductRow()"
                                style="margin-top: 10px; padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            + Adicionar Produto
                        </button>
                    </div>
                    <div style="grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="routeUI.cancelOrderForm()"
                                style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ❌ Cancelar
                        </button>
                        <button type="submit"
                                style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            ✅ Guardar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('orderFormContainer').innerHTML = formHTML;
        document.getElementById('orderFormContainer').scrollIntoView({ behavior: 'smooth' });

        document.getElementById('editOrderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedOrder();
        });
    }

    saveEditedOrder() {
        const orderId = document.getElementById('editOrderId').value;
        const distributorInitial = document.getElementById('orderDistributor').value;
        const restaurantName = document.getElementById('orderRestaurant').value.trim();

        const productSelects = document.querySelectorAll('.product-select');
        const productQuantities = document.querySelectorAll('.product-quantity');

        const items = [];
        productSelects.forEach((select, index) => {
            if (select.value) {
                const product = this.storage.loadProducts().find(p => p.sku === select.value);
                items.push(new OrderItem({
                    productCode: product.name,
                    productSKU: product.sku,
                    productName: product.name,
                    quantity: parseInt(productQuantities[index].value),
                    zone: product.zone,
                    kgPerBox: product.kgPerBox,
                    isMapped: true
                }));
            }
        });

        if (!distributorInitial || !restaurantName || items.length === 0) {
            alert('Por favor preencha todos os campos obrigatórios!');
            return;
        }

        const orders = this.storage.loadOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            alert('Pedido não encontrado!');
            return;
        }

        const distributor = this.storage.loadDistributors().find(d => d.initial === distributorInitial);

        // Update order
        orders[orderIndex].distributorInitial = distributorInitial;
        orders[orderIndex].distributorName = distributor ? distributor.name : '';
        orders[orderIndex].restaurantName = restaurantName;
        orders[orderIndex].items = items;
        orders[orderIndex].recalculateTotals();

        this.storage.saveOrders(orders);

        alert('✅ Pedido atualizado com sucesso!');
        this.cancelOrderForm();
        this.refresh();

        if (window.pickingUI) {
            window.pickingUI.refresh();
        }
    }

    // =============================================
    // DELETE ORDER
    // =============================================

    deleteOrder(orderId) {
        const orders = this.storage.loadOrders();
        const order = orders.find(o => o.id === orderId);

        if (!order) return;

        if (!confirm(`Tem a certeza que deseja apagar este pedido?\n\n${order.restaurantName}\n${order.totalBoxes} caixas`)) {
            return;
        }

        const filtered = orders.filter(o => o.id !== orderId);
        this.storage.saveOrders(filtered);

        alert('✅ Pedido apagado com sucesso!');
        this.refresh();

        if (window.pickingUI) {
            window.pickingUI.refresh();
        }
    }

    // =============================================
    // REASSIGN ROUTE
    // =============================================

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

    cancelOrderForm() {
        document.getElementById('orderFormContainer').innerHTML = '';
    }

    // =============================================
    // PRINT & EXPORT
    // =============================================

    printRoute(courierKey) {
        const orders = this.storage.loadOrders();
        const distributors = this.storage.loadDistributors();

        // Filter orders for this courier
        const courierOrders = orders.filter(o =>
            (o.distributorName === courierKey || o.distributorInitial === courierKey) &&
            o.status === 'pending'
        );

        if (courierOrders.length === 0) {
            alert('Nenhum pedido para imprimir para este motorista');
            return;
        }

        // Find distributor details
        const distributor = distributors.find(d =>
            d.name === courierKey || d.initial === courierKey
        );

        // Calculate totals
        const totalBoxes = courierOrders.reduce((sum, o) => sum + o.totalBoxes, 0);
        const totalKg = courierOrders.reduce((sum, o) => sum + o.totalKg, 0);
        const totalRestaurants = new Set(courierOrders.map(o => o.restaurantName)).size;

        // Generate print HTML
        const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rota ${courierKey} - ${new Date().toLocaleDateString('pt-PT')}</title>
    <style>
        @media print {
            @page { margin: 1cm; }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
        }
        h1 {
            color: #2563eb;
            margin-bottom: 5px;
            font-size: 24pt;
        }
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 11pt;
        }
        .summary {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 10px;
        }
        .summary-item {
            text-align: center;
        }
        .summary-label {
            font-size: 10pt;
            color: #64748b;
        }
        .summary-value {
            font-size: 16pt;
            font-weight: bold;
            color: #2563eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 11pt;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10pt;
        }
        tr:nth-child(even) {
            background: #f8fafc;
        }
        .restaurant-name {
            font-weight: bold;
            font-size: 11pt;
        }
        .products {
            color: #64748b;
            line-height: 1.5;
        }
        .number {
            text-align: center;
            font-weight: bold;
            color: #2563eb;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10pt;
        }
        .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            display: inline-block;
            vertical-align: middle;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚚 Rota ${courierKey}</h1>
        <div class="info-row">
            <span><strong>Motorista:</strong> ${courierKey}</span>
            <span><strong>Data:</strong> ${new Date().toLocaleDateString('pt-PT')}</span>
        </div>
        <div class="info-row">
            <span><strong>Rota:</strong> ${distributor ? distributor.routeNumber : '?'}</span>
            <span><strong>Prioridade:</strong> ${distributor ? distributor.routePriority : '?'}</span>
        </div>
    </div>

    <div class="summary">
        <strong>RESUMO DA ROTA</strong>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Pedidos</div>
                <div class="summary-value">${courierOrders.length}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Restaurantes</div>
                <div class="summary-value">${totalRestaurants}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Caixas</div>
                <div class="summary-value">${totalBoxes}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Kg</div>
                <div class="summary-value">${totalKg.toFixed(1)}</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 40px;">✓</th>
                <th style="width: 30%;">Restaurante</th>
                <th>Produtos</th>
                <th style="width: 80px; text-align: center;">Caixas</th>
                <th style="width: 80px; text-align: center;">Kg</th>
            </tr>
        </thead>
        <tbody>
            ${courierOrders.map(order => {
                const products = order.items
                    .map(item => `${item.quantity}x ${item.productName || item.productCode}`)
                    .join('<br>');

                return `
                    <tr>
                        <td style="text-align: center;"><span class="checkbox"></span></td>
                        <td class="restaurant-name">${order.restaurantName}</td>
                        <td class="products">${products}</td>
                        <td class="number">${order.totalBoxes}</td>
                        <td class="number">${order.totalKg.toFixed(1)}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Século Verde Frozen Foods - Sistema de Gestão de Armazém</p>
        <p>Impresso em ${new Date().toLocaleString('pt-PT')}</p>
    </div>
</body>
</html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printHTML);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    exportRouteCSV(courierKey) {
        const orders = this.storage.loadOrders();

        // Filter orders for this courier
        const courierOrders = orders.filter(o =>
            (o.distributorName === courierKey || o.distributorInitial === courierKey) &&
            o.status === 'pending'
        );

        if (courierOrders.length === 0) {
            alert('Nenhum pedido para exportar para este motorista');
            return;
        }

        // Build CSV
        let csv = 'Restaurante;Produto;Quantidade;Caixas;Kg\n';

        courierOrders.forEach(order => {
            order.items.forEach(item => {
                csv += `${order.restaurantName};${item.productName || item.productCode};${item.quantity};${item.quantity};${(item.quantity * (item.kgPerBox || 0)).toFixed(1)}\n`;
            });
        });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `rota_${courierKey}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
