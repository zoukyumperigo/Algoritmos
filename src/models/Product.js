/**
 * Product Model
 * Represents a warehouse product with stock, location, and conversion data
 */

class Product {
    constructor({
        sku,
        name,
        aliases = [],
        zone,
        currentStock = 0,
        kgPerBox = 0,
        boxesPerPallet = 0,
        reorderPoint = 0,
        supplier = '',
        notes = ''
    }) {
        this.sku = sku;
        this.name = name;
        this.aliases = aliases; // Alternative names/codes
        this.zone = zone; // FROZEN_SEAFOOD, FROZEN_MEAT, FROZEN_PRECOOKED, DRY_GOODS
        this.currentStock = currentStock;
        this.kgPerBox = kgPerBox;
        this.boxesPerPallet = boxesPerPallet;
        this.reorderPoint = reorderPoint;
        this.supplier = supplier;
        this.notes = notes;
    }

    /**
     * Check if product is low on stock
     */
    isLowStock() {
        return this.currentStock <= this.reorderPoint;
    }

    /**
     * Calculate total kg from boxes
     */
    boxesToKg(boxes) {
        return boxes * this.kgPerBox;
    }

    /**
     * Calculate pallets needed
     */
    boxesToPallets(boxes) {
        if (this.boxesPerPallet === 0) return 0;
        return Math.ceil(boxes / this.boxesPerPallet);
    }

    /**
     * Check if stock is sufficient for order
     */
    hasSufficientStock(quantity) {
        return this.currentStock >= quantity;
    }

    /**
     * Reduce stock after picking
     */
    reduceStock(quantity) {
        this.currentStock = Math.max(0, this.currentStock - quantity);
    }

    /**
     * Add stock (after receiving)
     */
    addStock(quantity) {
        this.currentStock += quantity;
    }

    /**
     * Get stock status
     */
    getStockStatus() {
        if (this.currentStock === 0) return 'OUT_OF_STOCK';
        if (this.isLowStock()) return 'LOW_STOCK';
        return 'OK';
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            sku: this.sku,
            name: this.name,
            aliases: this.aliases,
            zone: this.zone,
            currentStock: this.currentStock,
            kgPerBox: this.kgPerBox,
            boxesPerPallet: this.boxesPerPallet,
            reorderPoint: this.reorderPoint,
            supplier: this.supplier,
            notes: this.notes
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        return new Product(json);
    }
}
