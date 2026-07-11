import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from '../../app/colors';
import sharedStyles from '../../app/sharedStyles';
import { getDeck } from "../../db/interface";
import type { DeckRankCounts } from '../../db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '../../db/queries/getDeckRankCounts';
import { useUserContext } from "../../db/useUserContext";
import { getDeckRankProgress, getDeckRankUnlockCount } from '../../util/deckRankProgression';
import { WordRankDefinition, WordRankKey, wordRankDefinitions } from '../../util/wordRanks';
import { useCardDeck } from "../CardDeck/useCardDeck";
import GradientText from '../GradientText';
import LinkButton from "../LinkButton";
import LockOverlay from '../LockOverlay';
import { RankIcon } from '../WordRank';

/**
 * Typing
 */
interface LockedAccessibilityHintProps {
  deckWordCount: number;
  rankCounts: DeckRankCounts;
  rankKey: WordRankKey;
  rankName: string;
}

function getLockedAccessibilityHint({
  deckWordCount,
  rankCounts,
  rankKey,
  rankName,
}: LockedAccessibilityHintProps): string {
  const rankIndex = wordRankDefinitions.findIndex((rank) => rank.key === rankKey);

  const cardsAtOrAboveRank = wordRankDefinitions.reduce((total, rank, index) => {
    return index >= rankIndex ? total + (rankCounts[ rank.key ] ?? 0) : total;
  }, 0);

  const unlockCount = getDeckRankUnlockCount(deckWordCount);

  return `${rankName} unlocks when ${unlockCount} cards reach ${rankName}. You currently have ${cardsAtOrAboveRank}/${unlockCount}.`;
}

/**
 * CardDeckRankSelectView view
 */
export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [ rankCounts, setRankCounts ] = useState<DeckRankCounts>(emptyDeckRankCounts);

  /**
   * Destructure
   */
  const { title } = cardDeckState.cardDeck;
  const deckWordCount = cardDeckState.cardDeck.wordIds.length;

  /**
   * Styles
   */
  const {
    rankSelectContainerStyle,
    rankSelectTitleText,
    innerCardStyle,
    titleRowStyle,
    selectFlexStyle,
    selectContainerStyle,
    deckDescriptionStyle,
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

  /**
   * Load rank counts
   */
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

  /**
   * Render the view
   */
  return (
    <View style={selectFlexStyle}>
      <View style={selectContainerStyle}>
        <View style={innerCardStyle}>
          <View style={titleRowStyle}>
            <Text style={rankSelectTitleText}>Select the deck rank for</Text>
            <GradientText
              colors={[ cardDeckState.cardDeck.colors.dark.primary, cardDeckState.cardDeck.colors.dark.secondary ]}
              fontSize={20}
              text={title}
              fontWeight={700}
            />
          </View>
          <Text style={deckDescriptionStyle}>
            Advance half the deck to unlock the next rank. Advance every card for full completion.
          </Text>
          <View style={rankButtonContainer}>
            {
              wordRankDefinitions.map((item: WordRankDefinition) => {
                /**
                 * Rank vars
                 */
                const { key, name } = item;
                const rankCount = rankCounts[ key ];
                const rankProgress = getDeckRankProgress({
                  deckWordCount,
                  rankCounts,
                  rankKey: key,
                });
                const isRankFullyComplete = rankProgress.completion === 'full';
                const isRankSoftComplete = rankProgress.completion === 'soft';
                const isRankLocked = !rankProgress.isUnlocked;
                const isRankButtonDisabled = !rankProgress.isSelectable;
                const completionText = isRankSoftComplete
                  ? ' · Soft complete'
                  : isRankFullyComplete && rankProgress.isSelectable
                    ? ' · Full complete'
                    : '';

                /**
                 * Rank styles
                 */
                const rankButtonStyle = {
                  backgroundColor: colors.light.rank[ key ],
                  padding: 8,
                  gap: 4
                };

                const rankButtonTextStyle = {
                  color: colors.dark.text
                };

                /**
                 * Select container
                 */
                return (
                  <View key={key} style={rankSelectContainerStyle}>
                    <LockOverlay
                      completeAccessibilityHint={`${name} is fully complete.`}
                      completeAccessibilityLabel={`${name} rank fully complete`}
                      isComplete={isRankFullyComplete && !rankProgress.isSelectable}
                      isLocked={isRankLocked}
                      lockedAccessibilityHint={getLockedAccessibilityHint({
                        deckWordCount,
                        rankCounts,
                        rankKey: key,
                        rankName: name,
                      })}
                      lockedAccessibilityLabel={`${name} rank locked`}
                      overlayStyle={rankLockOverlayStyle}
                    >
                      <LinkButton
                        accessibilityHint={isRankSoftComplete
                          ? `${name} is softly complete and remains available to practice.`
                          : `Practice the ${name} cards in this deck.`}
                        accessibilityLabel={`${name}, ${rankCount} cards${isRankSoftComplete ? ', soft complete' : isRankFullyComplete ? ', full complete' : ''}`}
                        handler={() => handleLevelSelect(key)}
                        style={rankButtonStyle}
                        arrowColor={colors.dark.text}
                        useArrow={false}
                        disabled={isRankButtonDisabled}
                        SVGElement={<RankIcon size={32} rank={key} color={colors.dark.rank[ key ]} />}
                      >
                        <Text style={rankButtonTextStyle}>{name} ({rankCount}){completionText}</Text>
                      </LinkButton>
                    </LockOverlay>
                  </View>
                );
              })
            }
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  selectFlexStyle: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    flexGrow: 1
  },
  selectContainerStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: containerMargin,
    borderColor: colors.dark.border,
    overflow: 'hidden',
    borderWidth: 4,
    borderRadius: 16,
  },
  rankSelectTitleText: {
    fontSize: 16,
    fontFamily: 'lexend-400',
    textAlign: 'center',
  },
  deckDescriptionStyle: {
    fontSize: 14,
    fontFamily: 'lexend-400',
    textAlign: 'center',
    paddingBottom: 8
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
    gap: 8
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
