import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useSolveProgress } from '@/src/components/Solve/useSolveProgress';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findParagraphById } from '@/src/util/atlasCompletion';
import { solveStages, type SolveStage } from '@/src/util/solveProgression';
import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Fragment, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface SolvePuzzleButtonsProps {
	deckId: string;
	color: string;
	disabled?: boolean;
}

interface SolvePuzzleButtonProps extends SolvePuzzleButtonsProps {
	stage: SolveStage;
	isCurrentPuzzle: boolean;
	isCompleted: boolean;
	isUnlocked: boolean;
	showNewBadge: boolean;
	unlockMessage: string;
}

interface PuzzleButtonGradient {
	colors: readonly [string, string, ...string[]];
}

/**
 * Puzzle order and completed colors
 */
const puzzleStages: SolveStage[] = [1, 2, 3, 4, 5];
const completedPuzzleGradient: PuzzleButtonGradient = {
	colors: ['#EBF1EC', '#C3D5C6'],
};

/**
 * Shows all five paragraph puzzles with their progress and next available puzzle.
 */
export default function SolvePuzzleButtons({
	deckId,
	color,
	disabled = false,
}: SolvePuzzleButtonsProps) {
	/**
	 * Saved progress and paragraph
	 */
	const { id: userId } = useUserContext() ?? {};
	const { status, isUpdatingProgress } = useUserProgress();
	const { completedStages, nextStage, isEligible, unlockMessage, hasStartedCurrentStage } =
		useSolveProgress(deckId);
	const paragraph = findParagraphById(deckId);

	/**
	 * Button availability
	 */
	const areActionsDisabled = disabled || status !== 'ready' || !userId || isUpdatingProgress;

	if (!paragraph || paragraph.wordIds.length === 0) {
		return null;
	}

	return (
		<View style={styles.section}>
			<View style={styles.heading}>
				<View style={styles.headingLine} />
				<Text
					accessibilityRole="header"
					style={styles.headingText}
				>
					Puzzles
				</Text>
				<View style={styles.headingLine} />
			</View>
			<View style={styles.puzzleRow}>
				{puzzleStages.map(stage => {
					const isCurrentPuzzle = stage === nextStage;
					const isCompleted = stage <= completedStages;
					const isUnlocked = isCurrentPuzzle && isEligible && solveStages[stage].isImplemented;
					const showNewBadge = isUnlocked && !areActionsDisabled && !hasStartedCurrentStage;

					return (
						<Fragment key={stage}>
							<SolvePuzzleButton
								deckId={deckId}
								color={color}
								stage={stage}
								disabled={areActionsDisabled}
								isCurrentPuzzle={isCurrentPuzzle}
								isCompleted={isCompleted}
								isUnlocked={isUnlocked}
								showNewBadge={showNewBadge}
								unlockMessage={unlockMessage}
							/>
							{stage < 5 && (
								<View style={styles.connector}>
									<View style={styles.connectorLine} />
								</View>
							)}
						</Fragment>
					);
				})}
			</View>
		</View>
	);
}

/**
 * Shows a puzzle's progress and opens it when it is available.
 */
function SolvePuzzleButton({
	deckId,
	color,
	stage,
	disabled,
	isCurrentPuzzle,
	isCompleted,
	isUnlocked,
	showNewBadge,
	unlockMessage,
}: SolvePuzzleButtonProps) {
	/**
	 * Pressed state
	 */
	const [isPressed, setIsPressed] = useState(false);

	/**
	 * Movement
	 */
	const animatedStyle = useButtonWiggle(showNewBadge && !isPressed);
	const buttonStyle = StyleSheet.flatten([
		styles.button,
		isPressed && styles.pressedButton,
		disabled && styles.disabledButton,
	]);

	/**
	 * Button availability and colors
	 */
	const isDisabled = disabled || (!isUnlocked && !isCompleted);
	const isCurrentPuzzleUnlocked = isCurrentPuzzle && isUnlocked;
	const definition = solveStages[stage];
	let gradientColors = definition.buttonGradient;
	let borderColor = color;
	let iconColor = color;
	let actionSymbol = 'extension';

	/**
	 * Screen reader descriptions
	 */
	let accessibilityLabel = `Puzzle ${stage}`;
	let accessibilityHint = `Open puzzle ${stage} for this paragraph.`;

	if (!isUnlocked && !isCompleted) {
		borderColor = colors.light.border;
		iconColor = colors.light.border;
		actionSymbol = 'lock';
		accessibilityLabel = `Puzzle ${stage}, locked`;
		accessibilityHint = `Complete puzzle ${stage - 1} to unlock this puzzle.`;
	}

	if (isCurrentPuzzle && !isUnlocked) {
		accessibilityHint = unlockMessage;
	}

	if (isCompleted) {
		gradientColors = completedPuzzleGradient.colors;
		actionSymbol = 'check';
		iconColor = colors.dark.success;
		accessibilityLabel = `Puzzle ${stage}, completed`;
		accessibilityHint = 'View the correct answers for this completed puzzle.';
	}

	if (showNewBadge) {
		accessibilityLabel = `Puzzle ${stage}, new puzzle`;
	}

	return (
		<Animated.View
			style={[
				styles.puzzleSlot,
				isCurrentPuzzleUnlocked && styles.currentPuzzleSlot,
				animatedStyle,
			]}
		>
			<Link
				href={{
					pathname: '/Solve',
					params: {
						deckId,
						stage: String(stage),
					},
				}}
				asChild
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={accessibilityLabel}
					accessibilityHint={accessibilityHint}
					accessibilityState={{
						disabled: Boolean(isDisabled),
						selected: isCurrentPuzzleUnlocked,
					}}
					disabled={isDisabled}
					onPressIn={() => setIsPressed(true)}
					onPressOut={() => setIsPressed(false)}
					style={buttonStyle}
				>
					<View
						pointerEvents="none"
						style={[
							styles.circle,
							isCurrentPuzzleUnlocked && styles.activeCircle,
							isPressed && styles.pressedCircle,
							{
								borderColor,
							},
						]}
					>
						{(isUnlocked || isCompleted) && (
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
								style={[StyleSheet.absoluteFill, styles.circleGradient]}
							/>
						)}
						{isCurrentPuzzleUnlocked && <View style={styles.activeInnerBorder} />}
					</View>
					<View
						pointerEvents="none"
						style={styles.buttonContent}
					>
						<MaterialSymbol
							name={actionSymbol}
							size={22}
							color={iconColor}
							style={styles.icon}
						/>
						{isCurrentPuzzleUnlocked && (
							<Text
								allowFontScaling={false}
								style={[
									styles.number,
									{
										color,
									},
								]}
							>
								{stage}
							</Text>
						)}
					</View>
					{showNewBadge && (
						<View
							style={styles.newBadge}
							pointerEvents="none"
							aria-hidden
						>
							<Text
								allowFontScaling={false}
								style={styles.newBadgeText}
							>
								New
							</Text>
						</View>
					)}
				</Pressable>
			</Link>
		</Animated.View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	section: {
		alignSelf: 'stretch',
		alignItems: 'center',
		paddingVertical: 8,
		paddingBottom: 12,
		paddingHorizontal: 2,
		gap: 4,
	},
	heading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headingLine: {
		width: 32,
		height: 1,
		backgroundColor: colors.light.border,
	},
	headingText: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	puzzleRow: {
		width: '100%',
		maxWidth: 464,
		minHeight: 64,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	puzzleSlot: {
		width: 40,
		height: 40,
		flexShrink: 0,
		zIndex: 1,
	},
	currentPuzzleSlot: {
		width: 64,
		height: 64,
	},
	connector: {
		width: 16,
		minWidth: 6,
		flexShrink: 1,
		height: 2,
	},
	connectorLine: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: colors.light.border,
	},
	button: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressedButton: {
		transform: [
			{
				translateY: 2,
			},
			{
				scale: 0.94,
			},
		],
	},
	disabledButton: {
		opacity: 0.45,
	},
	circle: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		borderWidth: 1.5,
		borderRadius: 999,
	},
	circleGradient: {
		borderRadius: 999,
	},
	activeCircle: {
		borderWidth: 2,
		backgroundColor: colors.light.background,
		shadowColor: colors.dark.border,
		shadowOffset: {
			width: 0,
			height: 3,
		},
		shadowOpacity: 0.4,
		shadowRadius: 1,
		elevation: 4,
	},
	pressedCircle: {
		shadowOpacity: 0,
		elevation: 0,
	},
	activeInnerBorder: {
		position: 'absolute',
		top: 3,
		right: 3,
		bottom: 3,
		left: 3,
		borderRadius: 999,
		borderWidth: 1.5,
		borderColor: '#A0A0A0',
	},
	buttonContent: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		lineHeight: 24,
		includeFontPadding: false,
	},
	number: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		lineHeight: 14,
		includeFontPadding: false,
	},
	newBadge: {
		position: 'absolute',
		top: -6,
		alignSelf: 'center',
		backgroundColor: colors.dark.primary,
		borderRadius: 3,
		paddingHorizontal: 4,
		paddingVertical: 1,
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 10,
		lineHeight: 12,
	},
});
