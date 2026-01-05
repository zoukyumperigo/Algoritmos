/**
 * Order Validator
 * Validates orders for stock, duplicates, and anomalies
 * ZERO TOLERANCE FOR WAREHOUSE ERRORS
 */

class OrderValidator {
    constructor(config = {}) {
        this.config = {
            maxQuantityThreshold: config.maxQuantityThreshold || 300,
            duplicateCheckWindow: config.duplicateCheckWindow || 24 * 60 * 60 * 1000, // 24 hours
            minQuantity: config.minQuantity || 1,
            ...config
        };
    }

    /**
     * Validate a single order
     */
    validateOrder(order, existingOrders = []) {
        // Check stock for each item
        this.validateStock(order);

        // Check for abnormal quantities
        this.validateQuantities(order);

        // Check for duplicates
        this.validateDuplicates(order, existingOrders);

        // Check for unknown products
        this.validateProducts(order);

        return order;
    }

    /**
     * Validate multiple orders
     */
    validateOrders(orders, existingOrders = []) {
        // First pass: individual validation
        orders.forEach(order => this.validateOrder(order, existingOrders));

        // Second pass: cross-order validation
        this.validateCrossOrders(orders);

        return orders;
    }

    /**
     * Validate stock availability
     */
    validateStock(order) {
        order.items.forEach(item => {
            if (!item.isMapped) {
                // Already flagged as error in normalizer
                return;
            }

            const shortage = item.getStockShortage();

            if (shortage > 0) {
                if (item.stockAvailable === 0) {
                    order.addError(
                        `⚠️ STOCK ESGOTADO: ${item.productName} - Pedido: ${item.quantity}, Stock: 0`
                    );
                } else {
                    order.addWarning(
                        `⚠️ STOCK INSUFICIENTE: ${item.productName} - Pedido: ${item.quantity}, Disponível: ${item.stockAvailable}, Faltam: ${shortage} caixas`
                    );
                }
            }
        });
    }

    /**
     * Validate quantities for abnormal values
     */
    validateQuantities(order) {
        order.items.forEach(item => {
            // Check minimum
            if (item.quantity < this.config.minQuantity) {
                order.addError(
                    `Quantidade inválida: ${item.productName} - ${item.quantity} caixas (mínimo: ${this.config.minQuantity})`
                );
            }

            // Check maximum (abnormally high)
            if (item.quantity > this.config.maxQuantityThreshold) {
                order.addWarning(
                    `⚠️ QUANTIDADE ANORMALMENTE ALTA: ${item.productName} - ${item.quantity} caixas (> ${this.config.maxQuantityThreshold})`
                );
            }
        });

        // Check total boxes
        if (order.totalBoxes > this.config.maxQuantityThreshold * 2) {
            order.addWarning(
                `⚠️ TOTAL DE CAIXAS MUITO ALTO: ${order.totalBoxes} caixas no pedido`
            );
        }
    }

    /**
     * Validate for duplicate orders
     */
    validateDuplicates(order, existingOrders) {
        const recentOrders = existingOrders.filter(existing => {
            const timeDiff = new Date(order.timestamp) - new Date(existing.timestamp);
            return Math.abs(timeDiff) < this.config.duplicateCheckWindow;
        });

        recentOrders.forEach(existing => {
            // Check if same restaurant and similar items
            if (existing.restaurantName.toLowerCase() === order.restaurantName.toLowerCase()) {
                // Check if items overlap
                const hasOverlap = order.items.some(item =>
                    existing.items.some(existingItem =>
                        existingItem.productSKU === item.productSKU &&
                        existingItem.quantity === item.quantity
                    )
                );

                if (hasOverlap) {
                    order.addWarning(
                        `⚠️ POSSÍVEL DUPLICADO: Pedido similar para ${order.restaurantName} nas últimas 24h`
                    );
                }
            }
        });
    }

    /**
     * Validate products are mapped
     */
    validateProducts(order) {
        const unmappedItems = order.items.filter(item => !item.isMapped);

        if (unmappedItems.length > 0) {
            unmappedItems.forEach(item => {
                order.addError(
                    `❌ PRODUTO NÃO RECONHECIDO: "${item.productCode}" - Verificar catálogo`
                );
            });
        }
    }

    /**
     * Cross-validate multiple orders (check total demand vs stock)
     */
    validateCrossOrders(orders) {
        // Aggregate demand by product
        const demandByProduct = new Map();

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isMapped) return;

                const sku = item.productSKU;
                const current = demandByProduct.get(sku) || {
                    productName: item.productName,
                    totalDemand: 0,
                    stockAvailable: item.stockAvailable,
                    orders: []
                };

                current.totalDemand += item.quantity;
                current.orders.push({
                    orderId: order.id,
                    restaurant: order.restaurantName,
                    quantity: item.quantity
                });

                demandByProduct.set(sku, current);
            });
        });

        // Check if total demand exceeds stock
        demandByProduct.forEach((demand, sku) => {
            if (demand.totalDemand > demand.stockAvailable) {
                const shortage = demand.totalDemand - demand.stockAvailable;

                // Add warning to all affected orders
                demand.orders.forEach(orderInfo => {
                    const order = orders.find(o => o.id === orderInfo.orderId);
                    if (order && !order.warnings.some(w => w.includes(demand.productName))) {
                        order.addWarning(
                            `⚠️ STOCK TOTAL INSUFICIENTE: ${demand.productName} - Total pedido: ${demand.totalDemand}, Stock: ${demand.stockAvailable}, Falta: ${shortage} caixas`
                        );
                    }
                });
            }
        });
    }

    /**
     * Get validation summary for multiple orders
     */
    getValidationSummary(orders) {
        const summary = {
            totalOrders: orders.length,
            validOrders: 0,
            ordersWithErrors: 0,
            ordersWithWarnings: 0,
            totalErrors: 0,
            totalWarnings: 0,
            unmappedProducts: new Set(),
            stockIssues: []
        };

        orders.forEach(order => {
            if (order.hasErrors()) {
                summary.ordersWithErrors++;
                summary.totalErrors += order.errors.length;
            }

            if (order.hasWarnings()) {
                summary.ordersWithWarnings++;
                summary.totalWarnings += order.warnings.length;
            }

            if (!order.hasErrors()) {
                summary.validOrders++;
            }

            // Collect unmapped products
            order.items.forEach(item => {
                if (!item.isMapped) {
                    summary.unmappedProducts.add(item.productCode);
                }
            });

            // Collect stock issues
            order.items.forEach(item => {
                if (item.isMapped && !item.hasSufficientStock()) {
                    summary.stockIssues.push({
                        product: item.productName,
                        requested: item.quantity,
                        available: item.stockAvailable,
                        shortage: item.getStockShortage()
                    });
                }
            });
        });

        summary.unmappedProducts = Array.from(summary.unmappedProducts);

        return summary;
    }
}
