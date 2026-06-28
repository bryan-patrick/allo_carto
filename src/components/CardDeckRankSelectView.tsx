import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from '../app/colors';
import { getDeck } from "../db/interface";
import type { DeckRankCounts } from '../db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '../db/queries/getDeckRankCounts';
import { useUserContext } from "../db/useUserContext";
import { WordRankDefinition, WordRankKey, wordRankDefinitions } from '../util/wordRanks';
import { useCardDeck } from "./CardDeck/useCardDeck";
import LinkButton from "./LinkButton";

export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
  /**
   * Handlers
   */
  const handleLevelSelect = useCallback(async (rank: WordRankKey) => {
    if (user?.id) {
      const deck = await getDeck({
        deck: cardDeckState.cardDeck,
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
    cardDeckState.cardDeck,
    cardDeckDispatch
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
          wordIds: cardDeckState.cardDeck.wordIds,
        });

        if (isCurrent) setRankCounts(counts);

      } catch (error) {
        console.error('Could not retrieve deck rank counts:', error);
      }
    }

    loadRankCounts();

    return () => {
      isCurrent = false;
    };
  }, [
    cardDeckState.cardDeck.wordIds,
    user?.id
  ]);

  const { selectContainerStyle } = styles;

  return (
    <View style={selectContainerStyle}>
      {
        wordRankDefinitions.map((item: WordRankDefinition) => {
          const { key, name } = item;

          const rankButtonStyle = {
            backgroundColor: colors.rank[key],
          }

          const rankButtonTextStyle = {
            color: colors.dark.text
          }

          return (
            <View key={key}>
              <LinkButton
                handler={() => handleLevelSelect(key)}
                style={rankButtonStyle}
                arrowColor={colors.dark.text}
                disabled={false}
              >
                <Text style={rankButtonTextStyle}>{name}</Text>
              </LinkButton>
            </View>
          )
        })
      }
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  selectContainerStyle: {
    padding: 16
  }
});