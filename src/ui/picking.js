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

    /**
     * Get deterministic color for distributor based on initial
     * PREVENTS MIXED PICKING: Same distributor always gets same color
     */
    getDistributorColor(distributorInitial) {
        const initial = (distributorInitial || 'A').toUpperCase().charAt(0);
        const colorMap = {
            'A': '#ec4899', 'B': '#3b82f6', 'C': '#10b981', 'D': '#f59e0b',
            'E': '#8b5cf6', 'F': '#ef4444', 'G': '#06b6d4', 'H': '#84cc16',
            'I': '#f97316', 'J': '#f59e0b', 'K': '#14b8a6', 'L': '#a855f7',
            'M': '#2563eb', 'N': '#16a34a', 'O': '#ea580c', 'P': '#10b981',
            'Q': '#0891b2', 'R': '#65a30d', 'S': '#c026d3', 'T': '#0284c7'
        };
        return colorMap[initial] || '#6b7280'; // Default gray
    }

    /**
     * Get distributor icon based on initial
     */
    getDistributorIcon(distributorInitial) {
        const iconMap = {
            'J': '🚚', 'M': '🚙', 'P': '🚐', 'A': '🛻',
            'B': '🚗', 'C': '🚕', 'D': '🚓', 'E': '🚖'
        };
        return iconMap[distributorInitial] || '🚚';
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

        // MIXED PICKING PREVENTION: Check if multiple distributors
        const hasMultipleDistributors = pickingList.summary.distributors.length > 1;

        let html = `
            <!-- RULE 4: Total boxes banner at top - impossible to miss -->
            <div class="total-boxes-banner">
                <div class="label">Total a Recolher Hoje</div>
                <div class="value">${pickingList.summary.totalBoxes} CAIXAS</div>
                <div class="subtitle">${pickingList.summary.totalKg.toFixed(1)} kg total | ${pickingList.summary.totalOrders} pedidos | ${pickingList.summary.distributors.length} distribuidores</div>
            </div>

            <!-- MIXED PICKING WARNING: Alert when multiple distributors in same list -->
            ${hasMultipleDistributors ? `
                <div class="multi-distributor-warning">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-title">ATENÇÃO: MÚLTIPLOS DISTRIBUIDORES</div>
                    <div class="warning-text">
                        Esta lista contém ${pickingList.summary.distributors.length} distribuidores diferentes.<br>
                        <strong>Separe os produtos por cor/motorista para evitar mistura!</strong>
                    </div>
                </div>
            ` : ''}

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
                            <th class="checkbox-cell">✓</th>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">Produto</th>
                            <th style="width: 12%;">Distribuidor</th>
                            <th style="width: 28%;">Restaurante</th>
                            <th style="width: 12%;">Quantidade</th>
                            <th style="width: 8%;">Kg</th>
                            <th style="width: 10%;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // RULE 3: Sequential numbering across all items in zone
        let itemNumber = 1;
        let runningTotal = 0;
        const totalItemsInZone = zoneData.products.reduce((sum, p) => sum + this.countTotalOrders(p), 0);

        zoneData.products.forEach(product => {
            product.distributors.forEach((dist, distIndex) => {
                dist.orders.forEach((order, orderIndex) => {
                    const isFirstRow = distIndex === 0 && orderIndex === 0;
                    const totalOrders = this.countTotalOrders(product);
                    const totalKg = (order.quantity * product.kgPerBox).toFixed(1);

                    // RULE 4: Running total
                    runningTotal += order.quantity;

                    // MIXED PICKING PREVENTION: Color-code by distributor
                    const distInitial = order.distributorInitial || dist.distributorInitial || 'Z';
                    const distColor = this.getDistributorColor(distInitial);

                    html += `
                        <tr data-item-number="${itemNumber}" data-distributor-initial="${distInitial}" style="border-left-color: ${distColor};">
                            <td class="checkbox-cell">
                                <input type="checkbox" class="pick-checkbox" onchange="updatePickingProgress()">
                            </td>
                            <td class="item-number">${itemNumber}/${totalItemsInZone}</td>
                            ${isFirstRow ? `
                                <td rowspan="${totalOrders}" style="font-weight: bold; background: #f8fafc;">
                                    ${product.name}
                                </td>
                            ` : ''}
                            <td><strong style="color: ${distColor};">${dist.distributor}</strong></td>
                            <td>${order.restaurant}</td>
                            <td class="quantity-cell">
                                <div style="font-size: 2.5rem; font-weight: 900;">${order.quantity}</div>
                                <div style="font-size: 0.9rem; color: #92400e;">CAIXAS</div>
                            </td>
                            <td style="text-align: center;">${totalKg}</td>
                            <td class="running-total-cell">${runningTotal}</td>
                        </tr>
                    `;
                    itemNumber++;
                });
            });

            // Total row for product
            html += `
                <tr class="total-row">
                    <td colspan="5" style="text-align: right; font-weight: bold;">TOTAL ${product.name}:</td>
                    <td class="quantity-cell">
                        <div style="font-size: 2rem; font-weight: 900;">${product.totalQuantity}</div>
                        <div style="font-size: 0.8rem; color: #92400e;">CAIXAS</div>
                    </td>
                    <td style="text-align: center; font-weight: bold;">${product.totalKg.toFixed(1)}</td>
                    <td></td>
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
        `;

        // RULE 3: Sequential numbering across all items in zone
        let itemNumber = 1;
        let runningTotal = 0;
        const totalItemsInZone = zoneData.distributors.reduce(
            (sum, d) => sum + d.products.reduce((s, p) => s + p.orders.length, 0), 0
        );

        zoneData.distributors.forEach((dist, distIndex) => {
            const distColor = this.getDistributorColor(dist.distributorInitial);
            const distIcon = this.getDistributorIcon(dist.distributorInitial);

            // Add separator between distributors (except before first)
            if (distIndex > 0) {
                html += `
                    </tbody>
                    </table>
                    <div class="distributor-section-separator">
                        ⬇️ PRÓXIMO DISTRIBUIDOR ⬇️
                    </div>
                `;
            }

            // DISTRIBUTOR HEADER: Lock visual identity per distributor
            html += `
                <div class="distributor-header" style="background: ${distColor};">
                    <div>
                        <div class="dist-label">Rota / Distribuidor</div>
                        <div class="dist-name">${dist.distributor}</div>
                        <div class="dist-info">${dist.totalBoxes} caixas | ${dist.totalKg.toFixed(1)} kg</div>
                    </div>
                    <div class="dist-icon">${distIcon}</div>
                </div>

                <table class="picking-table">
                    <thead>
                        <tr>
                            <th class="checkbox-cell">✓</th>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">Produto</th>
                            <th style="width: 30%;">Restaurante</th>
                            <th style="width: 12%;">Quantidade</th>
                            <th style="width: 8%;">Kg</th>
                            <th style="width: 10%;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            // Calculate rowspan including product subtotal rows
            const distRowSpan = dist.products.reduce((sum, p) => sum + p.orders.length + 1, 0); // +1 for subtotal row per product

            dist.products.forEach((product, productIndex) => {
                product.orders.forEach((order, orderIndex) => {
                    const totalKg = (order.quantity * product.kgPerBox).toFixed(1);

                    // RULE 4: Running total
                    runningTotal += order.quantity;

                    // MIXED PICKING PREVENTION: Color-code by distributor
                    html += `
                        <tr data-item-number="${itemNumber}" data-distributor-initial="${dist.distributorInitial}" style="border-left-color: ${distColor};">
                            <td class="checkbox-cell">
                                <input type="checkbox" class="pick-checkbox" onchange="updatePickingProgress()">
                            </td>
                            <td class="item-number">${itemNumber}/${totalItemsInZone}</td>
                            <td><strong>${product.name}</strong></td>
                            <td>${order.restaurant}</td>
                            <td class="quantity-cell">
                                <div style="font-size: 2.5rem; font-weight: 900;">${order.quantity}</div>
                                <div style="font-size: 0.9rem; color: #92400e;">CAIXAS</div>
                            </td>
                            <td style="text-align: center;">${totalKg}</td>
                            <td class="running-total-cell">${runningTotal}</td>
                        </tr>
                    `;
                    itemNumber++;
                });

                // Subtotal row for product
                const productTotalQty = product.orders.reduce((sum, o) => sum + o.quantity, 0);
                const productTotalKg = (productTotalQty * product.kgPerBox).toFixed(1);

                html += `
                    <tr class="total-row" style="border-top: 2px solid ${distColor};">
                        <td colspan="4" style="text-align: right; padding-right: 10px; font-style: italic;">Subtotal ${product.name}:</td>
                        <td class="quantity-cell">
                            <div style="font-size: 1.5rem; font-weight: 900; color: ${distColor};">${productTotalQty}</div>
                            <div style="font-size: 0.8rem; color: ${distColor};">CAIXAS</div>
                        </td>
                        <td style="text-align: center; color: ${distColor}; font-weight: bold;">${productTotalKg}</td>
                        <td></td>
                    </tr>
                `;
            });

            // Total row for distributor
            html += `
                <tr class="total-row" style="background: ${distColor}20;">
                    <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL ${dist.distributor}:</td>
                    <td class="quantity-cell">
                        <div style="font-size: 2rem; font-weight: 900; color: ${distColor};">${dist.totalBoxes}</div>
                        <div style="font-size: 0.8rem; color: ${distColor};">CAIXAS</div>
                    </td>
                    <td style="text-align: center; font-weight: bold; color: ${distColor};">${dist.totalKg.toFixed(1)}</td>
                    <td></td>
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
