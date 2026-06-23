import colors from "@/src/app/colors";
import { Dispatch, memo, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useCardDeck } from "../CardDeck/useCardDeck";
import { useWordCardUI } from "./useWordCardUI";
import { type CardProgress } from "./wordCardContext";

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
  isActive: boolean;
  isCorrectWord: boolean;
  isHighlighted: boolean;
  isSelectedWrong: boolean;
  progress: CardProgress;
  highlightStyles?: ViewStyle;
  highlightTextStyles?: TextStyle;
  handler: Dispatch<string>;
}

/**
 * Private MappedButton Component
 * 
 * We need this component in addition to the other one
 * (below) so that we can create animations scoped per button.
 * We can't animate like this in a map.
 */
const MappedButton = memo(function MappedButtonMemo({
  word,
  isActive,
  isCorrectWord,
  isHighlighted,
  isSelectedWrong,
  progress,
  highlightStyles,
  highlightTextStyles,
  handler,
}: MappedButtonProps) {
  /**
   * Animation vars
   */
  const buttonBackgroundColor = useSharedValue(colors.light.background);
  const buttonBoxShadow = useSharedValue(`0 4px 0 0 ${colors.light.border}`);
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
    switch (progress) {
      case 'SUCCESS':
      case 'DANGER':
        if (isCorrectWord) {
          buttonY.value = withTiming(-6, timing);
          buttonBackgroundColor.value = withTiming(colors.light.success, timing);
        } else {
          buttonBackgroundColor.value = withTiming(colors.light.border, timing);
          buttonY.value = withTiming(0, timing);
        }

        if (isSelectedWrong) {
          buttonY.value = withTiming(0, timing);
          buttonBackgroundColor.value = withTiming(colors.light.background, timing);
        }

        buttonBoxShadow.value = `0 6px 0 0 ${colors.dark.border}`
        break;
      default:
        if (isActive) {
          buttonBackgroundColor.value = colors.dark.primaryActive;
          buttonY.value = withTiming(6, timing);
          buttonBoxShadow.value = '';
        } else {
          buttonY.value = withTiming(0, timing);
          buttonBackgroundColor.value = withTiming(colors.light.background, timing);
          buttonBoxShadow.value = `0 6px 0 0 ${colors.light.border}`
        }
        break;
    }
  }, [
    isCorrectWord,
    isSelectedWrong,
    progress,
    isActive,
    timing,
    buttonY,
    buttonBackgroundColor,
    buttonBoxShadow
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
          isHighlighted &&
          highlightStyles
        ]}
        onPress={() => handler(word)}
        hitSlop={10}
      >
        <Text style={[
          wcsText,
          isHighlighted &&
          highlightTextStyles
        ]}>{word}</Text>
      </AnimatedPressable>
    </Animated.View>
  )
});

/**
 * MappedWords Component
 * Map the word buttons
 */
const MappedWords = memo(
  function MappedWordsMemo({
    words,
    activeWord,
    handler
  }: MappedWordsProps) {
    /**
     * Context
     */
    const { currentCard } = useCardDeck();
    const { cardState } = useWordCardUI();

    /**
     * Destructure Styles
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
     * Current card data
     */
    const {
      highlightArticle,
      highlightWord,
      highlightStyles,
      highlightTextStyles
    } = useMemo(() => {
      const hasArticleMistake =
        cardState.mistake === 'ARTICLE' ||
        cardState.mistake === 'BOTH';

      const hasWordMistake =
        cardState.mistake === 'WORD' ||
        cardState.mistake === 'BOTH';

      switch (cardState.progress) {
        case 'SUCCESS':
          return {
            highlightArticle: cardState.selectedArticle,
            highlightWord: cardState.selectedWord,
            highlightStyles: highlightSuccess,
            highlightTextStyles: highlightTextSuccess,
          };
        case 'WARNING':
          return {
            highlightArticle: hasArticleMistake ? cardState.selectedArticle : null,
            highlightWord: hasWordMistake ? cardState.selectedWord : null,
            highlightStyles: highlightWarning,
            highlightTextStyles: highlightTextWarning,
          };
        case 'DANGER':
          return {
            highlightArticle: hasArticleMistake ? (currentCard.englishArticle ?? '') : null,
            highlightWord: hasWordMistake ? currentCard.englishWords[0] : null,
            highlightStyles: highlightDanger,
            highlightTextStyles: highlightTextDanger,
          };
        default:
          return {
            highlightArticle: null,
            highlightWord: null,
            highlightStyles: undefined,
            highlightTextStyles: undefined,
          };
      }
    }, [
      currentCard.englishWords,
      cardState.mistake,
      cardState.progress,
      cardState.selectedWord,
      cardState.selectedArticle,
      currentCard.englishArticle,
      highlightSuccess,
      highlightWarning,
      highlightDanger,
      highlightTextSuccess,
      highlightTextWarning,
      highlightTextDanger,
    ]);

    return words.map((word: string) => (
      <MappedButton
        key={word}
        word={word}
        isActive={word === activeWord}
        isCorrectWord={
          currentCard.englishWords.includes(word) ||
          word === currentCard.englishArticle
        }
        isSelectedWrong={
          (cardState.selectedArticle === word && word !== currentCard.englishArticle) ||
          (cardState.selectedWord === word && !currentCard.englishWords.includes(word))
        }
        isHighlighted={
          word === highlightArticle ||
          word === highlightWord
        }
        progress={cardState.progress}
        highlightStyles={highlightStyles}
        highlightTextStyles={highlightTextStyles}
        handler={handler}
      />
    ))
  });

export default MappedWords;

/**
 * Styles
 */
const mappedWordsStyles = StyleSheet.create({
  wcsButtonContainer: {
    display: 'contents',
  },
  wcsButton: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: 'transparent',
    padding: 14,
    maxWidth: '50%',
    minWidth: 70,
    backgroundColor: colors.light.background,
  },
  wcsText: {
    textAlign: 'center',
    color: colors.dark.text,
    fontFamily: 'lexend-600',
  },
  highlightSuccess: {
    backgroundColor: colors.light.success,
  },
  highlightWarning: {
  },
  highlightDanger: {
    borderBottomColor: colors.dark.success,
  },
  highlightTextSuccess: {
    color: colors.dark.success
  },
  highlightTextWarning: {
  },
  highlightTextDanger: {

  }
});
