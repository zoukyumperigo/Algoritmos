/**
 * Analytics Service
 * Provides historical analysis and purchase forecasting
 */

class AnalyticsService {
    constructor() {
        this.WEEKS_FOR_FORECAST = 4;
    }

    /**
     * Generate purchase forecast based on recent history
     */
    generatePurchaseForecast(orders, products) {
        const cutoffDate = this.getDateWeeksAgo(this.WEEKS_FOR_FORECAST);
        const recentOrders = orders.filter(order =>
            new Date(order.timestamp) >= cutoffDate
        );

        if (recentOrders.length === 0) {
            return {
                period: `Últimas ${this.WEEKS_FOR_FORECAST} semanas`,
                noData: true,
                products: []
            };
        }

        // Aggregate demand by product
        const demandMap = new Map();

        recentOrders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isMapped) return;

                const sku = item.productSKU;

                if (!demandMap.has(sku)) {
                    demandMap.set(sku, {
                        sku: sku,
                        name: item.productName,
                        zone: item.zone,
                        totalOrdered: 0,
                        orderCount: 0,
                        avgPerOrder: 0,
                        weeklyAvg: 0,
                        currentStock: 0,
                        kgPerBox: item.kgPerBox
                    });
                }

                const demand = demandMap.get(sku);
                demand.totalOrdered += item.quantity;
                demand.orderCount += 1;
            });
        });

        // Calculate averages and recommendations
        const forecastProducts = [];

        demandMap.forEach((demand, sku) => {
            const product = products.find(p => p.sku === sku);

            demand.avgPerOrder = demand.totalOrdered / demand.orderCount;
            demand.weeklyAvg = demand.totalOrdered / this.WEEKS_FOR_FORECAST;
            demand.currentStock = product ? product.currentStock : 0;

            // Calculate weeks of stock remaining
            demand.weeksRemaining = demand.weeklyAvg > 0
                ? demand.currentStock / demand.weeklyAvg
                : 999;

            // Calculate recommended order quantity (4 weeks worth)
            demand.recommendedOrder = Math.ceil(demand.weeklyAvg * 4 - demand.currentStock);
            demand.recommendedOrder = Math.max(0, demand.recommendedOrder);

            // Determine urgency
            if (demand.weeksRemaining < 1) {
                demand.urgency = 'CRÍTICO';
                demand.urgencyLevel = 3;
            } else if (demand.weeksRemaining < 2) {
                demand.urgency = 'URGENTE';
                demand.urgencyLevel = 2;
            } else if (demand.weeksRemaining < 4) {
                demand.urgency = 'ATENÇÃO';
                demand.urgencyLevel = 1;
            } else {
                demand.urgency = 'OK';
                demand.urgencyLevel = 0;
            }

            forecastProducts.push(demand);
        });

        // Sort by urgency, then by weekly average (most demanded first)
        forecastProducts.sort((a, b) => {
            if (b.urgencyLevel !== a.urgencyLevel) {
                return b.urgencyLevel - a.urgencyLevel;
            }
            return b.weeklyAvg - a.weeklyAvg;
        });

        return {
            period: `Últimas ${this.WEEKS_FOR_FORECAST} semanas`,
            startDate: cutoffDate.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            totalOrders: recentOrders.length,
            products: forecastProducts
        };
    }

    /**
     * Get order history with filters
     */
    getOrderHistory(orders, filters = {}) {
        let filtered = [...orders];

        // Filter by date range
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            filtered = filtered.filter(order => new Date(order.timestamp) >= from);
        }

        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => new Date(order.timestamp) <= to);
        }

        // Filter by restaurant
        if (filters.restaurant) {
            filtered = filtered.filter(order =>
                order.restaurantName.toLowerCase().includes(filters.restaurant.toLowerCase())
            );
        }

        // Filter by distributor
        if (filters.distributor) {
            filtered = filtered.filter(order =>
                order.distributorName === filters.distributor ||
                order.distributorInitial === filters.distributor
            );
        }

        // Filter by sales rep
        if (filters.salesRep) {
            filtered = filtered.filter(order =>
                order.salesRep === filters.salesRep
            );
        }

        // Filter by product
        if (filters.product) {
            filtered = filtered.filter(order =>
                order.items.some(item =>
                    item.productName.toLowerCase().includes(filters.product.toLowerCase()) ||
                    item.productSKU.toLowerCase().includes(filters.product.toLowerCase())
                )
            );
        }

        // Sort by date (most recent first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return filtered;
    }

    /**
     * Get sales statistics by restaurant
     */
    getRestaurantStats(orders, restaurantName) {
        const restaurantOrders = orders.filter(order =>
            order.restaurantName === restaurantName
        );

        if (restaurantOrders.length === 0) {
            return null;
        }

        const stats = {
            restaurant: restaurantName,
            totalOrders: restaurantOrders.length,
            totalBoxes: 0,
            totalKg: 0,
            firstOrder: null,
            lastOrder: null,
            avgBoxesPerOrder: 0,
            topProducts: []
        };

        // Aggregate product data
        const productMap = new Map();

        restaurantOrders.forEach(order => {
            stats.totalBoxes += order.totalBoxes;
            stats.totalKg += order.totalKg;

            order.items.forEach(item => {
                if (!item.isMapped) return;

                if (!productMap.has(item.productSKU)) {
                    productMap.set(item.productSKU, {
                        name: item.productName,
                        totalQuantity: 0,
                        orderCount: 0
                    });
                }

                const product = productMap.get(item.productSKU);
                product.totalQuantity += item.quantity;
                product.orderCount += 1;
            });
        });

        // Calculate averages
        stats.avgBoxesPerOrder = stats.totalBoxes / stats.totalOrders;

        // Find first and last orders
        const sortedByDate = [...restaurantOrders].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        stats.firstOrder = sortedByDate[0].timestamp;
        stats.lastOrder = sortedByDate[sortedByDate.length - 1].timestamp;

        // Top products
        stats.topProducts = Array.from(productMap.entries())
            .map(([sku, data]) => ({
                sku: sku,
                name: data.name,
                totalQuantity: data.totalQuantity,
                orderCount: data.orderCount,
                avgPerOrder: data.totalQuantity / data.orderCount
            }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10);

        return stats;
    }

    /**
     * Get sales statistics by product
     */
    getProductStats(orders, productSKU) {
        const productOrders = [];

        orders.forEach(order => {
            const matchingItems = order.items.filter(item => item.productSKU === productSKU);
            if (matchingItems.length > 0) {
                productOrders.push({
                    order: order,
                    items: matchingItems
                });
            }
        });

        if (productOrders.length === 0) {
            return null;
        }

        const stats = {
            productSKU: productSKU,
            productName: productOrders[0].items[0].productName,
            totalOrders: productOrders.length,
            totalQuantity: 0,
            avgPerOrder: 0,
            topCustomers: []
        };

        // Aggregate customer data
        const customerMap = new Map();

        productOrders.forEach(({ order, items }) => {
            const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
            stats.totalQuantity += quantity;

            const restaurant = order.restaurantName;
            if (!customerMap.has(restaurant)) {
                customerMap.set(restaurant, {
                    restaurant: restaurant,
                    totalQuantity: 0,
                    orderCount: 0
                });
            }

            const customer = customerMap.get(restaurant);
            customer.totalQuantity += quantity;
            customer.orderCount += 1;
        });

        stats.avgPerOrder = stats.totalQuantity / stats.totalOrders;

        // Top customers
        stats.topCustomers = Array.from(customerMap.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10);

        return stats;
    }

    /**
     * Get date X weeks ago
     */
    getDateWeeksAgo(weeks) {
        const date = new Date();
        date.setDate(date.getDate() - (weeks * 7));
        return date;
    }

    /**
     * Export orders to CSV
     */
    exportToCSV(orders) {
        const headers = [
            'Data',
            'Pedido ID',
            'Distribuidor',
            'Restaurante',
            'Vendedor',
            'Produto',
            'Quantidade',
            'Kg',
            'Status'
        ];

        const rows = [headers.join(',')];

        orders.forEach(order => {
            order.items.forEach(item => {
                const row = [
                    new Date(order.timestamp).toLocaleDateString('pt-PT'),
                    order.id,
                    order.distributorName || order.distributorInitial,
                    order.restaurantName,
                    order.salesRep || '',
                    item.productName,
                    item.quantity,
                    item.getTotalKg().toFixed(1),
                    order.status
                ];

                rows.push(row.map(cell => `"${cell}"`).join(','));
            });
        });

        return rows.join('\n');
    }
}
