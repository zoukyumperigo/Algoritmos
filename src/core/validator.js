/**
 * Order Validator
 * Validates orders for stock, duplicates, and anomalies
 * ZERO TOLERANCE FOR WAREHOUSE ERRORS
 */

class OrderValidator {
    constructor(config = {}) {
        // Use constants for configuration with fallbacks for testing
        const constants = window.APP_CONSTANTS || {
            MAX_QUANTITY_THRESHOLD: 300,
            DUPLICATE_CHECK_WINDOW_MS: 24 * 60 * 60 * 1000,
            MIN_ORDER_QUANTITY: 1,
            MAX_ORDER_QUANTITY: 10000,
            MAX_TOTAL_BOXES_WARNING: 600
        };

        this.config = {
            maxQuantityThreshold: config.maxQuantityThreshold || constants.MAX_QUANTITY_THRESHOLD,
            duplicateCheckWindow: config.duplicateCheckWindow || constants.DUPLICATE_CHECK_WINDOW_MS,
            minQuantity: config.minQuantity || constants.MIN_ORDER_QUANTITY,
            maxQuantity: config.maxQuantity || constants.MAX_ORDER_QUANTITY,
            maxTotalBoxes: config.maxTotalBoxes || constants.MAX_TOTAL_BOXES_WARNING,
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
     * NOTE: Stock issues are now WARNINGS only, not blocking errors
     * Orders can be collected even without stock
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
                    order.addWarning(
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
     * ENHANCED: Added maximum quantity limit and better validation
     */
    validateQuantities(order) {
        order.items.forEach(item => {
            // Check if quantity is a valid number
            if (!Number.isFinite(item.quantity)) {
                order.addError(
                    `Quantidade inválida: ${item.productName} - valor não numérico`
                );
                return;
            }

            // Check minimum
            if (item.quantity < this.config.minQuantity) {
                order.addError(
                    `Quantidade inválida: ${item.productName} - ${item.quantity} caixas (mínimo: ${this.config.minQuantity})`
                );
            }

            // Check absolute maximum (security limit)
            if (item.quantity > this.config.maxQuantity) {
                order.addError(
                    `❌ QUANTIDADE EXCEDE MÁXIMO: ${item.productName} - ${item.quantity} caixas (máximo: ${this.config.maxQuantity})`
                );
            }

            // Check warning threshold (abnormally high but not blocking)
            if (item.quantity > this.config.maxQuantityThreshold && item.quantity <= this.config.maxQuantity) {
                order.addWarning(
                    `⚠️ QUANTIDADE ANORMALMENTE ALTA: ${item.productName} - ${item.quantity} caixas (> ${this.config.maxQuantityThreshold})`
                );
            }
        });

        // Check total boxes with new config value
        if (order.totalBoxes > this.config.maxTotalBoxes) {
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
     * OPTIMIZED: O(n) instead of O(n²) - uses Map for efficient lookups
     */
    validateCrossOrders(orders) {
        // Aggregate demand by product - O(n) single pass
        const demandByProduct = new Map();
        const orderMap = new Map(); // For efficient order lookups

        // First pass: Build demand map and order index - O(n)
        orders.forEach(order => {
            orderMap.set(order.id, order);

            order.items.forEach(item => {
                if (!item.isMapped) return;

                const sku = item.productSKU;
                const current = demandByProduct.get(sku) || {
                    productName: item.productName,
                    totalDemand: 0,
                    stockAvailable: item.stockAvailable,
                    orderIds: []  // Store IDs instead of full objects
                };

                current.totalDemand += item.quantity;
                current.orderIds.push(order.id);

                demandByProduct.set(sku, current);
            });
        });

        // Second pass: Check stock and add warnings - O(m) where m = unique products
        demandByProduct.forEach((demand, sku) => {
            if (demand.totalDemand > demand.stockAvailable) {
                const shortage = demand.totalDemand - demand.stockAvailable;
                const warningMessage = `⚠️ STOCK TOTAL INSUFICIENTE: ${demand.productName} - Total pedido: ${demand.totalDemand}, Stock: ${demand.stockAvailable}, Falta: ${shortage} caixas`;

                // Add warning to each affected order - O(k) where k = orders for this product
                demand.orderIds.forEach(orderId => {
                    const order = orderMap.get(orderId);
                    if (order && !order.warnings.some(w => w.includes(demand.productName))) {
                        order.addWarning(warningMessage);
                    }
                });
            }
        });

        // Total complexity: O(n) + O(m*k) where k is typically small
        // Much better than original O(n²)
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
