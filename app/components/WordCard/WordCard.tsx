import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { colors } from "../../styles";
import { CardContext } from './cardContext';

/**
 * Typing
 */
export interface WordProps {
  id: string;
  translation: string;
  pronunciation: string;
  CEFRLevel: string;
  lemmaId?: string;
  frenchArticle?: string;
  englishArticle?: string;
  tense?: string;
  gender?: 'feminine' | 'masculine';
  partOfSpeech?: string;
  userScore?: number;
}

interface WordCardProps {
  word: WordProps;
}

/**
 * WordCard Component
 */
export default function WordCard({ word }: WordCardProps) {
  const {
    id,
    pronunciation,
    CEFRLevel,
    userScore,
    frenchArticle,
    englishArticle,
    translation
  } = word;
  const {
    wordId,
    wordPronunciation,
    cardGradient,
    wordCard,
    cardCEFRLevel,
    cardUserScore,
    cardMain,
    answerSlotContainer,
    answerSlot,
    hiddenMeasureText,
  } = wordCardStyles;
  const { cardState } = useContext(CardContext);
  const displayedArticle = cardState.selectedArticle ?? englishArticle ?? '';
  const displayedWord = cardState.selectedWord ?? translation ?? '';
  const articleClass = { color: cardState.selectedArticle ? colors.dark.text : 'transparent' };
  const wordClass = { color: cardState.selectedWord ? colors.dark.text : 'transparent' };

  /**
   * Animation vars
   */
  const articleWidth = useSharedValue(0);
  const wordWidth = useSharedValue(0);

  const timing = useMemo(() => ({
    duration: 120,
    easing: Easing.inOut(Easing.ease)
  }), []);

  const articleWidthStyle = useAnimatedStyle(() => ({
    width: articleWidth.value
  }));

  const wordWidthStyle = useAnimatedStyle(() => ({
    width: wordWidth.value
  }));


  /**
   * Handle setting the animated width of the selected word/article
   */
  const handleArticleWidth = (event: LayoutChangeEvent) => {
    articleWidth.value = withTiming(event.nativeEvent.layout.width, timing);
  };

  const handleWordWidth = (event: LayoutChangeEvent) => {
    wordWidth.value = withTiming(event.nativeEvent.layout.width, timing);
  };

  return (
    <View style={wordCard}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[colors.light.primary, colors.dark.border]}
        style={cardGradient}
      >
        <Text style={cardCEFRLevel}>{CEFRLevel}</Text>
        <Text style={cardUserScore}>{userScore}</Text>
      </LinearGradient>
      <View style={cardMain}>
        <Text style={wordId}>{frenchArticle}&nbsp;{id}</Text>
        <Text style={wordPronunciation}>({pronunciation})</Text>
      </View>
      <View style={answerSlotContainer}>
        {englishArticle && (
          <>
            <Text
              numberOfLines={1}
              onLayout={handleArticleWidth}
              style={[answerSlot, hiddenMeasureText]}
            >
              {displayedArticle}
            </Text>
            <Animated.Text
              numberOfLines={1}
              style={[answerSlot, articleClass, articleWidthStyle]}
            >
              {displayedArticle}
            </Animated.Text>
          </>
        )}
        <Text
          numberOfLines={1}
          onLayout={handleWordWidth}
          style={[answerSlot, hiddenMeasureText]}
        >
          {displayedWord}
        </Text>
        <Animated.Text
          numberOfLines={1}
          style={[answerSlot, wordClass, wordWidthStyle]}
        >
          {displayedWord}
        </Animated.Text>
      </View>
    </View>
  )
}

/**
 * Styles
 */
const wordCardStyles = StyleSheet.create({
  wordCard: {
    backgroundColor: colors.light.background,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    borderRadius: 8,
  },
  cardGradient: {
    alignContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 4,
    paddingRight: 8,
    paddingLeft: 8,
    gap: 4,
  },
  cardCEFRLevel: {
    color: colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardUserScore: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMain: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingRight: 8,
    paddingLeft: 8,
  },
  wordId: {
    color: colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
  },
  wordPronunciation: {
    fontSize: 18,
    color: colors.dark.text
  },
  answerSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12
  },
  answerSlot: {
    borderBottomWidth: 2,
    color: 'transparent',
    paddingRight: 8,
    paddingLeft: 8,
    fontWeight: 500,
    fontSize: 18
  },
  hiddenMeasureText: {
    position: 'absolute',
    opacity: 0,
    borderBottomWidth: 0
  }
});
