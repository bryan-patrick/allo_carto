import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import type { WordRankKey } from '@/src/util/wordRanks';
import { wordRankDefinitions } from '@/src/util/wordRanks';
import { StyleSheet, View } from 'react-native';
import RankButton from './RankButton';

/**
 * Typing
 */
interface RankButtonListProps {
  deckWordCount: number;
  handleRankSelect: (rank: WordRankKey) => Promise<void>;
  rankCounts: DeckRankCounts;
}

/**
 * Component rank button list
 */
export default function RankButtonList({
  deckWordCount,
  handleRankSelect,
  rankCounts,
}: RankButtonListProps) {
  const { rankButtonListStyle } = styles;

  /**
   * Render the component
   */
  return (
    <View style={rankButtonListStyle}>
      {wordRankDefinitions.map((rankDefinition) => (
        <RankButton
          deckWordCount={deckWordCount}
          handleRankSelect={handleRankSelect}
          key={rankDefinition.key}
          rankCounts={rankCounts}
          rankDefinition={rankDefinition}
        />
      ))}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  rankButtonListStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
