/**
 * WhatsApp Order Parser
 * Parses raw WhatsApp text into structured orders
 *
 * Format:
 * Line 1: Distributor Initial (single letter)
 * Line 2: Restaurant Name
 * Lines 3+: Quantity Product (multiple lines, one product per line)
 *
 * Example:
 * J
 * Restaurante Marazul
 * 10 Camarão 41/50
 * 5 Polvo
 * 15 Arroz Sushi
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

        // Split into lines (keep empty lines for separation)
        const lines = rawText.split('\n').map(line => line.trim());

        if (lines.length === 0) {
            this.errors.push('Nenhuma linha válida encontrada');
            return [];
        }

        // Parse orders dynamically
        const orders = [];
        let i = 0;

        while (i < lines.length) {
            // Skip empty lines
            if (!lines[i] || lines[i].length === 0) {
                i++;
                continue;
            }

            // Check if this looks like a distributor initial
            if (this.isDistributorInitial(lines[i])) {
                const orderData = this.extractOrderData(lines, i);
                if (orderData) {
                    const order = this.parseOrder(orderData);
                    if (order) {
                        orders.push(order);
                    }
                    i = orderData.nextLineIndex;
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }

        return orders;
    }

    /**
     * Check if a line is a distributor initial
     */
    isDistributorInitial(line) {
        const trimmed = line.trim().toUpperCase();
        return /^[A-Z]{1,2}$/.test(trimmed);
    }

    /**
     * Extract order data from lines starting at index
     */
    extractOrderData(lines, startIndex) {
        if (startIndex + 2 >= lines.length) {
            this.warnings.push(`Linha ${startIndex + 1}: Pedido incompleto`);
            return null;
        }

        const distributorLine = lines[startIndex];
        const restaurantLine = lines[startIndex + 1];

        // Collect item lines (until empty line or next distributor)
        const itemLines = [];
        let i = startIndex + 2;

        while (i < lines.length) {
            const line = lines[i];

            // Stop at empty line
            if (!line || line.length === 0) {
                i++;
                break;
            }

            // Stop at next distributor initial
            if (this.isDistributorInitial(line)) {
                break;
            }

            // Check if it's a product line (starts with number)
            if (/^\d+\s/.test(line)) {
                itemLines.push(line);
                i++;
            } else {
                i++;
                break;
            }
        }

        if (itemLines.length === 0) {
            this.warnings.push(`Linha ${startIndex + 1}: Nenhum produto encontrado`);
            return null;
        }

        const rawLines = [distributorLine, restaurantLine, ...itemLines];

        return {
            lineNumber: startIndex + 1,
            distributorLine,
            restaurantLine,
            itemLines,
            rawText: rawLines.join('\n'),
            nextLineIndex: i
        };
    }

    /**
     * Parse a single order
     */
    parseOrder(orderData) {
        const { lineNumber, distributorLine, restaurantLine, itemLines, rawText } = orderData;

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

        // Parse all item lines
        const items = [];
        itemLines.forEach((itemLine, index) => {
            const item = this.parseItemLine(itemLine);
            if (item) {
                items.push(item);
            } else {
                this.warnings.push(`Linha ${lineNumber + 2 + index}: Item inválido "${itemLine}"`);
            }
        });

        if (items.length === 0) {
            this.errors.push(`Linha ${lineNumber}: Nenhum item válido encontrado`);
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
     * Parse single item line
     * Format: Quantity ProductName (e.g., "4 Camarão 41/50")
     * ENHANCED: Added validation for quantity limits and number safety
     */
    parseItemLine(line) {
        // Regex: starts with number, whitespace, then product name
        const match = line.match(/^\s*(\d+)\s+(.+)$/);

        if (!match) {
            return null;
        }

        const quantity = parseInt(match[1], 10);
        const productName = match[2].trim();

        // Get constants with fallback for testing
        const constants = window.APP_CONSTANTS || {
            MIN_ORDER_QUANTITY: 1,
            MAX_ORDER_QUANTITY: 10000
        };

        // Validate quantity is within safe bounds
        if (!Number.isFinite(quantity) ||
            quantity < constants.MIN_ORDER_QUANTITY ||
            quantity > constants.MAX_ORDER_QUANTITY) {
            this.warnings.push(
                `Quantidade fora dos limites: ${quantity} (deve estar entre ${constants.MIN_ORDER_QUANTITY} e ${constants.MAX_ORDER_QUANTITY})`
            );
            return null;
        }

        // Validate product name
        if (productName.length === 0) {
            this.warnings.push(`Nome de produto vazio na linha: "${line}"`);
            return null;
        }

        return new OrderItem({
            productCode: productName, // Use full name as code initially
            productSKU: '', // Will be filled by normalizer
            productName: '', // Will be filled by normalizer
            quantity: quantity,
            zone: '', // Will be filled by normalizer
            isMapped: false
        });
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
