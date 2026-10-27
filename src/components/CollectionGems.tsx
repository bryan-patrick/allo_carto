import colors from '@/src/app/colors';
import { getCollectionLevel, getWordsAtLevel } from '@/src/util/collectionProgress';
import type { UserProgressRow } from '@/src/util/progression';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { Alert, Pressable, StyleSheet } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface CollectionGemsProps {
	title: string;
	progress?: UserProgressRow;
	size?: number;
}

interface GemResponse {
	label: string;
	filledCount: number;
	description: string;
}

/**
 * Builds the strings for the gem information
 */
function getGemInfo(
	progress?: UserProgressRow,
): Record<WordProgressKey | 'inProgress', GemResponse> {
	const wordCount = progress?.wordCount ?? 0;
	const seenWordCount = progress?.seenWordCount ?? 0;

	return {
		unseen: {
			label: '0/3 Gems',
			filledCount: 0,
			description: `${seenWordCount}/${wordCount} words seen. See every word to earn your first gem.`,
		},
		inProgress: {
			label: '0/3 Gems',
			filledCount: 0,
			description: `${seenWordCount}/${wordCount} words seen. See every word to earn your first gem.`,
		},
		new: {
			label: '1/3 Gems',
			filledCount: 1,
			description: `Every word is at least level "New".\n\n${getWordsAtLevel(progress, 'learning')}/${wordCount} words are at least Learning. Bring every word to Learning to earn your next gem.`,
		},
		learning: {
			label: '2/3 Gems',
			filledCount: 2,
			description: `Every word is at least level "Learning".\n\n${getWordsAtLevel(progress, 'familiar')}/${wordCount} words are at least Familiar. Bring every word to Familiar to earn your next gem.`,
		},
		familiar: {
			label: '3/3 Gems',
			filledCount: 3,
			description: 'Every word is at least level "Familiar".\n\nAll three gems earned!',
		},
		known: {
			label: '💠💠💠',
			filledCount: 3,
			description: 'Every word is at least Known.',
		},
		mastered: {
			label: '💎💎💎💯',
			filledCount: 3,
			description: 'Every word is mastered.',
		},
	};
}

/**
 * The collection gems component on decks, chapters, and stories
 */
export default function CollectionGems({ title, progress, size = 18 }: CollectionGemsProps) {
	const gemResponses = getGemInfo(progress);
	const level = getCollectionLevel(progress);
	const gemColor = colors.wordProgress[level];

	let situation: WordProgressKey | 'inProgress' = level;

	if (level === 'unseen' && progress?.seenWordCount) {
		situation = 'inProgress';
	}

	const { label, filledCount, description } = gemResponses[situation];

	function showProgress() {
		Alert.alert(`${title} (${label})`, description);
	}

	/**
	 * Render the component
	 */
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}: ${label}, ${filledCount} of 3 gems.`}
			accessibilityHint="Show learning progress and gem requirements."
			hitSlop={8}
			onPress={showProgress}
			style={styles.row}
		>
			{[0, 1, 2].map(index => {
				const filled = index < filledCount;

				return (
					<MaterialSymbol
						key={index}
						name="diamond"
						size={size}
						filled={filled}
						color={filled ? gemColor : colors.light.border}
						style={filled ? styles.filled : styles.unfilled}
					/>
				);
			})}
		</Pressable>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	filled: {
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 2,
		textShadowColor: '#ffffff',
	},
	unfilled: {
		opacity: 0.4,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
});
