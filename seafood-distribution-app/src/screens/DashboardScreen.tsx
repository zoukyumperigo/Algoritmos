import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderCard } from '../components/OrderCard';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatRelativeDate, getTodayStart, getTomorrowStart } from '../utils/dateUtils';

type TabType = 'today' | 'tomorrow';

export const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tomorrow');
  const [refreshing, setRefreshing] = useState(false);

  const {
    todayOrders,
    tomorrowOrders,
    user,
    assignOrder,
    currentTab,
    setCurrentTab,
  } = useStore();

  const isDarkMode = false; // Get from store/context
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const orders = activeTab === 'today' ? todayOrders : tomorrowOrders;

  const availableOrders = orders.filter(o => o.status === 'available');
  const assignedOrders = orders.filter(o => o.status !== 'available');
  const myOrders = orders.filter(o => o.assignedTo === user?.id);

  useEffect(() => {
    // Set default tab based on time
    const now = new Date();
    const defaultTab = now.getHours() >= 15 ? 'tomorrow' : 'today';
    setActiveTab(defaultTab);
    setCurrentTab(defaultTab);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh orders from Firebase
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAssignOrder = async (orderId: string) => {
    if (!user) return;

    try {
      assignOrder(orderId, user.id);
      // TODO: Update in Firebase
    } catch (error) {
      console.error('Error assigning order:', error);
    }
  };

  const handleOrderPress = (orderId: string) => {
    // TODO: Navigate to order details
    console.log('Order pressed:', orderId);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        🌙 Distribuição
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {activeTab === 'today'
          ? formatRelativeDate(getTodayStart())
          : formatRelativeDate(getTomorrowStart())}
      </Text>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'tomorrow' && styles.tabActive,
            { backgroundColor: activeTab === 'tomorrow' ? colors.primary : colors.surface },
          ]}
          onPress={() => {
            setActiveTab('tomorrow');
            setCurrentTab('tomorrow');
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'tomorrow' ? '#FFFFFF' : colors.text },
            ]}
          >
            Amanhã
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'today' && styles.tabActive,
            { backgroundColor: activeTab === 'today' ? colors.primary : colors.surface },
          ]}
          onPress={() => {
            setActiveTab('today');
            setCurrentTab('today');
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'today' ? '#FFFFFF' : colors.text },
            ]}
          >
            Hoje
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.summaryTitle, { color: colors.text }]}>
        📊 RESUMO TOTAL
      </Text>

      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          ├─ {orders.length} encomendas
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          ├─ {assignedOrders.length} atribuídas
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          └─ {availableOrders.length} disponíveis
        </Text>
      </View>

      {user?.role === 'distributor' && (
        <View style={[styles.myOrdersSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.myOrdersTitle, { color: colors.primary }]}>
            👤 MINHAS ENCOMENDAS ({myOrders.length})
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderSummary()}

        {/* My Orders Section (for distributors) */}
        {user?.role === 'distributor' && myOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Minhas Encomendas
            </Text>
            {myOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        )}

        {/* Available Orders Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💼 Disponíveis ({availableOrders.length})
          </Text>

          {availableOrders.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Sem encomendas disponíveis
              </Text>
            </View>
          ) : (
            availableOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order.id)}
                showAssignButton={user?.role === 'distributor'}
                onAssign={() => handleAssignOrder(order.id)}
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </View>

        {/* Assigned Orders Section (for admin view) */}
        {user?.role === 'admin' && assignedOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📦 Atribuídas ({assignedOrders.length})
            </Text>
            {assignedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  tab: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  tabActive: {
    // Active tab styling handled by backgroundColor
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    marginVertical: 2,
  },
  summaryText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'monospace',
  },
  myOrdersSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  myOrdersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  section: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  emptyState: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
  },
});
