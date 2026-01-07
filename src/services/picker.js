/**
 * Picking List Optimizer
 * Generates optimized picking lists for warehouse operations
 *
 * Optimization order:
 * 1. Zone (Frozen Seafood → Frozen Meat → Frozen Pre-cooked → Dry Goods)
 * 2. Product (aggregate same products) OR Distributor (group by courier)
 * 3. Route (distributor delivery order)
 */

class PickingListOptimizer {
    constructor(zones, distributors) {
        this.zones = zones;
        this.distributors = distributors;
        this.groupBy = 'product'; // 'product' or 'distributor'
    }

    /**
     * Set grouping mode
     */
    setGroupBy(mode) {
        this.groupBy = mode; // 'product' or 'distributor'
    }

    /**
     * Generate optimized picking list from orders
     */
    generatePickingList(orders, filters = {}) {
        // Filter orders based on criteria
        let filteredOrders = this.filterOrders(orders, filters);

        // Only include valid orders (no errors)
        filteredOrders = filteredOrders.filter(order => order.isValid());

        if (filteredOrders.length === 0) {
            return {
                zones: [],
                summary: {
                    totalOrders: 0,
                    totalItems: 0,
                    totalBoxes: 0,
                    totalKg: 0
                },
                groupBy: this.groupBy
            };
        }

        // Aggregate based on grouping mode
        let zoneGroups;
        if (this.groupBy === 'distributor') {
            zoneGroups = this.aggregateByZoneAndDistributor(filteredOrders);
        } else {
            zoneGroups = this.aggregateByZone(filteredOrders);
        }

        // Sort zones by picking priority
        const sortedZones = this.sortZones(zoneGroups);

        // Calculate summary
        const summary = this.calculateSummary(filteredOrders);

        return {
            zones: sortedZones,
            summary: summary,
            generatedAt: new Date().toISOString(),
            groupBy: this.groupBy
        };
    }

    /**
     * Filter orders based on criteria
     */
    filterOrders(orders, filters) {
        let filtered = [...orders];

        // Filter by date
        if (filters.date) {
            filtered = filtered.filter(order => order.getDate() === filters.date);
        } else if (filters.dateRange) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate >= filters.dateRange.from && orderDate <= filters.dateRange.to;
            });
        }

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(order => order.status === filters.status);
        } else {
            // Default: only pending orders
            filtered = filtered.filter(order => order.status === 'pending');
        }

        // Filter by distributor
        if (filters.distributor) {
            filtered = filtered.filter(order =>
                order.distributorInitial === filters.distributor ||
                order.distributorName === filters.distributor
            );
        }

        // Filter by sales rep
        if (filters.salesRep) {
            filtered = filtered.filter(order => order.salesRep === filters.salesRep);
        }

        return filtered;
    }

    /**
     * Aggregate items by zone
     */
    aggregateByZone(orders) {
        const zoneMap = new Map();

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isMapped) return;

                const zone = item.zone;

                if (!zoneMap.has(zone)) {
                    zoneMap.set(zone, new Map());
                }

                const productMap = zoneMap.get(zone);
                const key = item.productSKU;

                if (!productMap.has(key)) {
                    productMap.set(key, {
                        sku: item.productSKU,
                        name: item.productName,
                        zone: zone,
                        kgPerBox: item.kgPerBox,
                        distributors: new Map()
                    });
                }

                const product = productMap.get(key);
                const distKey = order.distributorName || order.distributorInitial;

                if (!product.distributors.has(distKey)) {
                    product.distributors.set(distKey, {
                        distributor: distKey,
                        distributorInitial: order.distributorInitial,
                        routePriority: this.getRoutePriority(order.distributorInitial),
                        orders: []
                    });
                }

                const dist = product.distributors.get(distKey);
                dist.orders.push({
                    orderId: order.id,
                    restaurant: order.restaurantName,
                    quantity: item.quantity
                });
            });
        });

        return zoneMap;
    }

    /**
     * Get route priority for distributor
     */
    getRoutePriority(distributorInitial) {
        const distributor = this.distributors.find(d =>
            d.initial.toUpperCase() === distributorInitial.toUpperCase()
        );
        return distributor ? distributor.routePriority : 999;
    }

    /**
     * Aggregate items by zone and distributor (group by distributor first)
     */
    aggregateByZoneAndDistributor(orders) {
        const zoneMap = new Map();

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isMapped) return;

                const zone = item.zone;

                if (!zoneMap.has(zone)) {
                    zoneMap.set(zone, new Map());
                }

                const distributorMap = zoneMap.get(zone);
                const distKey = order.distributorName || order.distributorInitial;

                if (!distributorMap.has(distKey)) {
                    distributorMap.set(distKey, {
                        distributor: distKey,
                        distributorInitial: order.distributorInitial,
                        routePriority: this.getRoutePriority(order.distributorInitial),
                        products: new Map()
                    });
                }

                const dist = distributorMap.get(distKey);
                const productKey = item.productSKU;

                if (!dist.products.has(productKey)) {
                    dist.products.set(productKey, {
                        sku: item.productSKU,
                        name: item.productName,
                        zone: zone,
                        kgPerBox: item.kgPerBox,
                        orders: []
                    });
                }

                const product = dist.products.get(productKey);
                product.orders.push({
                    orderId: order.id,
                    restaurant: order.restaurantName,
                    quantity: item.quantity
                });
            });
        });

        return zoneMap;
    }

    /**
     * Sort zones by picking priority
     */
    sortZones(zoneMap) {
        const zones = [];

        if (this.groupBy === 'distributor') {
            return this.sortZonesByDistributor(zoneMap);
        }

        Array.from(zoneMap.entries()).forEach(([zoneId, productMap]) => {
            const zone = this.zones[zoneId] || {
                id: zoneId,
                name: zoneId,
                pickingPriority: 999,
                color: '#666'
            };

            // Convert products map to array and sort by name
            const products = Array.from(productMap.values()).map(product => {
                // Convert distributors map to array and sort by route priority
                const distributorsList = Array.from(product.distributors.values())
                    .sort((a, b) => a.routePriority - b.routePriority);

                // Calculate totals
                const totalQuantity = distributorsList.reduce(
                    (sum, dist) => sum + dist.orders.reduce((s, o) => s + o.quantity, 0),
                    0
                );

                const totalKg = totalQuantity * product.kgPerBox;

                return {
                    ...product,
                    distributors: distributorsList,
                    totalQuantity: totalQuantity,
                    totalKg: totalKg
                };
            }).sort((a, b) => a.name.localeCompare(b.name));

            // Calculate zone totals
            const zoneTotalBoxes = products.reduce((sum, p) => sum + p.totalQuantity, 0);
            const zoneTotalKg = products.reduce((sum, p) => sum + p.totalKg, 0);

            zones.push({
                zone: zone,
                products: products,
                totalBoxes: zoneTotalBoxes,
                totalKg: zoneTotalKg
            });
        });

        // Sort zones by picking priority
        return zones.sort((a, b) => a.zone.pickingPriority - b.zone.pickingPriority);
    }

    /**
     * Sort zones by distributor (for distributor-first grouping)
     */
    sortZonesByDistributor(zoneMap) {
        const zones = [];

        Array.from(zoneMap.entries()).forEach(([zoneId, distributorMap]) => {
            const zone = this.zones[zoneId] || {
                id: zoneId,
                name: zoneId,
                pickingPriority: 999,
                color: '#666'
            };

            // Convert distributors map to array and sort by route priority
            const distributors = Array.from(distributorMap.values()).map(dist => {
                // Convert products map to array and sort by name
                const productsList = Array.from(dist.products.values()).map(product => {
                    // Calculate totals for this product
                    const totalQuantity = product.orders.reduce((sum, o) => sum + o.quantity, 0);
                    const totalKg = totalQuantity * product.kgPerBox;

                    return {
                        ...product,
                        totalQuantity: totalQuantity,
                        totalKg: totalKg
                    };
                }).sort((a, b) => a.name.localeCompare(b.name));

                // Calculate distributor totals
                const distTotalBoxes = productsList.reduce((sum, p) => sum + p.totalQuantity, 0);
                const distTotalKg = productsList.reduce((sum, p) => sum + p.totalKg, 0);

                return {
                    distributor: dist.distributor,
                    distributorInitial: dist.distributorInitial,
                    routePriority: dist.routePriority,
                    products: productsList,
                    totalBoxes: distTotalBoxes,
                    totalKg: distTotalKg
                };
            }).sort((a, b) => a.routePriority - b.routePriority);

            // Calculate zone totals
            const zoneTotalBoxes = distributors.reduce((sum, d) => sum + d.totalBoxes, 0);
            const zoneTotalKg = distributors.reduce((sum, d) => sum + d.totalKg, 0);

            zones.push({
                zone: zone,
                distributors: distributors,
                totalBoxes: zoneTotalBoxes,
                totalKg: zoneTotalKg
            });
        });

        // Sort zones by picking priority
        return zones.sort((a, b) => a.zone.pickingPriority - b.zone.pickingPriority);
    }

    /**
     * Calculate summary statistics
     */
    calculateSummary(orders) {
        const summary = {
            totalOrders: orders.length,
            totalItems: 0,
            totalBoxes: 0,
            totalKg: 0,
            distributors: new Set(),
            restaurants: new Set()
        };

        orders.forEach(order => {
            summary.totalItems += order.items.length;
            summary.totalBoxes += order.totalBoxes;
            summary.totalKg += order.totalKg;
            summary.distributors.add(order.distributorName || order.distributorInitial);
            summary.restaurants.add(order.restaurantName);
        });

        summary.distributors = Array.from(summary.distributors);
        summary.restaurants = Array.from(summary.restaurants);

        return summary;
    }

    /**
     * Generate printable picking list (HTML)
     */
    generatePrintableHTML(pickingList) {
        const groupedBy = pickingList.groupBy || 'product';

        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lista de Picking - ${new Date().toLocaleDateString('pt-PT')}</title>
    <style>
        @page { margin: 1cm; }
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        .summary {
            background: #f0f0f0;
            padding: 10px;
            margin-bottom: 20px;
        }
        .zone-section {
            page-break-inside: avoid;
            margin-bottom: 30px;
        }
        .zone-header {
            padding: 10px;
            color: white;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th {
            background: #333;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 11pt;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ccc;
            font-size: 10pt;
        }
        .quantity {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
        }
        .subtotal-row {
            background: #e0f2fe;
            font-weight: bold;
        }
        .total-row {
            background: #f1f5f9;
            font-weight: bold;
            font-size: 11pt;
        }
    </style>
</head>
<body>
    <h1>📋 LISTA DE PICKING - ${groupedBy === 'distributor' ? 'POR MOTORISTA' : 'POR PRODUTO'}</h1>
    <div class="summary">
        <strong>Data:</strong> ${new Date().toLocaleDateString('pt-PT')}<br>
        <strong>Total Pedidos:</strong> ${pickingList.summary.totalOrders} |
        <strong>Total Caixas:</strong> ${pickingList.summary.totalBoxes} |
        <strong>Total Kg:</strong> ${pickingList.summary.totalKg.toFixed(1)}
    </div>
`;

        if (groupedBy === 'distributor') {
            // Print by distributor
            pickingList.zones.forEach(zoneData => {
                html += `
    <div class="zone-section">
        <div class="zone-header" style="background-color: ${zoneData.zone.color};">
            ${zoneData.zone.name} - ${zoneData.totalBoxes} caixas
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Motorista</th>
                    <th style="width: 30%;">Produto</th>
                    <th style="width: 30%;">Restaurante</th>
                    <th style="width: 10%;">Qtd</th>
                    <th style="width: 10%;">Kg</th>
                </tr>
            </thead>
            <tbody>
`;

                zoneData.distributors.forEach(dist => {
                    const distRowSpan = dist.products.reduce((sum, p) => sum + p.orders.length + 1, 0); // +1 for subtotal rows

                    dist.products.forEach((product, productIndex) => {
                        product.orders.forEach((order, orderIndex) => {
                            const isFirstRowOfDist = productIndex === 0 && orderIndex === 0;
                            const totalKg = (order.quantity * product.kgPerBox).toFixed(1);

                            html += `
                <tr>
                    ${isFirstRowOfDist ? `<td rowspan="${distRowSpan}" style="font-weight: bold; vertical-align: top; padding-top: 12px;">${dist.distributor}</td>` : ''}
                    <td>${product.name}</td>
                    <td>${order.restaurant}</td>
                    <td class="quantity">${order.quantity}</td>
                    <td style="text-align: center;">${totalKg}</td>
                </tr>
`;
                        });

                        // Subtotal row for product
                        const productTotalQty = product.orders.reduce((sum, o) => sum + o.quantity, 0);
                        const productTotalKg = (productTotalQty * product.kgPerBox).toFixed(1);

                        html += `
                <tr class="subtotal-row">
                    <td colspan="2" style="text-align: right; padding-right: 10px;">Subtotal ${product.name}:</td>
                    <td class="quantity">${productTotalQty}</td>
                    <td style="text-align: center;">${productTotalKg}</td>
                </tr>
`;
                    });

                    // Total row for distributor
                    html += `
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-right: 10px;">TOTAL ${dist.distributor}:</td>
                    <td class="quantity">${dist.totalBoxes}</td>
                    <td style="text-align: center;">${dist.totalKg.toFixed(1)}</td>
                </tr>
`;
                });

                html += `
            </tbody>
        </table>
    </div>
`;
            });
        } else {
            // Print by product (original mode)
            pickingList.zones.forEach(zoneData => {
                html += `
    <div class="zone-section">
        <div class="zone-header" style="background-color: ${zoneData.zone.color};">
            ${zoneData.zone.name} - ${zoneData.totalBoxes} caixas
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Produto</th>
                    <th style="width: 20%;">Distribuidor</th>
                    <th style="width: 35%;">Restaurante</th>
                    <th style="width: 15%;">Quantidade</th>
                </tr>
            </thead>
            <tbody>
`;

                zoneData.products.forEach(product => {
                    product.distributors.forEach((dist, distIndex) => {
                        dist.orders.forEach((order, orderIndex) => {
                            const isFirstRow = distIndex === 0 && orderIndex === 0;
                            html += `
                <tr>
                    ${isFirstRow ? `<td rowspan="${this.countTotalOrders(product)}" style="font-weight: bold;">${product.name}</td>` : ''}
                    <td><strong>${dist.distributor}</strong></td>
                    <td>${order.restaurant}</td>
                    <td class="quantity">${order.quantity}</td>
                </tr>
`;
                        });
                    });

                    // Total row for product
                    html += `
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-right: 10px;">TOTAL ${product.name}:</td>
                    <td class="quantity">${product.totalQuantity}</td>
                </tr>
`;
                });

                html += `
            </tbody>
        </table>
    </div>
`;
            });
        }

        html += `
</body>
</html>
`;

        return html;
    }

    /**
     * Count total orders for a product
     */
    countTotalOrders(product) {
        return product.distributors.reduce(
            (sum, dist) => sum + dist.orders.length,
            0
        );
    }
}
