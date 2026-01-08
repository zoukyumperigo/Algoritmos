# 🚚 Route Management Guide

## Overview

The **Route Management (Gestão de Rotas)** feature allows you to view all pending orders grouped by courier and **manually reassign orders to different couriers** with a single click.

This is essential for:
- ✅ Handling last-minute driver changes
- ✅ Balancing workload between distributors
- ✅ Adjusting routes due to capacity constraints
- ✅ Reassigning orders when a distributor is unavailable

---

## How to Access

1. Open the application
2. Click **"🚚 Gestão de Rotas"** in the navigation menu
3. You'll see all pending orders grouped by courier

---

## Interface Overview

### Route Summary (Top)
Shows overall statistics:
- **Total Pedidos**: Total number of pending orders
- **Distribuidores Ativos**: Number of active couriers with orders

### Courier Sections
Each courier has a dedicated section showing:

```
🚚 João
Rota 1 | Prioridade: 1
5 pedidos | 3 restaurantes

Total Caixas: 120 | Total Kg: 1,800

┌──────────────────────────────────────────────────────┐
│ Restaurante          │ Produtos      │ Caixas │ Ação │
├──────────────────────────────────────────────────────┤
│ Restaurante Marazul  │ 10x Camarão   │   10   │ 🔄   │
│ Golden Dragon        │ 5x Arroz...   │   25   │ 🔄   │
└──────────────────────────────────────────────────────┘
```

---

## How to Reassign an Order

### Step-by-Step Process

**1. Find the Order**
- Locate the order you want to reassign in the courier's section
- Note the restaurant name

**2. Click "🔄 Mudar Rota"**
- Click the orange **"🔄 Mudar Rota"** button for that order
- A dialog will appear

**3. Select New Courier**
```
MUDAR ROTA

Pedido: Restaurante Marazul
Distribuidor atual: João

Selecione o novo distribuidor:

1. João (J) - Rota 1
2. Maria (M) - Rota 2
3. Paulo (P) - Rota 3
4. Ana (A) - Rota 4

Digite o número (1-4):
```

**4. Confirm the Change**
```
Confirma mudança de rota?

Restaurante Marazul
DE: João
PARA: Maria (Rota 2)
```

**5. Done!**
```
✅ Rota alterada com sucesso!

Restaurante Marazul → Maria
```

The view will automatically refresh, and the order will now appear under Maria's section.

---

## Real-World Examples

### Example 1: Driver Unavailable
**Scenario:** João calls in sick, you need to redistribute his orders.

**Steps:**
1. Go to **Gestão de Rotas**
2. Find João's section with 5 orders
3. For each order, click **"🔄 Mudar Rota"**
4. Reassign to Maria, Paulo, or Ana based on capacity
5. Orders are now distributed to available drivers

### Example 2: Workload Balance
**Scenario:** Maria has 15 orders, João only has 3. Balance the load.

**Steps:**
1. Go to **Gestão de Rotas**
2. Identify heavy orders in Maria's section
3. Reassign 5-6 orders to João
4. Both drivers now have ~9 orders each

### Example 3: Route Optimization
**Scenario:** A restaurant on Maria's route is closer to João's route.

**Steps:**
1. Find the restaurant order in Maria's section
2. Click **"🔄 Mudar Rota"**
3. Reassign to João
4. João will now deliver to that restaurant more efficiently

---

## Integration with Other Features

### Automatic Updates

When you reassign an order:

✅ **Route Management**: Immediately reflects the change
✅ **Lista de Picking**: Automatically regenerates with new routes
✅ **Histórico**: Records the original distributor

### Workflow Integration

**Complete Order Management Flow:**

```
1. Importar Pedidos (WhatsApp)
   ↓
2. Gestão de Rotas (Adjust if needed)
   ↓
3. Lista de Picking (Optimized for new routes)
   ↓
4. Print & Pick
```

---

## Features

### Visual Highlights

- **Gradient Headers**: Each courier has a distinct blue gradient header
- **Hover Effects**: Rows highlight on hover for easy tracking
- **Smooth Animations**: Sections fade in smoothly
- **Responsive Design**: Works on desktop and tablets

### Smart Grouping

Orders are automatically grouped by:
1. **Courier** (primary grouping)
2. **Restaurant** (within each courier)
3. **Products** (shown as line items)

### Comprehensive Totals

For each courier, you see:
- Number of orders
- Number of unique restaurants
- Total boxes
- Total weight (kg)

---

## Technical Details

### Data Persistence

- All route changes are **saved immediately** to LocalStorage
- Changes persist across browser sessions
- Export/import includes route assignments

### Validation

- Cannot reassign to same courier (redundant)
- Confirmation required before change
- All distributors must be configured in system

### Performance

- Instant updates (no server delay)
- Lightweight (no API calls)
- Scales to 100+ orders easily

---

## Keyboard Shortcuts

When reassignment dialog is open:
- **1-9**: Select distributor by number
- **Enter**: Confirm selection
- **Esc**: Cancel reassignment

---

## Tips & Best Practices

### Daily Operations

✅ **Check Routes First Thing**
- Open Route Management after importing orders
- Verify workload balance before printing picking lists

✅ **Communicate Changes**
- After reassigning, inform the drivers
- Print updated picking lists

✅ **Use for Emergencies**
- Keep system open during delivery hours
- Quick reassignment for last-minute changes

### Strategic Planning

📊 **Analyze Patterns**
- Track which restaurants order frequently
- Optimize fixed customer-courier assignments

📦 **Capacity Planning**
- Monitor total boxes per courier
- Aim for balanced loads (~100-150 boxes each)

🚚 **Route Efficiency**
- Group nearby restaurants under same courier
- Minimize backtracking and long drives

---

## Troubleshooting

### Order Not Appearing?
- Check if order status is "pending"
- Only pending orders show in route management

### Can't Reassign?
- Ensure distributors are configured in Settings
- Check browser console for errors

### Changes Not Reflecting?
- Click **"🔄 Atualizar"** to refresh view
- Check picking list view to confirm change

### Lost Track of Original Courier?
- Check **Histórico** (History) tab
- Original distributor is recorded

---

## Advanced Features (Future)

**Planned Enhancements:**
- 🗺️ Map view showing delivery locations
- 📊 Route optimization suggestions (AI)
- 📱 Mobile app for drivers
- 🔔 Push notifications for route changes
- 📍 GPS tracking of deliveries

---

## Support

For assistance:
1. Click **"🔄 Atualizar"** to refresh data
2. Check browser console (F12) for errors
3. Verify all distributors are configured in **Configurações**

---

## Summary

**Route Management gives you complete control:**

✅ View all orders by courier
✅ See workload distribution instantly
✅ Reassign orders in seconds
✅ Balance routes dynamically
✅ Handle emergencies efficiently

**This feature ensures operational flexibility while maintaining the optimized picking workflow.**

---

**Built for real warehouse operations. Zero downtime. Maximum flexibility. 🚚**
