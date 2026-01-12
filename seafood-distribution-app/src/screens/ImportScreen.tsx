import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { parseWhatsAppText, validateParsedOrders } from '../utils/whatsappParser';
import { getDefaultDeliveryDate, formatRelativeDate, getTodayStart, getTomorrowStart } from '../utils/dateUtils';
import { ParsedOrder, OrderProduct } from '../types';
import { findProductByName, getProductById } from '../constants/products';

export const ImportScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date>(getDefaultDeliveryDate());
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isDarkMode = false; // Get from store/context
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const handleProcess = () => {
    if (!text.trim()) {
      Alert.alert('Erro', 'Por favor, cole o texto do WhatsApp');
      return;
    }

    setIsProcessing(true);

    try {
      const result = parseWhatsAppText(text);

      if (result.errors.length > 0) {
        Alert.alert(
          'Avisos',
          result.errors.join('\n'),
          [{ text: 'OK' }]
        );
      }

      const { valid, invalid } = validateParsedOrders(result.orders);

      if (invalid.length > 0) {
        Alert.alert(
          'Encomendas Inválidas',
          invalid.map(i => `${i.order.clientName}: ${i.reason}`).join('\n'),
          [{ text: 'OK' }]
        );
      }

      if (valid.length === 0) {
        Alert.alert('Erro', 'Nenhuma encomenda válida encontrada');
        setIsProcessing(false);
        return;
      }

      setParsedOrders(valid);
      setShowPreview(true);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar texto: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    try {
      // TODO: Save orders to Firebase
      // Convert ParsedOrder to Order and save

      Alert.alert(
        'Sucesso',
        `${parsedOrders.length} encomendas adicionadas para ${formatRelativeDate(deliveryDate)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setText('');
              setParsedOrders([]);
              setShowPreview(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar encomendas: ' + (error as Error).message);
    }
  };

  const handleEditOrder = (index: number) => {
    // TODO: Open edit modal
    Alert.alert('Editar', `Editar encomenda ${parsedOrders[index].clientName}`);
  };

  const handleRemoveOrder = (index: number) => {
    Alert.alert(
      'Remover',
      `Remover encomenda de ${parsedOrders[index].clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setParsedOrders(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  if (showPreview) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Pré-visualização
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            ✅ {parsedOrders.length} encomendas detetadas
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {parsedOrders.map((order, index) => (
            <View
              key={index}
              style={[styles.previewCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  📍 {order.clientName}
                </Text>
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    onPress={() => handleEditOrder(index)}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: colors.primary }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveOrder(index)}
                    style={styles.actionButton}
                  >
                    <Text style={{ color: colors.error }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {order.products.map((product, pIndex) => {
                const catalogProduct = findProductByName(product.name);
                return (
                  <View key={pIndex} style={styles.productRow}>
                    <Text style={[styles.productText, { color: colors.text }]}>
                      • {catalogProduct?.name || product.name}:{' '}
                      {product.quantity} {product.unit || 'kg'}
                    </Text>
                    {!catalogProduct && (
                      <Text style={[styles.warningText, { color: colors.warning }]}>
                        ⚠️ Não reconhecido
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <Button
            title="Cancelar"
            onPress={() => setShowPreview(false)}
            variant="outline"
            size="lg"
            style={{ flex: 1 }}
          />
          <Button
            title="Confirmar e Adicionar Todas"
            onPress={handleConfirm}
            variant="primary"
            size="lg"
            style={{ flex: 2 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            📋 Importar Encomendas do WhatsApp
          </Text>
        </View>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            Para que data são estas encomendas?
          </Text>

          <View style={styles.dateOptions}>
            <TouchableOpacity
              style={[
                styles.dateOption,
                {
                  backgroundColor: deliveryDate.toDateString() === getTodayStart().toDateString()
                    ? colors.primary
                    : colors.surface,
                },
              ]}
              onPress={() => setDeliveryDate(getTodayStart())}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  {
                    color:
                      deliveryDate.toDateString() === getTodayStart().toDateString()
                        ? '#FFFFFF'
                        : colors.text,
                  },
                ]}
              >
                ○ Hoje ({formatRelativeDate(getTodayStart())})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateOption,
                {
                  backgroundColor:
                    deliveryDate.toDateString() === getTomorrowStart().toDateString()
                      ? colors.primary
                      : colors.surface,
                },
              ]}
              onPress={() => setDeliveryDate(getTomorrowStart())}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  {
                    color:
                      deliveryDate.toDateString() === getTomorrowStart().toDateString()
                        ? '#FFFFFF'
                        : colors.text,
                  },
                ]}
              >
                ● Amanhã ({formatRelativeDate(getTomorrowStart())})
                {' [Recomendado]'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Text Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text }]}>
            Cole o texto do WhatsApp:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Cole aqui a conversa do WhatsApp..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={10}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />
        </View>

        {/* Example */}
        <View style={styles.exampleSection}>
          <Text style={[styles.exampleTitle, { color: colors.textSecondary }]}>
            Exemplo de formato:
          </Text>
          <View style={[styles.exampleBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
              China Garden{'\n'}
              Camarão 30kg{'\n'}
              Polvo 15kg{'\n'}
              {'\n'}
              Golden Dragon{'\n'}
              Camarão: 25kg{'\n'}
              Lulas: 20kg
            </Text>
          </View>
        </View>

        {/* Process Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Processar Encomendas"
            onPress={handleProcess}
            variant="primary"
            size="lg"
            fullWidth
            loading={isProcessing}
            disabled={!text.trim()}
          />
        </View>

        {/* Recent Imports */}
        <View style={styles.recentSection}>
          <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>
            Últimas importações:
          </Text>
          <Text style={[styles.recentText, { color: colors.textSecondary }]}>
            - 16:30 - 8 encomendas (13 Jan)
          </Text>
          <Text style={[styles.recentText, { color: colors.textSecondary }]}>
            - 15:45 - 10 encomendas (13 Jan)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
  },
  dateSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  dateOptions: {
    gap: SPACING.sm,
  },
  dateOption: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  dateOptionText: {
    fontSize: FONT_SIZES.md,
  },
  inputSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  textInput: {
    height: 200,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  exampleSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  exampleTitle: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  exampleBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  exampleText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  recentSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  recentTitle: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  recentText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
  },
  previewCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  productRow: {
    marginBottom: SPACING.xs,
  },
  productText: {
    fontSize: FONT_SIZES.md,
  },
  warningText: {
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.md,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
