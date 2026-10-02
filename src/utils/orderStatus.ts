import { Order, OrderStatus } from '../types';

/**
 * Returns the normalized, authoritative current status for an order.
 * Priority: order_status > status > tracking.status > 'placed'
 * Resolves inconsistencies among multiple status fields so that stale tracking.status
 * cannot override an updated order_status or status.
 */
export function getAuthoritativeOrderStatus(order: Partial<Order> | null | undefined): string {
  if (!order) return 'placed';

  if (order.order_status && typeof order.order_status === 'string' && order.order_status.trim()) {
    return order.order_status.trim();
  }

  if (order.status && typeof order.status === 'string' && order.status.trim()) {
    return order.status.trim();
  }

  if (order.tracking?.status && typeof order.tracking.status === 'string' && order.tracking.status.trim()) {
    return order.tracking.status.trim();
  }

  return 'placed';
}

/**
 * Synchronizes all existing status fields on an order to ONE authoritative value:
 * - order.order_status
 * - order.status
 * - order.tracking.status
 * and updates order.updated_at.
 */
export function syncOrderStatus<T extends Partial<Order>>(order: T, targetStatus?: OrderStatus | string): T {
  if (!order) return order;

  const authoritative = (
    targetStatus && typeof targetStatus === 'string' && targetStatus.trim()
      ? targetStatus.trim()
      : getAuthoritativeOrderStatus(order)
  ) as OrderStatus;

  order.order_status = authoritative;
  order.status = authoritative;

  if (!order.tracking) {
    order.tracking = {};
  }
  order.tracking.status = authoritative;
  order.updated_at = new Date().toISOString();

  return order;
}

/**
 * Determines whether an order is active and eligible to appear in the customer
 * "Welcome Back / Previous Order" tracking card.
 *
 * Inactive orders:
 * - Delivered (delivered, Delivered, DELIVERED)
 * - Cancelled (cancelled, Cancelled, CANCELLED)
 * - Payment Failed (Failed, Payment Failed, payment_failed)
 */
export function isOrderActive(order: Partial<Order> | null | undefined): boolean {
  if (!order) return false;

  const rawStatus = getAuthoritativeOrderStatus(order);
  const normalizedStatus = String(rawStatus || '').toLowerCase().trim();
  const paymentStatus = String(order.payment_status || '').toLowerCase().trim();

  // Cancelled orders are inactive (Cancelled, cancelled, CANCELLED)
  if (normalizedStatus.includes('cancel')) {
    return false;
  }

  // Delivered orders are inactive (Delivered, delivered, DELIVERED, excluding 'out for delivery')
  if (normalizedStatus.includes('deliver') && !normalizedStatus.includes('out')) {
    return false;
  }

  // Payment failed orders are inactive (Payment Failed, Failed, payment_failed)
  if (paymentStatus.includes('fail') || normalizedStatus.includes('fail')) {
    return false;
  }

  return true;
}

