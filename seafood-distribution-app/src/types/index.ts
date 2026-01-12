// User Types
export type UserRole = 'admin' | 'distributor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Order Status Types
export type OrderStatus =
  | 'available'
  | 'assigned'
  | 'being_prepared'
  | 'loaded'
  | 'delivered';

// Product Types
export interface Product {
  id: string;
  name: string;
  variations: string[]; // Alternative names/spellings
  defaultUnit: 'kg' | 'units';
  category?: string;
}

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  unit: 'kg' | 'units';
  confirmed: boolean; // For cargo confirmation
}

// Client/Restaurant Types
export interface Client {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber?: string;
  notes?: string;
  orderHistory: string[]; // Array of order IDs
  createdAt: Date;
}

// Order Types
export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  deliveryAddress: string;
  products: OrderProduct[];
  status: OrderStatus;
  deliveryDate: Date; // The date this order is for
  createdAt: Date; // When the order was imported
  assignedTo?: string; // User ID of assigned distributor
  assignedAt?: Date;
  loadedAt?: Date;
  deliveredAt?: Date;
  deliveryProofPhotoUrl?: string;
  notes?: string;
}

// Import Types
export interface ParsedOrder {
  clientName: string;
  products: {
    name: string;
    quantity: number;
    unit?: string;
  }[];
  rawText: string;
}

export interface ImportSession {
  id: string;
  importedBy: string; // User ID
  importedAt: Date;
  deliveryDate: Date;
  ordersCount: number;
  rawText: string;
}

// Cargo Confirmation Types
export interface AggregatedProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  unit: 'kg' | 'units';
  confirmed: boolean;
  orderIds: string[]; // Which orders contribute to this total
}

export interface ClientCargoStatus {
  clientId: string;
  clientName: string;
  orderId: string;
  products: OrderProduct[];
  allConfirmed: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Import: undefined;
  MyOrders: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardList: { tab: 'today' | 'tomorrow' };
  OrderDetails: { orderId: string };
  CargoConfirmation: { view: 'total' | 'by-client' };
};

// Notification Types
export interface AppNotification {
  id: string;
  type: 'new_order' | 'order_assigned' | 'reminder' | 'day_summary';
  title: string;
  body: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}

// Settings Types
export interface AppSettings {
  darkMode: 'auto' | 'on' | 'off';
  notificationsEnabled: boolean;
  reminderTime: string; // e.g., "03:00"
  defaultView: 'total' | 'by-client';
}

// Statistics Types
export interface DayStatistics {
  date: Date;
  totalOrders: number;
  assignedOrders: number;
  availableOrders: number;
  deliveredOrders: number;
  totalWeight: number;
  distributors: {
    userId: string;
    userName: string;
    ordersCount: number;
    deliveredCount: number;
  }[];
}
