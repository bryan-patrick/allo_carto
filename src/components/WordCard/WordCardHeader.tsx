import { colors } from "@/src/app/styles";
import { LinearGradient } from "expo-linear-gradient";
import { useContext } from "react";
import { Text } from "react-native";
import WordRank from "../WordRank";
import { sharedWordCardStyles } from "./sharedWordCardStyles";
import { WordCardContext } from "./wordCardContext";

export default function WordCardHeader() {
  const { cardState } = useContext(WordCardContext);
  const {
    cardGradient,
    cardCEFRLevel,
  } = sharedWordCardStyles;

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={[colors.light.primary, colors.dark.border]}
      style={cardGradient}
    >
      <Text style={cardCEFRLevel}>{cardState.word.CEFRLevel}</Text>
      <WordRank />
    </LinearGradient>
  )
}