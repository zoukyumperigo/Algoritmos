/**
 * IndexedDB Storage Service
 * Simple database for warehouse management
 * Replaces localStorage with much better performance and capacity
 */

class IndexedDBService {
    constructor() {
        this.dbName = 'WarehouseDB';
        this.version = 1;
        this.db = null;

        this.stores = {
            PRODUCTS: 'products',
            DISTRIBUTORS: 'distributors',
            SALES_REPS: 'salesreps',
            ZONES: 'zones',
            ORDERS: 'orders',
            SETTINGS: 'settings',
            CUSTOMERS: 'customers'
        };
    }

    /**
     * Initialize database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                Object.values(this.stores).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    }
                });
            };
        });
    }

    /**
     * Save data to IndexedDB
     */
    async save(storeName, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            // Clear existing data and save new
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // Save as single record with id: 'data'
                const saveRequest = store.put({ id: 'data', content: data });
                saveRequest.onsuccess = () => resolve(true);
                saveRequest.onerror = () => reject(saveRequest.error);
            };

            clearRequest.onerror = () => reject(clearRequest.error);
        });
    }

    /**
     * Load data from IndexedDB
     */
    async load(storeName, defaultValue = null) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get('data');

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.content : defaultValue);
            };

            request.onerror = () => resolve(defaultValue);
        });
    }

    /**
     * Delete data from IndexedDB
     */
    async delete(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all warehouse data
     */
    async clearAll() {
        const promises = Object.values(this.stores).map(store => this.delete(store));
        return Promise.all(promises);
    }

    /**
     * Migrate data from localStorage to IndexedDB
     */
    async migrateFromLocalStorage() {
        console.log('🔄 Migrating data from localStorage to IndexedDB...');

        const oldKeys = {
            PRODUCTS: 'warehouse_products',
            DISTRIBUTORS: 'warehouse_distributors',
            SALES_REPS: 'warehouse_salesreps',
            ZONES: 'warehouse_zones',
            ORDERS: 'warehouse_orders',
            SETTINGS: 'warehouse_settings',
            CUSTOMERS: 'wms_customers'
        };

        let migrated = 0;

        for (const [key, localStorageKey] of Object.entries(oldKeys)) {
            try {
                const data = localStorage.getItem(localStorageKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    await this.save(this.stores[key], parsed);
                    migrated++;
                    console.log(`✅ Migrated ${key}`);
                }
            } catch (error) {
                console.warn(`⚠️ Could not migrate ${key}:`, error);
            }
        }

        if (migrated > 0) {
            console.log(`✅ Migration complete! ${migrated} stores migrated to IndexedDB`);
            // Mark migration as complete
            localStorage.setItem('indexeddb_migrated', 'true');
        } else {
            console.log('ℹ️ No data to migrate');
        }

        return migrated;
    }

    /**
     * Check if migration is needed
     */
    needsMigration() {
        return !localStorage.getItem('indexeddb_migrated');
    }

    // ===== PRODUCTS =====

    async saveProducts(products) {
        const data = products.map(p => p.toJSON ? p.toJSON() : p);
        return this.save(this.stores.PRODUCTS, data);
    }

    async loadProducts() {
        const data = await this.load(this.stores.PRODUCTS, []);
        return data.map(p => Product.fromJSON(p));
    }

    // ===== DISTRIBUTORS =====

    async saveDistributors(distributors) {
        const data = distributors.map(d => d.toJSON ? d.toJSON() : d);
        return this.save(this.stores.DISTRIBUTORS, data);
    }

    async loadDistributors() {
        const data = await this.load(this.stores.DISTRIBUTORS, []);
        return data.map(d => Distributor.fromJSON(d));
    }

    // ===== SALES REPS =====

    async saveSalesReps(salesReps) {
        const data = salesReps.map(s => s.toJSON ? s.toJSON() : s);
        return this.save(this.stores.SALES_REPS, data);
    }

    async loadSalesReps() {
        const data = await this.load(this.stores.SALES_REPS, []);
        return data.map(s => SalesRep.fromJSON(s));
    }

    // ===== ZONES =====

    async saveZones(zones) {
        const data = Object.values(zones).map(z => z.toJSON ? z.toJSON() : z);
        return this.save(this.stores.ZONES, data);
    }

    async loadZones() {
        const data = await this.load(this.stores.ZONES, Object.values(DEFAULT_ZONES).map(z => z.toJSON()));
        const zonesArray = data.map(z => Zone.fromJSON(z));

        // Convert to object keyed by ID
        const zonesObj = {};
        zonesArray.forEach(zone => {
            zonesObj[zone.id] = zone;
        });

        return zonesObj;
    }

    // ===== ORDERS =====

    async saveOrders(orders) {
        const data = orders.map(o => o.toJSON ? o.toJSON() : o);
        return this.save(this.stores.ORDERS, data);
    }

    async loadOrders() {
        const data = await this.load(this.stores.ORDERS, []);
        return data.map(o => Order.fromJSON(o));
    }

    async addOrder(order) {
        const orders = await this.loadOrders();
        orders.push(order);
        return this.saveOrders(orders);
    }

    async addOrders(newOrders) {
        const orders = await this.loadOrders();
        orders.push(...newOrders);
        return this.saveOrders(orders);
    }

    async updateOrder(orderId, updates) {
        const orders = await this.loadOrders();
        const index = orders.findIndex(o => o.id === orderId);

        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            return this.saveOrders(orders);
        }

        return false;
    }

    async deleteOrder(orderId) {
        const orders = await this.loadOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        return this.saveOrders(filtered);
    }

    // ===== CUSTOMERS =====

    async saveCustomers(customers) {
        return this.save(this.stores.CUSTOMERS, customers);
    }

    async loadCustomers() {
        return this.load(this.stores.CUSTOMERS, []);
    }

    // ===== SETTINGS =====

    async saveSettings(settings) {
        return this.save(this.stores.SETTINGS, settings);
    }

    async loadSettings() {
        return this.load(this.stores.SETTINGS, {
            currentSalesRep: null,
            maxQuantityThreshold: 300,
            lowStockThreshold: 100,
            theme: 'light'
        });
    }

    // ===== STOCK MANAGEMENT =====

    async updateProductStock(sku, newStock) {
        const products = await this.loadProducts();
        const product = products.find(p => p.sku === sku);

        if (product) {
            product.currentStock = newStock;
            return this.saveProducts(products);
        }

        return false;
    }

    async reduceStock(orderItems) {
        const products = await this.loadProducts();
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

    async exportData() {
        return {
            products: await this.loadProducts(),
            distributors: await this.loadDistributors(),
            salesReps: await this.loadSalesReps(),
            zones: await this.loadZones(),
            orders: await this.loadOrders(),
            customers: await this.loadCustomers(),
            settings: await this.loadSettings(),
            exportDate: new Date().toISOString()
        };
    }

    async importData(data) {
        if (data.products) await this.saveProducts(data.products);
        if (data.distributors) await this.saveDistributors(data.distributors);
        if (data.salesReps) await this.saveSalesReps(data.salesReps);
        if (data.zones) await this.saveZones(data.zones);
        if (data.orders) await this.saveOrders(data.orders);
        if (data.customers) await this.saveCustomers(data.customers);
        if (data.settings) await this.saveSettings(data.settings);
    }

    async getStorageSize() {
        if (!this.db) await this.init();

        // IndexedDB doesn't have a direct size API, return estimate
        const data = await this.exportData();
        const json = JSON.stringify(data);
        return (json.length / 1024).toFixed(2) + ' KB (IndexedDB)';
    }
}
