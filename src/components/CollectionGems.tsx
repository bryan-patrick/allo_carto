import colors from '@/src/app/colors';
import type { ProgressType, UserProgressRow } from '@/src/util/progression';
import { Alert, Pressable, StyleSheet } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

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
 * First gems come from saved puzzles, rather than vocabulary levels.
 * Chapter and story gems need every paragraph's first gem. Gems two and three come later.
 */
function getGemResponses(
	progress?: UserProgressRow,
): Record<'incomplete' | 'complete', GemResponse> {
	const type = progress?.type ?? 'paragraph';
	const completedParagraphCount = progress?.completedParagraphCount ?? 0;
	const paragraphCount = progress?.paragraphCount ?? 0;
	const seenWordCount = progress?.seenWordCount ?? 0;
	const wordCount = progress?.wordCount ?? 0;
	const requirements: Record<ProgressType, string> = {
		paragraph: `${seenWordCount} of ${wordCount} words seen. See every word in flashcards, then unlock and solve every puzzle card to earn the first gem.`,
		chapter: `${completedParagraphCount} of ${paragraphCount} paragraphs solved. Solve every paragraph in this chapter to earn its first gem.`,
		story: `${completedParagraphCount} of ${paragraphCount} paragraphs solved. Solve every paragraph in this story to earn its first gem.`,
	};

	return {
		incomplete: {
			label: '0/3 Gems',
			filledCount: 0,
			description: requirements[type],
		},
		complete: {
			label: '1/3 Gems',
			filledCount: 1,
			description: 'First gem earned! Every puzzle card is solved. Gems 2 and 3 are coming later.',
		},
	};
}

export default function CollectionGems({ title, progress, size = 18 }: CollectionGemsProps) {
	const responses = getGemResponses(progress);
	const response = progress?.hasFirstGem ? responses.complete : responses.incomplete;
	const gemColor = colors.rarity.Legendary;

	function showProgress() {
		Alert.alert(`${title} (${response.label})`, response.description);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}: ${response.filledCount} of 3 gems.`}
			accessibilityHint="Show puzzle progress and gem requirements."
			hitSlop={8}
			onPress={showProgress}
			style={styles.row}
		>
			{[0, 1, 2].map(index => {
				const filled = index < response.filledCount;

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

const styles = StyleSheet.create({
	filled: {
		textShadowOffset: {
			width: 0,
			height: 0,
		},
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
