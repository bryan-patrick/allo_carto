import { colors } from "@/app/styles";
import { Dispatch } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";

/**
 * Typing
 */
interface MappedWordsProps {
  words: string[];
  activeWord: string | null;
  handler: Dispatch<string>;
}

/**
 * MappedWords Component
 */
export default function MappedWords({ words, activeWord, handler }: MappedWordsProps) {
  const { wcsButton, wcsButtonActive, wcsText } = mappedWordsStyles;

  return words.map((word: string) => {
    let wcsButtonClass;

    if (activeWord === word) {
      wcsButtonClass = [wcsButton, wcsButtonActive];
    } else {
      wcsButtonClass = wcsButton;
    }

    return (
      <Animated.View key={word}>
        <Pressable
          style={wcsButtonClass}
          onPress={() => handler(word)}
        >
          <Text style={wcsText}>{word}</Text>
        </Pressable>
      </Animated.View>
    )
  })
}

/**
 * Styles
 */
const mappedWordsStyles = StyleSheet.create({
  wcsButton: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 10,
    paddingRight: 16,
    paddingLeft: 16,
    boxShadow: `0 4px 0 0 ${colors.light.border}`,
  },
  wcsButtonActive: {
    top: 3,
    backgroundColor: colors.light.primary,
    color: colors.light.text,
    boxShadow: '0 0 0 0 transparent'
  },
  wcsText: {
    color: colors.dark.text
  }
});