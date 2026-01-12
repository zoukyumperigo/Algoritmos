/**
 * Firebase Service Layer
 * Handles all Firebase operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.example';
import { Order, User, Client, ImportSession } from '../types';

/**
 * Generic Firestore operations
 */

export async function addDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  return null;
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<any>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Real-time listeners
 */

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): () => void {
  const q = query(collection(db, collectionName), ...constraints);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });

  return unsubscribe;
}

/**
 * Order operations
 */

export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  return addDocument<Order>(COLLECTIONS.ORDERS, order);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  return getDocument<Order>(COLLECTIONS.ORDERS, orderId);
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  return updateDocument(COLLECTIONS.ORDERS, orderId, updates);
}

export async function getOrdersByDate(date: Date): Promise<Order[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return queryDocuments<Order>(COLLECTIONS.ORDERS, [
    where('deliveryDate', '>=', Timestamp.fromDate(startOfDay)),
    where('deliveryDate', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('deliveryDate', 'asc'),
  ]);
}

export async function getOrdersByDistributor(
  distributorId: string,
  date: Date
): Promise<Order[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return queryDocuments<Order>(COLLECTIONS.ORDERS, [
    where('assignedTo', '==', distributorId),
    where('deliveryDate', '>=', Timestamp.fromDate(startOfDay)),
    where('deliveryDate', '<=', Timestamp.fromDate(endOfDay)),
  ]);
}

export function subscribeToOrders(
  date: Date,
  callback: (orders: Order[]) => void
): () => void {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return subscribeToCollection<Order>(
    COLLECTIONS.ORDERS,
    [
      where('deliveryDate', '>=', Timestamp.fromDate(startOfDay)),
      where('deliveryDate', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('deliveryDate', 'asc'),
    ],
    callback
  );
}

/**
 * Client operations
 */

export async function createClient(client: Omit<Client, 'id'>): Promise<string> {
  return addDocument<Client>(COLLECTIONS.CLIENTS, client);
}

export async function getClient(clientId: string): Promise<Client | null> {
  return getDocument<Client>(COLLECTIONS.CLIENTS, clientId);
}

export async function searchClients(searchTerm: string): Promise<Client[]> {
  const clients = await queryDocuments<Client>(COLLECTIONS.CLIENTS, [
    orderBy('name'),
  ]);

  // Client-side filtering (Firestore doesn't support case-insensitive search)
  return clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export async function getAllClients(): Promise<Client[]> {
  return queryDocuments<Client>(COLLECTIONS.CLIENTS, [orderBy('name')]);
}

/**
 * User operations
 */

export async function getUser(userId: string): Promise<User | null> {
  return getDocument<User>(COLLECTIONS.USERS, userId);
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  return updateDocument(COLLECTIONS.USERS, userId, updates);
}

export async function getAllUsers(): Promise<User[]> {
  return queryDocuments<User>(COLLECTIONS.USERS, []);
}

/**
 * Import session operations
 */

export async function createImportSession(
  session: Omit<ImportSession, 'id'>
): Promise<string> {
  return addDocument<ImportSession>(COLLECTIONS.IMPORT_SESSIONS, session);
}

export async function getRecentImportSessions(
  deliveryDate: Date,
  limit: number = 10
): Promise<ImportSession[]> {
  const startOfDay = new Date(deliveryDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(deliveryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await queryDocuments<ImportSession>(
    COLLECTIONS.IMPORT_SESSIONS,
    [
      where('deliveryDate', '>=', Timestamp.fromDate(startOfDay)),
      where('deliveryDate', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('importedAt', 'desc'),
    ]
  );

  return sessions.slice(0, limit);
}
