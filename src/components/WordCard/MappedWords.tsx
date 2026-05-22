import { colors } from "@/src/app/styles";
import { Dispatch, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { WordCardContext } from "./wordCardContext";

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
 * 
 * We need this component in addition to the other one
 * (below) so that we can create animations scoped per button.
 * We can't animate like this in a map.
 */
function MappedButton({
  word,
  activeWord,
  handler,
}: MappedButtonProps) {
  const { cardState } = useContext(WordCardContext);
  const [highlightStyles, setHighlightStyles] = useState<ViewStyle>({});
  const [highlightTextStyles, setHighlightTextStyles] = useState<TextStyle>({});
  const [highlightArticle, setHighlightArticle] = useState<string | null>(null);
  const [highlightWord, setHighlightWord] = useState<string | null>(null);

  /**
   * Destructure styles
   */
  const {
    highlightSuccess,
    highlightWarning,
    highlightDanger,
    highlightTextSuccess,
    highlightTextWarning,
    highlightTextDanger
  } = mappedWordsStyles;

  /**
   * Animation vars
   */
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

  /**
   * Handle animation side effects
   */
  useEffect(() => {
    if (activeWord !== word) {
      buttonY.value = withTiming(0, timing);
      buttonBackgroundColor.value = withTiming(colors.light.background, timing)
    } else {
      buttonY.value = withTiming(2, timing);
      buttonBackgroundColor.value = withTiming(colors.light.border, timing)
    }
  }, [activeWord, timing, buttonY, buttonBackgroundColor, buttonBoxShadow, word]);

  /**
   * Destructure Styles
   */
  const {
    wcsButtonContainer,
    wcsButton,
    wcsText
  } = mappedWordsStyles;

  /**
   * Highlight the buttons based on current state 
   */
  useLayoutEffect(() => {
    const hasArticleMistake =
      (cardState.mistake === 'ARTICLE') ||
      (cardState.mistake === 'BOTH');

    const hasWordMistake =
      (cardState.mistake === 'WORD') ||
      (cardState.mistake === 'BOTH');

    switch (cardState.progress) {
      case 'PENDING':
        setHighlightTextStyles({});
        setHighlightStyles({});
        setHighlightArticle(null);
        setHighlightWord(null);
        break;
      case 'SUCCESS':
        setHighlightTextStyles(highlightTextSuccess);
        setHighlightStyles(highlightSuccess);
        setHighlightArticle(cardState.selectedArticle);
        setHighlightWord(cardState.selectedWord);
        break;
      case 'WARNING':
        setHighlightStyles(highlightWarning);
        setHighlightTextStyles(highlightTextWarning);
        if (hasArticleMistake) setHighlightArticle(cardState.selectedArticle);
        if (hasWordMistake) setHighlightWord(cardState.selectedWord);
        break;
      case 'DANGER':
        setHighlightStyles(highlightDanger);
        setHighlightTextStyles(highlightTextDanger);
        if (hasArticleMistake) setHighlightArticle(cardState.word.englishArticle ?? '');
        if (hasWordMistake) setHighlightWord(cardState.word.translation ?? '');
        break;
    }
  }, [
    highlightSuccess,
    highlightWarning,
    highlightDanger,
    highlightTextSuccess,
    highlightTextWarning,
    highlightTextDanger,
    cardState.progress,
    cardState.mistake,
    cardState.selectedArticle,
    cardState.selectedWord,
    cardState.word.translation,
    cardState.word.englishArticle,
  ]);

  /**
   * Render the words.
   * Note the hitslop, it works well here.
   */
  return (
    <Animated.View
      style={[
        wcsButtonContainer,
        wcsButtonActive
      ]}
      key={word}
    >
      <Pressable
        style={[
          wcsButton,
          (
            word === highlightArticle ||
            word === highlightWord
          ) &&
          highlightStyles
        ]}
        onPress={() => handler(word)}
        hitSlop={10}
      >
        <Text style={[
          wcsText,
          (
            word === highlightArticle ||
            word === highlightWord
          ) &&
          highlightTextStyles
        ]}>{word}</Text>
      </Pressable>
    </Animated.View>
  )
}

/**
 * MappedWords Component
 * Map the word buttons
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
    maxWidth: 100
  },
  wcsButton: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    paddingRight: 16,
    paddingLeft: 16,
  },
  wcsText: {
    textAlign: 'center',
    color: colors.dark.text,
    fontWeight: 500
  },
  highlightSuccess: {
    borderColor: colors.dark.success,
    backgroundColor: colors.light.success
  },
  highlightWarning: {
    borderColor: colors.dark.warning,
    backgroundColor: colors.light.warning
  },
  highlightDanger: {
    borderColor: colors.dark.danger,
    backgroundColor: colors.light.danger
  },
  highlightTextSuccess: {
    color: colors.dark.success
  },
  highlightTextWarning: {
    color: colors.dark.warning
  },
  highlightTextDanger: {
    color: colors.dark.danger
  }
});