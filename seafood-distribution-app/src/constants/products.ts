import { Product } from '../types';

/**
 * Product Catalog with variations
 * This helps the parser recognize different spellings and languages
 */
export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'shrimp',
    name: 'Camarão',
    variations: [
      'camarão',
      'camarao',
      'shrimp',
      'gambas',
      'prawns',
      'gamba',
      'camaron'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'octopus',
    name: 'Polvo',
    variations: [
      'polvo',
      'octopus',
      'pulpo'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'squid',
    name: 'Lulas',
    variations: [
      'lulas',
      'lula',
      'squid',
      'calamares',
      'calamari',
      'calamar'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'sea_bass',
    name: 'Robalo',
    variations: [
      'robalo',
      'sea bass',
      'seabass',
      'lubina'
    ],
    defaultUnit: 'kg',
    category: 'fish'
  },
  {
    id: 'salmon',
    name: 'Salmão',
    variations: [
      'salmão',
      'salmao',
      'salmon',
      'salmón'
    ],
    defaultUnit: 'kg',
    category: 'fish'
  },
  {
    id: 'cod',
    name: 'Bacalhau',
    variations: [
      'bacalhau',
      'cod',
      'codfish',
      'bacalao'
    ],
    defaultUnit: 'kg',
    category: 'fish'
  },
  {
    id: 'crab',
    name: 'Caranguejo',
    variations: [
      'caranguejo',
      'crab',
      'cangrejo'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'lobster',
    name: 'Lagosta',
    variations: [
      'lagosta',
      'lobster',
      'langosta'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'clams',
    name: 'Ameijoas',
    variations: [
      'ameijoas',
      'ameijoa',
      'clams',
      'clam',
      'almejas'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'mussels',
    name: 'Mexilhões',
    variations: [
      'mexilhões',
      'mexilhao',
      'mexilhoes',
      'mussels',
      'mussel',
      'mejillones'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'scallops',
    name: 'Vieiras',
    variations: [
      'vieiras',
      'vieira',
      'scallops',
      'scallop',
      'vieiras'
    ],
    defaultUnit: 'kg',
    category: 'seafood'
  },
  {
    id: 'tuna',
    name: 'Atum',
    variations: [
      'atum',
      'tuna',
      'atún'
    ],
    defaultUnit: 'kg',
    category: 'fish'
  },
  {
    id: 'sea_bream',
    name: 'Dourada',
    variations: [
      'dourada',
      'sea bream',
      'dorada'
    ],
    defaultUnit: 'kg',
    category: 'fish'
  }
];

/**
 * Find product by name or variation
 */
export function findProductByName(name: string): Product | undefined {
  const normalizedName = name.toLowerCase().trim();

  return PRODUCT_CATALOG.find(product => {
    // Check main name
    if (product.name.toLowerCase() === normalizedName) {
      return true;
    }

    // Check variations
    return product.variations.some(variation =>
      variation.toLowerCase() === normalizedName
    );
  });
}

/**
 * Get all product names (for autocomplete)
 */
export function getAllProductNames(): string[] {
  return PRODUCT_CATALOG.map(p => p.name);
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCT_CATALOG.find(p => p.id === id);
}
