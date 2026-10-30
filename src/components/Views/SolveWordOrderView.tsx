import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import WordOrderBoard from '@/src/components/Solve/WordOrderBoard';
import type {
	SolveAttemptResult,
	SolveWordOrderPuzzle,
	WordOrderAttemptRequest,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolveWordOrderPuzzle from '@/src/db/queries/getSolveWordOrderPuzzle';
import saveWordOrderDraft from '@/src/db/queries/saveWordOrderDraft';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findCompletionPath } from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { inkConfig } from '@/src/util/ink';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
} from '@/src/util/solveProgression';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SolveWordOrderViewProps {
	deckId: string;
}

interface WordOrderFeedback {
	text: string;
	backgroundColor: string;
	needsInk?: boolean;
}

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/*
 * Gives the player feedback after submitting a Word Order puzzle.
 */
function getWordOrderFeedback(result: SolveAttemptResult): WordOrderFeedback {
	const messages: Partial<Record<SolveAttemptResult['status'], WordOrderFeedback>> = {
		exact: {
			text: 'Correct! Third gem earned.',
			backgroundColor: colors.light.success,
		},
		incorrect: {
			text: `Not quite. That arrangement cost ${result.inkSpent} Ink. Change the order before submitting again.`,
			backgroundColor: colors.light.danger,
		},
		notEnoughInk: {
			text: 'Not enough Ink. Close this puzzle and practice flashcards to earn more.',
			backgroundColor: colors.light.warning,
			needsInk: true,
		},
		alreadySolved: {
			text: 'This paragraph already has its third gem.',
			backgroundColor: colors.light.success,
		},
	};

	return (
		messages[result.status] ?? {
			text: 'This puzzle is locked. Check its unlock requirements beside the Solve button.',
			backgroundColor: colors.light.warning,
		}
	);
}

/*
 * Lets the player arrange a whole French paragraph and submit it in Solve++.
 * Saves each move for later and awards the third gem after a correct paid submission.
 */
export default function SolveWordOrderView({ deckId }: SolveWordOrderViewProps) {
	const router = useRouter();
	const { top, bottom } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { progressById, experience, inkBalance, isUpdatingProgress, writeWordOrderAttempt } =
		useUserProgress();
	const { settings } = useAppSettings();
	const [puzzle, setPuzzle] = useState<SolveWordOrderPuzzle>();
	const [positions, setPositions] = useState<number[]>([]);
	const [lastSubmittedOrder, setLastSubmittedOrder] = useState<string | null>(null);
	const [loadError, setLoadError] = useState('');
	const [feedback, setFeedback] = useState<WordOrderFeedback | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);
	const isBusy = useRef(false);
	const pendingAttempt = useRef<WordOrderAttemptRequest | null>(null);
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const stageDefinition = solveStages[3];
	const inkCost = stageDefinition.attemptInkCost ?? stageDefinition.incorrectAttemptInkCost;
	const savedCompletedStages = getCompletedSolveStages(progressById[deckId]);
	const puzzleCompletedStages = puzzle?.completedSolveStages ?? 0;
	const completedStages =
		savedCompletedStages >= puzzleCompletedStages ? savedCompletedStages : puzzleCompletedStages;
	const isComplete = completedStages >= 3;
	const eligibility = getSolveStageEligibility({
		stage: 3,
		completedStages,
		playerLevel: experience.level,
		fastSolveUnlocks,
		isParagraphUnlocked: puzzle?.isUnlocked ?? false,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progressById[deckId]?.seenWordCount ?? 0,
	});
	const unlockMessage = getSolveUnlockMessage({
		stage: 3,
		eligibility,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progressById[deckId]?.seenWordCount ?? 0,
	});
	const serializedOrder = JSON.stringify(positions);
	const hasChangedOrder = serializedOrder !== lastSubmittedOrder;
	const hasEnoughInk = inkBalance >= inkCost;
	const disabled = isSaving || isUpdatingProgress || isDragging;
	const isEligible = Boolean(puzzle && eligibility.isEligible);
	const submitDisabled =
		disabled || isComplete || (!needsRetry && (!isEligible || !hasEnoughInk || !hasChangedOrder));
	const boardDisabled = isSaving || isUpdatingProgress || needsRetry || !isEligible;
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const storyColor = getDeckStoryColor(deckId);
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const containerInsets = {
		paddingTop: top + 8,
	};
	const postcardInsets = {
		marginBottom: Math.max(bottom, 8),
	};
	const parchmentTint = {
		backgroundColor: stageDefinition.backgroundTint,
	};
	const titleColor = {
		color: storyColor,
	};
	const balanceColor = {
		color: inkColor,
	};
	const feedbackStyle = {
		backgroundColor: feedback?.backgroundColor ?? 'transparent',
	};
	const submitLabel = needsRetry ? 'Retry save' : `Submit (${inkCost} Ink)`;

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			async function loadPuzzle() {
				if (!userId) {
					setLoadError('Your player could not be loaded.');
					return;
				}

				setPuzzle(undefined);
				setLoadError('');

				try {
					const database = await getDB();
					const savedPuzzle = await getSolveWordOrderPuzzle({
						database,
						userId,
						deckId,
						fastSolveUnlocks,
					});
					const savedOrder = JSON.stringify(savedPuzzle.positions);
					const lastAttempt = savedPuzzle.lastAttempt;
					const attemptedOrder =
						lastAttempt?.status === 'incorrect' ? JSON.stringify(lastAttempt.positions) : null;
					let savedFeedback: WordOrderFeedback | null = null;

					if (savedPuzzle.isEligible) {
						await saveWordOrderDraft({
							database,
							userId,
							deckId,
							positions: savedPuzzle.positions,
						});
					}

					if (lastAttempt?.status === 'incorrect' && savedOrder === attemptedOrder) {
						savedFeedback = {
							text: `That arrangement cost ${lastAttempt.inkSpent} Ink. Change the order before submitting again.`,
							backgroundColor: colors.light.danger,
						};
					}

					if (isActive) {
						setPuzzle(savedPuzzle);
						setPositions(savedPuzzle.positions);
						setLastSubmittedOrder(attemptedOrder);
						setFeedback(savedFeedback);
						setNeedsRetry(false);
						pendingAttempt.current = null;
					}
				} catch (error) {
					console.error('Could not load Word Order:', error);

					if (isActive) {
						setLoadError('Could not load this puzzle. Go back and try again.');
					}
				}
			}

			loadPuzzle();

			return () => {
				isActive = false;
			};
		}, [deckId, userId, fastSolveUnlocks]),
	);

	/*
	 * Saves a card move before updating the board or allowing another action.
	 * If saving fails, the last saved order stays in place so the player can try that move again.
	 */
	async function handleReorder(nextPositions: number[]): Promise<boolean> {
		if (
			!userId ||
			!isEligible ||
			isComplete ||
			needsRetry ||
			isBusy.current ||
			isUpdatingProgress
		) {
			return false;
		}

		isBusy.current = true;
		setIsSaving(true);

		try {
			const database = await getDB();

			await saveWordOrderDraft({
				database,
				userId,
				deckId,
				positions: nextPositions,
			});

			setPositions(nextPositions);
			setFeedback(null);
			pendingAttempt.current = null;
			return true;
		} catch (error) {
			console.error('Could not save the card order:', error);
			setFeedback({
				text: 'That move could not be saved. Please try it again.',
				backgroundColor: colors.light.warning,
			});
			return false;
		} finally {
			isBusy.current = false;
			setIsSaving(false);
		}
	}

	/*
	 * Sends the current card order for a paid check and shows the result.
	 * Keeps the same submission ID after a save error so retrying cannot charge twice.
	 */
	async function handleSubmit() {
		let attempt = pendingAttempt.current;

		if (submitDisabled || isBusy.current || (!needsRetry && pendingAttempt.current)) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);
		setFeedback(null);

		if (!attempt) {
			attempt = {
				deckId,
				positions: [...positions],
				attemptId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			};
			pendingAttempt.current = attempt;
		}

		try {
			const result = await writeWordOrderAttempt(attempt);

			if (result === false) {
				setNeedsRetry(true);
				setFeedback({
					text: 'The submission could not be saved. Retry to recover the same attempt.',
					backgroundColor: colors.light.warning,
				});
				return;
			}

			setNeedsRetry(false);
			setFeedback(getWordOrderFeedback(result));

			if (result.status === 'incorrect') {
				setLastSubmittedOrder(JSON.stringify(attempt.positions));
			} else if (result.stageCompleted || result.status === 'alreadySolved') {
				setPuzzle(current => {
					if (!current) {
						return current;
					}

					return {
						...current,
						completedSolveStages: 3,
					};
				});
			} else {
				pendingAttempt.current = null;
			}
		} finally {
			isBusy.current = false;
			setIsSaving(false);
		}
	}

	function handleClose() {
		if (disabled || isBusy.current) {
			return;
		}

		if (router.canDismiss()) {
			router.dismiss();
		} else if (chapter) {
			router.replace({
				pathname: '/ChapterDetail',
				params: {
					chapterId: chapter.id,
				},
			});
		} else {
			router.replace('/(tabs)');
		}
	}

	return (
		<View style={[styles.container, containerInsets]}>
			<ImageBackground
				source={postcardBackground}
				style={[styles.postcard, postcardInsets]}
			>
				<View
					pointerEvents="none"
					style={[StyleSheet.absoluteFill, parchmentTint]}
				/>
				<View style={styles.header}>
					<Text
						accessibilityRole="header"
						style={[styles.title, titleColor]}
					>
						Solve++: Word Order
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close Solve++"
						disabled={disabled}
						onPress={handleClose}
						style={styles.closeButton}
					>
						<MaterialSymbol
							name="close"
							size={24}
							color={storyColor}
						/>
					</Pressable>
				</View>
				<View style={styles.details}>
					<Text style={[styles.text, styles.paragraphTitle]}>{puzzle?.deck.title}</Text>
					<MaterialSymbol
						name="water_drop"
						size={18}
						color={inkColor}
					/>
					<Text style={[styles.text, balanceColor]}>
						{inkBalance} / {inkConfig.maxBalance}
					</Text>
				</View>
				{!puzzle ?
					<Text style={styles.notice}>{loadError || 'Loading puzzle…'}</Text>
				: isComplete ?
					<View style={styles.completion}>
						<MaterialSymbol
							name="diamond"
							filled
							size={32}
							color={colors.gems.third}
						/>
						<Text style={styles.title}>Third gem earned!</Text>
						<Text style={styles.text}>All three gems are earned for this paragraph.</Text>
					</View>
				: isEligible ?
					<WordOrderBoard
						cards={puzzle.cards}
						positions={positions}
						disabled={boardDisabled}
						onReorder={handleReorder}
						onDraggingChange={setIsDragging}
					/>
				:	<Text style={styles.notice}>{unlockMessage}</Text>}
				<View style={styles.footer}>
					{puzzle && !isComplete && (
						<>
							{isEligible && !hasEnoughInk && !feedback?.needsInk && (
								<Text style={styles.text}>
									You need {inkCost} Ink to submit. Close this puzzle and practice flashcards to
									earn more.
								</Text>
							)}
							{feedback && (
								<Text
									accessibilityLiveRegion="polite"
									style={styles.text}
								>
									<Text style={feedbackStyle}>{feedback.text}</Text>
								</Text>
							)}
							<LinkButton
								handler={handleSubmit}
								disabled={submitDisabled}
								accessibilityLabel={submitLabel}
								accessibilityState={{
									disabled: submitDisabled,
									busy: isSaving,
								}}
								color={submitDisabled ? colors.dark.border : inkColor}
								style={submitDisabled && styles.disabled}
								useArrow={false}
								fullwidth
							>
								{submitLabel}
							</LinkButton>
						</>
					)}
					<SecondaryButton
						onPress={handleClose}
						disabled={disabled}
						color={storyColor}
						type="outline"
						fullwidth
					>
						Close
					</SecondaryButton>
				</View>
			</ImageBackground>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 8,
		backgroundColor: colors.dark.background,
	},
	postcard: {
		flex: 1,
		maxWidth: 600,
		width: '100%',
		alignSelf: 'center',
		backgroundColor: colors.light.background,
		borderColor: colors.light.goldenBorder,
		borderWidth: 1,
		borderRadius: 12,
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		padding: 12,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		color: colors.dark.text,
		flexShrink: 1,
	},
	closeButton: {
		marginLeft: 'auto',
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	details: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingBottom: 12,
	},
	paragraphTitle: {
		flex: 1,
	},
	text: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	notice: {
		flex: 1,
		padding: 16,
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	completion: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		padding: 16,
	},
	footer: {
		padding: 12,
		gap: 8,
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	disabled: {
		opacity: 0.6,
	},
});
