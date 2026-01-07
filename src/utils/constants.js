/**
 * Application Constants
 * Central location for all configuration values and magic numbers
 * MAINTAINABILITY: Change values here instead of searching through code
 */

const APP_CONSTANTS = {
    // ===== VALIDATION LIMITS =====
    MAX_ORDER_QUANTITY: 10000,              // Maximum boxes per order item
    MIN_ORDER_QUANTITY: 1,                   // Minimum boxes per order item
    MAX_QUANTITY_THRESHOLD: 300,             // Warning threshold for unusual quantities
    MAX_TOTAL_BOXES_WARNING: 600,           // Warning for very large orders

    // ===== FILE UPLOAD LIMITS =====
    MAX_FILE_SIZE_MB: 10,                    // Maximum upload file size (MB)
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,  // Maximum upload file size (bytes)

    // ===== DATABASE LIMITS =====
    MAX_STORAGE_SIZE_MB: 50,                 // Warning threshold for storage usage
    MAX_STORAGE_SIZE_BYTES: 50 * 1024 * 1024,

    // ===== TIMING =====
    DUPLICATE_CHECK_WINDOW_MS: 24 * 60 * 60 * 1000,  // 24 hours for duplicate detection
    DEBOUNCE_DELAY_MS: 300,                           // Default debounce delay
    TOAST_DURATION_MS: 3000,                          // Toast notification duration
    AUTO_SAVE_DELAY_MS: 1000,                         // Auto-save debounce

    // ===== BATCH PROCESSING =====
    BATCH_SIZE: 100,                         // Items per batch for large operations
    CSV_PREVIEW_LINES: 5,                    // Lines to show in CSV preview

    // ===== PRODUCT VALIDATION =====
    MIN_PRODUCT_NAME_LENGTH: 2,
    MAX_PRODUCT_NAME_LENGTH: 100,
    MIN_SKU_LENGTH: 2,
    MAX_SKU_LENGTH: 50,
    AUTO_GENERATED_SKU_LENGTH: 20,

    // ===== RESTAURANT VALIDATION =====
    MIN_RESTAURANT_NAME_LENGTH: 3,
    MAX_RESTAURANT_NAME_LENGTH: 100,

    // ===== DISTRIBUTOR VALIDATION =====
    DISTRIBUTOR_INITIAL_MIN_LENGTH: 1,
    DISTRIBUTOR_INITIAL_MAX_LENGTH: 2,

    // ===== STOCK MANAGEMENT =====
    LOW_STOCK_THRESHOLD: 100,                // Default low stock warning
    REORDER_POINT_DEFAULT: 50,               // Default reorder point

    // ===== PERFORMANCE =====
    MAX_ORDERS_BEFORE_PAGINATION: 1000,      // Implement pagination above this
    LARGE_DATASET_WARNING: 500,              // Warn user about performance

    // ===== SECURITY =====
    ID_RANDOM_BYTES: 8,                      // Bytes for secure random IDs
    MAX_LOGIN_ATTEMPTS: 5,                   // If authentication is added
    SESSION_TIMEOUT_MINUTES: 30,             // Future feature

    // ===== UI =====
    MODAL_ANIMATION_DURATION_MS: 300,
    SCROLL_ANIMATION_DURATION_MS: 500,
    MAX_TOAST_NOTIFICATIONS: 5,              // Maximum simultaneous toasts

    // ===== REGEX PATTERNS =====
    REGEX: {
        DISTRIBUTOR_INITIAL: /^[A-Z]{1,2}$/,
        QUANTITY_LINE: /^\s*(\d+)\s+(.+)$/,
        PRODUCT_SKU: /^[A-Z0-9-_]{2,50}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_PT: /^[0-9]{9}$/,              // Portuguese phone numbers
    },

    // ===== CSV FORMATS =====
    CSV: {
        DELIMITER: ';',                      // Portuguese Excel standard
        ENCODING: 'UTF-8',
        MAX_COLUMNS: 20,
        DANGEROUS_FORMULA_CHARS: ['=', '+', '-', '@', '\t', '\r', '\n'],
    },

    // ===== ERROR MESSAGES =====
    ERRORS: {
        FILE_TOO_LARGE: 'Ficheiro muito grande! Máximo: ',
        INVALID_QUANTITY: 'Quantidade inválida. Deve estar entre ',
        NETWORK_ERROR: 'Erro de rede. Por favor tente novamente.',
        STORAGE_FULL: 'Armazenamento cheio. Por favor limpe dados antigos.',
        INVALID_FILE_TYPE: 'Tipo de ficheiro inválido.',
        PARSE_ERROR: 'Erro ao processar dados. Verifique o formato.',
        DATABASE_ERROR: 'Erro na base de dados. Por favor recarregue a página.',
    },

    // ===== SUCCESS MESSAGES =====
    SUCCESS: {
        ORDER_SAVED: 'Pedido guardado com sucesso!',
        PRODUCT_ADDED: 'Produto adicionado com sucesso!',
        IMPORT_COMPLETE: 'Importação concluída!',
        DATA_EXPORTED: 'Dados exportados com sucesso!',
        SETTINGS_SAVED: 'Configurações guardadas!',
    },

    // ===== DEFAULT VALUES =====
    DEFAULTS: {
        THEME: 'light',
        LANGUAGE: 'pt',
        ITEMS_PER_PAGE: 50,
        SORT_ORDER: 'desc',
        SORT_FIELD: 'timestamp',
    },

    // ===== FEATURE FLAGS =====
    FEATURES: {
        ENABLE_AUTO_SAVE: true,
        ENABLE_OFFLINE_MODE: true,
        ENABLE_ANALYTICS: false,             // Future feature
        ENABLE_NOTIFICATIONS: true,
        DEBUG_MODE: false,                   // Set to false in production
    },

    // ===== ZONE CONSTANTS =====
    ZONES: {
        FROZEN_SEAFOOD_SHRIMP: 'SEAFOOD_SHRIMP',
        FROZEN_SEAFOOD_FISH: 'SEAFOOD_FISH',
        FROZEN_SEAFOOD_OCTOPUS: 'SEAFOOD_OCTOPUS',
        FROZEN_MEAT: 'FROZEN_MEAT',
        FROZEN_PRECOOKED: 'FROZEN_PRECOOKED',
        DRY_GOODS: 'DRY_GOODS',
    },

    // ===== ORDER STATUS =====
    ORDER_STATUS: {
        PENDING: 'pending',
        FULFILLED: 'fulfilled',
        PARTIAL: 'partial',
        CANCELLED: 'cancelled',
    },

    // ===== STOCK STATUS =====
    STOCK_STATUS: {
        OK: 'OK',
        LOW_STOCK: 'LOW_STOCK',
        OUT_OF_STOCK: 'OUT_OF_STOCK',
    },
};

// Make constants immutable (prevent accidental modification)
Object.freeze(APP_CONSTANTS);
Object.freeze(APP_CONSTANTS.REGEX);
Object.freeze(APP_CONSTANTS.CSV);
Object.freeze(APP_CONSTANTS.ERRORS);
Object.freeze(APP_CONSTANTS.SUCCESS);
Object.freeze(APP_CONSTANTS.DEFAULTS);
Object.freeze(APP_CONSTANTS.FEATURES);
Object.freeze(APP_CONSTANTS.ZONES);
Object.freeze(APP_CONSTANTS.ORDER_STATUS);
Object.freeze(APP_CONSTANTS.STOCK_STATUS);

// Export to global scope for easy access
if (typeof window !== 'undefined') {
    window.APP_CONSTANTS = APP_CONSTANTS;
}
