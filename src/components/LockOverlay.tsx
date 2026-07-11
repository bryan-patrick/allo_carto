import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import colors from "../app/colors";
import SVGCheck from "./SVG/SVGCheck";

/**
 * Typing
 */
interface LockOverlayProps {
  children: ReactNode;
  completeAccessibilityHint?: string;
  completeAccessibilityLabel?: string;
  isComplete?: boolean;
  isLocked: boolean;
  lockedAccessibilityHint?: string;
  lockedAccessibilityLabel?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  unlockCriteria?: string;
}

/**
 * LockOverlay Component
 */
export default function LockOverlay({
  children,
  completeAccessibilityHint,
  completeAccessibilityLabel = 'Complete content',
  isComplete = false,
  isLocked,
  unlockCriteria,
  lockedAccessibilityHint,
  lockedAccessibilityLabel = 'Locked content',
  overlayStyle: customOverlayStyle,
  style,
}: LockOverlayProps) {

  /**
   * Destructure styles
   */
  const {
    completeOverlayStyle,
    containerStyle,
    overlayStyle,
    unlockCriteriaStyle
  } = styles;

  /**
   * Overlay vars
   */
  const showLockOverlay = isLocked;
  const showCompleteOverlay = !isLocked && isComplete;
  const showOverlay = showLockOverlay || showCompleteOverlay;

  /**
   * Ternaries
   */
  const accessibilityHint = showLockOverlay
    ? lockedAccessibilityHint
    : completeAccessibilityHint;
  const accessibilityLabel = showLockOverlay
    ? lockedAccessibilityLabel
    : completeAccessibilityLabel;
  const overlayTestID = showLockOverlay
    ? 'lock-overlay'
    : 'complete-overlay';

  /**
   * Render LockOverlay
   */
  return (
    <View style={[ containerStyle, style ]}>
      {children}
      {showOverlay && (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: true }}
          onPress={() => undefined}
          style={[
            overlayStyle,
            showCompleteOverlay && completeOverlayStyle,
            customOverlayStyle,
          ]}
          testID={overlayTestID}
        >
          {showLockOverlay && (
            <MaterialIcons
              color={colors.light.text}
              name="lock"
              size={32}
            />
          )}
          {showCompleteOverlay && (
            <SVGCheck
              color={colors.dark.success}
              height="32"
              width="32"
            />
          )}
          {unlockCriteria && (
            <Text style={unlockCriteriaStyle}>{unlockCriteria}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  completeOverlayStyle: {
    backgroundColor: colors.light.success,
    borderColor: colors.dark.success,
    opacity: 0.75
  },
  containerStyle: {
    position: 'relative',
  },
  overlayStyle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: `#333333dd`,
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  unlockCriteriaStyle: {
    padding: 16,
    textAlign: 'center',
    fontFamily: 'lexend-400',
    color: colors.dark.text,
    marginVertical: 16,
    backgroundColor: colors.light.primary
  }
});
