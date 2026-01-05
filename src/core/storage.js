/**
 * Storage Service
 * Manages LocalStorage persistence for all warehouse data
 */

class StorageService {
    constructor() {
        this.keys = {
            PRODUCTS: 'warehouse_products',
            DISTRIBUTORS: 'warehouse_distributors',
            SALES_REPS: 'warehouse_salesreps',
            ZONES: 'warehouse_zones',
            ORDERS: 'warehouse_orders',
            SETTINGS: 'warehouse_settings'
        };
    }

    /**
     * Save data to localStorage
     */
    save(key, data) {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(key, json);
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     */
    load(key, defaultValue = null) {
        try {
            const json = localStorage.getItem(key);
            if (json === null) return defaultValue;
            return JSON.parse(json);
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }

    /**
     * Delete data from localStorage
     */
    delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage delete error:', error);
            return false;
        }
    }

    /**
     * Clear all warehouse data
     */
    clearAll() {
        Object.values(this.keys).forEach(key => {
            this.delete(key);
        });
    }

    // ===== PRODUCTS =====

    saveProducts(products) {
        const data = products.map(p => p.toJSON ? p.toJSON() : p);
        return this.save(this.keys.PRODUCTS, data);
    }

    loadProducts() {
        const data = this.load(this.keys.PRODUCTS, []);
        return data.map(p => Product.fromJSON(p));
    }

    // ===== DISTRIBUTORS =====

    saveDistributors(distributors) {
        const data = distributors.map(d => d.toJSON ? d.toJSON() : d);
        return this.save(this.keys.DISTRIBUTORS, data);
    }

    loadDistributors() {
        const data = this.load(this.keys.DISTRIBUTORS, []);
        return data.map(d => Distributor.fromJSON(d));
    }

    // ===== SALES REPS =====

    saveSalesReps(salesReps) {
        const data = salesReps.map(s => s.toJSON ? s.toJSON() : s);
        return this.save(this.keys.SALES_REPS, data);
    }

    loadSalesReps() {
        const data = this.load(this.keys.SALES_REPS, []);
        return data.map(s => SalesRep.fromJSON(s));
    }

    // ===== ZONES =====

    saveZones(zones) {
        const data = Object.values(zones).map(z => z.toJSON ? z.toJSON() : z);
        return this.save(this.keys.ZONES, data);
    }

    loadZones() {
        const data = this.load(this.keys.ZONES, Object.values(DEFAULT_ZONES).map(z => z.toJSON()));
        const zonesArray = data.map(z => Zone.fromJSON(z));

        // Convert to object keyed by ID
        const zonesObj = {};
        zonesArray.forEach(zone => {
            zonesObj[zone.id] = zone;
        });

        return zonesObj;
    }

    // ===== ORDERS =====

    saveOrders(orders) {
        const data = orders.map(o => o.toJSON ? o.toJSON() : o);
        return this.save(this.keys.ORDERS, data);
    }

    loadOrders() {
        const data = this.load(this.keys.ORDERS, []);
        return data.map(o => Order.fromJSON(o));
    }

    addOrder(order) {
        const orders = this.loadOrders();
        orders.push(order);
        return this.saveOrders(orders);
    }

    addOrders(newOrders) {
        const orders = this.loadOrders();
        orders.push(...newOrders);
        return this.saveOrders(orders);
    }

    updateOrder(orderId, updates) {
        const orders = this.loadOrders();
        const index = orders.findIndex(o => o.id === orderId);

        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            return this.saveOrders(orders);
        }

        return false;
    }

    deleteOrder(orderId) {
        const orders = this.loadOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        return this.saveOrders(filtered);
    }

    // ===== SETTINGS =====

    saveSettings(settings) {
        return this.save(this.keys.SETTINGS, settings);
    }

    loadSettings() {
        return this.load(this.keys.SETTINGS, {
            currentSalesRep: null,
            maxQuantityThreshold: 300,
            lowStockThreshold: 100,
            theme: 'light'
        });
    }

    // ===== STOCK MANAGEMENT =====

    updateProductStock(sku, newStock) {
        const products = this.loadProducts();
        const product = products.find(p => p.sku === sku);

        if (product) {
            product.currentStock = newStock;
            return this.saveProducts(products);
        }

        return false;
    }

    reduceStock(orderItems) {
        const products = this.loadProducts();
        let updated = false;

        orderItems.forEach(item => {
            if (item.isMapped) {
                const product = products.find(p => p.sku === item.productSKU);
                if (product) {
                    product.reduceStock(item.quantity);
                    updated = true;
                }
            }
        });

        if (updated) {
            return this.saveProducts(products);
        }

        return false;
    }

    // ===== UTILITIES =====

    exportData() {
        return {
            products: this.loadProducts(),
            distributors: this.loadDistributors(),
            salesReps: this.loadSalesReps(),
            zones: this.loadZones(),
            orders: this.loadOrders(),
            settings: this.loadSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.products) this.saveProducts(data.products);
        if (data.distributors) this.saveDistributors(data.distributors);
        if (data.salesReps) this.saveSalesReps(data.salesReps);
        if (data.zones) this.saveZones(data.zones);
        if (data.orders) this.saveOrders(data.orders);
        if (data.settings) this.saveSettings(data.settings);
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }
}
