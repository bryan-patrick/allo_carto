import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Change these colors to adjust the Solve button's background.
 * The first color starts at the top left, and the last ends at the bottom right.
 */
const solveGradientColors: LinearGradientProps['colors'] = [
	'rgb(248, 200, 8, 0.1)',
	'rgb(6, 164, 255, 0.1)',
	'rgba(255, 139, 6, 0.1)',
	'rgb(251, 6, 186, 0.1)',
];

/**
 * Typing
 */
interface SolveButtonProps {
	deckId: string;
	color: string;
}

/**
 * Button component used to open the puzzle modal
 */
export default function SolveButton({ deckId, color }: SolveButtonProps) {
	const router = useRouter();
	const { id: userId } = useUserContext() ?? {};
	const { progressById, experience, status, isUpdatingProgress } = useUserProgress();
	const [isComplete, setIsComplete] = useState(false);
	const deck = findParagraphById(deckId);
	const progress = progressById[deckId];
	const isEligible = Boolean(
		deck?.wordIds.length &&
		progress?.seenWordCount === deck.wordIds.length &&
		isItemUnlocked({ id: deckId, progressById, userLevel: experience.level }),
	);
	const isDisabled = !isEligible || status !== 'ready' || !userId || isUpdatingProgress;
	let label = 'Solve';

	if (isComplete) {
		label = 'View solved paragraph';
	}

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			async function loadSolvedCount() {
				if (!userId || !isEligible) {
					return;
				}

				try {
					const database = await getDB();
					const puzzle = await getSolvePuzzle({ database, userId, deckId });
					const cards = puzzle.positions.filter(card => card.wordId);
					const solvedCards = cards.filter(card => card.acceptedAnswer !== null);

					if (isActive) {
						setIsComplete(cards.length > 0 && solvedCards.length === cards.length);
					}
				} catch (error) {
					console.error('Could not load Solve progress:', error);
				}
			}

			loadSolvedCount();

			return () => {
				isActive = false;
			};
		}, [userId, deckId, isEligible]),
	);

	function handleOpen() {
		router.push({ pathname: '/Solve', params: { deckId } });
	}

	if (!deck || deck.wordIds.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<SecondaryButton
				onPress={handleOpen}
				color={color}
				type="outline"
				disabled={isDisabled}
				style={[styles.button, isDisabled && styles.disabledButton]}
				background={
					<LinearGradient
						colors={solveGradientColors}
						start={{
							x: 0,
							y: 1,
						}}
						end={{
							x: 1,
							y: 0.1,
						}}
						pointerEvents="none"
						style={styles.gradient}
					/>
				}
				accessibilityHint={
					isEligible ?
						'Open this paragraph’s puzzle.'
					:	'Study every word in this paragraph to unlock Solve.'
				}
				SVGElement={
					<MaterialSymbol
						name={isEligible ? 'extension' : 'lock'}
						size={18}
						color={color}
					/>
				}
				fullwidth
			>
				{label}
			</SecondaryButton>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	button: {
		paddingVertical: 6,
		borderBottomWidth: 2,
		shadowOpacity: 0,
		borderRadius: 8,
	},
	gradient: {
		...StyleSheet.absoluteFill,
		borderRadius: 7,
	},
	disabledButton: {
		opacity: 0.6,
	},
});
