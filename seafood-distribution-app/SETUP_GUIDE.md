# 🚀 Setup Guide - Seafood Distribution App

Complete step-by-step setup instructions.

## Step 1: Install Dependencies

```bash
cd seafood-distribution-app
npm install
```

## Step 2: Firebase Setup (REQUIRED)

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `seafood-distribution-app`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2.2 Add Web App

1. In Firebase Console, click the Web icon `</>`
2. Enter app nickname: `Seafood Distribution App`
3. Don't check "Firebase Hosting"
4. Click "Register app"
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seafood-distribution-app.firebaseapp.com",
  projectId: "seafood-distribution-app",
  storageBucket: "seafood-distribution-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2.3 Configure Firebase in Your App

1. Rename the example config file:
   ```bash
   cd src/config
   cp firebase.example.ts firebase.ts
   ```

2. Open `firebase.ts` and replace the config values with yours:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### 2.4 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Click "Email/Password" under Sign-in providers
4. Toggle "Enable"
5. Click "Save"

### 2.5 Create Test Users

1. Go to **Authentication** → **Users** tab
2. Click "Add user"
3. Create admin user:
   - Email: `admin@seafood.com`
   - Password: `admin123`
4. Click "Add user" again for distributor:
   - Email: `dist@seafood.com`
   - Password: `dist123`

### 2.6 Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your region)
5. Click "Enable"

### 2.7 Configure Firestore Security Rules

Go to **Firestore Database** → **Rules** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || request.auth.uid == userId;
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Clients collection
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Products collection
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Import sessions collection
    match /import_sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update, delete: if false;
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

Click "Publish"

### 2.8 Add User Profiles to Firestore

Since we're using a custom user system, manually add user profiles:

1. Go to **Firestore Database**
2. Click "Start collection"
3. Collection ID: `users`
4. Document ID: (auto-generate or use Firebase Auth UID)
5. Add fields:
   ```
   email: "admin@seafood.com"
   name: "Admin User"
   role: "admin"
   createdAt: (timestamp - now)
   ```
6. Add another document for distributor with `role: "distributor"`

## Step 3: Run the App

```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## Step 4: Test the App

1. **Login**
   - Use `admin@seafood.com` / `admin123`
   - Should see admin dashboard with Import tab

2. **Import Test Orders**
   - Go to "Importar" tab
   - Paste this test data:
   ```
   China Garden
   Camarão 30kg
   Polvo 15kg

   Golden Dragon
   Camarão 25kg
   Lulas 20kg
   ```
   - Click "Processar Encomendas"
   - Verify it parsed correctly
   - Click "Confirmar e Adicionar Todas"

3. **Test Distributor Flow**
   - Logout (TODO: add logout button)
   - Login with `dist@seafood.com` / `dist123`
   - See available orders
   - Click "Puxar" to claim an order
   - Go to "Minha Carga" tab
   - Test cargo confirmation views

## Optional: Enable Push Notifications

### iOS Setup

1. Create Apple Developer account
2. Generate APNs key
3. Upload to Firebase Console → Project Settings → Cloud Messaging

### Android Setup

1. FCM is automatically configured with Firebase
2. Test notifications in Firebase Console → Cloud Messaging → Send test message

## Optional: Enable Firebase Storage (for delivery photos)

1. Go to **Storage** in Firebase Console
2. Click "Get started"
3. Use default rules for development
4. Click "Done"

## Troubleshooting

### "Firebase not defined" error
- Make sure you renamed `firebase.example.ts` to `firebase.ts`
- Verify your config is correct

### "Permission denied" in Firestore
- Check your security rules
- Make sure user document exists in Firestore with correct role

### App won't start
- Try clearing cache: `expo start -c`
- Delete `node_modules` and run `npm install` again
- Check all dependencies are compatible

### Orders not appearing
- Check Firestore in Firebase Console
- Verify security rules allow read access
- Check browser console for errors

## Next Steps

1. **Customize Products**: Edit `src/constants/products.ts`
2. **Adjust Theme**: Modify `src/constants/theme.ts`
3. **Configure Times**: Update `src/constants/config.ts`
4. **Add Real Users**: Create actual users in Firebase Auth
5. **Deploy**: Use Expo EAS Build for production apps

## Production Checklist

Before deploying to production:

- [ ] Change Firestore rules from test mode to production
- [ ] Use real user authentication (not demo credentials)
- [ ] Enable Firebase Security
- [ ] Set up proper backup for Firestore
- [ ] Configure app analytics
- [ ] Test on real devices
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Configure app store listings

---

Need help? Contact your development team.
