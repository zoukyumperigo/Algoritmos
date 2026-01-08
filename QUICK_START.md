# ⚡ QUICK START GUIDE

## Get Started in 3 Minutes

### 1. Open the Application
```bash
# Option A: Double-click index.html in file browser
# Option B: Open in browser directly
firefox index.html  # or chrome, safari, etc.
```

### 2. Test Import Feature
The application comes pre-loaded with sample WhatsApp text.

**Steps:**
1. You'll see the "Importar Pedidos" (Import Orders) tab
2. Sample WhatsApp text is already in the text area
3. Click **"🔍 Processar Pedidos"** button
4. Review the parsed orders:
   - ✅ Valid orders shown in white/green
   - ⚠️ Warnings shown in orange
   - ❌ Errors shown in red
5. Click **"✅ Confirmar e Guardar Pedidos"**
6. Orders are now saved!

### 3. View Picking List
1. Click **"📋 Lista de Picking"** tab
2. See the optimized picking list:
   - Organized by **Zone** (Frozen Seafood → Meat → Pre-cooked → Dry)
   - Then by **Product**
   - Then by **Distributor Route**
3. Click **"🖨️ Imprimir"** to open print-friendly view

### 4. Explore Other Features
- **📊 Histórico**: View order history with filters
- **📈 Previsão de Compras**: See purchase forecasting
- **📦 Stock**: Manage product stock levels
- **⚙️ Configurações**: View products, distributors, zones

---

## Example WhatsApp Format

```
J
Restaurante Marazul
10(41/50)

M
Restaurant Panda
20(Rolinhos Primavera)
8(Dumpling Porco)
```

**Format Rules:**
- **Line 1**: Distributor initial (J, M, P, A)
- **Line 2**: Restaurant name
- **Line 3**: Quantity(ProductCode) - can have multiple items

---

## Sample Products Included

### Frozen Seafood
- Camarão 26/30, 41/50, 51/60
- Lulas, Polvo, Salmão, Bacalhau

### Frozen Meat
- Barriga de Porco, Pato, Coxa de Frango, Lombo de Vaca

### Frozen Pre-cooked
- Rolinhos Primavera, Dumplings, Wontons, Bao

### Dry Goods
- Arroz Sushi, Arroz Jasmin, Noodles, Molho Soja

---

## Common Product Aliases

You can use any of these codes:
- `41/50` = `Camarão 41-50` = `Shrimp 41/50` = `4150`
- `26/30` = `Camarão 26-30` = `2630`
- `Rolinhos` = `Rolinhos Primavera` = `Spring Roll`
- `Arroz` = `Arroz Sushi` = `Sushi Rice`
- `Dumpling` = `Dumplings de Porco` = `Pork Dumpling`

---

## Keyboard Shortcuts

- **Ctrl+P**: Print picking list (when on picking view)
- **F12**: Open browser console for diagnostics

---

## Console Commands

Open browser console (F12) and type:

```javascript
// Show system info
showAppInfo()

// Export all data (backup)
exportAllData()

// View current storage
App.storage.loadOrders()
App.storage.loadProducts()

// Add test orders
App.importUI.loadSampleData()
```

---

## Troubleshooting

### Orders not appearing?
- Check if you clicked "Confirmar e Guardar Pedidos"
- Go to Lista de Picking and select "Pendentes" filter

### Product not recognized?
- Add it to the product catalog in Configurações
- Or check if you're using a valid alias

### Need to reset everything?
```javascript
resetAllData() // CAUTION: Deletes all data!
```

### Browser compatibility?
- Works best in Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Enable JavaScript
- Enable LocalStorage

---

## Daily Workflow

### Morning Routine
1. Open application
2. Go to "Importar Pedidos"
3. Copy WhatsApp messages from group
4. Paste and click "Processar Pedidos"
5. Review for errors/warnings
6. Confirm and save
7. Go to "Lista de Picking"
8. Print picking list
9. Give to warehouse operator

### End of Day
1. Update stock levels in "Stock" tab
2. Check "Previsão de Compras" for low stock alerts
3. Export history if needed (CSV)

### Weekly
1. Review "Histórico" for patterns
2. Check forecast for purchasing
3. Backup data: `exportAllData()`

---

## Getting Help

**Console Diagnostics:**
```javascript
showAppInfo()  // Shows version, data counts, storage size
```

**Backup Data:**
```javascript
exportAllData()  // Downloads JSON backup
```

**View Logs:**
- Open Console (F12)
- Look for errors (red text)
- Take screenshot for support

---

## Pro Tips

### Faster Import
- Keep a text file with common orders
- Copy/paste entire file at once
- System handles multiple orders automatically

### Stock Management
- Update stock after each picking session
- Set reorder points wisely
- Check forecast weekly

### Printing
- Use "Lista de Picking" print view
- Set printer to portrait mode
- Black & white printing works fine

### Data Safety
- Export data weekly: `exportAllData()`
- Keep backups in safe location
- Import when switching computers

---

## Next Steps

1. **Customize Products**
   - Edit `src/data/sample-data.js`
   - Or add via Configurações

2. **Configure Distributors**
   - Set correct route priorities
   - Update customer lists

3. **Set Reorder Points**
   - Based on your actual usage
   - Update in Stock tab

4. **Train Team**
   - Show warehouse operator picking list
   - Train sales reps on history view
   - Show purchasing manager forecast

---

## Support

For questions or issues, check:
1. README.md - Comprehensive documentation
2. ARCHITECTURE.md - Technical details
3. Browser console - Error messages

---

**Built for real warehouse operations. Zero tolerance for errors. 🏢**
