# 🏗️ System Architecture Documentation

## Overview

This warehouse management system is built with a **modular, service-oriented architecture** designed for reliability, maintainability, and warehouse-specific workflows.

---

## Architecture Layers

### 1. Presentation Layer (UI)
**Location:** `/src/ui/`

Responsible for user interface and interaction handling.

```
ImportUI → WhatsApp order import interface
PickingUI → Optimized picking list display
HistoryUI → Order history with filters
ForecastUI → Purchase forecasting dashboard
StockUI → Stock management interface
SettingsUI → Configuration management
```

**Key Principles:**
- Each UI module is self-contained
- Communicates with services via dependency injection
- Refreshes data on view activation
- No direct DOM manipulation in business logic

---

### 2. Business Logic Layer (Core + Services)
**Location:** `/src/core/` and `/src/services/`

#### Core Services (`/src/core/`)

**Parser (`parser.js`)**
- Parses raw WhatsApp text into structured orders
- Handles 3-line format: Distributor/Restaurant/Quantity(Code)
- Error detection for malformed messages
- Multiple order batch processing

```javascript
WhatsAppParser
├── parse(rawText) → Order[]
├── parseOrder(orderData) → Order
├── parseDistributorInitial(line) → string
├── parseRestaurantName(line) → string
└── parseItems(line) → OrderItem[]
```

**Normalizer (`normalizer.js`)**
- Maps product aliases to canonical SKUs
- Fuzzy matching for unknown products
- Fills in product metadata (zone, kg/box, stock)

```javascript
ProductNormalizer
├── findProduct(productCode) → Product
├── normalizeOrder(order, distributors) → Order
├── suggestProducts(code) → Product[]
└── buildAliasMap() → Map<string, SKU>
```

**Validator (`validator.js`)**
- Zero-tolerance error detection
- Stock validation (individual + aggregate)
- Duplicate order detection
- Abnormal quantity flagging

```javascript
OrderValidator
├── validateOrder(order, existing) → Order
├── validateStock(order)
├── validateQuantities(order)
├── validateDuplicates(order)
└── validateCrossOrders(orders) → void
```

**Storage (`storage.js`)**
- LocalStorage abstraction
- CRUD operations for all entities
- Data export/import
- Storage size monitoring

```javascript
StorageService
├── saveProducts(products)
├── loadProducts() → Product[]
├── saveOrders(orders)
├── loadOrders() → Order[]
├── exportData() → JSON
└── importData(json)
```

#### Business Services (`/src/services/`)

**Picker (`picker.js`)**
- Generates optimized picking lists
- Multi-level sorting: Zone → Product → Route
- Aggregates identical products across orders
- Printable HTML generation

```javascript
PickingListOptimizer
├── generatePickingList(orders, filters) → PickingList
├── aggregateByZone(orders) → Map<Zone, Products>
├── sortZones(zoneMap) → Zone[]
└── generatePrintableHTML(list) → HTML
```

**Analytics (`analytics.js`)**
- Historical analysis
- Purchase forecasting (4-week average)
- Stock remaining calculation
- CSV export

```javascript
AnalyticsService
├── generatePurchaseForecast(orders, products) → Forecast
├── getOrderHistory(orders, filters) → Order[]
├── getRestaurantStats(orders, restaurant) → Stats
└── exportToCSV(orders) → CSV
```

---

### 3. Data Layer (Models)
**Location:** `/src/models/`

Domain models with business logic encapsulated.

```javascript
Product
├── Properties: sku, name, aliases, zone, stock, kgPerBox
├── Methods: isLowStock(), boxesToKg(), hasSufficientStock()
└── Serialization: toJSON(), fromJSON()

Order
├── Properties: id, timestamp, distributor, restaurant, items, status
├── Methods: addItem(), addWarning(), addError(), isValid()
└── Aggregation: calculateTotals()

OrderItem
├── Properties: productCode, productSKU, quantity, zone
└── Methods: getTotalKg(), hasSufficientStock()

Distributor
├── Properties: initial, name, routeNumber, customers
└── Methods: hasCustomer(), addCustomer()

SalesRep
├── Properties: id, name, customers, email
└── Methods: hasCustomer(), addCustomer()

Zone
├── Properties: id, name, pickingPriority, location, color
└── Constants: DEFAULT_ZONES
```

---

### 4. Application Controller
**Location:** `app.js`

Orchestrates all modules and manages application state.

```javascript
App (Global State)
├── Services: storage, parser, normalizer, validator, picker, analytics
├── UI Instances: importUI, pickingUI, historyUI, forecastUI, stockUI, settingsUI
├── State: currentView, currentSalesRep
└── Utilities: initializeApp(), switchView(), exportAllData()
```

**Initialization Flow:**
```
1. initializeSampleData()
2. Initialize core services (storage, parser, validator)
3. Load data (products, distributors, zones)
4. Initialize business services (normalizer, picker, analytics)
5. Initialize UI modules
6. Setup navigation and event handlers
7. Ready for user interaction
```

---

## Data Flow

### Order Import Flow

```
1. User pastes WhatsApp text
   ↓
2. WhatsAppParser.parse(text)
   → Extracts orders (distributor, restaurant, items)
   ↓
3. ProductNormalizer.normalizeOrder(order)
   → Maps product codes to SKUs
   → Fills in product metadata
   ↓
4. OrderValidator.validateOrder(order)
   → Checks stock availability
   → Detects anomalies (high qty, duplicates)
   → Flags errors/warnings
   ↓
5. User reviews parsed orders
   ↓
6. StorageService.addOrders(validOrders)
   → Saves to LocalStorage
   ↓
7. PickingUI refreshes
   → Generates optimized list
```

### Picking List Generation Flow

```
1. StorageService.loadOrders()
   → Get all pending orders
   ↓
2. PickingListOptimizer.generatePickingList(orders)
   ↓
   a. Filter orders (by date, status, sales rep)
   b. Aggregate items by zone
   c. Group by product
   d. Sort by route priority
   e. Calculate totals
   ↓
3. Display optimized picking list
   → Zone → Product → Distributor → Restaurant
   ↓
4. User can print warehouse-friendly view
```

### Forecasting Flow

```
1. AnalyticsService.generatePurchaseForecast()
   ↓
2. Filter orders (last 4 weeks)
   ↓
3. Aggregate demand by product
   → Total ordered, order count, weekly average
   ↓
4. Load current stock levels
   ↓
5. Calculate:
   → Weeks remaining = stock / weekly average
   → Recommended order = (4 weeks * avg) - stock
   → Urgency level (CRÍTICO, URGENTE, ATENÇÃO, OK)
   ↓
6. Display forecast with recommendations
```

---

## Key Design Patterns

### 1. **Dependency Injection**
UI modules receive services via constructor:
```javascript
const importUI = new ImportUI(storage, parser, normalizer, validator);
```

**Benefits:**
- Loose coupling
- Easy testing
- Modular replacement

### 2. **Service Layer Pattern**
Business logic separated from UI:
```javascript
// UI calls service
const pickingList = picker.generatePickingList(orders, filters);

// Service handles complexity
class PickingListOptimizer {
    generatePickingList(orders, filters) {
        // Complex business logic here
    }
}
```

**Benefits:**
- Reusable logic
- Single responsibility
- Testable in isolation

### 3. **Data Transfer Objects (DTOs)**
Models serialize to plain objects:
```javascript
// Save
const json = product.toJSON();
storage.save('products', json);

// Load
const product = Product.fromJSON(json);
```

**Benefits:**
- Storage independence
- Version migration support
- Data validation

### 4. **Observer Pattern (Event-Driven)**
UI modules communicate via global references:
```javascript
// After saving orders
if (window.pickingUI) {
    window.pickingUI.refresh();
}
```

**Benefits:**
- Loose coupling
- Dynamic updates
- Extensible

---

## Critical Algorithms

### 1. Product Normalization Algorithm

**Problem:** Map `"41/50"` → `"SHRMP-41-50"` (SKU)

**Solution:**
```javascript
1. Normalize input: "41/50" → "4150" (remove non-alphanumeric)
2. Build alias map: Map<normalized_alias, SKU>
3. Lookup: aliasMap.get("4150") → "SHRMP-41-50"
4. If not found: fuzzy match with Levenshtein distance
```

**Time Complexity:** O(1) for exact match, O(n) for fuzzy

### 2. Picking List Optimization Algorithm

**Problem:** Sort orders for efficient warehouse picking

**Solution:**
```javascript
1. Aggregate items by zone
   → Map<Zone, Map<Product, Array<Distributor>>>

2. For each zone:
   a. Sort products alphabetically
   b. For each product:
      - Group by distributor
      - Sort distributors by routePriority
   c. Calculate zone totals

3. Sort zones by pickingPriority
```

**Time Complexity:** O(n log n) where n = number of items

### 3. Cross-Order Stock Validation

**Problem:** Detect if total demand exceeds stock across ALL orders

**Solution:**
```javascript
1. Aggregate demand: Map<SKU, totalQuantity>
2. For each product:
   if (totalDemand > stock):
       → Add warning to ALL affected orders
```

**Time Complexity:** O(n + m) where n = items, m = products

### 4. Purchase Forecasting Algorithm

**Problem:** Recommend order quantity based on historical demand

**Solution:**
```javascript
1. Filter orders: last 4 weeks
2. Aggregate by product: totalOrdered, orderCount
3. Calculate:
   weeklyAvg = totalOrdered / 4
   weeksRemaining = currentStock / weeklyAvg
   recommendedOrder = max(0, (4 * weeklyAvg) - currentStock)
4. Determine urgency:
   if weeksRemaining < 1: CRÍTICO
   if weeksRemaining < 2: URGENTE
   if weeksRemaining < 4: ATENÇÃO
   else: OK
```

**Time Complexity:** O(n) where n = number of orders

---

## Performance Considerations

### LocalStorage Limits
- **Maximum:** ~5-10 MB per domain
- **Current usage:** Displayed via `storage.getStorageSize()`
- **Recommendation:** Monitor, export old orders periodically

### Rendering Optimization
- **Virtual scrolling:** Not implemented (manageable data size)
- **Lazy loading:** Not needed for current scale
- **Print optimization:** Separate print stylesheet

### Browser Compatibility
- **Target:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features used:** ES6, LocalStorage, CSS Grid
- **No polyfills needed** for modern browsers

---

## Security Considerations

### Data Storage
- **Location:** Browser LocalStorage (client-side only)
- **Encryption:** None (local app, no transmission)
- **Access:** Only accessible to same domain

### Input Validation
- **WhatsApp text:** Sanitized during parsing
- **Product codes:** Normalized and validated
- **Quantities:** Min/max validation

### XSS Prevention
- **Template literals:** All user input escaped
- **innerHTML:** Used sparingly, only with trusted data
- **Event handlers:** Bound programmatically

---

## Testing Strategy

### Manual Testing Checklist

**Import Module:**
- [ ] Parse valid WhatsApp text
- [ ] Handle malformed messages
- [ ] Detect unmapped products
- [ ] Flag stock shortages
- [ ] Identify duplicate orders

**Picking Module:**
- [ ] Generate optimized list
- [ ] Correct zone ordering
- [ ] Route priority respected
- [ ] Totals calculated correctly
- [ ] Print layout functional

**Forecast Module:**
- [ ] 4-week analysis accurate
- [ ] Urgency levels correct
- [ ] Recommendations reasonable
- [ ] Handles zero-demand products

**Stock Module:**
- [ ] Display all products
- [ ] Update stock correctly
- [ ] Trigger forecast refresh

**History Module:**
- [ ] Filters work correctly
- [ ] CSV export complete
- [ ] Date range filtering

### Automated Testing (Future)
- Unit tests for core algorithms
- Integration tests for workflows
- E2E tests for critical paths

---

## Scalability

### Current Scale
- **Orders:** Handles 1000s of orders efficiently
- **Products:** 100-500 products supported
- **History:** 1-2 years of data

### Scale-Up Recommendations

**If orders > 10,000:**
- Implement pagination in history view
- Add database backend (SQLite, PostgreSQL)
- Move to server-side processing

**If products > 1,000:**
- Implement product search/filter
- Add virtual scrolling
- Optimize alias map with trie structure

**If users > 10:**
- Add authentication system
- Implement role-based access control
- Multi-tenant architecture

---

## Deployment

### Current (Local Web App)
```
1. Open index.html in browser
2. Data stored in LocalStorage
3. No server required
```

### Future (Hosted Web App)
```
1. Deploy to web server (Apache, Nginx)
2. Add HTTPS certificate
3. Optional: Add authentication
4. Optional: Backend API
```

### Mobile App (Future)
```
1. Wrap in Cordova/Capacitor
2. Package as native app (iOS/Android)
3. Use same codebase
4. Add mobile-specific features
```

---

## Maintenance

### Data Backup
```javascript
// Backup
exportAllData(); // Downloads JSON

// Restore
importAllData(file); // Uploads JSON
```

### Updating Products
- Edit `src/data/sample-data.js`
- Or use browser console: `App.storage`

### Version Migration
- Check LocalStorage version on load
- Apply migrations if needed
- Preserve user data

---

## Conclusion

This architecture prioritizes:
1. **Reliability** - Zero tolerance for errors
2. **Simplicity** - Easy to understand and maintain
3. **Modularity** - Components can be replaced independently
4. **Performance** - Fast enough for daily warehouse use
5. **Extensibility** - Easy to add new features

**Built for real-world warehouse operations with logistics expertise.**
