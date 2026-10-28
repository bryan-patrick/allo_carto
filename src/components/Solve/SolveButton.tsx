import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { useSolveProgress } from '@/src/components/Solve/useSolveProgress';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById } from '@/src/util/atlasCompletion';
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
 * We use this to open the paragraph's next unfinished Solve puzzle.
 * The button shows that puzzle's name and stays disabled until its requirements are met.
 */
export default function SolveButton({ deckId, color }: SolveButtonProps) {
	const router = useRouter();
	const { id: userId } = useUserContext() ?? {};
	const { status, isUpdatingProgress } = useUserProgress();
	const { nextStage, definition, isEligible, unlockMessage } = useSolveProgress(deckId);
	const deck = findParagraphById(deckId);
	const isDisabled =
		!isEligible ||
		!definition?.isImplemented ||
		status !== 'ready' ||
		!userId ||
		isUpdatingProgress;
	const label = definition?.label ?? 'Mastered';
	const gradientColors = definition?.buttonGradient ?? solveGradientColors;
	const accessibilityHint =
		unlockMessage ||
		(nextStage === null ?
			'All five Solve puzzles are complete.'
		:	`Open this paragraph’s ${label} puzzle.`);

	function handleOpen() {
		if (isDisabled || nextStage === null) {
			return;
		}

		router.push({
			pathname: '/Solve',
			params: {
				deckId,
				stage: String(nextStage),
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
					!isDisabled && (
						<LinearGradient
							colors={gradientColors}
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
				accessibilityHint={accessibilityHint}
				accessibilityState={{
					disabled: isDisabled,
				}}
				SVGElement={
					<MaterialSymbol
						name={
							nextStage === null ? 'check'
							: isDisabled ?
								'lock'
							:	'extension'
						}
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
