# 🦐 Seafood Distribution App

A comprehensive mobile order management application for seafood distribution businesses. Built with React Native, Expo, and Firebase.

## 📋 Features

### Core Functionality

1. **WhatsApp Order Import**
   - Copy-paste orders from WhatsApp group conversations
   - Intelligent parsing of multiple order formats
   - Automatic product recognition with variations
   - Preview and edit before confirming
   - Duplicate detection

2. **Dashboard with Two Modes**
   - **Tomorrow Tab**: Active by default after 3 PM for next-day orders
   - **Today Tab**: Current day deliveries in progress
   - Real-time order status updates
   - Summary statistics

3. **Order Assignment System**
   - Distributors can "pull" (claim) available orders
   - Real-time sync across all users
   - View assigned distributor for each order
   - Release orders when needed

4. **Cargo Confirmation - Dual Views**
   - **Total View**: Aggregated products across all orders
   - **By Restaurant View**: Products organized by client
   - Toggle between views with synchronized checkboxes
   - Confirm individual products or entire load

5. **Role-Based Access**
   - **Admin/Manager**: Import orders, view all orders, reassign
   - **Distributor**: View available orders, claim orders, confirm cargo

6. **Additional Features**
   - Offline-first architecture
   - Dark mode for early morning warehouse use
   - Client management with address history
   - Delivery proof photo capture
   - GPS navigation integration
   - Push notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Firebase account (free tier works)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd seafood-distribution-app
   npm install
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Add a Web app to your project
   - Copy the configuration
   - Rename `src/config/firebase.example.ts` to `src/config/firebase.ts`
   - Paste your Firebase config

3. **Configure Firebase Services**

   In Firebase Console:

   - **Authentication**:
     - Enable Email/Password provider
     - Create users for testing

   - **Firestore Database**:
     - Create database in production mode (or test mode for development)
     - Collections will be auto-created on first use

   - **Storage** (optional, for delivery photos):
     - Enable Firebase Storage

   - **Cloud Messaging** (optional, for notifications):
     - Set up FCM for push notifications

4. **Run the app**
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

## 📱 Demo Credentials

- **Admin**: admin@seafood.com / admin123
- **Distributor**: dist@seafood.com / dist123

## 🏗️ Project Structure

```
seafood-distribution-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   └── OrderCard.tsx
│   ├── screens/             # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ImportScreen.tsx
│   │   └── CargoConfirmationScreen.tsx
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Firebase and API services
│   │   └── firebaseService.ts
│   ├── store/               # Global state management (Zustand)
│   │   └── useStore.ts
│   ├── utils/               # Utility functions
│   │   ├── whatsappParser.ts
│   │   ├── dateUtils.ts
│   │   └── validation.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── constants/           # App constants
│   │   ├── products.ts
│   │   ├── theme.ts
│   │   └── config.ts
│   └── hooks/               # Custom React hooks
├── assets/                  # Images, fonts, etc.
├── App.tsx                  # App entry point
├── app.json                 # Expo configuration
├── package.json
└── README.md
```

## 🔧 Configuration

### Product Catalog

Edit `src/constants/products.ts` to add or modify products:

```typescript
{
  id: 'shrimp',
  name: 'Camarão',
  variations: ['camarão', 'camarao', 'shrimp', 'gambas'],
  defaultUnit: 'kg',
  category: 'seafood'
}
```

### Theme & Colors

Customize app appearance in `src/constants/theme.ts`:
- Light and dark mode colors
- Button sizes (optimized for warehouse use)
- Spacing, fonts, shadows

### Time Configuration

Adjust operational hours in `src/constants/config.ts`:
- `ORDER_IMPORT_START_HOUR`: When import feature becomes active (default: 15 = 3 PM)
- `ORDER_IMPORT_END_HOUR`: When to stop suggesting tomorrow's date (default: 23 = 11 PM)
- `MORNING_REMINDER_HOUR`: When to send morning notification (default: 3 = 3 AM)

## 📖 Usage Guide

### For Administrators

1. **Importing Orders (3 PM - 11 PM)**
   - Open WhatsApp and go to your group
   - Copy the conversation text
   - Open app → "Importar" tab
   - Paste text into the text field
   - Select delivery date (Tomorrow is recommended after 3 PM)
   - Click "Processar Encomendas"
   - Review parsed orders in preview
   - Edit or remove incorrect entries
   - Click "Confirmar e Adicionar Todas"

2. **Monitoring Orders**
   - View all orders in Dashboard
   - See which distributors claimed which orders
   - Reassign orders if needed
   - Mark day as "Closed" when all orders are in

### For Distributors

1. **Claiming Orders (Early Morning)**
   - Open app between 3-6 AM (or whenever you start)
   - Switch to appropriate tab (Today/Tomorrow)
   - Review available orders
   - Click "Puxar" on orders you want to deliver
   - Orders move to "Minhas Encomendas"

2. **Confirming Cargo (In Warehouse)**
   - Go to "Minha Carga" tab
   - Choose view mode:
     - **Total View**: See all products aggregated (e.g., "150kg Camarão total")
     - **By Client View**: See products per restaurant
   - Check off items as you load them
   - Click "Confirmar Carga Completa" when done

3. **Deliveries**
   - View order details
   - Use GPS navigation to addresses
   - Take delivery proof photo
   - Mark as delivered

## 🎨 WhatsApp Import Format Examples

The parser recognizes multiple formats:

```
Format 1:
China Garden
Camarão 30kg
Polvo 15kg

Format 2:
Golden Dragon
Camarão: 25kg
Polvo: 10kg

Format 3:
Panda Real
- Camarão 40
- Lulas 30kg

Format 4 (with emojis):
🏪 Dragon Vermelho
🦐 Camarão - 15kg
🐙 Polvo - 10kg
```

## 🔐 Security

- All Firebase operations use security rules (configure in Firebase Console)
- User authentication required for all operations
- Role-based access control
- Sensitive data (credentials) not committed to repository

## 🚀 Deployment

### Build for Production

```bash
# iOS
expo build:ios

# Android
expo build:android

# Or use EAS Build (recommended)
eas build --platform ios
eas build --platform android
```

### Publishing Updates

```bash
expo publish
```

## 🛠️ Development

### Adding a New Product

1. Add to `src/constants/products.ts` in `PRODUCT_CATALOG`
2. Include all name variations for parser recognition

### Adding a New Screen

1. Create component in `src/screens/`
2. Add navigation in `App.tsx`
3. Update types in `src/types/index.ts`

### Modifying Order Status

1. Update `OrderStatus` type in `src/types/index.ts`
2. Add status color in `src/constants/theme.ts`
3. Update UI components to handle new status

## 📊 Database Schema

### Collections

- **users**: User profiles and roles
- **orders**: Order documents
- **clients**: Restaurant/client information
- **products**: Product catalog (optional, uses constants by default)
- **import_sessions**: Import history
- **notifications**: Push notifications log

### Order Document Structure

```typescript
{
  id: string;
  clientId: string;
  clientName: string;
  deliveryAddress: string;
  products: [
    {
      productId: string;
      productName: string;
      quantity: number;
      unit: 'kg' | 'units';
      confirmed: boolean;
    }
  ];
  status: 'available' | 'assigned' | 'being_prepared' | 'loaded' | 'delivered';
  deliveryDate: Date;
  createdAt: Date;
  assignedTo?: string;
  assignedAt?: Date;
  loadedAt?: Date;
  deliveredAt?: Date;
}
```

## 🐛 Troubleshooting

### Orders not syncing
- Check Firebase connection
- Verify Firestore rules allow read/write
- Check console for errors

### Parser not recognizing products
- Add product variations to `products.ts`
- Check spelling in WhatsApp messages
- Products should be on separate lines

### App crashes on startup
- Ensure Firebase config is correct
- Check all dependencies are installed
- Clear cache: `expo start -c`

## 📝 TODO / Future Enhancements

- [ ] Delivery route optimization
- [ ] Barcode scanning for products
- [ ] Multi-language support
- [ ] Export reports (Excel, PDF)
- [ ] WhatsApp Business API integration
- [ ] Voice commands for hands-free operation
- [ ] Analytics dashboard
- [ ] Automated invoice generation

## 🤝 Contributing

This is a custom application built for a specific business. Contact the development team for modifications.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions, contact your system administrator.

---

Built with ❤️ for efficient seafood distribution management
