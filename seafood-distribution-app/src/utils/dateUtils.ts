import { format, addDays, isToday, isTomorrow, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Date utility functions for order management
 */

/**
 * Get today's date at start of day
 */
export function getTodayStart(): Date {
  return startOfDay(new Date());
}

/**
 * Get tomorrow's date at start of day
 */
export function getTomorrowStart(): Date {
  return startOfDay(addDays(new Date(), 1));
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = 'dd MMM yyyy'): string {
  return format(date, formatStr, { locale: ptBR });
}

/**
 * Format date for display with relative terms
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return 'Hoje';
  }
  if (isTomorrow(date)) {
    return 'Amanhã';
  }
  return formatDate(date, 'dd/MM/yyyy');
}

/**
 * Check if it's currently after 3 PM (order import time)
 */
export function isAfterImportTime(): boolean {
  const now = new Date();
  return now.getHours() >= 15; // 3 PM
}

/**
 * Get default delivery date based on current time
 * After 3 PM: tomorrow, Before 3 PM: today
 */
export function getDefaultDeliveryDate(): Date {
  if (isAfterImportTime()) {
    return getTomorrowStart();
  }
  return getTodayStart();
}

/**
 * Format time
 */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Get date range for filtering
 */
export function getDateRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  };
}

/**
 * Check if date is in range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
