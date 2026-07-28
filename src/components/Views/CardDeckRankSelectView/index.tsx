import colors from '@/src/app/colors';
import sharedStyles from '@/src/app/sharedStyles';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { getDeck } from '@/src/db/interface';
import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import { useUserContext } from '@/src/db/useUserContext';
import type { WordRankKey } from '@/src/util/wordRanks';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import RankButtonList from './RankButtonList';
import RankSelectHeader from './RankSelectHeader';

/**
 * View card deck rank select
 */
export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [ rankCounts, setRankCounts ] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const { cardDeck } = cardDeckState;
  const deckWordCount = cardDeck.wordIds.length;
  const {
    rankSelectFlexStyle,
    rankSelectContainerStyle,
    rankSelectInnerCardStyle,
  } = styles;

  const handleRankSelect = useCallback(async (rank: WordRankKey) => {
    if (user?.id) {
      const deck = await getDeck({
        deck: cardDeck,
        userId: user.id,
        rank,
      });

      if (deck) {
        cardDeckDispatch({ type: 'SET_DECK', payload: deck });
        router.push('/CardDeck');
      }
    }
  }, [
    user?.id,
    cardDeck,
    cardDeckDispatch,
  ]);

  useEffect(() => {
    let isCurrent = true;

    async function loadRankCounts() {
      try {
        if (!user?.id) {
          setRankCounts(emptyDeckRankCounts);
          return;
        }

        const counts = await getDeckRankCounts({
          userId: user.id,
          wordIds: cardDeck.wordIds,
        });

        if (isCurrent) {
          setRankCounts(counts);
        }
      } catch (error) {
        console.error('Could not retrieve deck rank counts:', error);
      }
    }

    loadRankCounts();

    return () => {
      isCurrent = false;
    };
  }, [
    cardDeck.wordIds,
    user?.id,
  ]);

  /**
   * Render the component
   */
  return (
    <View style={rankSelectFlexStyle}>
      <View style={rankSelectContainerStyle}>
        <View style={rankSelectInnerCardStyle}>
          <RankSelectHeader cardDeck={cardDeck} />
          <RankButtonList
            deckWordCount={deckWordCount}
            handleRankSelect={handleRankSelect}
            rankCounts={rankCounts}
          />
        </View>
      </View>
    </View>
  );
}

const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  rankSelectFlexStyle: {
    alignContent: 'center',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
  },
  rankSelectContainerStyle: {
    borderColor: colors.dark.border,
    borderRadius: 16,
    borderWidth: 4,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: containerMargin,
    overflow: 'hidden',
  },
  rankSelectInnerCardStyle: {
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    padding: 32,
  },
});
