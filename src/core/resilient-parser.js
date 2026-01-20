/**
 * Resilient WhatsApp Order Parser
 * NEVER blocks orders - always produces valid output
 * Philosophy: Capture intent, flag uncertainty, never stop operations
 *
 * CRITICAL BUSINESS RULE:
 * ❌ Operations must NEVER stop due to unrecognized products/distributors
 * ✅ Auto-recover, guess safely, flag for review
 */

class ResilientOrderParser {
    constructor(products, distributors) {
        this.products = products || [];
        this.distributors = distributors || [];
        this.heuristicRules = this.buildHeuristicRules();
    }

    /**
     * STAGE 1: Clean WhatsApp raw text
     * Removes system messages, timestamps, encryption notices
     */
    cleanWhatsAppText(rawText) {
        return rawText
            // Remove WhatsApp system messages
            .replace(/Messages and calls are end-to-end encrypted.*/gi, '')
            .replace(/\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(-|–)\s*/g, '') // timestamps
            .replace(/joined using this group's invite link/gi, '')
            .replace(/\bleft\b/gi, '')
            .replace(/changed the subject/gi, '')
            .replace(/created group/gi, '')

            // Normalize encoding
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')

            // Normalize quotes and apostrophes
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")

            .trim();
    }

    /**
     * STAGE 2: Parse order blocks from cleaned text
     * Returns array of order blocks
     */
    parseOrderBlocks(cleanedText) {
        const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l);
        const orderBlocks = [];
        let currentBlock = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this is a distributor line (single letter or 2-letter initial)
            if (this.isDistributorLine(line)) {
                // Start new block
                if (currentBlock) {
                    orderBlocks.push(currentBlock);
                }

                currentBlock = {
                    distributorRaw: line,
                    restaurantRaw: null,
                    itemLines: [],
                    rawStartLine: i
                };
                continue;
            }

            // If we have a block started, next non-empty line is restaurant
            if (currentBlock && !currentBlock.restaurantRaw && line) {
                currentBlock.restaurantRaw = line;
                continue;
            }

            // Subsequent lines are items
            if (currentBlock && currentBlock.restaurantRaw) {
                currentBlock.itemLines.push(line);
            }
        }

        // Add last block
        if (currentBlock) {
            orderBlocks.push(currentBlock);
        }

        // Handle case where no distributor detected - create single "UNKNOWN" block
        if (orderBlocks.length === 0 && lines.length > 0) {
            orderBlocks.push({
                distributorRaw: 'UNKNOWN',
                restaurantRaw: lines[0] || 'Unknown Restaurant',
                itemLines: lines.slice(1),
                rawStartLine: 0
            });
        }

        return orderBlocks;
    }

    /**
     * Check if line looks like a distributor initial
     */
    isDistributorLine(line) {
        const trimmed = line.trim();

        // Empty line is not a distributor
        if (!trimmed) return false;

        // Single letter or 2-letter code (case-insensitive)
        if (/^[A-Za-z]{1,2}$/.test(trimmed)) return true;

        return false;
    }

    /**
     * STAGE 3: Parse individual item line
     * Extracts quantity, text, and strips prices
     */
    parseItemLine(line) {
        const original = line;

        // Extract quantity (optional, at start)
        let quantity = null;
        let textWithoutQty = line;

        const qtyMatch = line.match(/^(\d+(?:[,\.]\d+)?)\s*/);
        if (qtyMatch) {
            quantity = parseFloat(qtyMatch[1].replace(',', '.'));
            textWithoutQty = line.substring(qtyMatch[0].length);
        }

        // Strip price if present (€, EUR, numbers with comma/decimal at end)
        // More specific pattern to avoid stripping product codes like 41/50
        const pricePattern = /\s+[\d]+[,\.][\d]+\s*€?\s*$|[\d]+\s*€\s*$/;
        const textWithoutPrice = textWithoutQty.replace(pricePattern, '').trim();

        return {
            originalLine: original,
            parsedQuantity: quantity,
            parsedText: textWithoutPrice || textWithoutQty.trim(),
            strippedPrice: textWithoutPrice !== textWithoutQty
        };
    }

    /**
     * STAGE 4: Multi-layer product matching
     * ALWAYS returns a result object (never null)
     */
    matchProductResilient(parsedText) {
        const result = {
            matchedProduct: null,
            matchedSku: null,
            matchLayer: null,
            confidence: 0,
            warnings: []
        };

        // Normalize for matching
        const normalized = this.normalizeForMatching(parsedText);

        // LAYER 1: Exact match
        const exactMatch = this.matchExact(normalized, parsedText);
        if (exactMatch) {
            result.matchedProduct = exactMatch;
            result.matchedSku = exactMatch.sku;
            result.matchLayer = 'exact';
            result.confidence = 95;
            return result;
        }

        // LAYER 2: Heuristic match
        const heuristicMatch = this.matchHeuristic(normalized, parsedText);
        if (heuristicMatch) {
            result.matchedProduct = heuristicMatch.product;
            result.matchedSku = heuristicMatch.product.sku;
            result.matchLayer = 'heuristic';
            result.confidence = heuristicMatch.confidence;
            result.warnings.push(`Matched by heuristic: "${heuristicMatch.rule}"`);
            return result;
        }

        // LAYER 3: Unknown but accepted
        result.matchedProduct = null;
        result.matchedSku = null;
        result.matchLayer = 'unknown';
        result.confidence = 0;
        result.warnings.push(`⚠️ PRODUTO NÃO RECONHECIDO: "${parsedText}" - Verificar catálogo`);

        return result; // NEVER returns null
    }

    /**
     * Normalize text for matching
     */
    normalizeForMatching(text) {
        if (!text) return '';

        return text
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/\b(un|unidade|cx|caixa|kg|kgs|gramas|g|pacote|pacotes)\b/gi, "") // units
            .replace(/[€$£]/g, '') // currency
            .replace(/[^a-z0-9\/\s]/g, '') // keep only letters, numbers, slashes, spaces
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Layer 1: Exact match
     */
    matchExact(normalized, original) {
        for (const product of this.products) {
            const nameNorm = this.normalizeForMatching(product.name);
            if (normalized === nameNorm || normalized.includes(nameNorm)) {
                return product;
            }

            for (const alias of product.aliases || []) {
                const aliasNorm = this.normalizeForMatching(alias);
                if (aliasNorm && (normalized === aliasNorm || normalized.includes(aliasNorm))) {
                    return product;
                }
            }
        }
        return null;
    }

    /**
     * Layer 2: Heuristic matching based on patterns and keywords
     */
    matchHeuristic(normalized, original) {
        for (const rule of this.heuristicRules) {
            const match = rule.test(normalized, original);
            if (match) {
                return match;
            }
        }
        return null;
    }

    /**
     * Build heuristic matching rules
     */
    buildHeuristicRules() {
        const rules = [];

        // Rule 1: Numeric shrimp sizes (41/50, 36/40, 26/30, 20/30, etc.)
        rules.push({
            name: 'Numeric shrimp size',
            test: (norm, orig) => {
                const shrimpPattern = /(\d{1,3})\s*[\/\-]\s*(\d{1,3})/;
                const match = norm.match(shrimpPattern);

                if (match) {
                    const size = `${match[1]}/${match[2]}`;

                    // Try to find exact size match in shrimp products
                    const shrimpProducts = this.products.filter(p =>
                        p.name.toLowerCase().includes('camarao') ||
                        p.name.toLowerCase().includes('shrimp') ||
                        p.aliases.some(a => a.toLowerCase().includes('cam'))
                    );

                    // Look for exact size match
                    for (const product of shrimpProducts) {
                        if (product.name.includes(size) ||
                            product.aliases.some(a => a.includes(size))) {
                            return { product, confidence: 85, rule: `Shrimp size ${size}` };
                        }
                    }

                    // Fallback to first shrimp product
                    if (shrimpProducts.length > 0) {
                        return { product: shrimpProducts[0], confidence: 60, rule: 'Generic shrimp (size not found)' };
                    }
                }
                return null;
            }
        });

        // Rule 2: "cozido" → cooked shrimp
        rules.push({
            name: 'Keyword: cozido',
            test: (norm) => {
                if (norm.includes('cozido')) {
                    const cookedShrimp = this.products.find(p =>
                        p.name.toLowerCase().includes('cozido') ||
                        p.aliases.some(a => a.toLowerCase().includes('cozido'))
                    );
                    if (cookedShrimp) {
                        return { product: cookedShrimp, confidence: 80, rule: 'Keyword: cozido' };
                    }
                }
                return null;
            }
        });

        // Rule 3: "covete" or "covet" → tentacles pota covete
        rules.push({
            name: 'Keyword: covete',
            test: (norm) => {
                if (norm.includes('covet') || norm.includes('covete')) {
                    const tentaclesCovete = this.products.find(p =>
                        p.name.toLowerCase().includes('covete') ||
                        p.name.toLowerCase().includes('covet')
                    );
                    if (tentaclesCovete) {
                        return { product: tentaclesCovete, confidence: 85, rule: 'Keyword: covete/covet' };
                    }
                }
                return null;
            }
        });

        // Rule 4: "tentaculos" + "gr" or "granel" → tentacles granel
        rules.push({
            name: 'Keyword: tentáculos granel',
            test: (norm) => {
                if ((norm.includes('tentaculo') || norm.includes('tent')) &&
                    (norm.includes('gr') || norm.includes('granel'))) {
                    const tentaclesGranel = this.products.find(p =>
                        p.name.toLowerCase().includes('tentaculo') &&
                        (p.name.toLowerCase().includes('granel') || p.name.toLowerCase().includes('tiras'))
                    );
                    if (tentaclesGranel) {
                        return { product: tentaclesGranel, confidence: 75, rule: 'Tentáculos granel' };
                    }
                }
                return null;
            }
        });

        // Rule 5: "caprichos" or "capricho" or "muslitos"
        rules.push({
            name: 'Keyword: caprichos',
            test: (norm) => {
                if (norm.includes('capricho') || norm.includes('muslito')) {
                    const caprichos = this.products.find(p =>
                        p.name.toLowerCase().includes('caprichos') ||
                        p.name.toLowerCase().includes('muslitos')
                    );
                    if (caprichos) {
                        return { product: caprichos, confidence: 85, rule: 'Keyword: caprichos/muslitos' };
                    }
                }
                return null;
            }
        });

        // Rule 6: "arroz" → generic rice
        rules.push({
            name: 'Keyword: arroz',
            test: (norm) => {
                if (norm.includes('arroz') || norm.includes('rice')) {
                    const rice = this.products.find(p =>
                        p.name.toLowerCase().includes('arroz') ||
                        p.name.toLowerCase().includes('rice')
                    );
                    if (rice) {
                        return { product: rice, confidence: 70, rule: 'Keyword: arroz' };
                    }
                }
                return null;
            }
        });

        // Rule 7: "pato" → duck
        rules.push({
            name: 'Keyword: pato',
            test: (norm) => {
                if (norm.includes('pato') || norm.includes('duck')) {
                    const duck = this.products.find(p =>
                        p.name.toLowerCase().includes('pato') ||
                        p.name.toLowerCase().includes('duck')
                    );
                    if (duck) {
                        return { product: duck, confidence: 80, rule: 'Keyword: pato/duck' };
                    }
                }
                return null;
            }
        });

        // Rule 8: Just numbers (like "36") → assume shrimp
        rules.push({
            name: 'Single number (shrimp)',
            test: (norm) => {
                if (/^\d{2}$/.test(norm.trim())) {
                    const shrimpProducts = this.products.filter(p =>
                        p.name.toLowerCase().includes('camarao') ||
                        p.name.toLowerCase().includes('shrimp')
                    );
                    if (shrimpProducts.length > 0) {
                        return { product: shrimpProducts[0], confidence: 50, rule: 'Single number (assumed shrimp)' };
                    }
                }
                return null;
            }
        });

        return rules;
    }

    /**
     * Match distributor (soft match, never blocks)
     */
    matchDistributor(rawLine) {
        const normalized = rawLine.trim().toUpperCase();

        // Check known distributors
        for (const dist of this.distributors) {
            if (dist.initial.toUpperCase() === normalized) {
                return {
                    name: dist.name,
                    initial: dist.initial,
                    confidence: 95,
                    warning: null
                };
            }
        }

        // Unknown distributor - accept it anyway
        return {
            name: 'UNKNOWN',
            initial: normalized,
            confidence: 0,
            warning: `⚠️ Distribuidor "${normalized}" não encontrado - usando UNKNOWN`
        };
    }

    /**
     * STAGE 5: Generate normalized order template
     * ALWAYS succeeds, never throws
     */
    generateOrderTemplate(orderBlock) {
        const template = {
            distributor: 'UNKNOWN',
            distributorInitial: orderBlock.distributorRaw,
            distributorConfidence: 0,
            restaurant: orderBlock.restaurantRaw || 'Unknown Restaurant',
            items: [],
            warnings: [],
            metadata: {
                rawDistributorLine: orderBlock.distributorRaw,
                rawRestaurantLine: orderBlock.restaurantRaw,
                totalLines: orderBlock.itemLines.length,
                timestamp: new Date().toISOString()
            }
        };

        // Try to match distributor
        const distResult = this.matchDistributor(orderBlock.distributorRaw);
        template.distributor = distResult.name;
        template.distributorInitial = distResult.initial;
        template.distributorConfidence = distResult.confidence;
        if (distResult.warning) {
            template.warnings.push(distResult.warning);
        }

        // Parse each item line
        for (const line of orderBlock.itemLines) {
            try {
                const parsed = this.parseItemLine(line);
                const matched = this.matchProductResilient(parsed.parsedText);

                const item = {
                    originalLine: parsed.originalLine,
                    parsedQuantity: parsed.parsedQuantity,
                    parsedText: parsed.parsedText,
                    matchedSku: matched.matchedSku,
                    matchedProduct: matched.matchedProduct ? {
                        sku: matched.matchedProduct.sku,
                        name: matched.matchedProduct.name,
                        zone: matched.matchedProduct.zone,
                        kgPerBox: matched.matchedProduct.kgPerBox
                    } : null,
                    matchLayer: matched.matchLayer,
                    confidence: matched.confidence,
                    warnings: matched.warnings
                };

                template.items.push(item);
                template.warnings.push(...matched.warnings);
            } catch (error) {
                // Even if parsing fails catastrophically, include the line
                template.items.push({
                    originalLine: line,
                    parsedQuantity: null,
                    parsedText: line,
                    matchedSku: null,
                    matchedProduct: null,
                    matchLayer: 'error',
                    confidence: 0,
                    warnings: [`⚠️ Erro ao processar linha: ${error.message}`]
                });
                template.warnings.push(`Erro ao processar: "${line}" - ${error.message}`);
            }
        }

        return template;
    }

    /**
     * MAIN ENTRY POINT: Parse raw WhatsApp text
     * ALWAYS returns valid output, never throws
     */
    parseWhatsAppOrders(rawText) {
        try {
            // Stage 1: Clean
            const cleaned = this.cleanWhatsAppText(rawText);

            // Stage 2: Extract blocks
            const blocks = this.parseOrderBlocks(cleaned);

            // Stage 3-5: Generate templates for each block
            const orders = blocks.map(block => this.generateOrderTemplate(block));

            return {
                success: true,
                ordersCount: orders.length,
                orders: orders,
                globalWarnings: []
            };
        } catch (error) {
            // Even catastrophic failure returns valid structure
            console.error('Critical parsing error:', error);
            return {
                success: false,
                ordersCount: 0,
                orders: [],
                globalWarnings: [`❌ Erro crítico: ${error.message}`],
                rawInput: rawText.substring(0, 500)
            };
        }
    }
}
