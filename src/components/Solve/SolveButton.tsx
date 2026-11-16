import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import { useSolveProgress } from '@/src/components/Solve/useSolveProgress';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById } from '@/src/util/atlasCompletion';
import { solveStages } from '@/src/util/solveProgression';
import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
	Animated,
	StyleSheet,
	Text,
	View,
	type StyleProp,
	type TextStyle,
	type ViewStyle,
} from 'react-native';

/**
 * Typing
 */
interface SolveButtonProps {
	deckId: string;
	color: string;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
}

/**
 * Opens the next unfinished Solve puzzle for a paragraph.
 */
export default function SolveButton({
	deckId,
	color,
	disabled = false,
	style,
	textStyle,
}: SolveButtonProps) {
	/**
	 * Hooks and saved puzzle progress
	 */
	const router = useRouter();
	const { id: userId } = useUserContext() ?? {};
	const { status, isUpdatingProgress } = useUserProgress();
	const { nextStage, definition, isEligible, unlockMessage, hasStartedCurrentStage } =
		useSolveProgress(deckId);

	/**
	 * Paragraph and button availability
	 */
	const deck = findParagraphById(deckId);
	const isDisabled =
		disabled ||
		!isEligible ||
		!definition?.isImplemented ||
		status !== 'ready' ||
		!userId ||
		isUpdatingProgress;
	const showNewBadge = nextStage !== null && !isDisabled && !hasStartedCurrentStage;

	/**
	 * Movement for a new puzzle
	 */
	const animatedStyle = useButtonWiggle(showNewBadge);

	/**
	 * Initial button text, colors, and icon
	 */
	const label = definition?.label ?? 'Mastered';
	const isMastered = nextStage === null;
	const gradientColors = definition?.buttonGradient ?? solveStages[5].buttonGradient;
	let actionSymbol = 'extension';

	/**
	 * Screen reader descriptions
	 */
	let accessibilityLabel = label;
	let accessibilityHint = `Open this paragraph’s ${label} puzzle.`;

	if (isDisabled) {
		actionSymbol = 'lock';
	}

	if (isMastered) {
		actionSymbol = 'check';
		accessibilityHint = 'All five Solve puzzles are complete.';
	}

	if (unlockMessage) {
		accessibilityHint = unlockMessage;
	}

	if (showNewBadge) {
		accessibilityLabel = `${label}, new puzzle`;
	}

	/**
	 * Opens the paragraph's next unlocked puzzle.
	 */
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
		<Animated.View style={[styles.container, style, animatedStyle]}>
			<SecondaryButton
				onPress={handleOpen}
				color={color}
				type="outline"
				disabled={isDisabled}
				style={[styles.button, isDisabled && !isMastered && styles.disabledButton]}
				textStyle={textStyle}
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
				accessibilityLabel={accessibilityLabel}
				accessibilityHint={accessibilityHint}
				accessibilityState={{
					disabled: isDisabled,
				}}
				SVGElement={
					<MaterialSymbol
						name={actionSymbol}
						size={18}
						color={color}
						style={styles.icon}
					/>
				}
				fullwidth
			>
				{label}
			</SecondaryButton>
			{showNewBadge && (
				<View
					style={styles.newBadge}
					pointerEvents="none"
					aria-hidden
				>
					<Text style={styles.newBadgeText}>New</Text>
				</View>
			)}
		</Animated.View>
	);
}

/**
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
	newBadge: {
		position: 'absolute',
		top: -8,
		right: -5,
		zIndex: 1,
		transform: [
			{
				rotate: '8deg',
			},
		],
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 10,
	},
});
