/**
 * WhatsApp Order Parser
 * Parses raw WhatsApp text into structured orders
 *
 * Format (exactly 3 lines per order):
 * Line 1: Distributor Initial (single letter)
 * Line 2: Restaurant Name
 * Line 3: Quantity(ProductCode)
 *
 * Example:
 * J
 * Restaurante Marazul
 * 10(41/50)
 */

class WhatsAppParser {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Parse raw WhatsApp text into orders
     * @param {string} rawText - Raw WhatsApp text
     * @returns {Array<Order>} - Array of Order objects
     */
    parse(rawText) {
        this.errors = [];
        this.warnings = [];

        if (!rawText || typeof rawText !== 'string') {
            this.errors.push('Texto inválido ou vazio');
            return [];
        }

        // Split into lines and clean
        const lines = rawText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0); // Remove empty lines

        if (lines.length === 0) {
            this.errors.push('Nenhuma linha válida encontrada');
            return [];
        }

        // Parse in groups of 3
        const orders = [];
        for (let i = 0; i < lines.length; i += 3) {
            if (i + 2 >= lines.length) {
                this.warnings.push(`Linha ${i + 1}: Pedido incompleto (necessita 3 linhas)`);
                break;
            }

            const orderData = {
                lineNumber: i + 1,
                distributorLine: lines[i],
                restaurantLine: lines[i + 1],
                itemsLine: lines[i + 2],
                rawText: `${lines[i]}\n${lines[i + 1]}\n${lines[i + 2]}`
            };

            const order = this.parseOrder(orderData);
            if (order) {
                orders.push(order);
            }
        }

        return orders;
    }

    /**
     * Parse a single order (3 lines)
     */
    parseOrder(orderData) {
        const { lineNumber, distributorLine, restaurantLine, itemsLine, rawText } = orderData;

        // Parse distributor initial
        const distributorInitial = this.parseDistributorInitial(distributorLine);
        if (!distributorInitial) {
            this.errors.push(`Linha ${lineNumber}: Inicial de distribuidor inválida "${distributorLine}"`);
            return null;
        }

        // Parse restaurant name
        const restaurantName = this.parseRestaurantName(restaurantLine);
        if (!restaurantName) {
            this.errors.push(`Linha ${lineNumber + 1}: Nome de restaurante inválido "${restaurantLine}"`);
            return null;
        }

        // Parse items (can be multiple items in one line)
        const items = this.parseItems(itemsLine);
        if (items.length === 0) {
            this.errors.push(`Linha ${lineNumber + 2}: Nenhum item válido encontrado em "${itemsLine}"`);
            return null;
        }

        // Create order
        const order = new Order({
            distributorInitial: distributorInitial,
            distributorName: '', // Will be filled by normalizer
            restaurantName: restaurantName,
            items: items,
            rawText: rawText
        });

        return order;
    }

    /**
     * Parse distributor initial (should be 1-2 letters)
     */
    parseDistributorInitial(line) {
        const trimmed = line.trim().toUpperCase();

        // Should be 1-2 letters
        if (/^[A-Z]{1,2}$/.test(trimmed)) {
            return trimmed;
        }

        return null;
    }

    /**
     * Parse restaurant name
     */
    parseRestaurantName(line) {
        const trimmed = line.trim();

        if (trimmed.length < 3) {
            return null;
        }

        // Capitalize properly
        return this.capitalizeRestaurantName(trimmed);
    }

    /**
     * Capitalize restaurant name properly
     */
    capitalizeRestaurantName(name) {
        return name
            .split(' ')
            .map(word => {
                if (word.length === 0) return '';
                // Keep abbreviations uppercase
                if (word.length <= 3 && word === word.toUpperCase()) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    /**
     * Parse items line
     * Format: Quantity(ProductCode) or multiple: 10(41/50) 5(26/30)
     */
    parseItems(line) {
        const items = [];

        // Regex to match: number(text)
        // Matches: 10(41/50), 5(Arroz Sushi), etc.
        const itemPattern = /(\d+)\s*\(([^)]+)\)/g;

        let match;
        while ((match = itemPattern.exec(line)) !== null) {
            const quantity = parseInt(match[1], 10);
            const productCode = match[2].trim();

            if (quantity > 0 && productCode.length > 0) {
                items.push(new OrderItem({
                    productCode: productCode,
                    productSKU: '', // Will be filled by normalizer
                    productName: '', // Will be filled by normalizer
                    quantity: quantity,
                    zone: '', // Will be filled by normalizer
                    isMapped: false
                }));
            }
        }

        return items;
    }

    /**
     * Parse from file
     */
    async parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target.result;
                const orders = this.parse(text);
                resolve(orders);
            };

            reader.onerror = (e) => {
                reject(new Error('Erro ao ler ficheiro'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Get parsing errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get parsing warnings
     */
    getWarnings() {
        return this.warnings;
    }

    /**
     * Check if parsing was successful
     */
    hasErrors() {
        return this.errors.length > 0;
    }

    /**
     * Check if there are warnings
     */
    hasWarnings() {
        return this.warnings.length > 0;
    }
}
