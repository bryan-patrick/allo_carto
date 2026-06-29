import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import colors from "../app/colors";

/**
 * Typing
 */
interface LockOverlayProps {
  children: ReactNode;
  isLocked: boolean;
  lockedAccessibilityHint?: string;
  lockedAccessibilityLabel?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

/**
 * LockOverlay Component
 */
export default function LockOverlay({
  children,
  isLocked,
  lockedAccessibilityHint,
  lockedAccessibilityLabel = 'Locked content',
  overlayStyle: customOverlayStyle,
  style,
}: LockOverlayProps) {

  /**
   * Destructure styles
   */
  const {
    containerStyle,
    overlayStyle,
  } = styles;

  /**
   * Render LockOverlay
   */
  return (
    <View style={[containerStyle, style]}>
      {children}
      {isLocked && (
        <Pressable
          accessibilityHint={lockedAccessibilityHint}
          accessibilityLabel={lockedAccessibilityLabel}
          accessibilityState={{ disabled: true }}
          onPress={() => undefined}
          style={[overlayStyle, customOverlayStyle]}
          testID="lock-overlay"
        >
          <MaterialIcons
            color={colors.dark.border}
            name="lock"
            size={32}
          />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  containerStyle: {
    position: 'relative',
  },
  overlayStyle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: `#CCCCCCCC`,
    justifyContent: 'center',
    zIndex: 10,
  },
});
