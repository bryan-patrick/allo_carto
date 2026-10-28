import colors from '@/src/app/colors';
import type { ProgressType, UserProgressRow } from '@/src/util/progression';
import { getCompletedSolveStages, type CompletedSolveStages } from '@/src/util/solveProgression';
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

const gemColors = [colors.gems.first, colors.gems.second, colors.gems.third];

/**
 * Explains earned gems and the next Solve challenge.
 */
function getGemResponses(progress?: UserProgressRow): Record<CompletedSolveStages, GemResponse> {
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
	const targets: Record<ProgressType, string> = {
		paragraph: 'this paragraph',
		chapter: 'every paragraph in this chapter',
		story: 'every paragraph in this story',
	};
	const target = targets[type];

	return {
		0: {
			label: '0/3 Gems',
			filledCount: 0,
			description: requirements[type],
		},
		1: {
			label: '1/3 Gems',
			filledCount: 1,
			description: `First gem earned! Complete Solve+ for ${target} to earn the second gem.`,
		},
		2: {
			label: '2/3 Gems',
			filledCount: 2,
			description: `Second gem earned! Complete Solve++ for ${target} to earn the third gem.`,
		},
		3: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `All three gems earned! Complete Solve+++ for ${target} to make them glow.`,
		},
		4: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `Complete Solve++++ for ${target} to reach final mastery.`,
		},
		5: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `All five Solve puzzles are complete for ${target}.`,
		},
	};
}

export default function CollectionGems({ title, progress, size = 18 }: CollectionGemsProps) {
	const responses = getGemResponses(progress);
	const completedStages = getCompletedSolveStages(progress);
	const response = responses[completedStages];

	function showProgress() {
		Alert.alert(`${title} (${response.label})`, response.description);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}: ${response.filledCount} of 3 gems. ${completedStages} of 5 Solve stages complete.`}
			accessibilityHint="Show puzzle progress and gem requirements."
			hitSlop={8}
			onPress={showProgress}
			style={styles.row}
		>
			{gemColors.map((gemColor, index) => {
				const filled = index < response.filledCount;

				return (
					<MaterialSymbol
						key={index}
						name="diamond"
						size={size}
						filled={filled}
						color={filled ? gemColor : colors.gems.unsolved}
						style={filled ? styles.gem : styles.unfilled}
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
	gem: {
		textShadowOffset: {
			width: 0,
			height: 0,
		},
		textShadowRadius: 1,
		textShadowColor: colors.gems.glow,
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
