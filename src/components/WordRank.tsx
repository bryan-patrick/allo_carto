import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import colors from "../app/colors";
import { useCardDeck } from "./CardDeck/useCardDeck";

/**
 * Typing
 */
type RankIconProps = Omit<ComponentProps<typeof MaterialIcons>, "name"> & {
  score?: number;
};

/**
 * Static colors
 */
const {
  fnew,
  bronze,
  silver,
  gold,
  diamond,
  memorized
} = colors.rank;

/**
 * Helpers
 * Yes, I did put a decimal so the ifs would line up.
 */
function getRankColor(score: number = 0) {
  if (score < 5.) return fnew;
  if (score < 15) return bronze;
  if (score < 30) return silver;
  if (score < 60) return gold;
  if (score < 80) return diamond;
  else return memorized;
}

/**
 * RankIcon Component
 */
export function RankIcon({ score = 0, size = 12, ...props }: RankIconProps) {
  if (score < 5.) return <MaterialIcons {...props} color={fnew} size={size} name="fiber-new" />
  if (score < 15) return <MaterialIcons {...props} color={bronze} size={size} name="stars" />
  if (score < 30) return <MaterialIcons {...props} color={silver} size={size} name="military-tech" />
  if (score < 60) return <MaterialIcons {...props} color={gold} size={size} name="emoji-events" />
  if (score < 80) return <MaterialIcons {...props} color={diamond} size={size} name="diamond" />
  else return <MaterialIcons {...props} color={memorized} size={size} name="psychology" />
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

  const currentRankColor = useMemo(() =>
    ({ color: getRankColor(currentScore) }),
    [currentScore]);

  const nextRankColor = useMemo(() =>
    ({ color: getRankColor(nextScore) }),
    [nextScore]);

  /**
   * Animation vars
   */
  const translateY = useSharedValue(0);

  const containerY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
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
      translateY.value = withDelay(600,
        withSpring(-44, {
          stiffness: 180,
          damping: 40,
          mass: 2,
        })
      );
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
        <Animated.View style={currentContainer}>
          <Animated.Text
            style={[
              scoreText,
              currentRankColor,
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
        <Animated.View style={nextContainer}>
          <Animated.Text
            style={[
              scoreText,
              nextRankColor,
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
    backgroundColor: colors.dark.primary,
    paddingLeft: 4,
    paddingRight: 4
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
    height: 22,
    gap: 4
  },
  nextContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    gap: 4
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'red-hat-variable',
  },
})); 
