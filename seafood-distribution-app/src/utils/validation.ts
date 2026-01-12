import { CONFIG } from '../constants/config';
import { Order, OrderProduct } from '../types';

/**
 * Validation utilities
 */

/**
 * Validate order quantity
 */
export function validateQuantity(quantity: number): {
  isValid: boolean;
  warning?: string;
  error?: string;
} {
  if (quantity <= 0) {
    return {
      isValid: false,
      error: 'Quantidade deve ser maior que zero'
    };
  }

  if (quantity < CONFIG.MIN_QUANTITY_WARNING) {
    return {
      isValid: true,
      warning: 'Quantidade muito baixa'
    };
  }

  if (quantity > CONFIG.MAX_QUANTITY_WARNING) {
    return {
      isValid: true,
      warning: 'Quantidade muito alta - confirmar'
    };
  }

  return { isValid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Portuguese format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+351)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Check if order can be assigned to distributor
 */
export function canAssignOrder(order: Order): {
  canAssign: boolean;
  reason?: string;
} {
  if (order.status !== 'available') {
    return {
      canAssign: false,
      reason: 'Encomenda já atribuída'
    };
  }

  return { canAssign: true };
}

/**
 * Check if order can be unassigned
 */
export function canUnassignOrder(order: Order, userId: string): {
  canUnassign: boolean;
  reason?: string;
} {
  if (order.status === 'delivered') {
    return {
      canUnassign: false,
      reason: 'Encomenda já entregue'
    };
  }

  if (order.assignedTo !== userId) {
    return {
      canUnassign: false,
      reason: 'Encomenda atribuída a outro distribuidor'
    };
  }

  return { canUnassign: true };
}

/**
 * Check if all products in order are confirmed
 */
export function areAllProductsConfirmed(products: OrderProduct[]): boolean {
  return products.every(p => p.confirmed);
}

/**
 * Validate order before saving
 */
export function validateOrder(order: Partial<Order>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!order.clientName || order.clientName.trim().length === 0) {
    errors.push('Nome do cliente é obrigatório');
  }

  if (!order.deliveryAddress || order.deliveryAddress.trim().length === 0) {
    errors.push('Morada de entrega é obrigatória');
  }

  if (!order.products || order.products.length === 0) {
    errors.push('Encomenda deve ter pelo menos um produto');
  }

  if (order.products) {
    order.products.forEach((product, index) => {
      const validation = validateQuantity(product.quantity);
      if (!validation.isValid) {
        errors.push(`Produto ${index + 1}: ${validation.error}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
