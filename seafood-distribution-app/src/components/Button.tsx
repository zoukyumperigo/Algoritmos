import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, BUTTON_SIZES, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const isDarkMode = false; // Get from theme context
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const buttonStyle = [
    styles.button,
    {
      height: BUTTON_SIZES[size].height,
      paddingHorizontal: BUTTON_SIZES[size].paddingHorizontal,
      borderRadius: BORDER_RADIUS.md,
    },
    variant === 'primary' && { backgroundColor: colors.primary },
    variant === 'secondary' && { backgroundColor: colors.secondary },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    variant === 'danger' && { backgroundColor: colors.error },
    disabled && { backgroundColor: colors.disabled },
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    { fontSize: size === 'sm' ? FONT_SIZES.sm : size === 'lg' ? FONT_SIZES.lg : FONT_SIZES.md },
    variant === 'outline' ? { color: colors.primary } : { color: '#FFFFFF' },
    disabled && { color: colors.textSecondary },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});
