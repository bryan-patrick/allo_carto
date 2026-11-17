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
import { Fragment } from 'react';
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
	colors: [`${colors.gems.earned}0D`, `${colors.gems.earned}33`],
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
	 * Movement
	 */
	const animatedStyle = useButtonWiggle(showNewBadge);

	/**
	 * Button availability and colors
	 */
	const isDisabled = disabled || !isUnlocked;
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
		accessibilityHint = 'This puzzle is complete.';
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
					style={styles.button}
				>
					<View
						pointerEvents="none"
						style={[
							styles.diamond,
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
								style={StyleSheet.absoluteFill}
							/>
						)}
					</View>
					<View
						pointerEvents="none"
						style={styles.buttonContent}
					>
						<MaterialSymbol
							name={actionSymbol}
							size={20}
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
		gap: 4,
		paddingVertical: 10,
		paddingHorizontal: 2,
	},
	heading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headingLine: {
		width: 28,
		height: 1,
		backgroundColor: colors.light.border,
	},
	headingText: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.wordProgress.unseen,
	},
	puzzleRow: {
		width: '100%',
		maxWidth: 464,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	puzzleSlot: {
		width: 44,
		height: 44,
		flexShrink: 0,
		zIndex: 1,
	},
	currentPuzzleSlot: {
		width: 68,
		height: 68,
	},
	connector: {
		width: 4,
		height: 2,
	},
	connectorLine: {
		position: 'absolute',
		left: -4,
		right: -4,
		height: 2,
		backgroundColor: colors.light.border,
	},
	button: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	diamond: {
		position: 'absolute',
		width: '70.7%',
		height: '70.7%',
		borderWidth: 1.5,
		borderRadius: 7,
		overflow: 'hidden',
		transform: [
			{
				rotate: '45deg',
			},
		],
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
		top: '8%',
		right: '-5%',
		backgroundColor: colors.dark.primary,
		borderRadius: 3,
		paddingHorizontal: 4,
		paddingVertical: 1,
		transform: [
			{
				rotate: '45deg',
			},
		],
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 9,
		lineHeight: 12,
	},
});
