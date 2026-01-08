/**
 * Product Normalizer
 * Maps product codes/aliases to standardized SKUs
 * Handles different naming variations
 *
 * Example:
 * "41/50", "Camarão 41-50", "Shrimp 41/50" → SHRMP-41-50
 */

class ProductNormalizer {
    constructor(products) {
        this.products = products || [];
        this.aliasMap = this.buildAliasMap();
    }

    /**
     * Build a map of aliases to SKUs for fast lookup
     */
    buildAliasMap() {
        const map = new Map();

        this.products.forEach(product => {
            // Add primary name
            const primaryKey = this.normalizeCode(product.name);
            map.set(primaryKey, product.sku);

            // Add all aliases
            product.aliases.forEach(alias => {
                const aliasKey = this.normalizeCode(alias);
                map.set(aliasKey, product.sku);
            });

            // Add SKU itself
            map.set(this.normalizeCode(product.sku), product.sku);
        });

        return map;
    }

    /**
     * Normalize product code for comparison
     * Removes accents, spaces, special chars, units, and quantities
     */
    normalizeCode(code) {
        if (!code) return '';

        return code
            .toString()
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/\b(un|cx|caixa|kg|kgs)\b/g, "")        // remove unidades
            .replace(/^\d+\s*/g, "")                         // remove qty inicial
            .replace(/[^a-z0-9/ ]/g, "")                     // limpa símbolos (mantém /)
            .replace(/\s+/g, "")                             // remove espaços
            .replace(/\//g, "");                              // remove /
    }

    /**
     * Find product by code/alias
     */
    findProduct(productCode) {
        const normalized = this.normalizeCode(productCode);
        const sku = this.aliasMap.get(normalized);

        if (!sku) return null;

        return this.products.find(p => p.sku === sku);
    }

    /**
     * Normalize an order (fill in product details)
     */
    normalizeOrder(order, distributors) {
        // Fill in distributor name
        const distributor = distributors.find(d =>
            d.initial.toUpperCase() === order.distributorInitial.toUpperCase()
        );

        if (distributor) {
            order.distributorName = distributor.name;
        } else {
            order.addError(`Distribuidor "${order.distributorInitial}" não encontrado`);
        }

        // Normalize each item
        order.items.forEach((item, index) => {
            const product = this.findProduct(item.productCode);

            if (product) {
                // Fill in product details
                item.productSKU = product.sku;
                item.productName = product.name;
                item.zone = product.zone;
                item.kgPerBox = product.kgPerBox;
                item.stockAvailable = product.currentStock;
                item.isMapped = true;
            } else {
                // Product not found
                item.isMapped = false;
                order.addError(`Produto "${item.productCode}" não encontrado no catálogo`);
            }
        });

        // Calculate totals
        order.calculateTotals();

        return order;
    }

    /**
     * Normalize multiple orders
     */
    normalizeOrders(orders, distributors) {
        return orders.map(order => this.normalizeOrder(order, distributors));
    }

    /**
     * Get all unmapped product codes from orders
     */
    getUnmappedProducts(orders) {
        const unmapped = new Set();

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isMapped) {
                    unmapped.add(item.productCode);
                }
            });
        });

        return Array.from(unmapped);
    }

    /**
     * Suggest similar products for unmapped code
     */
    suggestProducts(productCode, maxResults = 5) {
        const normalized = this.normalizeCode(productCode);
        const suggestions = [];

        this.products.forEach(product => {
            // Check if product name or aliases contain the code
            const searchIn = [product.name, ...product.aliases];

            searchIn.forEach(term => {
                const termNormalized = this.normalizeCode(term);

                if (termNormalized.includes(normalized) || normalized.includes(termNormalized)) {
                    suggestions.push({
                        product: product,
                        similarity: this.calculateSimilarity(normalized, termNormalized)
                    });
                }
            });
        });

        // Sort by similarity and return top results
        return suggestions
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults)
            .map(s => s.product);
    }

    /**
     * Calculate simple similarity score (0-1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Levenshtein distance for similarity calculation
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Reload products (after adding new ones)
     */
    reloadProducts(products) {
        this.products = products;
        this.aliasMap = this.buildAliasMap();
    }
}
