import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
	const { progressById, status, isUpdatingProgress } = useUserProgress();
	const deck = findParagraphById(deckId);
	const progress = progressById[deckId];
	const isComplete = Boolean(progress?.hasFirstGem);
	const isEligible = Boolean(
		deck?.wordIds.length &&
		progress?.seenWordCount === deck.wordIds.length &&
		isItemUnlocked({
			id: deckId,
			progressById,
		}),
	);
	const isDisabled = !isEligible || status !== 'ready' || !userId || isUpdatingProgress;
	let label = 'Solve';

	if (isComplete) {
		label = 'View';
	}

	function handleOpen() {
		router.push({
			pathname: '/Solve',
			params: {
				deckId,
			},
		});
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
					isEligible && (
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
					)
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
