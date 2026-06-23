import colors from "@/src/app/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";
import { Word } from "../CardDeck/cardDeckTypes";

/**
 * Typing
 */
interface ResultsListProps {
  isCorrect: boolean;
  wordArr: Word[];
}

/**
 * ResultsList component
 */
export default function ResultsList({ isCorrect, wordArr }: ResultsListProps) {

  /**
   * Destructure styles
   */
  const {
    sectionTitleStyle,
    wordRowContainerStyle,
    checkMarKContainerStyle,
    wordRowStyle,
    wordsListStyle,
    frenchWordStyle,
    englishWordStyle,
    successStyle,
    dangerStyle,
    CEFRStyle
  } = styles;

  /**
   * Is correct or nah?
   */
  const title: string = isCorrect ? 'Correct' : 'Incorrect';
  const iconColor: string = isCorrect ? colors.dark.success : colors.dark.danger;
  const isCorrectStyle: TextStyle = isCorrect ? successStyle : dangerStyle;
  const iconName: ComponentProps<typeof MaterialIcons>["name"] = isCorrect ? 'check' : 'close';
  const emptyText = isCorrect ? "You got none correct. Try again!" : "Wow, you had no incorrect words! Nice!"

  /**
   * Render the results list
   */
  return (
    <View style={wordsListStyle}>
      <Text style={sectionTitleStyle}>{title}</Text>
      {wordArr.length > 0 && wordArr.map((word: Word) => {
        const {
          frenchWord,
          correctCount,
          englishWords,
          CEFR
        } = word;

        /**
         * Map out the words
         */
        return (
          <View key={`${frenchWord}-${correctCount}`} style={wordRowContainerStyle}>
            <View style={checkMarKContainerStyle}>
              <MaterialIcons
                name={iconName}
                size={24}
                color={iconColor}
              />
              <View style={wordRowStyle}>
                <Text style={frenchWordStyle}>{frenchWord}</Text>
                <Text style={[englishWordStyle, isCorrectStyle]}>{englishWords.join(', ')}</Text>
              </View>
            </View>
            <Text style={[CEFRStyle, { backgroundColor: colors.light.CEFR[CEFR] }]}>{CEFR}</Text>
          </View>
        );
      })}
      {wordArr.length === 0 && <Text>{emptyText}</Text>}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  sectionTitleStyle: {
    fontSize: 18,
    fontFamily: 'lexend-600',
    color: colors.dark.text,
    marginBottom: 2
  },
  wordRowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.light.border,
    paddingTop: 1,
    paddingBottom: 1
  },
  checkMarKContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  wordRowStyle: {
    padding: 2,
  },
  wordsListStyle: {
    display: 'flex',
    flexDirection: 'column',
    padding: 4,
  },
  frenchWordStyle: {
    fontSize: 14,
    fontFamily: 'lexend-400'
  },
  englishWordStyle: {
    fontSize: 16,
    fontFamily: 'lexend-600',
  },
  successStyle: {
    color: colors.dark.success
  },
  dangerStyle: {
    color: colors.dark.danger
  },
  correctCountStyle: {

  },
  CEFRStyle: {
    fontFamily: 'azeret-mono-600',
    fontSize: 12,
    padding: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
    boxShadow: `0 2px 0 0 ${colors.light.border}`
  }
});
