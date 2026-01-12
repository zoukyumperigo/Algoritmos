/**
 * Global State Management with Zustand
 */

import { create } from 'zustand';
import { User, Order, Client, OrderStatus, AggregatedProduct } from '../types';

interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Orders
  todayOrders: Order[];
  tomorrowOrders: Order[];
  myOrders: Order[];
  setTodayOrders: (orders: Order[]) => void;
  setTomorrowOrders: (orders: Order[]) => void;
  setMyOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignOrder: (orderId: string, userId: string) => void;
  unassignOrder: (orderId: string) => void;

  // Clients
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;

  // UI State
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTab: 'today' | 'tomorrow';
  setCurrentTab: (tab: 'today' | 'tomorrow') => void;
  cargoView: 'total' | 'by-client';
  setCargoView: (view: 'total' | 'by-client') => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Offline mode
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSync: Order[];
  addPendingSync: (order: Order) => void;
  clearPendingSync: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Authentication
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Orders
  todayOrders: [],
  tomorrowOrders: [],
  myOrders: [],
  setTodayOrders: (orders) => set({ todayOrders: orders }),
  setTomorrowOrders: (orders) => set({ tomorrowOrders: orders }),
  setMyOrders: (orders) => set({ myOrders: orders }),

  addOrder: (order) => {
    const { todayOrders, tomorrowOrders } = get();
    const isToday = new Date(order.deliveryDate).toDateString() === new Date().toDateString();

    if (isToday) {
      set({ todayOrders: [...todayOrders, order] });
    } else {
      set({ tomorrowOrders: [...tomorrowOrders, order] });
    }
  },

  updateOrderStatus: (orderId, status) => {
    const updateOrders = (orders: Order[]) =>
      orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      );

    set({
      todayOrders: updateOrders(get().todayOrders),
      tomorrowOrders: updateOrders(get().tomorrowOrders),
      myOrders: updateOrders(get().myOrders),
    });
  },

  assignOrder: (orderId, userId) => {
    const now = new Date();
    const updateOrders = (orders: Order[]) =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'assigned' as OrderStatus, assignedTo: userId, assignedAt: now }
          : order
      );

    set({
      todayOrders: updateOrders(get().todayOrders),
      tomorrowOrders: updateOrders(get().tomorrowOrders),
    });

    // Add to my orders if it's the current user
    const { user, myOrders } = get();
    if (user && user.id === userId) {
      const order = [...get().todayOrders, ...get().tomorrowOrders].find(o => o.id === orderId);
      if (order) {
        set({ myOrders: [...myOrders, { ...order, status: 'assigned', assignedTo: userId, assignedAt: now }] });
      }
    }
  },

  unassignOrder: (orderId) => {
    const updateOrders = (orders: Order[]) =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'available' as OrderStatus, assignedTo: undefined, assignedAt: undefined }
          : order
      );

    set({
      todayOrders: updateOrders(get().todayOrders),
      tomorrowOrders: updateOrders(get().tomorrowOrders),
      myOrders: get().myOrders.filter(order => order.id !== orderId),
    });
  },

  // Clients
  clients: [],
  setClients: (clients) => set({ clients }),
  addClient: (client) => set({ clients: [...get().clients, client] }),

  // UI State
  isDarkMode: false,
  toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
  currentTab: 'tomorrow',
  setCurrentTab: (tab) => set({ currentTab: tab }),
  cargoView: 'total',
  setCargoView: (view) => set({ cargoView: view }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Offline mode
  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),
  pendingSync: [],
  addPendingSync: (order) => set({ pendingSync: [...get().pendingSync, order] }),
  clearPendingSync: () => set({ pendingSync: [] }),
}));

/**
 * Selectors for computed values
 */

export const selectAvailableOrders = (state: AppState) =>
  state.currentTab === 'today'
    ? state.todayOrders.filter(o => o.status === 'available')
    : state.tomorrowOrders.filter(o => o.status === 'available');

export const selectAssignedOrders = (state: AppState) =>
  state.currentTab === 'today'
    ? state.todayOrders.filter(o => o.status !== 'available')
    : state.tomorrowOrders.filter(o => o.status !== 'available');

export const selectMyOrdersForDate = (state: AppState, date: 'today' | 'tomorrow') => {
  const orders = date === 'today' ? state.todayOrders : state.tomorrowOrders;
  return orders.filter(o => o.assignedTo === state.user?.id);
};

/**
 * Calculate aggregated products from multiple orders
 */
export function calculateAggregatedProducts(orders: Order[]): AggregatedProduct[] {
  const productMap = new Map<string, AggregatedProduct>();

  orders.forEach(order => {
    order.products.forEach(product => {
      const existing = productMap.get(product.productId);

      if (existing) {
        existing.totalQuantity += product.quantity;
        existing.confirmed = existing.confirmed && product.confirmed;
        existing.orderIds.push(order.id);
      } else {
        productMap.set(product.productId, {
          productId: product.productId,
          productName: product.productName,
          totalQuantity: product.quantity,
          unit: product.unit,
          confirmed: product.confirmed,
          orderIds: [order.id],
        });
      }
    });
  });

  return Array.from(productMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );
}
