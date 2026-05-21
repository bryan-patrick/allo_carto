import { colors } from "@/src/app/styles";
import { Dispatch, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

/**
 * Typing
 */
interface MappedWordsProps {
  words: string[];
  activeWord: string | null;
  handler: Dispatch<string>;
}

interface MappedButtonProps {
  word: string;
  activeWord: string | null;
  handler: Dispatch<string>;
}

/**
 * Private MappedButton Component
 * (We need this component so we can create animations scoped per button)
 */
function MappedButton({
  word,
  activeWord,
  handler,
}: MappedButtonProps) {
  const { wcsButtonContainer, wcsButton, wcsText } = mappedWordsStyles;
  const buttonY = useSharedValue(0);
  const buttonBackgroundColor = useSharedValue(colors.light.background);
  const buttonBoxShadow = useSharedValue(`0 4px 0 0 ${colors.light.border}`);

  const wcsButtonActive = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    backgroundColor: buttonBackgroundColor.value,
    color: colors.light.text,
    boxShadow: buttonBoxShadow.value
  }));

  const timing = useMemo(() => ({
    duration: 70,
    easing: Easing.inOut(Easing.bounce)
  }), []);

  useEffect(() => {
    if (activeWord !== word) {
      buttonY.value = withTiming(0, timing);
      buttonBackgroundColor.value = withTiming(colors.light.background, timing)
    } else {
      buttonY.value = withTiming(2, timing);
      buttonBackgroundColor.value = withTiming(colors.light.border, timing)
    }
    //
  }, [activeWord, timing, buttonY, buttonBackgroundColor, buttonBoxShadow, word])

  return (
    <Animated.View
      style={[wcsButtonContainer, wcsButtonActive]}
      key={word}
    >
      <Pressable
        style={wcsButton}
        onPress={() => handler(word)}
        hitSlop={10}
      >
        <Text style={wcsText}>{word}</Text>
      </Pressable>
    </Animated.View>
  )
}

/**
 * MappedWords Component
 */
export default function MappedWords({ words, activeWord, handler }: MappedWordsProps) {
  return words.map((word: string) => {
    return (
      <MappedButton
        key={word}
        word={word}
        activeWord={activeWord}
        handler={handler}
      />
    )
  })
}

/**
 * Styles
 */
const mappedWordsStyles = StyleSheet.create({
  wcsButtonContainer: {
    display: 'flex',
    flexGrow: 1,
    borderRadius: 8,
    backgroundColor: colors.light.background,
    boxShadow: `0 4px 0 0 ${colors.light.border}`,
    maxWidth: 100
  },
  wcsButton: {
    borderRadius: 8,
    padding: 12,
    paddingRight: 16,
    paddingLeft: 16,
  },
  wcsText: {
    textAlign: 'center',
    color: colors.dark.text,
    fontWeight: 500
  }
});