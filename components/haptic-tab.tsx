import * as Haptics from 'expo-haptics';
import { Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import type { PressableProps } from 'react-native';

// Compatible with BottomTabBarButtonProps without importing @react-navigation
type TabBarButtonProps = Omit<PressableProps, 'style'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  to?: string;
  accessibilityState?: { selected?: boolean };
};

export function HapticTab({ onPressIn, ...props }: TabBarButtonProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
