import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from '../../app/colors';
import sharedStyles from '../../app/sharedStyles';
import { getDeck } from "../../db/interface";
import type { DeckRankCounts } from '../../db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '../../db/queries/getDeckRankCounts';
import { useUserContext } from "../../db/useUserContext";
import { WordRankDefinition, WordRankKey, wordRankDefinitions } from '../../util/wordRanks';
import { useCardDeck } from "../CardDeck/useCardDeck";
import GradientText from '../GradientText';
import LinkButton from "../LinkButton";
import LockOverlay from '../LockOverlay';
import { RankIcon } from '../WordRank';

export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const unlockAmount = 5;

  /**
   * Styles
   */
  const {
    rankSelectTitleText,
    innerCardStyle,
    titleRowStyle,
    rankButtonContainer,
    rankLockOverlayStyle,
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

  const { colors: deckColors, title } = cardDeckState.cardDeck;
  const gradientDark = deckColors?.dark ?? '#000000';
  const gradientLight = deckColors?.light ?? '#ffffff';
  const unlockText = `You need ${unlockAmount} cards to unlock a rank`;

  return (
    <View style={selectContainerStyle}>
      <View style={innerCardStyle}>
        <View style={titleRowStyle}>
          <Text style={rankSelectTitleText}>Select the deck rank for</Text>
          <GradientText
            colors={[gradientDark, gradientLight]}
            fontSize={20}
            text={title}
            fontWeight={700}
          />
          <Text style={rankSelectTitleText}>{unlockText}</Text>
        </View>
        <View style={rankButtonContainer}>
          {
            wordRankDefinitions.map((item: WordRankDefinition) => {
              const { key, name } = item;
              const isLocked = rankCounts[key] < unlockAmount;

              const rankButtonStyle = {
                backgroundColor: colors.light.rank[key],
                padding: 8,
                gap: 4
              }

              const rankButtonTextStyle = {
                color: colors.dark.text
              }

              return (
                <View key={key} style={rankSelectContainerStyle}>
                  <LockOverlay
                    isLocked={isLocked}
                    lockedAccessibilityHint={`${unlockText} You currently have ${rankCounts[key]}.`}
                    lockedAccessibilityLabel={`${name} rank locked`}
                    overlayStyle={rankLockOverlayStyle}
                  >
                    <LinkButton
                      handler={() => handleLevelSelect(key)}
                      style={rankButtonStyle}
                      arrowColor={colors.dark.text}
                      useArrow={false}
                      disabled={isLocked}
                      SVGElement={<RankIcon size={32} rank={key} color={colors.dark.rank[key]} />}
                    >
                      <Text style={rankButtonTextStyle}>{name} ({rankCounts[key]})</Text>
                    </LinkButton>
                  </LockOverlay>
                </View>
              )
            })
          }
        </View>
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
    borderColor: colors.dark.border,
    backgroundColor: colors.light.border,
    overflow: 'hidden',
    borderWidth: 4,
    borderRadius: 16,
  },
  rankSelectTitleText: {
    fontSize: 16,
    fontWeight: 500,
    textAlign: 'center',
  },
  titleRowStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  innerCardStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: colors.light.background,
    flexWrap: 'wrap',
    padding: 32,
    gap: 32
  },
  rankButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rankSelectContainerStyle: {
    flexGrow: 1,
    marginBottom: 4,
    width: '40%' // a hack for 50% without calc
  },
  rankLockOverlayStyle: {
    borderRadius: 8,
  },
  rankButtonStyle: {
    display: 'flex',
    flexDirection: 'column',
    padding: 4,
  }
});
