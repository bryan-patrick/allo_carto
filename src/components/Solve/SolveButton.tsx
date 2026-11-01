import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { useSolveProgress } from '@/src/components/Solve/useSolveProgress';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById } from '@/src/util/atlasCompletion';
import { solveStages } from '@/src/util/solveProgression';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/*
 * Typing
 */
interface SolveButtonProps {
	deckId: string;
	color: string;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
}

/*
 * Opens the next unfinished Solve puzzle for a paragraph.
 */
export default function SolveButton({ deckId, color, disabled = false, style }: SolveButtonProps) {
	const router = useRouter();
	const { id: userId } = useUserContext() ?? {};
	const { status, isUpdatingProgress } = useUserProgress();
	const { nextStage, definition, isEligible, unlockMessage } = useSolveProgress(deckId);
	const deck = findParagraphById(deckId);
	const isDisabled =
		disabled ||
		!isEligible ||
		!definition?.isImplemented ||
		status !== 'ready' ||
		!userId ||
		isUpdatingProgress;
	const label = definition?.label ?? 'Mastered';
	const isMastered = nextStage === null;
	const gradientColors = definition?.buttonGradient ?? solveStages[5].buttonGradient;
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
		<View style={[styles.container, style]}>
			<SecondaryButton
				onPress={handleOpen}
				color={color}
				type="outline"
				disabled={isDisabled}
				style={[styles.button, isDisabled && !isMastered && styles.disabledButton]}
				background={
					(!isDisabled || isMastered) && (
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
						style={styles.icon}
					/>
				}
				fullwidth
			>
				{label}
			</SecondaryButton>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		minWidth: 110,
	},
	button: {
		flexGrow: 1,
		paddingVertical: 8,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderBottomWidth: 2,
		shadowOpacity: 0,
		borderRadius: 8,
	},
	icon: {
		includeFontPadding: false,
	},
	gradient: {
		...StyleSheet.absoluteFill,
		borderRadius: 7,
	},
	disabledButton: {
		opacity: 0.6,
	},
});
