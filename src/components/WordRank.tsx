import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useContext, useMemo } from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { colors } from "../app/styles";
import { WordCardContext } from "./WordCard/wordCardContext";

/**
 * Typing
 */
interface RankIconProps {
  score?: number;
  size?: number;
}

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
export function RankIcon({ score = 0, size = 12 }: RankIconProps) {
  if (score < 5.) return <MaterialIcons color={fnew} size={size} name="fiber-new" />
  if (score < 15) return <MaterialIcons color={bronze} size={size} name="stars" />
  if (score < 30) return <MaterialIcons color={silver} size={size} name="military-tech" />
  if (score < 60) return <MaterialIcons color={gold} size={size} name="emoji-events" />
  if (score < 80) return <MaterialIcons color={diamond} size={size} name="diamond" />
  else return <MaterialIcons color={memorized} size={size} name="psychology" />
}

/**
 * WordRank Component
 */
export default function WordRank() {
  const { cardState } = useContext(WordCardContext);

  const rankColor = useMemo(() =>
    ({ color: getRankColor(cardState.word.userScore) }),
    [cardState.word.userScore]);

  /**
   * Destructure styles
   */
  const {
    wordRankContainer,
    userScoreText
  } = wordRankStyles;

  return (
    <View style={wordRankContainer}>
      <Animated.Text style={[
        userScoreText,
        rankColor
      ]}>
        {cardState.word.userScore}
      </Animated.Text>
      <RankIcon
        score={cardState.word.userScore}
        size={22}
      />
    </View>
  )
}

/**
 * Styles
 */
const wordRankStyles = StyleSheet.create<Record<string, ViewStyle & TextStyle>>(({
  wordRankContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    margin: 2
  },
  userScoreText: {
    fontSize: 16,
    fontWeight: 700,
  }
})); 