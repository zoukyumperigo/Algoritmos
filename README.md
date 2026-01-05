# 🏢 Warehouse Management System for Frozen Foods

**A production-ready warehouse optimization system designed for frozen food distributors serving Chinese restaurants in Portugal.**

Built with **zero tolerance for warehouse errors** - optimized for daily operations by logistics directors.

---

## 📋 Table of Contents

1. [Business Context](#business-context)
2. [Features](#features)
3. [Quick Start](#quick-start)
4. [User Guide](#user-guide)
5. [Architecture](#architecture)
6. [Data Models](#data-models)
7. [Development](#development)
8. [Next-Level Automation](#next-level-automation)

---

## 🎯 Business Context

### Company Profile
- **Products**: Frozen seafood, frozen meat, frozen pre-cooked items, dry goods (sushi rice)
- **Customers**: Chinese restaurants and wholesale resellers in Portugal
- **Team**: 7 people (1 warehouse operator, 2 sales reps, 2 distributors, 1 admin, 1 purchasing manager)

### Problem Statement
- Orders come via **WhatsApp** (unstructured text)
- Manual picking leads to **errors** and **delays**
- No **stock validation** before fulfillment
- No **purchase forecasting** or historical intelligence
- Picking not optimized by **warehouse zones** or **delivery routes**

### Solution Goals
✅ Reduce picking time
✅ Eliminate human error
✅ Improve purchase planning
✅ Optimize warehouse operations

---

## ✨ Features

### 🔥 Core Features (A-Tier)

#### 1. **WhatsApp Order Import**
- Parse raw WhatsApp messages
- Handle multiple orders in batch
- Support file upload (.txt)
- Visual error flagging

**Input Format** (exactly 3 lines per order):
```
J
Restaurante Marazul
10(41/50)
```
- Line 1: Distributor initial
- Line 2: Restaurant name
- Line 3: Quantity(ProductCode)

#### 2. **Product Normalization**
- Map multiple product names to single SKU
- Example: `"41/50"`, `"Camarão 41-50"`, `"Shrimp 41/50"` → same SKU
- Fuzzy matching with suggestions
- Auto-complete for unmapped products

#### 3. **Stock Validation**
- Real-time stock checking
- **Critical alerts** for out-of-stock items
- **Warnings** for insufficient stock
- Partial fulfillment suggestions

#### 4. **Warehouse Zone Management**
Four zones with picking priority:
1. **Frozen Seafood** (picked first)
2. **Frozen Meat**
3. **Frozen Pre-cooked**
4. **Dry Goods** (picked last)

#### 5. **Route Optimization**
- Each distributor has a predefined delivery route
- Picking list ordered by: **Zone → Product → Distributor Route**
- Ensures efficient warehouse flow

#### 6. **Error Prevention**
Automatic detection of:
- ❌ Abnormally high quantities (> 300 boxes)
- ❌ Unknown/unmapped products
- ❌ Duplicate orders for same restaurant
- ❌ Stock shortages across all orders

### ⚡ Power Features (B-Tier)

#### 7. **Order History**
- Complete historical record
- Filter by:
  - Restaurant
  - Sales rep
  - Distributor
  - Product
  - Date range
- Export to CSV

#### 8. **Sales Rep Mode**
- Each sales rep sees only their customers
- Filtered views and reports
- No authentication needed (selector-based)

#### 9. **Box ↔ Kg Conversion**
- Automatic conversion for each product
- Display totals in both units
- Essential for purchase decisions

#### 10. **Purchase Forecasting**
- Analyzes last **4 weeks** of orders
- Suggests optimal purchase quantities
- Shows:
  - Weekly average demand
  - Current stock levels
  - Weeks of stock remaining
  - Recommended order quantity
  - Urgency levels (CRÍTICO, URGENTE, ATENÇÃO, OK)

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No server required - runs entirely in browser
- No installation needed

### Installation

1. **Download or clone** this repository
2. **Open `index.html`** in your web browser
3. **That's it!** The system is ready to use

### First Use

The system comes with **sample data** pre-loaded:
- 21 products (seafood, meat, pre-cooked, dry goods)
- 4 distributors with routes
- 3 sales representatives
- Sample orders for testing

To test import functionality:
1. Go to **"Importar Pedidos"** tab
2. Click **"Processar Pedidos"** (sample text is pre-filled)
3. Review parsed orders
4. Click **"Confirmar e Guardar Pedidos"**
5. Go to **"Lista de Picking"** to see optimized list

---

## 📖 User Guide

### 1. Importing Orders (Importar Pedidos)

**Method A: Paste Text**
1. Copy WhatsApp messages
2. Paste into text area
3. Click "Processar Pedidos"
4. Review errors/warnings
5. Confirm to save

**Method B: Upload File**
1. Save WhatsApp messages as `.txt`
2. Click "Carregar Ficheiro"
3. Select file
4. Click "Carregar e Processar"

**Error Handling:**
- 🔴 **ERRORS**: Orders will NOT be saved (fix required)
- 🟠 **WARNINGS**: Orders can be saved (review recommended)
- 🟢 **VALID**: Orders ready to save

### 2. Picking List (Lista de Picking)

**View Options:**
- **Hoje**: Today's pending orders
- **Pendentes**: All pending orders
- **Todos**: All orders (including fulfilled)

**Layout:**
- Grouped by **Zone** (color-coded)
- Sorted by **Product** (alphabetically)
- Then by **Distributor Route** (delivery order)
- Shows **Restaurant**, **Quantity**, **Kg**

**Printing:**
- Click **"Imprimir"**
- Opens print-friendly view
- High contrast, large fonts
- Optimized for warehouse use

### 3. Order History (Histórico)

**Filters:**
- Date range
- Restaurant name
- Distributor
- Product
- Sales representative

**Export:**
- Click **"Exportar CSV"**
- Opens spreadsheet-compatible file
- All order details included

### 4. Purchase Forecast (Previsão de Compras)

**Analysis Period:** Last 4 weeks

**Metrics per Product:**
- **Current Stock**
- **Weekly Average** (boxes sold per week)
- **Weeks Remaining** (stock ÷ weekly avg)
- **Recommended Order** (4 weeks supply - current stock)

**Urgency Levels:**
- 🔴 **CRÍTICO**: < 1 week of stock
- 🟠 **URGENTE**: < 2 weeks of stock
- 🟡 **ATENÇÃO**: < 4 weeks of stock
- 🟢 **OK**: > 4 weeks of stock

### 5. Stock Management (Stock)

**View:**
- All products with current stock
- Zone assignment
- Reorder points
- Stock status (OK, LOW, OUT)

**Update Stock:**
- Click **"Editar"** on any product
- Enter new stock quantity
- Forecast updates automatically

### 6. Settings (Configurações)

**Tabs:**
- **Produtos**: View all products and aliases
- **Distribuidores**: View distributors and routes
- **Vendedores**: View sales reps and customers
- **Zonas**: View warehouse zones

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     WAREHOUSE OPERATIONS                     │
│                    (Desktop Web Application)                 │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │ IMPORT  │          │ PICKING │          │ANALYTICS│
   │  MODULE │          │  MODULE │          │ MODULE  │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                     │                     │
   ┌────▼─────────────────────▼─────────────────────▼────┐
   │              CORE BUSINESS LOGIC                     │
   │  • Parser      • Validator    • Optimizer           │
   │  • Normalizer  • Zone Manager • Route Manager       │
   └────┬─────────────────────┬─────────────────────┬────┘
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  DATA   │          │ STORAGE │          │  ERROR  │
   │ MODELS  │          │ SERVICE │          │ HANDLER │
   └─────────┘          └─────────┘          └─────────┘
```

### Technology Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3 (with CSS Grid and Flexbox)

**Storage:**
- LocalStorage API (browser-based)
- JSON serialization
- No server required

**No Build Tools:**
- No webpack, npm, or node.js required
- Pure web standards
- Works offline

### File Structure

```
/
├── index.html              # Main HTML file
├── styles.css              # Warehouse-optimized styles
├── app.js                  # Main application controller
│
├── src/
│   ├── core/              # Core business logic
│   │   ├── parser.js      # WhatsApp text parser
│   │   ├── normalizer.js  # Product normalization
│   │   ├── validator.js   # Order validation
│   │   └── storage.js     # LocalStorage service
│   │
│   ├── models/            # Data models
│   │   ├── Product.js     # Product model
│   │   ├── Order.js       # Order & OrderItem models
│   │   ├── Distributor.js # Distributor & SalesRep models
│   │   └── Zone.js        # Zone model
│   │
│   ├── services/          # Business services
│   │   ├── picker.js      # Picking list optimizer
│   │   └── analytics.js   # Analytics & forecasting
│   │
│   ├── ui/                # UI modules
│   │   ├── import.js      # Import interface
│   │   ├── picking.js     # Picking list interface
│   │   ├── history.js     # History interface
│   │   ├── forecast.js    # Forecast interface
│   │   ├── stock.js       # Stock management interface
│   │   └── settings.js    # Settings interface
│   │
│   └── data/              # Sample data
│       └── sample-data.js # Pre-loaded sample data
│
└── README.md              # This file
```

---

## 📊 Data Models

### Product
```javascript
{
  sku: "SHRMP-41-50",
  name: "Camarão 41/50",
  aliases: ["41/50", "Camarão 41-50", "Shrimp 41/50"],
  zone: "FROZEN_SEAFOOD",
  currentStock: 380,
  kgPerBox: 15,
  boxesPerPallet: 40,
  reorderPoint: 100,
  supplier: "Atlantic Seafood Ltd"
}
```

### Order
```javascript
{
  id: "ORD-1234567890-abc123",
  timestamp: "2026-01-05T10:30:00Z",
  distributorInitial: "J",
  distributorName: "João",
  restaurantName: "Restaurante Marazul",
  items: [
    {
      productCode: "41/50",
      productSKU: "SHRMP-41-50",
      productName: "Camarão 41/50",
      quantity: 10,
      zone: "FROZEN_SEAFOOD",
      kgPerBox: 15,
      isMapped: true
    }
  ],
  salesRep: "Carlos Silva",
  status: "pending",
  warnings: [],
  errors: [],
  totalBoxes: 10,
  totalKg: 150
}
```

### Distributor
```javascript
{
  initial: "J",
  name: "João",
  routeNumber: 1,
  routePriority: 1,
  customers: ["Restaurante Marazul", "Golden Dragon"],
  deliveryDays: ["Mon", "Wed", "Fri"],
  phone: "+351 912 345 678"
}
```

### Zone
```javascript
{
  id: "FROZEN_SEAFOOD",
  name: "Frozen Seafood",
  pickingPriority: 1,
  location: "Warehouse Section A",
  color: "#0ea5e9",
  temperature: "FROZEN"
}
```

---

## 🔧 Development

### Adding New Products

1. Go to **Configurações → Produtos**
2. Note the data structure
3. Add to `sample-data.js` or use browser console:

```javascript
const newProduct = new Product({
    sku: "NEW-SKU-001",
    name: "New Product Name",
    aliases: ["Alias1", "Alias2"],
    zone: "FROZEN_SEAFOOD",
    currentStock: 100,
    kgPerBox: 10,
    boxesPerPallet: 40,
    reorderPoint: 30,
    supplier: "Supplier Name"
});

const products = App.storage.loadProducts();
products.push(newProduct);
App.storage.saveProducts(products);
location.reload(); // Reload to apply changes
```

### Modifying Validation Rules

Edit `src/core/validator.js`:

```javascript
const validator = new OrderValidator({
    maxQuantityThreshold: 300,  // Change max quantity
    duplicateCheckWindow: 24 * 60 * 60 * 1000, // 24 hours
    minQuantity: 1
});
```

### Exporting/Importing Data

**Export** (backup):
```javascript
exportAllData(); // Downloads JSON file
```

**Import** (restore):
```javascript
// Use file upload or:
const input = document.createElement('input');
input.type = 'file';
input.onchange = e => importAllData(e.target.files[0]);
input.click();
```

### Resetting Data

```javascript
resetAllData(); // CAUTION: Deletes everything!
```

---

## 🚀 Next-Level Automation

### Immediate Improvements (0-3 months)

1. **WhatsApp API Integration**
   - Direct integration with WhatsApp Business API
   - Auto-import orders without copy/paste
   - Estimated effort: 2-3 weeks
   - Cost: ~€500-1000 setup + €40/month

2. **Barcode Scanner Integration**
   - Scan products during picking
   - Real-time verification
   - Reduces picking errors to near-zero
   - Estimated effort: 1 week
   - Cost: €200-400 per scanner

3. **Automatic Stock Deduction**
   - After picking completion, auto-deduct stock
   - Prevents over-selling
   - Estimated effort: 2-3 days

### Medium-Term (3-6 months)

4. **Barcode Printing**
   - Generate picking labels
   - Print distributor route labels
   - Estimated effort: 1 week
   - Cost: €300-600 for printer

5. **Email Notifications**
   - Send picking lists to warehouse operator
   - Alert purchasing manager on low stock
   - Estimated effort: 1 week

6. **Mobile App**
   - Native mobile app for warehouse operator
   - Larger buttons, voice commands
   - Estimated effort: 4-6 weeks

### Advanced (6-12 months)

7. **ERP Integration**
   - Connect to accounting system
   - Automatic invoicing
   - Estimated effort: 4-8 weeks

8. **Machine Learning Forecasting**
   - Predict demand based on seasonality
   - Optimize reorder points dynamically
   - Estimated effort: 6-8 weeks

9. **GPS Route Optimization**
   - Optimize distributor routes automatically
   - Real-time traffic consideration
   - Estimated effort: 4-6 weeks

10. **IoT Temperature Monitoring**
    - Monitor freezer temperatures
    - Alert on temperature deviations
    - Estimated effort: 2-3 weeks
    - Cost: €500-1000 per sensor

---

## 📞 Support

For issues or questions:
1. Check console for errors (F12 → Console)
2. Run `showAppInfo()` in console for diagnostics
3. Export data for backup: `exportAllData()`

---

## 📄 License

This system is designed for internal warehouse operations. Modify and adapt as needed for your business.

---

## 🎯 Design Principles

1. **Reliability > Aesthetics** - Function over form
2. **Speed > Features** - Fast operations critical for warehouse
3. **Accuracy > Everything** - Zero tolerance for errors
4. **Simple > Complex** - Warehouse operators need clarity
5. **Offline-First** - No internet dependency

---

**Built for real warehouse operations. Tested with frozen food distribution workflows.**

🏢 **Zero tolerance for warehouse errors. Designed by logistics directors, for logistics directors.**
