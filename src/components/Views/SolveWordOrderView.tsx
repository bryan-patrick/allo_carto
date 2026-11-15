import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import SecondaryButton from '@/src/components/SecondaryButton';
import SolveGemCelebration from '@/src/components/Solve/SolveGemCelebration';
import SolveGemClaim from '@/src/components/Solve/SolveGemClaim';
import WordOrderBoard from '@/src/components/Solve/WordOrderBoard';
import WordOrderClaims from '@/src/components/Solve/WordOrderClaims';
import type {
	SolveAttemptResult,
	SolveReward,
	SolveWordOrderPuzzle,
	WordOrderAttemptRequest,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolveWordOrderPuzzle from '@/src/db/queries/getSolveWordOrderPuzzle';
import saveWordOrderDraft from '@/src/db/queries/saveWordOrderDraft';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import {
	findCompletionPath,
	findNextParagraph,
	getParagraphNumber,
} from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
} from '@/src/util/solveProgression';
import { useSoundEffect } from '@/src/util/useSoundEffect';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

/**
 * Gives the player feedback after submitting a Word Order puzzle.
 */
function getWordOrderFeedback(result: SolveAttemptResult): WordOrderFeedback {
	const hasGemReward = result.rewards?.some(reward => reward.kind === 'gem');
	let correctMessage = 'Correct! Claim the word XP, then continue to the next sentence.';

	if (hasGemReward) {
		correctMessage = 'Correct! Claim the word XP, then claim your third gem.';
	}

	const messages: Partial<Record<SolveAttemptResult['status'], WordOrderFeedback>> = {
		exact: {
			text: correctMessage,
			backgroundColor: colors.light.success,
		},
		incorrect: {
			text: `Not quite. That attempt cost ${result.inkSpent} ink`,
			backgroundColor: colors.light.danger,
		},
		notEnoughInk: {
			text: 'Not enough Ink. Close this puzzle and practice flashcards to earn more.',
			backgroundColor: colors.light.warning,
			needsInk: true,
		},
		alreadySolved: {
			text: 'This sentence is already solved.',
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

/**
 * Lets the player arrange one French sentence at a time in Solve++.
 *
 * Save each move,
 * let the player claim each solved word's XP,
 * then open the next sentence.
 */
export default function SolveWordOrderView({ deckId }: SolveWordOrderViewProps) {
	const router = useRouter();
	const { top, bottom } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const {
		progressById,
		experience,
		inkBalance,
		maxInkBalance,
		isUpdatingProgress,
		writeWordOrderAttempt,
	} = useUserProgress();
	const { settings } = useAppSettings();
	const playCorrectWord = useSoundEffect('correctWord');
	const playIncorrect = useSoundEffect('incorrect');
	const [puzzle, setPuzzle] = useState<SolveWordOrderPuzzle>();
	const [claimedGem, setClaimedGem] = useState<SolveReward>();
	const [positions, setPositions] = useState<number[]>([]);
	const [hasFailedAttempt, setHasFailedAttempt] = useState(false);
	const [loadError, setLoadError] = useState('');
	const [feedback, setFeedback] = useState<WordOrderFeedback | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);
	const isBusy = useRef(false);
	const pendingAttempt = useRef<WordOrderAttemptRequest | null>(null);
	const lastFeedbackAttemptId = useRef<string | null>(null);
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const stageDefinition = solveStages[3];
	const inkCost = stageDefinition.attemptInkCost ?? stageDefinition.incorrectAttemptInkCost;
	const savedCompletedStages = getCompletedSolveStages(progressById[deckId]);
	const puzzleCompletedStages = puzzle?.completedSolveStages ?? 0;
	const completedStages =
		savedCompletedStages >= puzzleCompletedStages ? savedCompletedStages : puzzleCompletedStages;
	const isComplete = completedStages >= 3;
	const pendingGem = puzzle?.rewards.find(
		reward => reward.kind === 'gem' && reward.claimedAt === null,
	);
	const isSentenceSolved = puzzle?.isSentenceSolved ?? false;
	const hasPendingCardRewards =
		puzzle?.rewards.some(reward => reward.kind === 'card' && reward.claimedAt === null) ?? false;
	const isShowingGemClaim = Boolean(pendingGem && !hasPendingCardRewards);
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
	const hasEnoughInk = inkBalance >= inkCost;
	const disabled = isSaving || isUpdatingProgress || isDragging;
	const isEligible = Boolean(puzzle && eligibility.isEligible);
	const boardDisabled =
		isSaving || isUpdatingProgress || needsRetry || !isEligible || isSentenceSolved;
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const storyColor = getDeckStoryColor(deckId);
	const paragraphNumber = getParagraphNumber(deckId);
	const puzzleTitle = paragraphNumber ? `Solve Paragraph ${paragraphNumber}` : 'Solve';
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const nextParagraph = findNextParagraph(deckId);
	const isChapterComplete = nextParagraph?.chapter.id !== chapter?.id;
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
	/**
	 * Initial submission button values
	 */
	let submitLabel = `Submit (${inkCost} Ink)`;
	let submitColor = inkColor;
	let submitDisabled = disabled || isComplete;

	if (!needsRetry) {
		submitDisabled = submitDisabled || !isEligible || isShowingGemClaim;

		if (isSentenceSolved) {
			submitDisabled = submitDisabled || hasPendingCardRewards;
		} else {
			submitDisabled = submitDisabled || !hasEnoughInk;
		}
	}

	if (hasFailedAttempt) {
		submitLabel = `Try again (${inkCost} Ink)`;
	}

	if (isSentenceSolved) {
		submitLabel = 'Next sentence';
		submitColor = storyColor;
	}

	if (needsRetry) {
		submitLabel = 'Retry save';
	}

	if (submitDisabled) {
		submitColor = colors.dark.border;
	}

	/**
	 * Message after claiming all three gems
	 */
	let completionMessage = 'All 3 gems earned! The next paragraph is ready.';

	if (isChapterComplete) {
		completionMessage = 'All 3 gems earned! The next chapter is ready.';
	}

	if (!nextParagraph) {
		completionMessage = 'All 3 gems earned! Story complete!';
	}

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			async function loadPuzzle() {
				if (!userId) {
					setLoadError('Your player could not be loaded.');
					return;
				}

				setPuzzle(undefined);
				setClaimedGem(undefined);
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
					const hasPendingGem = savedPuzzle.rewards.some(reward => reward.kind === 'gem');
					let savedFeedback: WordOrderFeedback | null = null;

					if (savedPuzzle.isEligible && !savedPuzzle.isSentenceSolved && !hasPendingGem) {
						await saveWordOrderDraft({
							database,
							userId,
							deckId,
							position: savedPuzzle.sentencePosition,
							positions: savedPuzzle.positions,
						});
					}

					if (lastAttempt?.status === 'incorrect' && savedOrder === attemptedOrder) {
						savedFeedback = {
							text: `Not quite. That attempt cost ${lastAttempt.inkSpent} ink`,
							backgroundColor: colors.light.danger,
						};
					}

					if (isActive) {
						setPuzzle(savedPuzzle);
						setPositions(savedPuzzle.positions);
						setHasFailedAttempt(lastAttempt?.status === 'incorrect');
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

	/**
	 * Saves a card move before updating the board or allowing another action.
	 */
	async function handleReorder(nextPositions: number[]): Promise<boolean> {
		if (
			!userId ||
			!puzzle ||
			!isEligible ||
			isComplete ||
			isSentenceSolved ||
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
				position: puzzle.sentencePosition,
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

	/**
	 * Update the claimed word in place so the remaining claims and next button stay accurate.
	 */
	function handleCardRewardClaimed(reward: SolveReward) {
		setPuzzle(current => {
			if (!current) {
				return current;
			}

			const rewards = current.rewards.map(saved => {
				if (saved.kind === reward.kind && saved.position === reward.position) {
					return reward;
				}

				return saved;
			});

			return {
				...current,
				rewards,
			};
		});
	}

	/**
	 * Open the next unfinished sentence after every word reward has been claimed.
	 * Moving forward does not submit another answer or spend Ink.
	 */
	async function handleNextSentence() {
		if (!userId || !puzzle || hasPendingCardRewards || disabled || isBusy.current) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);

		try {
			const database = await getDB();
			const nextPuzzle = await getSolveWordOrderPuzzle({
				database,
				userId,
				deckId,
				fastSolveUnlocks,
			});
			const hasPendingGem = nextPuzzle.rewards.some(reward => reward.kind === 'gem');

			if (nextPuzzle.isEligible && !nextPuzzle.isSentenceSolved && !hasPendingGem) {
				await saveWordOrderDraft({
					database,
					userId,
					deckId,
					position: nextPuzzle.sentencePosition,
					positions: nextPuzzle.positions,
				});
			}

			setPuzzle(nextPuzzle);
			setPositions(nextPuzzle.positions);
			setHasFailedAttempt(false);
			setFeedback(null);
			pendingAttempt.current = null;
		} catch (error) {
			console.error('Could not open the next Word Order sentence:', error);
			setFeedback({
				text: 'The next sentence could not be loaded. Please try again.',
				backgroundColor: colors.light.warning,
			});
		} finally {
			isBusy.current = false;
			setIsSaving(false);
		}
	}

	/**
	 * Check the order
	 */
	async function handleSubmit() {
		let attempt = pendingAttempt.current;

		if (
			!puzzle ||
			!userId ||
			submitDisabled ||
			isBusy.current ||
			(!needsRetry && pendingAttempt.current)
		) {
			return;
		}

		if (isSentenceSolved && !needsRetry) {
			await handleNextSentence();
			return;
		}

		isBusy.current = true;
		setIsSaving(true);
		setFeedback(null);

		if (!attempt) {
			attempt = {
				deckId,
				position: puzzle.sentencePosition,
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

			/**
			 * Play feedback for this saved submission.
			 * I like using explicit voids
			 */
			if (
				(result.status === 'exact' || result.status === 'incorrect') &&
				lastFeedbackAttemptId.current !== attempt.attemptId
			) {
				lastFeedbackAttemptId.current = attempt.attemptId;

				if (result.status === 'exact') {
					void playCorrectWord();
				} else {
					void playIncorrect();
				}
			}

			if (
				result.status === 'incorrect' ||
				result.status === 'exact' ||
				result.status === 'alreadySolved'
			) {
				const database = await getDB();
				const nextPuzzle = await getSolveWordOrderPuzzle({
					database,
					userId,
					deckId,
					fastSolveUnlocks,
					sentencePosition: attempt.position,
				});
				const hasPendingGem = nextPuzzle.rewards.some(reward => reward.kind === 'gem');

				if (nextPuzzle.isEligible && !nextPuzzle.isSentenceSolved && !hasPendingGem) {
					await saveWordOrderDraft({
						database,
						userId,
						deckId,
						position: nextPuzzle.sentencePosition,
						positions: nextPuzzle.positions,
					});
				}

				setPuzzle(nextPuzzle);
				setPositions(nextPuzzle.positions);
				setHasFailedAttempt(result.status === 'incorrect');

				pendingAttempt.current = null;
			} else {
				pendingAttempt.current = null;
			}
		} catch (error) {
			console.error('Could not load the next Word Order sentence:', error);
			setNeedsRetry(true);
			setFeedback({
				text: 'The submission could not be loaded. Retry to recover the same attempt.',
				backgroundColor: colors.light.warning,
			});
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

	/**
	 * Render it
	 */
	return (
		<View style={[styles.container, containerInsets]}>
			<BackgroundImage
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
						{puzzleTitle}
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
					{puzzle && isEligible && !isComplete && !isShowingGemClaim && (
						<Text style={[styles.text, styles.sentenceProgress]}>
							Sentence {puzzle.sentencePosition + 1} of {puzzle.sentenceCount}
						</Text>
					)}
					<MaterialSymbol
						name="water_drop"
						size={18}
						color={inkColor}
					/>
					<Text style={[styles.text, balanceColor]}>
						{inkBalance} / {maxInkBalance}
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
						<Text style={styles.text}>{completionMessage}</Text>
					</View>
				: isShowingGemClaim && pendingGem ?
					<SolveGemClaim
						deckId={deckId}
						reward={pendingGem}
						disabled={disabled}
						onClaimed={setClaimedGem}
					/>
				: isEligible && isSentenceSolved ?
					<WordOrderClaims
						deckId={deckId}
						cards={puzzle.cards}
						positions={positions}
						rewards={puzzle.rewards}
						disabled={disabled}
						onRewardClaimed={handleCardRewardClaimed}
					/>
				: isEligible ?
					<WordOrderBoard
						key={`${deckId}-${puzzle.sentencePosition}`}
						deckId={deckId}
						cards={puzzle.cards}
						positions={positions}
						lockedCardIds={puzzle.lockedCardIds}
						rewards={puzzle.rewards}
						disabled={boardDisabled}
						onRewardClaimed={handleCardRewardClaimed}
						onReorder={handleReorder}
						onDraggingChange={setIsDragging}
					/>
				:	<Text style={styles.notice}>{unlockMessage}</Text>}
				<View style={styles.footer}>
					{puzzle && !isComplete && !isShowingGemClaim && (
						<>
							{isEligible && !isSentenceSolved && !hasEnoughInk && !feedback?.needsInk && (
								<Text style={styles.text}>
									<Text style={styles.warningHighlight}>
										You need {inkCost} Ink to submit. Close this puzzle and practice flashcards to
										earn more.
									</Text>
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
						</>
					)}
					<View style={styles.actions}>
						<View style={styles.actionButton}>
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
						{puzzle && !isComplete && !isShowingGemClaim && (
							<View style={styles.solveActionButton}>
								<LinkButton
									handler={handleSubmit}
									disabled={submitDisabled}
									accessibilityLabel={submitLabel}
									accessibilityState={{
										disabled: submitDisabled,
										busy: isSaving,
									}}
									color={submitColor}
									style={submitDisabled && styles.disabled}
									useArrow={false}
									fullwidth
								>
									{submitLabel}
								</LinkButton>
							</View>
						)}
					</View>
				</View>
			</BackgroundImage>
			{puzzle && claimedGem && (
				<SolveGemCelebration
					deck={puzzle.deck}
					stage={claimedGem.stage}
					onClose={() => setClaimedGem(undefined)}
				/>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	warningHighlight: {
		backgroundColor: colors.light.warning,
	},
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
		paddingHorizontal: 12,
		paddingVertical: 4,
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
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: 6,
		paddingHorizontal: 12,
		paddingBottom: 8,
	},
	sentenceProgress: {
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
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	actionButton: {
		flex: 1,
	},
	solveActionButton: {
		flex: 2,
	},
	disabled: {
		opacity: 0.6,
	},
});
