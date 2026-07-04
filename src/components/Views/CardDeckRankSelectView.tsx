import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from '../../app/colors';
import sharedStyles from '../../app/sharedStyles';
import { getDeck } from "../../db/interface";
import type { DeckRankCounts } from '../../db/queries/getDeckRankCounts';
import getDeckRankCounts, { emptyDeckRankCounts } from '../../db/queries/getDeckRankCounts';
import { useUserContext } from "../../db/useUserContext";
import {
  EARLY_RANK_UNLOCK_COUNT,
  getDeckRankSelectionState
} from '../../util/deckRankProgression';
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
  const currentRankCount = rankCounts[rankKey] ?? 0;
  let hint = `Complete the earliest active rank to keep progressing. The next rank can unlock early when ${EARLY_RANK_UNLOCK_COUNT} cards reach it. You currently have ${currentRankCount}.`;

  if (rankKey === 'diamond') {
    hint = `Diamond unlocks when every card in this deck reaches Diamond. You currently have ${currentRankCount}/${deckWordCount}.`;
  }

  if (currentRankCount === 0) {
    hint = `${rankName} unlocks once cards move into that rank.`;
  }

  return hint;
}

export default function CardDeckRankSelectView() {
  const user = useUserContext();
  const { cardDeckState, cardDeckDispatch } = useCardDeck();
  const [rankCounts, setRankCounts] = useState<DeckRankCounts>(emptyDeckRankCounts);

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

  const { colors: deckColors, title } = cardDeckState.cardDeck;
  const gradientDark = deckColors?.dark ?? '#000000';
  const gradientLight = deckColors?.light ?? '#ffffff';
  const deckWordCount = cardDeckState.cardDeck.wordIds.length;

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
              colors={[gradientDark, gradientLight]}
              fontSize={20}
              text={title}
              fontWeight={700}
            />
          </View>
          <Text style={deckDescriptionStyle}>Get 20 words to the next rank to unlock it early. Finish a rank to unlock more!</Text>
          <View style={rankButtonContainer}>
            {
              wordRankDefinitions.map((item: WordRankDefinition) => {
                /**
                 * Rank vars
                 */
                const { key, name } = item;
                const rankCount = rankCounts[key];
                const rankSelectionState = getDeckRankSelectionState({
                  deckWordCount,
                  rankCounts,
                  rankKey: key,
                });
                const isRankComplete = rankSelectionState === 'complete';
                const isRankLocked = rankSelectionState === 'locked';
                const isRankAvailable = rankSelectionState === 'available';
                const isRankButtonDisabled = !isRankAvailable;

                /**
                 * Rank styles
                 */
                const rankButtonStyle = {
                  backgroundColor: colors.light.rank[key],
                  padding: 8,
                  gap: 4
                }

                const rankButtonTextStyle = {
                  color: colors.dark.text
                }

                /**
                 * Select container
                 */
                return (
                  <View key={key} style={rankSelectContainerStyle}>
                    <LockOverlay
                      completeAccessibilityHint={`No cards remain in ${name}.`}
                      completeAccessibilityLabel={`${name} rank complete`}
                      isComplete={isRankComplete}
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
                        handler={() => handleLevelSelect(key)}
                        style={rankButtonStyle}
                        arrowColor={colors.dark.text}
                        useArrow={false}
                        disabled={isRankButtonDisabled}
                        SVGElement={<RankIcon size={32} rank={key} color={colors.dark.rank[key]} />}
                      >
                        <Text style={rankButtonTextStyle}>{name} ({rankCount})</Text>
                      </LinkButton>
                    </LockOverlay>
                  </View>
                )
              })
            }
          </View>
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
