import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useContext, useMemo } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
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
 * Helpers
 */
function getRankColor(score: number = 0) {
  if (score < 5) return colors.rank.fnew;
  if (score < 15) return colors.rank.bronze;
  if (score < 30) return colors.rank.silver;
  if (score < 60) return colors.rank.gold;
  if (score < 80) return colors.rank.diamond;
  else return colors.rank.memorized;
}

/**
 * RankIcon Component
 */
export function RankIcon({ score = 0, size = 12 }: RankIconProps) {
  const { fnew, bronze, silver, gold, diamond, memorized } = colors.rank;

  if (score < 5) return <MaterialIcons color={fnew} size={size} name="fiber-new" />
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
      <Text style={[
        userScoreText,
        rankColor
      ]}>
        {cardState.word.userScore}
      </Text>
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