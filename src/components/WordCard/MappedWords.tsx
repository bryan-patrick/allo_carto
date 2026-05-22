import { colors } from "@/src/app/styles";
import { Dispatch, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { WordCardContext } from "./wordCardContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const buttonBackgroundColor = useSharedValue(colors.light.background);
  const buttonBoxShadow = useSharedValue(`0 4px 0 0 ${colors.light.border}`);
  const borderColor = useSharedValue(colors.dark.border);
  const textColor = useSharedValue(colors.dark.text);
  const buttonY = useSharedValue(0);

  const wcsButtonActive = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
    backgroundColor: buttonBackgroundColor.value,
    boxShadow: buttonBoxShadow.value,
  }));

  const timing = useMemo(() => ({
    duration: 70,
    easing: Easing.inOut(Easing.bounce)
  }), []);

  /**
   * Handle animation side effects
   */
  useEffect(() => {

    // TODO Raise the buttons

    if (activeWord !== word) {
      buttonY.value = withTiming(0, timing);
      buttonBackgroundColor.value = withTiming(colors.light.background, timing);
      buttonBoxShadow.value = `0 6px 0 0 ${colors.light.border}`
      textColor.value = colors.dark.text;
    } else {
      if (cardState.progress === 'SUCCESS') {
        buttonY.value = withTiming(-6, timing);
        buttonBackgroundColor.value = withTiming(colors.light.success, timing);
        buttonBoxShadow.value = `0 0px 8px 0 ${colors.light.border}`
      } else {
        buttonY.value = withTiming(6, timing);
        buttonBoxShadow.value = '';
      }

    }
  }, [
    cardState.progress,
    borderColor,
    textColor,
    activeWord,
    timing,
    buttonY,
    buttonBackgroundColor,
    buttonBoxShadow,
    word
  ]);

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
      style={wcsButtonContainer}
      key={word}
    >
      <AnimatedPressable
        style={[
          wcsButton,
          wcsButtonActive,
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
      </AnimatedPressable>
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
    display: 'contents',
  },
  wcsButton: {
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 12,
    paddingRight: 16,
    paddingLeft: 16,
    maxWidth: 120,
    backgroundColor: colors.light.background,
  },
  wcsText: {
    textAlign: 'center',
    color: colors.dark.text,
    fontWeight: 500
  },
  highlightSuccess: {
    backgroundColor: colors.light.success,
  },
  highlightWarning: {
    borderBottomColor: colors.light.warning,
  },
  highlightDanger: {
    borderBottomColor: colors.dark.success,
  },
  highlightTextSuccess: {
    color: colors.dark.success
  },
  highlightTextWarning: {
    color: colors.dark.warning
  },
  highlightTextDanger: {

  }
});