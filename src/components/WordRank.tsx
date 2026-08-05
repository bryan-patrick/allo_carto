import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import colors from "../app/colors";
import { getWordRankDefinitionByKey, getWordRankDefinitionFromCorrectCount, WordRankKey } from "../util/wordRanks";
import { useCardDeck } from "./CardDeck/useCardDeck";

/**
 * Typing
 */
type RankIconProps = Omit<ComponentProps<typeof MaterialIcons>, "name"> & {
  rank?: WordRankKey;
  score?: number;
};

function getRankColor(score: number = 0, isDark = false) {
  if (isDark) {
    return colors.dark.rank[getWordRankDefinitionFromCorrectCount(score).key];
  }
  return colors.light.rank[getWordRankDefinitionFromCorrectCount(score).key];
}

/**
 * RankIcon Component
 */
export function RankIcon({ rank, score = 0, size = 12, color, ...props }: RankIconProps) {
  let rankDefinition = getWordRankDefinitionFromCorrectCount(score);

  if (rank) {
    rankDefinition = getWordRankDefinitionByKey(rank);
  }

  return (
    <MaterialIcons
      {...props}
      color={color ?? colors.dark.rank[rankDefinition.key]}
      size={size}
      name={rankDefinition.iconName}
    />
  );
}

/**
 * WordRank Component
 */
export default function WordRank() {
  /**
   * State
   */
  const { currentCard } = useCardDeck();
  const [currentScore] = useState(currentCard.correctCount);
  const [nextScore] = useState(currentCard.correctCount + 1);

  const currentRankDarkColor = useMemo(() =>
    ({ color: getRankColor(currentScore, true) }),
    [currentScore]);

  const nextRankDarkColor = useMemo(() =>
    ({ color: getRankColor(nextScore, true) }),
    [nextScore]);

  const currentRankBackgroundColor = useMemo(() =>
  ({
    backgroundColor: getRankColor(currentScore),
    borderColor: getRankColor(currentScore, true),
  }),
    [currentScore]);

  const nextRankBackgroundColor = useMemo(() =>
  ({
    backgroundColor: getRankColor(nextScore),
    borderColor: getRankColor(nextScore, true),
  }),
    [nextScore]);

  /**
   * Animation vars
   */
  const translateY = useSharedValue(0);

  const containerY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }]
  }));

  /**
   * Destructure styles
   */
  const {
    wordRankContainer,
    animationContainer,
    currentContainer,
    nextContainer,
    scoreText,
    icon,
  } = wordRankStyles;

  /**
   * When the correctCount changes, trigger our animation
   */
  useEffect(() => {
    if (currentCard.correctCount !== currentScore) {
      translateY.set(withDelay(400,
        withSpring(-44, {
          stiffness: 1200,
          damping: 30,
          mass: 1,
        })
      ));
    }
  }, [
    currentScore,
    currentCard.correctCount,
    translateY
  ]);

  /**
   * Render
   */
  return (
    <View style={wordRankContainer}>
      <Animated.View style={[animationContainer, containerY]}>
        <Animated.View style={[
          currentContainer,
          currentRankBackgroundColor
        ]}>
          <Animated.Text
            style={[
              scoreText,
              currentRankDarkColor,
            ]}
          >
            {currentScore}
          </Animated.Text>
          <RankIcon
            style={icon}
            score={currentScore}
            size={20}
          />
        </Animated.View>
        <Animated.View style={[
          nextContainer,
          nextRankBackgroundColor
        ]}>
          <Animated.Text
            style={[
              scoreText,
              nextRankDarkColor,
            ]}
          >
            {nextScore}
          </Animated.Text>
          <RankIcon
            style={icon}
            score={nextScore}
            size={22}
          />
        </Animated.View>
      </Animated.View>
    </View>
  )
}

/**
 * Styles
 */
const wordRankStyles = StyleSheet.create<Record<string, ViewStyle & TextStyle>>(({
  wordRankContainer: {
    display: 'flex',
    height: 22,
    backgroundColor: colors.dark.background,
  },
  animationContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 22,
  },
  currentContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 4,
    height: 22,
    gap: 4,
    borderLeftWidth: 1
  },
  nextContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    gap: 4,
    borderLeftWidth: 1
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'azeret-mono-400',
  },
})); 
