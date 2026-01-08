/**
 * Zone Model
 * Represents a warehouse zone for product organization
 */

class Zone {
    constructor({
        id,
        name,
        pickingPriority = 1,
        location = '',
        color = '#2563eb',
        temperature = 'FROZEN' // FROZEN, REFRIGERATED, DRY
    }) {
        this.id = id;
        this.name = name;
        this.pickingPriority = pickingPriority; // Lower = picked first
        this.location = location;
        this.color = color;
        this.temperature = temperature;
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            pickingPriority: this.pickingPriority,
            location: this.location,
            color: this.color,
            temperature: this.temperature
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        return new Zone(json);
    }
}

/**
 * Default warehouse zones
 */
const DEFAULT_ZONES = {
    FROZEN_SEAFOOD: new Zone({
        id: 'FROZEN_SEAFOOD',
        name: 'Frozen Seafood',
        pickingPriority: 1,
        location: 'Warehouse Section A',
        color: '#0ea5e9',
        temperature: 'FROZEN'
    }),
    FROZEN_MEAT: new Zone({
        id: 'FROZEN_MEAT',
        name: 'Frozen Meat',
        pickingPriority: 2,
        location: 'Warehouse Section B',
        color: '#ef4444',
        temperature: 'FROZEN'
    }),
    FROZEN_PRECOOKED: new Zone({
        id: 'FROZEN_PRECOOKED',
        name: 'Frozen Pre-cooked',
        pickingPriority: 3,
        location: 'Warehouse Section C',
        color: '#f59e0b',
        temperature: 'FROZEN'
    }),
    DRY_GOODS: new Zone({
        id: 'DRY_GOODS',
        name: 'Dry Goods',
        pickingPriority: 4,
        location: 'Warehouse Section D',
        color: '#84cc16',
        temperature: 'DRY'
    })
};
