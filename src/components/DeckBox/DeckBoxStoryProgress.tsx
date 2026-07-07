import type { DeckRankCounts } from "@/src/db/queries/getDeckRankCounts";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import colors from "../../app/colors";
import type { WordProgressKey } from "../../util/wordRanks";
import type { CardDeck } from "../CardDeck/cardDeckTypes";
import SecondaryButton from "../SecondaryButton";
import SVGArrowUpFromLine from "../SVG/SVGArrowUpFromLine";
import SVGRightArrow from "../SVG/SVGRightArrow";
import DeckBoxModal from "./DeckBoxModal";

const plopStyleByProgress: Record<WordProgressKey, ViewStyle> = {
  unseen: {
    backgroundColor: 'transparent',
    borderColor: colors.dark.border,
    opacity: 0.35,
  },
  fnew: {
    backgroundColor: colors.light.rank.fnew,
    borderColor: colors.dark.rank.fnew,
    opacity: 0.2,
  },
  bronze: {
    backgroundColor: colors.light.rank.bronze,
    borderColor: colors.dark.rank.bronze,
    opacity: 0.75,
  },
  silver: {
    backgroundColor: colors.light.rank.silver,
    borderColor: colors.dark.rank.silver,
    opacity: 0.85,
  },
  gold: {
    backgroundColor: colors.light.rank.gold,
    borderColor: colors.dark.rank.gold,
    opacity: 0.95,
  },
  diamond: {
    backgroundColor: colors.light.rank.diamond,
    borderColor: colors.dark.rank.diamond,
    opacity: 1,
  },
};

interface DeckBoxStoryProgressProps {
  deck: CardDeck;
  deckCompletionPercent: number;
  handleShowStory: () => void;
  handleViewCards: () => void;
  modalVisible: boolean;
  rankCounts: DeckRankCounts;
  setModalVisible: (modalVisible: boolean) => void;
  wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * DeckBoxStoryProgress component
 */
export default function DeckBoxStoryProgress({
  deck,
  deckCompletionPercent,
  handleShowStory,
  handleViewCards,
  modalVisible,
  rankCounts,
  setModalVisible,
  wordProgressKeyByWordId,
}: DeckBoxStoryProgressProps) {
  const {
    storyProgressContainerStyle,
    storyProgressHeaderStyle,
    storyProgressTitleStyle,
    storyProgressStyle,
    storyProgressTextStyle,
    storyProgressButtonContainerStyle,
    storyProgressButtonStyle,
    storyProgressButtonTextStyle,
    plopContainerStyle,
    plopStyle,
  } = styles;

  return (
    <View style={[storyProgressContainerStyle]}>
      <View style={[storyProgressHeaderStyle, { borderColor: deck.colors.dark.primary }]}>
        <Text style={[storyProgressTitleStyle, { color: deck.colors.dark.primary }]}>Story Progress</Text>
        <Text style={[storyProgressTextStyle, { color: deck.colors.dark.primary }]}>
          {deckCompletionPercent}%
        </Text>
      </View>
      {
        /**
         * Story Progress
         */
      }
      <View style={storyProgressStyle}>
        <View style={plopContainerStyle}>
          {deck.story?.map(({ wordId, text }, index) => {
            const progress = wordProgressKeyByWordId[wordId ?? ''] ?? 'unseen';

            return (
              <View
                key={`plop-${index}-${wordId}-${text}`}
                style={[plopStyle, plopStyleByProgress[progress]]}
              />
            )
          })}
        </View>
      </View>
      <View style={storyProgressButtonContainerStyle}>
        <SecondaryButton
          style={[storyProgressButtonStyle, {
            borderColor: deck.colors.dark.primary,
            shadowColor: deck.colors.dark.primary,
          }]}
          textStyle={[storyProgressButtonTextStyle, {
            color: deck.colors.dark.primary,
          }]}
          onPress={handleShowStory}
          hitSlop={4}
          SVGElement={
            <SVGArrowUpFromLine
              color={colors.dark.text}
              height="14px"
              width="14px"
            />
          }
        >
          Show Story
        </SecondaryButton>
        {
          /**
           * Modal
           */
        }
        <DeckBoxModal
          deck={deck}
          modalVisible={modalVisible}
          rankCounts={rankCounts}
          setModalVisible={setModalVisible}
          wordProgressKeyByWordId={wordProgressKeyByWordId}
        />
        <SecondaryButton
          style={[storyProgressButtonStyle, {
            borderColor: deck.colors.dark.primary,
            shadowColor: deck.colors.dark.primary,
          }]}
          textStyle={[storyProgressButtonTextStyle, {
            color: deck.colors.dark.primary,
          }]}
          onPress={handleViewCards}
          hitSlop={4}
          SVGElement={
            <SVGRightArrow
              height="14px"
              width="14px"
              color={colors.dark.text}
            />
          }
        >
          View Cards
        </SecondaryButton>
      </View>
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  storyProgressContainerStyle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  storyProgressHeaderStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  storyProgressTitleStyle: {
    fontSize: 16,
    fontFamily: 'lexend-600',
  },
  storyProgressStyle: {
    alignItems: 'center',
    borderColor: colors.dark.border,
    flexDirection: 'row',
  },
  storyProgressTextStyle: {
    fontFamily: 'lexend-600',
    fontSize: 16,
  },
  storyProgressButtonContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  storyProgressButtonStyle: {
    flexGrow: 1,
  },
  storyProgressButtonTextStyle: {
    fontSize: 12,
  },
  plopContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  plopStyle: {
    width: 10,
    height: 5,
    borderWidth: 1,
  },
});
