import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
				accessibilityHint={
					isEligible ?
						'Open this paragraph’s puzzle.'
					:	'Study every word in this paragraph to unlock Solve.'
				}
				SVGElement={
					<MaterialSymbol
						name="extension"
						size={18}
						color={color}
					/>
				}
				fullwidth
			>
				{label}
			</SecondaryButton>
			{!isEligible && (
				<Text style={styles.hint}>
					Study every word to unlock · {progress?.seenWordCount ?? 0} / {deck.wordIds.length} seen
				</Text>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 6,
	},
	button: {
		paddingVertical: 6,
		borderBottomWidth: 2,
		shadowOpacity: 0,
		borderRadius: 8,
	},
	disabledButton: {
		opacity: 0.6,
	},
	hint: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
		textAlign: 'center',
	},
});
