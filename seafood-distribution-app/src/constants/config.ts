/**
 * App Configuration Constants
 */

export const CONFIG = {
  // Time configuration
  ORDER_IMPORT_START_HOUR: 15, // 3 PM
  ORDER_IMPORT_END_HOUR: 23, // 11 PM
  MORNING_REMINDER_HOUR: 3, // 3 AM

  // Validation thresholds
  MIN_QUANTITY_WARNING: 1,
  MAX_QUANTITY_WARNING: 500, // kg

  // Sync configuration
  SYNC_INTERVAL: 30000, // 30 seconds
  OFFLINE_RETRY_ATTEMPTS: 3,

  // Import configuration
  MAX_IMPORT_HISTORY: 10,

  // Default values
  DEFAULT_UNIT: 'kg' as const,
  DEFAULT_STATUS: 'available' as const,
};

export const TIME_ZONES = {
  DEFAULT: 'Europe/Lisbon', // Adjust based on your location
};

export const NOTIFICATION_MESSAGES = {
  NEW_ORDER: (count: number) =>
    count === 1
      ? 'Nova encomenda adicionada'
      : `${count} novas encomendas adicionadas`,

  ORDER_ASSIGNED: (restaurant: string, distributor: string) =>
    `${distributor} atribuiu ${restaurant}`,

  DAY_CLOSED: (date: string, count: number) =>
    `Encomendas fechadas para ${date}: ${count} encomendas`,

  MORNING_REMINDER: (count: number) =>
    `Bom dia! ${count} encomendas disponíveis para atribuição`,

  ALL_LOADED: 'Carga completa confirmada',
};
