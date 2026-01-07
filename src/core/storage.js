/**
 * Storage Service
 * Manages IndexedDB persistence for all warehouse data with in-memory cache
 * Automatically migrates from localStorage on first use
 */

class StorageService {
    constructor() {
        this.db = new IndexedDBService();
        this.initialized = false;
        this.initPromise = null;

        // In-memory cache for synchronous access
        this.cache = {
            products: null,
            distributors: null,
            salesReps: null,
            zones: null,
            orders: null,
            customers: null,
            settings: null
        };

        // Legacy localStorage keys (for migration only)
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
     * Initialize storage and migrate from localStorage if needed
     * Returns same promise if already initializing
     */
    async init() {
        if (this.initialized) return;

        // If already initializing, return existing promise
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            await this.db.init();

            // Check if we need to migrate from localStorage
            if (this.db.needsMigration()) {
                await this.db.migrateFromLocalStorage();
            }

            // Load all data into cache
            this.cache.products = await this.db.loadProducts();
            this.cache.distributors = await this.db.loadDistributors();
            this.cache.salesReps = await this.db.loadSalesReps();
            this.cache.zones = await this.db.loadZones();
            this.cache.orders = await this.db.loadOrders();
            this.cache.customers = await this.db.loadCustomers();
            this.cache.settings = await this.db.loadSettings();

            this.initialized = true;
            this.initPromise = null;
        })();

        return this.initPromise;
    }

    // ===== PRODUCTS =====

    saveProducts(products) {
        this.cache.products = products;
        // Persist to IndexedDB asynchronously
        this.db.saveProducts(products).catch(e => console.error('Error saving products:', e));
        return true;
    }

    loadProducts() {
        return this.cache.products || [];
    }

    // ===== DISTRIBUTORS =====

    saveDistributors(distributors) {
        this.cache.distributors = distributors;
        this.db.saveDistributors(distributors).catch(e => console.error('Error saving distributors:', e));
        return true;
    }

    loadDistributors() {
        return this.cache.distributors || [];
    }

    // ===== SALES REPS =====

    saveSalesReps(salesReps) {
        this.cache.salesReps = salesReps;
        this.db.saveSalesReps(salesReps).catch(e => console.error('Error saving salesReps:', e));
        return true;
    }

    loadSalesReps() {
        return this.cache.salesReps || [];
    }

    // ===== ZONES =====

    saveZones(zones) {
        this.cache.zones = zones;
        this.db.saveZones(zones).catch(e => console.error('Error saving zones:', e));
        return true;
    }

    loadZones() {
        return this.cache.zones || (DEFAULT_ZONES ? Object.values(DEFAULT_ZONES).reduce((obj, z) => {
            obj[z.id] = z;
            return obj;
        }, {}) : {});
    }

    // ===== ORDERS =====

    saveOrders(orders) {
        this.cache.orders = orders;
        this.db.saveOrders(orders).catch(e => console.error('Error saving orders:', e));
        return true;
    }

    loadOrders() {
        return this.cache.orders || [];
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

    // ===== CUSTOMERS =====

    saveCustomers(customers) {
        this.cache.customers = customers;
        this.db.saveCustomers(customers).catch(e => console.error('Error saving customers:', e));
        return true;
    }

    loadCustomers() {
        return this.cache.customers || [];
    }

    // ===== SETTINGS =====

    saveSettings(settings) {
        this.cache.settings = settings;
        this.db.saveSettings(settings).catch(e => console.error('Error saving settings:', e));
        return true;
    }

    loadSettings() {
        return this.cache.settings || {
            currentSalesRep: null,
            maxQuantityThreshold: 300,
            lowStockThreshold: 100,
            theme: 'light'
        };
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
            customers: this.loadCustomers(),
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
        if (data.customers) this.saveCustomers(data.customers);
        if (data.settings) this.saveSettings(data.settings);
    }

    async getStorageSize() {
        return this.db.getStorageSize();
    }

    async clearAll() {
        this.cache = {
            products: [],
            distributors: [],
            salesReps: [],
            zones: {},
            orders: [],
            customers: [],
            settings: {}
        };
        return this.db.clearAll();
    }
}
