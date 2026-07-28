import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import LockOverlay from '@/src/components/LockOverlay';
import { RankIcon } from '@/src/components/WordRank';
import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import { getDeckRankProgress, getDeckRankUnlockCount } from '@/src/util/deckRankProgression';
import type { WordRankDefinition, WordRankKey } from '@/src/util/wordRanks';
import { wordRankDefinitions } from '@/src/util/wordRanks';
import { StyleSheet, Text, View } from 'react-native';

interface RankButtonProps {
  deckWordCount: number;
  handleRankSelect: (rank: WordRankKey) => Promise<void>;
  rankCounts: DeckRankCounts;
  rankDefinition: WordRankDefinition;
}

interface LockedAccessibilityHintProps {
  deckWordCount: number;
  rankCounts: DeckRankCounts;
  rankKey: WordRankKey;
  rankName: string;
}

export default function RankButton({
  deckWordCount,
  handleRankSelect,
  rankCounts,
  rankDefinition,
}: RankButtonProps) {
  const { key, name } = rankDefinition;
  const rankCount = rankCounts[ key ];
  const rankProgress = getDeckRankProgress({
    deckWordCount,
    rankCounts,
    rankKey: key,
  });
  const isRankFullyComplete = rankProgress.completion === 'full';
  const isRankLocked = !rankProgress.isUnlocked;
  const isRankButtonDisabled = !rankProgress.isSelectable;
  const rankButtonColorStyle = {
    backgroundColor: colors.light.rank[ key ],
  };
  const {
    rankButtonContainerStyle,
    rankLockOverlayStyle,
    rankButtonStyle,
    rankButtonTextStyle,
  } = styles;

  return (
    <View style={rankButtonContainerStyle}>
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
          SVGElement={<RankIcon color={colors.dark.rank[ key ]} rank={key} size={32} />}
          accessibilityHint={`Practice the ${name} cards in this deck.`}
          accessibilityLabel={`${name}, ${rankCount} cards${isRankFullyComplete ? ', full complete' : ''}`}
          arrowColor={colors.dark.text}
          disabled={isRankButtonDisabled}
          handler={() => handleRankSelect(key)}
          style={[ rankButtonStyle, rankButtonColorStyle ]}
          useArrow={false}
        >
          <Text style={rankButtonTextStyle}>{name} ({rankCount})</Text>
        </LinkButton>
      </LockOverlay>
    </View>
  );
}

function getLockedAccessibilityHint({
  deckWordCount,
  rankCounts,
  rankKey,
  rankName,
}: LockedAccessibilityHintProps): string {
  let result = '';

  const rankIndex = wordRankDefinitions.findIndex((rank) => rank.key === rankKey);

  const cardsAtOrAboveRank = wordRankDefinitions.reduce((total, rank, index) => {
    const indexIsGreaterThanRank = index >= rankIndex;
    const rankCount = rankCounts[ rank.key ] ?? 0;

    return indexIsGreaterThanRank ? total + rankCount : total;
  }, 0);

  const unlockCount = getDeckRankUnlockCount(deckWordCount);

  result = `${rankName} unlocks when ${unlockCount} cards reach ${rankName}. You currently have ${cardsAtOrAboveRank}/${unlockCount}.`;

  return result;
}

const styles = StyleSheet.create({
  rankButtonContainerStyle: {
    flexGrow: 1,
    marginBottom: 4,
    width: '40%',
  },
  rankLockOverlayStyle: {
    borderRadius: 8,
  },
  rankButtonStyle: {
    gap: 4,
    padding: 8,
  },
  rankButtonTextStyle: {
    color: colors.dark.text,
  },
});
