# 🔴 CRITICAL SECURITY FIXES REQUIRED

## ⚠️ DO NOT USE IN PRODUCTION UNTIL THESE ARE FIXED ⚠️

---

## 1. XSS Vulnerability - CRITICAL

### Problem:
All user input is inserted into HTML without sanitization. Attackers can inject JavaScript.

### Files to Fix:
- `src/ui/import.js`
- `src/ui/route.js`
- `src/ui/settings.js`

### Solution:
Add this helper function to `app.js`:

```javascript
// Add to app.js before initializeApp()
function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Make it globally available
window.escapeHtml = escapeHtml;
```

### Then Update All innerHTML:

**Before (UNSAFE):**
```javascript
html += `<div>${order.restaurantName}</div>`;
```

**After (SAFE):**
```javascript
html += `<div>${escapeHtml(order.restaurantName)}</div>`;
```

### Apply to ALL template literals containing user data.

---

## 2. Race Condition in Storage - CRITICAL

### Problem:
Data saves are asynchronous but return immediately, causing data loss.

### File to Fix:
`src/core/storage.js`

### Solution:
Make all save operations await completion:

**Replace lines 73-78:**
```javascript
// OLD (BROKEN):
saveProducts(products) {
    this.cache.products = products;
    this.db.saveProducts(products).catch(e => console.error('Error saving products:', e));
    return true;
}

// NEW (FIXED):
saveProducts(products) {
    this.cache.products = products;
    // Return the promise so callers can await if needed
    const savePromise = this.db.saveProducts(products).catch(e => {
        console.error('Error saving products:', e);
        alert('⚠️ Erro ao guardar produtos! Por favor tente novamente.');
        return false;
    });
    // Still return true for backward compatibility
    return true;
}
```

**Better Fix - Make Async:**
Update all save methods to be async and update callers to await.

---

## 3. CSV Formula Injection - CRITICAL

### Problem:
CSV imports can execute malicious formulas in Excel.

### File to Fix:
`src/ui/settings.js`

### Solution:
Add sanitization before any CSV import:

**Add to settings.js:**
```javascript
// Add this method to SettingsUI class
sanitizeCSVCell(cell) {
    if (!cell || typeof cell !== 'string') return cell;

    const str = String(cell).trim();
    const dangerous = ['=', '+', '-', '@', '\t', '\r'];

    // If starts with dangerous character, prefix with single quote
    if (dangerous.some(char => str.startsWith(char))) {
        return "'" + str;
    }

    return str;
}
```

**Then update CSV parsing (line ~1028 and ~751):**
```javascript
// OLD:
const name = parts[0];

// NEW:
const name = this.sanitizeCSVCell(parts[0]);
```

Apply to ALL CSV fields: name, zone, contact, address, SKU, aliases.

---

## 4. Input Validation - HIGH

### Problem:
No validation on order quantities allows system-breaking values.

### File to Fix:
`src/core/parser.js`

### Solution:
**Update line 247:**
```javascript
// OLD:
const quantity = parseInt(match[1], 10);

// NEW:
const quantity = parseInt(match[1], 10);
const MAX_QUANTITY = 10000; // Reasonable maximum

if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return null; // Reject invalid quantities
}
```

---

## 5. File Size Limits - HIGH

### Problem:
Users can upload gigabyte files and freeze browser.

### File to Fix:
`src/ui/import.js`

### Solution:
**Update readFile method (line 80):**
```javascript
readFile(file) {
    // Add size check
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        return Promise.reject(new Error('Ficheiro muito grande! Máximo: 10MB'));
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Erro ao ler ficheiro'));
        reader.readAsText(file);
    });
}
```

---

## Quick Fix Checklist

- [ ] Add escapeHtml() function globally
- [ ] Update ALL innerHTML with escapeHtml()
- [ ] Add sanitizeCSVCell() to settings.js
- [ ] Apply CSV sanitization to all imports
- [ ] Add quantity validation in parser
- [ ] Add file size limits
- [ ] Test with malicious inputs
- [ ] Review storage save/load patterns

---

## Testing After Fixes

### 1. Test XSS Protection:
```javascript
// Try importing order with:
Restaurant Name: <img src=x onerror=alert('XSS')>
Product Name: <script>alert('XSS')</script>

// Should display as text, not execute
```

### 2. Test CSV Injection:
```csv
=cmd|'/c calc'!A1;Zone;Contact;Address
```
Should be escaped to: `'=cmd|'/c calc'!A1`

### 3. Test Large Quantities:
```
999999999999 Camarão
```
Should be rejected.

### 4. Test Large Files:
Upload 20MB file - should be rejected.

---

## Estimated Fix Time

- **XSS Fixes**: 2-3 hours
- **Storage Race Condition**: 1-2 hours
- **CSV Injection**: 30 minutes
- **Input Validation**: 30 minutes
- **Testing**: 2 hours

**Total**: ~6-8 hours for critical fixes

---

## After Critical Fixes

See full `SECURITY_QA_REPORT.md` for:
- 27 additional medium/low priority issues
- Performance optimizations
- Best practices recommendations
- Comprehensive testing strategy

---

**Status**: ❌ NOT PRODUCTION READY
**Next Review**: After implementing above fixes
