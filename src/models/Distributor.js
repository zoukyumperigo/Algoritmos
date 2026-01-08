/**
 * Distributor Model
 * Represents a delivery distributor with route information
 */

class Distributor {
    constructor({
        initial,
        name,
        routeNumber,
        routePriority = 1,
        customers = [],
        deliveryDays = [],
        phone = '',
        notes = ''
    }) {
        this.initial = initial; // Single letter identifier
        this.name = name;
        this.routeNumber = routeNumber;
        this.routePriority = routePriority; // Lower number = picked first
        this.customers = customers;
        this.deliveryDays = deliveryDays; // ['Mon', 'Wed', 'Fri']
        this.phone = phone;
        this.notes = notes;
    }

    /**
     * Check if distributor has a customer
     */
    hasCustomer(restaurantName) {
        return this.customers.some(c =>
            c.toLowerCase() === restaurantName.toLowerCase()
        );
    }

    /**
     * Add customer to distributor
     */
    addCustomer(restaurantName) {
        if (!this.hasCustomer(restaurantName)) {
            this.customers.push(restaurantName);
        }
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            initial: this.initial,
            name: this.name,
            routeNumber: this.routeNumber,
            routePriority: this.routePriority,
            customers: this.customers,
            deliveryDays: this.deliveryDays,
            phone: this.phone,
            notes: this.notes
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        return new Distributor(json);
    }
}

/**
 * SalesRep Model
 * Represents a sales representative
 */
class SalesRep {
    constructor({
        id,
        name,
        customers = [],
        email = '',
        phone = ''
    }) {
        this.id = id;
        this.name = name;
        this.customers = customers;
        this.email = email;
        this.phone = phone;
    }

    /**
     * Check if sales rep manages a customer
     */
    hasCustomer(restaurantName) {
        return this.customers.some(c =>
            c.toLowerCase() === restaurantName.toLowerCase()
        );
    }

    /**
     * Add customer to sales rep
     */
    addCustomer(restaurantName) {
        if (!this.hasCustomer(restaurantName)) {
            this.customers.push(restaurantName);
        }
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            customers: this.customers,
            email: this.email,
            phone: this.phone
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        return new SalesRep(json);
    }
}
