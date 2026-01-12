import { ParsedOrder } from '../types';
import { findProductByName } from '../constants/products';

/**
 * WhatsApp Order Parser
 * Intelligently parses copy-pasted WhatsApp conversations into structured orders
 */

interface ParserResult {
  orders: ParsedOrder[];
  errors: string[];
  warnings: string[];
}

/**
 * Main parsing function
 */
export function parseWhatsAppText(text: string): ParserResult {
  const orders: ParsedOrder[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Split into potential order blocks
  const blocks = splitIntoOrderBlocks(cleanedText);

  blocks.forEach((block, index) => {
    try {
      const parsed = parseOrderBlock(block);
      if (parsed) {
        orders.push(parsed);
      }
    } catch (error) {
      errors.push(`Block ${index + 1}: ${(error as Error).message}`);
    }
  });

  return { orders, errors, warnings };
}

/**
 * Split text into order blocks
 * Each block should contain one restaurant and its products
 */
function splitIntoOrderBlocks(text: string): string[] {
  const lines = text.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Skip WhatsApp metadata (timestamps, "Messages and calls are...")
    if (isMetadataLine(line)) {
      continue;
    }

    // Check if this line looks like a restaurant name (start of new block)
    if (looksLikeRestaurantName(line, lines[i + 1])) {
      // Save previous block
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    }

    currentBlock.push(line);
  }

  // Add last block
  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  return blocks;
}

/**
 * Check if line is WhatsApp metadata
 */
function isMetadataLine(line: string): boolean {
  // Timestamps: [10:23] or 10:23
  if (/^\[?\d{1,2}:\d{2}\]?/.test(line)) {
    return true;
  }

  // WhatsApp system messages
  if (line.includes('Messages and calls are') ||
      line.includes('Mensagens e chamadas') ||
      line.includes('end-to-end encrypted')) {
    return true;
  }

  // Greetings only lines
  if (/^(bom dia|boa tarde|olá|ola|boas|hi|hello)!?$/i.test(line)) {
    return true;
  }

  return false;
}

/**
 * Check if line looks like a restaurant name
 */
function looksLikeRestaurantName(line: string, nextLine?: string): boolean {
  const cleaned = line.toLowerCase();

  // Contains restaurant keywords
  const restaurantKeywords = [
    'restaurante',
    'restaurant',
    'casa',
    'dragon',
    'golden',
    'china',
    'garden',
    'palace',
    'panda'
  ];

  const hasKeyword = restaurantKeywords.some(keyword =>
    cleaned.includes(keyword)
  );

  if (hasKeyword) {
    return true;
  }

  // Is followed by product line
  if (nextLine && looksLikeProductLine(nextLine)) {
    // Line is not itself a product line
    if (!looksLikeProductLine(line)) {
      return true;
    }
  }

  // Capitalized words (likely a name)
  if (/^[A-Z][a-zA-Z\s]+$/.test(line) && line.split(' ').length >= 2) {
    return true;
  }

  return false;
}

/**
 * Check if line looks like a product line
 */
function looksLikeProductLine(line: string): boolean {
  // Has product separator (-, :, |)
  if (/[-:|]/.test(line)) {
    // Has numbers
    if (/\d+/.test(line)) {
      return true;
    }
  }

  // Starts with emoji or bullet
  if (/^[🦐🐙🐠🐟🦑🦞🦀•\-*]/.test(line)) {
    return true;
  }

  // Has quantity pattern
  if (/\d+\s*(kg|kilos?|unidades?|units?)?/i.test(line)) {
    const productName = line.split(/[:-]/)[0].trim();
    if (findProductByName(productName)) {
      return true;
    }
  }

  return false;
}

/**
 * Parse a single order block
 */
function parseOrderBlock(block: string): ParsedOrder | null {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);

  if (lines.length === 0) {
    return null;
  }

  // First line is usually the restaurant name
  let restaurantName = lines[0];

  // Clean restaurant name
  restaurantName = cleanRestaurantName(restaurantName);

  // Parse products from remaining lines
  const products: ParsedOrder['products'] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip non-product lines
    if (!looksLikeProductLine(line)) {
      continue;
    }

    const product = parseProductLine(line);
    if (product) {
      products.push(product);
    }
  }

  // If no products found, maybe first line was a product too
  if (products.length === 0) {
    const product = parseProductLine(lines[0]);
    if (product) {
      products.push(product);
      // Try to find restaurant name in context or use generic
      restaurantName = 'Cliente ' + Date.now();
    }
  }

  if (products.length === 0) {
    return null;
  }

  return {
    clientName: restaurantName,
    products,
    rawText: block
  };
}

/**
 * Clean restaurant name
 */
function cleanRestaurantName(name: string): string {
  // Remove timestamps
  name = name.replace(/^\[?\d{1,2}:\d{2}\]?\s*/, '');

  // Remove WhatsApp sender name format (name followed by : )
  name = name.replace(/^[^:]+:\s*/, '');

  // Remove emojis at start
  name = name.replace(/^[🏪🏠🏢]+\s*/, '');

  // Remove "Restaurante" prefix if present
  name = name.replace(/^(restaurante|restaurant)\s+/i, '');

  return name.trim();
}

/**
 * Parse a product line
 */
function parseProductLine(line: string): ParsedOrder['products'][0] | null {
  // Remove emojis and bullets
  let cleaned = line.replace(/^[🦐🐙🐠🐟🦑🦞🦀•\-*]\s*/, '');

  // Try different patterns
  const patterns = [
    // Pattern 1: Camarão 30kg or Camarão 30
    /^([^:-]+?)\s+(\d+(?:\.\d+)?)\s*(kg|kilos?|k|unidades?|units?|un)?$/i,

    // Pattern 2: Camarão: 30kg or Camarão - 30
    /^([^:-]+?)\s*[:-]\s*(\d+(?:\.\d+)?)\s*(kg|kilos?|k|unidades?|units?|un)?$/i,

    // Pattern 3: 30kg Camarão (quantity first)
    /^(\d+(?:\.\d+)?)\s*(kg|kilos?|k|unidades?|units?|un)?\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);

    if (match) {
      let productName: string;
      let quantity: number;
      let unit: string | undefined;

      if (pattern === patterns[2]) {
        // Quantity first pattern
        quantity = parseFloat(match[1]);
        unit = match[2];
        productName = match[3];
      } else {
        productName = match[1];
        quantity = parseFloat(match[2]);
        unit = match[3];
      }

      // Validate product name
      const product = findProductByName(productName.trim());

      if (product || productName.length > 2) {
        return {
          name: productName.trim(),
          quantity,
          unit: normalizeUnit(unit)
        };
      }
    }
  }

  return null;
}

/**
 * Normalize unit to kg or units
 */
function normalizeUnit(unit?: string): string {
  if (!unit) {
    return 'kg';
  }

  const normalized = unit.toLowerCase();

  if (normalized.includes('kg') || normalized === 'k' || normalized.includes('kilo')) {
    return 'kg';
  }

  if (normalized.includes('un') || normalized.includes('unit')) {
    return 'units';
  }

  return 'kg'; // Default
}

/**
 * Validate parsed orders
 */
export function validateParsedOrders(orders: ParsedOrder[]): {
  valid: ParsedOrder[];
  invalid: { order: ParsedOrder; reason: string }[];
} {
  const valid: ParsedOrder[] = [];
  const invalid: { order: ParsedOrder; reason: string }[] = [];

  orders.forEach(order => {
    // Check if has products
    if (order.products.length === 0) {
      invalid.push({ order, reason: 'Sem produtos' });
      return;
    }

    // Check quantities
    const hasInvalidQuantity = order.products.some(
      p => p.quantity <= 0 || p.quantity > 1000
    );

    if (hasInvalidQuantity) {
      invalid.push({ order, reason: 'Quantidade inválida' });
      return;
    }

    valid.push(order);
  });

  return { valid, invalid };
}

/**
 * Example usage for testing
 */
export const EXAMPLE_WHATSAPP_TEXT = `
[15:30] Admin: Encomendas para amanhã:

China Garden
Camarão 30kg
Polvo 15kg
Lulas 20kg

[16:00] Golden Dragon
Camarão: 25kg
Polvo: 10kg

Panda Real
- Camarão 40kg
- Lulas 30kg
- Robalo 20kg

🏪 Dragon Vermelho
🦐 Camarão - 15kg
🐙 Polvo - 10kg
`;
