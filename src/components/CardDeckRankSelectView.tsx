import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import colors from '../app/colors';
import sharedStyles from '../app/sharedStyles';
import { getDeck } from "../db/interface";
import type { DeckRankCounts } from '../db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '../db/queries/getDeckRankCounts';
import { useUserContext } from "../db/useUserContext";
import { WordRankDefinition, WordRankKey, wordRankDefinitions } from '../util/wordRanks';
import { useCardDeck } from "./CardDeck/useCardDeck";
import GradientText from './GradientText';
import LinkButton from "./LinkButton";
import { RankIcon } from './WordRank';

export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);

  /**
   * Styles
   */
  const {
    rankSelectTitleText,
    innerCardStyle,
    titleRowStyle,
    deckImageStyle,
  } = styles;

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

  const {
    selectContainerStyle,
    rankSelectContainerStyle
  } = styles;

  const { colors: deckColors, title, image } = cardDeckState.cardDeck;
  const gradientDark = deckColors?.dark ?? '#000000';
  const gradientLight = deckColors?.light ?? '#ffffff';

  return (
    <View style={selectContainerStyle}>
      <ImageBackground style={deckImageStyle} source={image} />
      <View style={innerCardStyle}>
        <View style={titleRowStyle}>
          <Text style={rankSelectTitleText}>Select your word rank for</Text>
          <GradientText
            colors={[gradientDark, gradientLight]}
            fontSize={20}
            text={title}
            fontWeight={700}
          />
        </View>
        {
          wordRankDefinitions.map((item: WordRankDefinition) => {
            const { key, name } = item;

            const rankButtonStyle = {
              backgroundColor: colors.light.rank[key],
              padding: 8,
              paddingBottom: 12,
              gap: 4
            }

            const rankButtonTextStyle = {
              color: colors.dark.text
            }

            return (
              <View key={key} style={rankSelectContainerStyle}>
                <LinkButton
                  handler={() => handleLevelSelect(key)}
                  style={rankButtonStyle}
                  arrowColor={colors.dark.text}
                  useArrow={false}
                  disabled={rankCounts[key] < 5}
                  SVGElement={<RankIcon size={32} rank={key} color={colors.dark.rank[key]} />}
                >
                  <Text style={rankButtonTextStyle}>{name} ({rankCounts[key]})</Text>
                </LinkButton>
              </View>
            )
          })
        }
      </View>
    </View>
  )
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles

/**
 * Styles
 */
const styles = StyleSheet.create({
  selectContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: containerMargin,
    borderWidth: 2,
    borderColor: colors.dark.border,
    backgroundColor: colors.light.border,
    overflow: 'hidden',
    borderRadius: 12,
    padding: 8,
  },
  rankSelectTitleContainer: {
    margin: 0,
  },
  rankSelectTitleText: {
    fontSize: 18,
    fontWeight: 500,
  },
  deckImageStyle: {
    height: 150,
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  titleRowStyle: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8,
  },
  innerCardStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.light.background,
    flexWrap: 'wrap',
    padding: 16,
  },
  rankSelectContainerStyle: {
    flexGrow: 1,
    flexShrink: 1,
    margin: 8,
    marginBottom: 12,
    width: '40%' // a hack for 50% without calc
  },
  rankButtonStyle: {
    display: 'flex',
    flexDirection: 'column',
    padding: 4,
  }
});
