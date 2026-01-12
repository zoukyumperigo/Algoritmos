import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useStore, calculateAggregatedProducts } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Order, OrderProduct, AggregatedProduct } from '../types';

type ViewMode = 'total' | 'by-client';

export const CargoConfirmationScreen: React.FC = () => {
  const { myOrders, user, cargoView, setCargoView } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>(cargoView);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const isDarkMode = false;
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  // Calculate aggregated products
  const aggregatedProducts = calculateAggregatedProducts(myOrders);

  // Group orders by client
  const ordersByClient = myOrders.reduce((acc, order) => {
    if (!acc[order.clientId]) {
      acc[order.clientId] = [];
    }
    acc[order.clientId].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const toggleProductConfirmation = (productId: string) => {
    // TODO: Update product confirmation in store and Firebase
    console.log('Toggle product:', productId);
  };

  const toggleClientProductConfirmation = (orderId: string, productId: string) => {
    // TODO: Update specific product in order
    console.log('Toggle client product:', orderId, productId);
  };

  const handleConfirmAllCargo = () => {
    const unconfirmedProducts = aggregatedProducts.filter(p => !p.confirmed);

    if (unconfirmedProducts.length > 0) {
      Alert.alert(
        'Atenção',
        `Ainda há ${unconfirmedProducts.length} produtos não confirmados. Deseja confirmar mesmo assim?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              // TODO: Mark all as loaded
              Alert.alert('Sucesso', 'Carga completa confirmada!');
            },
          },
        ]
      );
    } else {
      Alert.alert('Sucesso', 'Carga completa confirmada!');
    }
  };

  const renderTotalView = () => {
    const totalWeight = aggregatedProducts.reduce(
      (sum, p) => sum + (p.unit === 'kg' ? p.totalQuantity : 0),
      0
    );

    const confirmedCount = aggregatedProducts.filter(p => p.confirmed).length;

    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.viewTitle, { color: colors.text }]}>
          📦 Vista Total - Produtos Agregados
        </Text>

        <View style={[styles.totalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.totalText, { color: colors.text }]}>
            Total: {totalWeight.toFixed(0)} kg
          </Text>
          <Text style={[styles.totalSubtext, { color: colors.textSecondary }]}>
            {confirmedCount}/{aggregatedProducts.length} produtos confirmados
          </Text>
        </View>

        <ScrollView style={styles.productsList}>
          {aggregatedProducts.map(product => (
            <TouchableOpacity
              key={product.productId}
              style={[
                styles.productCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: product.confirmed ? colors.success : colors.border,
                  borderWidth: product.confirmed ? 2 : 1,
                },
              ]}
              onPress={() => toggleProductConfirmation(product.productId)}
            >
              <View style={styles.productLeft}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: product.confirmed ? colors.success : 'transparent',
                      borderColor: product.confirmed ? colors.success : colors.border,
                    },
                  ]}
                >
                  {product.confirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <View>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {product.productName}
                  </Text>
                  <Text style={[styles.productOrders, { color: colors.textSecondary }]}>
                    {product.orderIds.length} encomendas
                  </Text>
                </View>
              </View>

              <View style={styles.productRight}>
                <Text style={[styles.productQuantity, { color: colors.text }]}>
                  {product.totalQuantity.toFixed(0)}
                </Text>
                <Text style={[styles.productUnit, { color: colors.textSecondary }]}>
                  {product.unit}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderByClientView = () => {
    return (
      <View style={styles.viewContainer}>
        <Text style={[styles.viewTitle, { color: colors.text }]}>
          🏪 Vista por Cliente
        </Text>

        <ScrollView style={styles.clientsList}>
          {Object.entries(ordersByClient).map(([clientId, orders]) => {
            const order = orders[0]; // Get first order for client info
            const allProducts = orders.flatMap(o => o.products);
            const allConfirmed = allProducts.every(p => p.confirmed);
            const isExpanded = expandedClients.has(clientId);

            return (
              <View key={clientId} style={styles.clientCard}>
                <TouchableOpacity
                  style={[
                    styles.clientHeader,
                    {
                      backgroundColor: colors.surface,
                      borderColor: allConfirmed ? colors.success : colors.border,
                      borderWidth: allConfirmed ? 2 : 1,
                    },
                  ]}
                  onPress={() => toggleClient(clientId)}
                >
                  <View style={styles.clientLeft}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: allConfirmed ? colors.success : 'transparent',
                          borderColor: allConfirmed ? colors.success : colors.border,
                        },
                      ]}
                    >
                      {allConfirmed && <Text style={styles.checkmark}>✓</Text>}
                    </View>

                    <View>
                      <Text style={[styles.clientName, { color: colors.text }]}>
                        {order.clientName}
                      </Text>
                      <Text style={[styles.clientSubtext, { color: colors.textSecondary }]}>
                        {allProducts.length} produtos
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.expandIcon, { color: colors.text }]}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.clientProducts, { backgroundColor: colors.background }]}>
                    {orders.map(order =>
                      order.products.map((product, index) => (
                        <TouchableOpacity
                          key={`${order.id}-${index}`}
                          style={styles.clientProductRow}
                          onPress={() =>
                            toggleClientProductConfirmation(order.id, product.productId)
                          }
                        >
                          <View
                            style={[
                              styles.smallCheckbox,
                              {
                                backgroundColor: product.confirmed
                                  ? colors.success
                                  : 'transparent',
                                borderColor: product.confirmed ? colors.success : colors.border,
                              },
                            ]}
                          >
                            {product.confirmed && (
                              <Text style={styles.smallCheckmark}>✓</Text>
                            )}
                          </View>

                          <Text style={[styles.clientProductName, { color: colors.text }]}>
                            {product.productName}
                          </Text>

                          <Text style={[styles.clientProductQuantity, { color: colors.text }]}>
                            {product.quantity} {product.unit}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (myOrders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Você ainda não tem encomendas atribuídas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ✅ Confirmação de Carga
        </Text>

        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'total' && styles.toggleButtonActive,
              {
                backgroundColor: viewMode === 'total' ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => {
              setViewMode('total');
              setCargoView('total');
            }}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'total' ? '#FFFFFF' : colors.text },
              ]}
            >
              Vista Total
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'by-client' && styles.toggleButtonActive,
              {
                backgroundColor: viewMode === 'by-client' ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => {
              setViewMode('by-client');
              setCargoView('by-client');
            }}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'by-client' ? '#FFFFFF' : colors.text },
              ]}
            >
              Por Cliente
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'total' ? renderTotalView() : renderByClientView()}

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title="Confirmar Carga Completa"
          onPress={handleConfirmAllCargo}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  toggleButtonActive: {},
  toggleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  viewContainer: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: 0,
  },
  viewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  totalCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  totalText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  totalSubtext: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  productsList: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  productOrders: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  productRight: {
    alignItems: 'flex-end',
  },
  productQuantity: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  productUnit: {
    fontSize: FONT_SIZES.sm,
  },
  clientsList: {
    flex: 1,
  },
  clientCard: {
    marginBottom: SPACING.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  clientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  clientName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  clientSubtext: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: FONT_SIZES.md,
  },
  clientProducts: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  clientProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  smallCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clientProductName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  clientProductQuantity: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
  },
});
