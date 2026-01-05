/**
 * Picking List UI Module
 * Displays optimized picking lists for warehouse operations
 */

class PickingUI {
    constructor(storage, optimizer) {
        this.storage = storage;
        this.optimizer = optimizer;

        this.initializeElements();
        this.attachEventListeners();
        this.refresh();
    }

    initializeElements() {
        this.container = document.getElementById('pickingListContainer');
        this.dateFilter = document.getElementById('pickingDateFilter');
        this.printBtn = document.getElementById('printPickingBtn');
        this.groupByBtn = document.getElementById('groupByBtn');
    }

    attachEventListeners() {
        if (this.dateFilter) {
            this.dateFilter.addEventListener('change', () => this.refresh());
        }

        if (this.printBtn) {
            this.printBtn.addEventListener('click', () => this.handlePrint());
        }

        if (this.groupByBtn) {
            this.groupByBtn.addEventListener('click', () => this.toggleGroupBy());
        }
    }

    toggleGroupBy() {
        const currentMode = this.optimizer.groupBy;
        const newMode = currentMode === 'product' ? 'distributor' : 'product';
        this.optimizer.setGroupBy(newMode);

        // Update button text
        if (this.groupByBtn) {
            if (newMode === 'distributor') {
                this.groupByBtn.innerHTML = '📦 Agrupar por Produto';
            } else {
                this.groupByBtn.innerHTML = '🚚 Agrupar por Motorista';
            }
        }

        this.refresh();
    }

    refresh() {
        const orders = this.storage.loadOrders();
        const filters = this.getFilters();

        const pickingList = this.optimizer.generatePickingList(orders, filters);

        this.displayPickingList(pickingList);
    }

    getFilters() {
        const filterValue = this.dateFilter?.value || 'pending';

        const filters = {
            status: 'pending'
        };

        if (filterValue === 'today') {
            filters.date = new Date().toISOString().split('T')[0];
        } else if (filterValue === 'all') {
            filters.status = null; // Show all
        }

        return filters;
    }

    displayPickingList(pickingList) {
        if (!pickingList || pickingList.zones.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Nenhum pedido pendente</h3>
                    <p>Importe novos pedidos para gerar a lista de picking.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="picking-summary" style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">📊 Resumo</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Total Pedidos</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${pickingList.summary.totalOrders}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Total Caixas</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${pickingList.summary.totalBoxes}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Total Kg</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${pickingList.summary.totalKg.toFixed(1)}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.9rem; color: #64748b;">Distribuidores</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: #2563eb;">${pickingList.summary.distributors.length}</div>
                    </div>
                </div>
            </div>
        `;

        // Render each zone based on grouping mode
        if (pickingList.groupBy === 'distributor') {
            pickingList.zones.forEach(zoneData => {
                html += this.renderZoneByDistributor(zoneData);
            });
        } else {
            pickingList.zones.forEach(zoneData => {
                html += this.renderZone(zoneData);
            });
        }

        this.container.innerHTML = html;
    }

    renderZone(zoneData) {
        const zone = zoneData.zone;

        let html = `
            <div class="zone-section">
                <div class="zone-header ${zone.id}">
                    <span>${zone.name}</span>
                    <span>${zoneData.totalBoxes} caixas (${zoneData.totalKg.toFixed(1)} kg)</span>
                </div>

                <table class="picking-table">
                    <thead>
                        <tr>
                            <th style="width: 30%;">Produto</th>
                            <th style="width: 15%;">Distribuidor</th>
                            <th style="width: 35%;">Restaurante</th>
                            <th style="width: 10%;" class="quantity-cell">Qtd</th>
                            <th style="width: 10%;">Kg</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        zoneData.products.forEach(product => {
            product.distributors.forEach((dist, distIndex) => {
                dist.orders.forEach((order, orderIndex) => {
                    const isFirstRow = distIndex === 0 && orderIndex === 0;
                    const totalOrders = this.countTotalOrders(product);
                    const totalKg = (order.quantity * product.kgPerBox).toFixed(1);

                    html += `
                        <tr>
                            ${isFirstRow ? `
                                <td rowspan="${totalOrders}" style="font-weight: bold; background: #f8fafc;">
                                    ${product.name}
                                </td>
                            ` : ''}
                            <td><strong>${dist.distributor}</strong></td>
                            <td>${order.restaurant}</td>
                            <td class="quantity-cell">${order.quantity}</td>
                            <td>${totalKg}</td>
                        </tr>
                    `;
                });
            });

            // Total row for product
            html += `
                <tr style="background: #f1f5f9; font-weight: bold;">
                    <td colspan="3" style="text-align: right;">TOTAL ${product.name}:</td>
                    <td class="quantity-cell">${product.totalQuantity}</td>
                    <td>${product.totalKg.toFixed(1)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>

                <div class="zone-totals">
                    <div>
                        <strong>Total Zona:</strong> ${zoneData.totalBoxes} caixas
                    </div>
                    <div>
                        <strong>Total Kg:</strong> ${zoneData.totalKg.toFixed(1)} kg
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderZoneByDistributor(zoneData) {
        const zone = zoneData.zone;

        let html = `
            <div class="zone-section">
                <div class="zone-header ${zone.id}">
                    <span>${zone.name}</span>
                    <span>${zoneData.totalBoxes} caixas (${zoneData.totalKg.toFixed(1)} kg)</span>
                </div>

                <table class="picking-table">
                    <thead>
                        <tr>
                            <th style="width: 20%;">Motorista</th>
                            <th style="width: 30%;">Produto</th>
                            <th style="width: 30%;">Restaurante</th>
                            <th style="width: 10%;" class="quantity-cell">Qtd</th>
                            <th style="width: 10%;">Kg</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        zoneData.distributors.forEach(dist => {
            const distRowSpan = dist.products.reduce((sum, p) => sum + p.orders.length, 0);

            dist.products.forEach((product, productIndex) => {
                product.orders.forEach((order, orderIndex) => {
                    const isFirstRowOfDist = productIndex === 0 && orderIndex === 0;
                    const totalKg = (order.quantity * product.kgPerBox).toFixed(1);

                    html += `
                        <tr>
                            ${isFirstRowOfDist ? `
                                <td rowspan="${distRowSpan}" style="font-weight: bold; background: #f8fafc; vertical-align: top; padding-top: 15px;">
                                    <div style="font-size: 1.1rem;">${dist.distributor}</div>
                                    <div style="font-size: 0.9rem; color: #64748b; margin-top: 5px;">
                                        ${dist.totalBoxes} caixas<br>
                                        ${dist.totalKg.toFixed(1)} kg
                                    </div>
                                </td>
                            ` : ''}
                            <td>${product.name}</td>
                            <td>${order.restaurant}</td>
                            <td class="quantity-cell">${order.quantity}</td>
                            <td>${totalKg}</td>
                        </tr>
                    `;
                });
            });

            // Total row for distributor
            html += `
                <tr style="background: #f1f5f9; font-weight: bold;">
                    <td colspan="3" style="text-align: right;">TOTAL ${dist.distributor}:</td>
                    <td class="quantity-cell">${dist.totalBoxes}</td>
                    <td>${dist.totalKg.toFixed(1)}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>

                <div class="zone-totals">
                    <div>
                        <strong>Total Zona:</strong> ${zoneData.totalBoxes} caixas
                    </div>
                    <div>
                        <strong>Total Kg:</strong> ${zoneData.totalKg.toFixed(1)} kg
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    countTotalOrders(product) {
        return product.distributors.reduce(
            (sum, dist) => sum + dist.orders.length,
            0
        );
    }

    handlePrint() {
        const orders = this.storage.loadOrders();
        const filters = this.getFilters();
        const pickingList = this.optimizer.generatePickingList(orders, filters);

        if (!pickingList || pickingList.zones.length === 0) {
            alert('Nenhuma lista de picking para imprimir');
            return;
        }

        // Generate printable HTML
        const printHTML = this.optimizer.generatePrintableHTML(pickingList);

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printHTML);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
}
