import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
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
 * Yes, I did put a period next to the "5" so the ifs would line up.
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
  const { currentCard } = useCardDeck();

  /**
   * State
   */
  const [currentScore] = useState(currentCard.userScore);
  const [nextScore] = useState(currentCard.userScore + 1);

  const currentRankColor = useMemo(() =>
    ({ color: getRankColor(currentScore) }),
    [currentScore]);

  const nextRankColor = useMemo(() =>
    ({ color: getRankColor(nextScore) }),
    [nextScore]);

  /**
   * Animation vars
   */
  const translateY = useSharedValue(22);

  const containerY = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  /**
   * Destructure styles
   */
  const {
    container,
    textContainer,
    iconContainer,
    score,
    icon,
  } = wordRankStyles;

  useEffect(() => {
    if (currentCard.userScore !== currentScore) {
      translateY.value = withDelay(600,
        withSpring(-20, {
          stiffness: 360,
          damping: 40,
          mass: 4,
        })
      );
    }
  }, [
    currentScore,
    currentCard.userScore,
    translateY
  ]);

  return (
    <Animated.View style={[container, containerY]}>
      <Animated.View style={textContainer}>
        <Animated.Text
          style={[
            score,
            currentRankColor,
          ]}
        >
          {currentScore}
        </Animated.Text>
        <Animated.Text
          style={[
            score,
            nextRankColor,
          ]}
        >
          {nextScore}
        </Animated.Text>
      </Animated.View>
      <Animated.View style={iconContainer}>
        <RankIcon
          style={icon}
          score={currentScore}
          size={22}
        />
        <RankIcon
          style={icon}
          score={nextScore}
          size={22}
        />
      </Animated.View>
    </Animated.View>
  )
}

/**
 * Styles
 */
const wordRankStyles = StyleSheet.create<Record<string, ViewStyle & TextStyle>>(({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    height: 25
  },
  textContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20
  },
  score: {
    fontSize: 16,
    fontWeight: 600,
    height: 22
  },
  icon: {
    height: 22
  },
})); 
