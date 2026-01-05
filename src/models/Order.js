/**
 * Order Model
 * Represents a customer order with items, validation, and fulfillment status
 */

class Order {
    constructor({
        id = null,
        timestamp = new Date().toISOString(),
        distributorInitial,
        distributorName,
        restaurantName,
        items = [],
        salesRep = '',
        status = 'pending',
        warnings = [],
        errors = [],
        totalBoxes = 0,
        totalKg = 0,
        notes = '',
        rawText = ''
    }) {
        this.id = id || this.generateId();
        this.timestamp = timestamp;
        this.distributorInitial = distributorInitial;
        this.distributorName = distributorName;
        this.restaurantName = restaurantName;
        this.items = items;
        this.salesRep = salesRep;
        this.status = status; // pending, fulfilled, partial, cancelled
        this.warnings = warnings;
        this.errors = errors;
        this.totalBoxes = totalBoxes;
        this.totalKg = totalKg;
        this.notes = notes;
        this.rawText = rawText;
    }

    /**
     * Generate unique order ID
     */
    generateId() {
        return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add item to order
     */
    addItem(item) {
        this.items.push(item);
        this.calculateTotals();
    }

    /**
     * Calculate total boxes and kg
     */
    calculateTotals() {
        this.totalBoxes = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.totalKg = this.items.reduce((sum, item) => {
            return sum + (item.quantity * (item.kgPerBox || 0));
        }, 0);
    }

    /**
     * Add warning
     */
    addWarning(message) {
        this.warnings.push(message);
    }

    /**
     * Add error
     */
    addError(message) {
        this.errors.push(message);
    }

    /**
     * Check if order has errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Check if order has warnings
     */
    hasWarnings() {
        return this.warnings.length > 0;
    }

    /**
     * Check if order is valid (no errors)
     */
    isValid() {
        return !this.hasErrors();
    }

    /**
     * Get order date (YYYY-MM-DD)
     */
    getDate() {
        return this.timestamp.split('T')[0];
    }

    /**
     * Mark as fulfilled
     */
    markFulfilled() {
        this.status = 'fulfilled';
    }

    /**
     * Mark as partially fulfilled
     */
    markPartiallyFulfilled() {
        this.status = 'partial';
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            timestamp: this.timestamp,
            distributorInitial: this.distributorInitial,
            distributorName: this.distributorName,
            restaurantName: this.restaurantName,
            items: this.items,
            salesRep: this.salesRep,
            status: this.status,
            warnings: this.warnings,
            errors: this.errors,
            totalBoxes: this.totalBoxes,
            totalKg: this.totalKg,
            notes: this.notes,
            rawText: this.rawText
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        return new Order(json);
    }
}

/**
 * OrderItem - represents a single line item in an order
 */
class OrderItem {
    constructor({
        productCode,
        productSKU,
        productName,
        quantity,
        zone,
        kgPerBox = 0,
        stockAvailable = 0,
        isMapped = false
    }) {
        this.productCode = productCode;
        this.productSKU = productSKU;
        this.productName = productName;
        this.quantity = quantity;
        this.zone = zone;
        this.kgPerBox = kgPerBox;
        this.stockAvailable = stockAvailable;
        this.isMapped = isMapped;
    }

    /**
     * Calculate total kg for this item
     */
    getTotalKg() {
        return this.quantity * this.kgPerBox;
    }

    /**
     * Check if sufficient stock
     */
    hasSufficientStock() {
        return this.stockAvailable >= this.quantity;
    }

    /**
     * Get stock shortage
     */
    getStockShortage() {
        return Math.max(0, this.quantity - this.stockAvailable);
    }
}
