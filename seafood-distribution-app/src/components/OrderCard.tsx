import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Order } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatTime } from '../utils/dateUtils';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  showAssignButton?: boolean;
  onAssign?: () => void;
  isDarkMode?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  showAssignButton = false,
  onAssign,
  isDarkMode = false,
}) => {
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'available':
        return colors.available;
      case 'assigned':
        return colors.assigned;
      case 'being_prepared':
        return colors.beingPrepared;
      case 'loaded':
        return colors.loaded;
      case 'delivered':
        return colors.delivered;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'assigned':
        return 'Atribuída';
      case 'being_prepared':
        return 'Em Preparação';
      case 'loaded':
        return 'Carregada';
      case 'delivered':
        return 'Entregue';
      default:
        return status;
    }
  };

  const totalItems = order.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.md]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.clientName, { color: colors.text }]}>
          {order.clientName}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Address */}
      <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
        📍 {order.deliveryAddress}
      </Text>

      {/* Products Summary */}
      <View style={styles.productsContainer}>
        <Text style={[styles.productsLabel, { color: colors.textSecondary }]}>
          Produtos:
        </Text>
        <Text style={[styles.productsCount, { color: colors.text }]}>
          {order.products.length} itens • {totalItems.toFixed(0)} kg total
        </Text>
      </View>

      {/* Products List Preview */}
      <View style={styles.productsList}>
        {order.products.slice(0, 3).map((product, index) => (
          <Text
            key={index}
            style={[styles.productItem, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            • {product.productName}: {product.quantity} {product.unit}
          </Text>
        ))}
        {order.products.length > 3 && (
          <Text style={[styles.productItem, { color: colors.textSecondary }]}>
            + {order.products.length - 3} mais...
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatTime(order.createdAt)}
        </Text>

        {order.assignedTo && (
          <Text style={[styles.assignedTo, { color: colors.textSecondary }]}>
            Atribuída
          </Text>
        )}

        {showAssignButton && order.status === 'available' && onAssign && (
          <TouchableOpacity
            style={[styles.assignButton, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              onAssign();
            }}
          >
            <Text style={styles.assignButtonText}>Puxar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clientName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  address: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  productsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  productsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  productsCount: {
    fontSize: FONT_SIZES.sm,
  },
  productsList: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  productItem: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
  },
  assignedTo: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
  },
  assignButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
