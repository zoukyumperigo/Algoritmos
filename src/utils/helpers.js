/**
 * Utility Helpers
 * Common utility functions for security, validation, and formatting
 */

/**
 * HTML Sanitization - Prevents XSS attacks
 * CRITICAL: Use this for ALL user-generated content before inserting into HTML
 *
 * @param {any} unsafe - Potentially unsafe user input
 * @returns {string} - HTML-safe string
 *
 * @example
 * html += `<div>${escapeHtml(order.restaurantName)}</div>`;
 */
function escapeHtml(unsafe) {
    if (unsafe == null) return '';

    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * CSV Cell Sanitization - Prevents formula injection
 * Excel/LibreOffice execute formulas starting with =, +, -, @
 *
 * @param {string} cell - CSV cell content
 * @returns {string} - Sanitized cell content
 *
 * @example
 * const name = sanitizeCSVCell(parts[0]);
 */
function sanitizeCSVCell(cell) {
    if (!cell || typeof cell !== 'string') return cell;

    const str = String(cell).trim();
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];

    // If starts with dangerous character, prefix with single quote to neutralize
    if (dangerousChars.some(char => str.startsWith(char))) {
        return "'" + str;
    }

    return str;
}

/**
 * Debounce function - Prevents excessive function calls
 * Useful for search inputs, resize handlers, etc.
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 *
 * @example
 * const debouncedSearch = debounce(searchFunction, 300);
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - Limits function execution rate
 * Ensures function runs at most once per interval
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between calls
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validate quantity input
 * Ensures quantity is within safe bounds
 *
 * @param {number} quantity - Quantity to validate
 * @param {number} max - Maximum allowed quantity
 * @returns {boolean} - True if valid
 */
function isValidQuantity(quantity, max = window.APP_CONSTANTS?.MAX_ORDER_QUANTITY || 10000) {
    return Number.isFinite(quantity) &&
           quantity >= 1 &&
           quantity <= max;
}

/**
 * Format file size for display
 *
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file size
 *
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Object} - {valid: boolean, message: string}
 */
function validateFileSize(file, maxSizeMB = 10) {
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
        return {
            valid: false,
            message: `Ficheiro muito grande! Tamanho: ${formatFileSize(file.size)}, Máximo: ${maxSizeMB}MB`
        };
    }

    return { valid: true, message: '' };
}

/**
 * Generate cryptographically secure ID
 * Uses Web Crypto API for security
 *
 * @param {string} prefix - ID prefix
 * @returns {string} - Secure random ID
 */
function generateSecureId(prefix = 'ID') {
    const timestamp = Date.now();
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    const randomHex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');

    return `${prefix}-${timestamp}-${randomHex}`;
}

/**
 * Deep clone object (simple implementation)
 * Handles JSON-serializable objects only
 *
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        console.error('Deep clone failed:', e);
        return obj;
    }
}

/**
 * Safe array access - prevents undefined errors
 *
 * @param {Array} arr - Array to access
 * @param {number} index - Index to access
 * @param {any} defaultValue - Default if not found
 * @returns {any} - Array element or default
 */
function safeArrayAccess(arr, index, defaultValue = null) {
    if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
        return defaultValue;
    }
    return arr[index];
}

/**
 * Show toast notification (better than alert)
 * Creates temporary notification overlay
 *
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Batch operations helper - prevents UI blocking
 * Processes large arrays in chunks with delays
 *
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each item
 * @param {number} batchSize - Items per batch
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} - Resolves when complete
 */
async function batchProcess(items, processor, batchSize = 100, onProgress = null) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        for (const item of batch) {
            results.push(await processor(item));
        }

        if (onProgress) {
            onProgress(Math.min(i + batchSize, items.length), items.length);
        }

        // Yield to browser to prevent freezing
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
}

/**
 * Retry async operation with exponential backoff
 * Useful for network operations
 *
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} - Result or throws error
 */
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Add CSS for toast animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
