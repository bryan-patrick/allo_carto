import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ReadingLink from '@/src/components/ReadingLink';
import SolveCard from '@/src/components/Solve/SolveCard';
import SolveCharacterKeyboard from '@/src/components/Solve/SolveCharacterKeyboard';
import SolveGemCelebration from '@/src/components/Solve/SolveGemCelebration';
import SolveGemClaim from '@/src/components/Solve/SolveGemClaim';
import type {
	SolveAttemptRequest,
	SolveAttemptResult,
	SolvePosition,
	SolvePuzzle,
	SolveReward,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findCompletionPath, getParagraphNumber } from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
	type SolveWordStage,
} from '@/src/util/solveProgression';
import { getSolveSentenceGroups } from '@/src/util/solveSentenceGroups';
import { useSoundEffect } from '@/src/util/useSoundEffect';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	type TextInputInstance,
	type TextInputSelectionChangeEvent,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Typing
 */
interface SolveViewProps {
	deckId: string;
	stage: SolveWordStage;
}

interface SolveAnswerSelection {
	start: number;
	end: number;
}

interface SolveFeedback {
	text: string;
	backgroundColor: string;
}

interface SolveSentencePage {
	cards: SolvePosition[];
	hasUnansweredWords: boolean;
	hasPendingRewards: boolean;
}

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * The puzzles are chunked up by sentence for pagination. They were getting long.
 */
function getSolveSentencePages(puzzle?: SolvePuzzle): SolveSentencePage[] {
	const unclaimedCardPositions = new Set<number>();

	if (!puzzle) {
		return [];
	}

	for (const reward of puzzle.rewards) {
		if (reward.kind === 'card' && reward.claimedAt === null) {
			unclaimedCardPositions.add(reward.position);
		}
	}

	return getSolveSentenceGroups(puzzle.deck).map(sentenceGroup => {
		const sentencePositions = new Set(sentenceGroup.segments.map(segment => segment.position));
		const cards = puzzle.positions.filter(card => sentencePositions.has(card.position));
		const hasUnansweredWords = cards.some(card => card.wordId && card.acceptedAnswer === null);
		const hasPendingRewards = cards.some(card => unclaimedCardPositions.has(card.position));

		return {
			cards,
			hasUnansweredWords,
			hasPendingRewards,
		};
	});
}

/**
 * Get the next sentence
 */
function getSolveSentencePageToOpen(sentencePages: SolveSentencePage[]): number | undefined {
	let pageWithUnansweredWords: number | undefined;

	for (const [pageIndex, sentencePage] of sentencePages.entries()) {
		if (sentencePage.hasPendingRewards) {
			return pageIndex;
		}

		if (sentencePage.hasUnansweredWords && pageWithUnansweredWords === undefined) {
			pageWithUnansweredWords = pageIndex;
		}
	}

	return pageWithUnansweredWords;
}

/**
 * Choose the message and color shown after a word answer is checked.
 */
function getSolveFeedback(result: SolveAttemptResult, stage: SolveWordStage): SolveFeedback {
	const messages: Record<SolveAttemptResult['status'], SolveFeedback> = {
		exact: {
			text: `Correct! ${result.acceptedAnswer}.`,
			backgroundColor: colors.light.success,
		},
		close: {
			text: `Accepted! The spelling is “${result.acceptedAnswer}”.`,
			backgroundColor: colors.light.success,
		},
		incorrect: {
			text: `Not quite. That attempt cost ${result.inkSpent} Ink.`,
			backgroundColor: colors.light.danger,
		},
		empty: {
			text: 'An English answer is required.',
			backgroundColor: colors.light.warning,
		},
		notEnoughInk: {
			text: 'Not enough Ink. Close this puzzle and practice flashcards to earn more.',
			backgroundColor: colors.light.warning,
		},
		alreadySolved: {
			text: `Already solved: ${result.acceptedAnswer}.`,
			backgroundColor: colors.light.success,
		},
		unavailable: {
			text: 'This puzzle is locked. Check its unlock requirements beside the Solve button.',
			backgroundColor: colors.light.warning,
		},
	};

	if (stage === 2) {
		messages.empty.text = 'A French answer is required.';
	}

	return messages[result.status];
}

/**
 * Lets the player solve English or French word cards one sentence page at a time.
 */
export default function SolveView({ deckId, stage }: SolveViewProps) {
	/**
	 * Hooks and player progress
	 */
	const router = useRouter();
	const { bottom, top } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const {
		experience,
		progressById,
		inkBalance,
		maxInkBalance,
		isUpdatingProgress,
		writeSolveAttempt,
	} = useUserProgress();
	const { settings } = useAppSettings();
	const playCorrectWord = useSoundEffect('correctWord');

	/**
	 * State
	 */
	const [puzzle, setPuzzle] = useState<SolvePuzzle>();
	const [claimedGem, setClaimedGem] = useState<SolveReward>();
	const [loadError, setLoadError] = useState('');
	const [selectedSentencePageIndex, setSelectedSentencePageIndex] = useState(0);
	const [selectedPosition, setSelectedPosition] = useState<number>();
	const [answer, setAnswer] = useState('');
	const [answerSelection, setAnswerSelection] = useState<SolveAnswerSelection>({
		start: 0,
		end: 0,
	});
	const [feedback, setFeedback] = useState<SolveFeedback | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);

	/**
	 * Inputs and pending saves
	 */
	const isBusy = useRef(false);
	const answerInput = useRef<TextInputInstance>(null);
	const pendingAttempt = useRef<SolveAttemptRequest | null>(null);

	/**
	 * Sentence pages and paragraph progress
	 */
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const stageDefinition = solveStages[stage];
	const isFrenchAnswer = stageDefinition.answerLanguage === 'french';
	const sentencePages = getSolveSentencePages(puzzle);
	const selectedSentencePage = sentencePages[selectedSentencePageIndex];
	const sentenceCards = selectedSentencePage?.cards ?? [];
	const selectedCard = sentenceCards.find(card => card.position === selectedPosition);
	const isSentenceSolved = sentenceCards.length > 0 && !selectedSentencePage?.hasUnansweredWords;
	const cards = puzzle?.positions.filter(card => card.wordId) ?? [];
	const solvedCount = cards.filter(card => card.acceptedAnswer !== null).length;
	const savedCompletedStages = getCompletedSolveStages(progressById[deckId]);
	const puzzleCompletedStages = puzzle?.completedSolveStages ?? 0;
	let completedStages = savedCompletedStages;

	if (puzzleCompletedStages > completedStages) {
		completedStages = puzzleCompletedStages;
	}

	const isComplete = cards.length > 0 && solvedCount === cards.length && completedStages >= stage;

	/**
	 * XP claims and the next sentence
	 */
	const rewards = puzzle?.rewards ?? [];
	const hasPendingCardRewards = rewards.some(
		reward => reward.kind === 'card' && reward.claimedAt === null,
	);
	const hasPendingSentenceRewards = selectedSentencePage?.hasPendingRewards ?? false;
	const pendingGem = rewards.find(reward => reward.kind === 'gem' && reward.claimedAt === null);
	const isShowingGemClaim = Boolean(pendingGem && !hasPendingCardRewards);
	const nextSentencePageIndex = sentencePages.findIndex(sentencePage => {
		return sentencePage.hasUnansweredWords || sentencePage.hasPendingRewards;
	});
	const isShowingNextSentence = isSentenceSolved && !isComplete && !isShowingGemClaim;

	/**
	 * Puzzle eligibility
	 */
	const eligibility = getSolveStageEligibility({
		stage,
		completedStages,
		playerLevel: experience.level,
		fastSolveUnlocks,
		isParagraphUnlocked: puzzle?.isUnlocked ?? false,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progressById[deckId]?.seenWordCount ?? 0,
	});
	const unlockMessage = getSolveUnlockMessage({
		stage,
		eligibility,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progressById[deckId]?.seenWordCount ?? 0,
	});
	const isEligible = Boolean(
		puzzle && (eligibility.isEligible || eligibility.lockReason === 'completed'),
	);

	/**
	 * Answer availability
	 */
	const cardCost = selectedCard?.inkCost ?? 0;
	let hasEnoughInk = inkBalance > 0;

	if (selectedCard) {
		hasEnoughInk = inkBalance >= cardCost;
	}

	const hasUnsolvedCard = Boolean(selectedCard?.wordId && selectedCard.acceptedAnswer === null);
	const disabled = isSaving || isUpdatingProgress;

	/**
	 * Keep the finished puzzle open until it has been claimed.
	 */
	const isCloseDisabled = disabled || Boolean(pendingGem && !isComplete);
	const isInputDisabled =
		disabled || needsRetry || !isEligible || !hasEnoughInk || !hasUnsolvedCard;
	const canSubmit = isEligible && hasUnsolvedCard && hasEnoughInk && Boolean(answer.trim());
	const isNextSentenceDisabled =
		disabled || needsRetry || hasPendingSentenceRewards || nextSentencePageIndex === -1;
	const needsInk = hasUnsolvedCard && !hasEnoughInk && !needsRetry;

	/**
	 * Story and layout
	 */
	const storyColor = getDeckStoryColor(deckId);
	const paragraphNumber = getParagraphNumber(deckId);
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const isLoading = !puzzle && !loadError;
	const wordColor = {
		color: storyColor,
	};
	const containerInsets = {
		paddingTop: top + 8,
	};
	const postcardInsets = {
		marginBottom: Math.max(bottom, 8),
	};
	const parchmentTint = {
		backgroundColor: 'transparent',
	};
	const statusTextStyle = {
		backgroundColor: 'transparent',
	};
	const feedbackTextStyle = {
		backgroundColor: feedback?.backgroundColor ?? 'transparent',
	};
	const balanceColor = {
		color: colors.ink.available,
	};

	/**
	 * Initial display values
	 */
	let inkColor = colors.ink.available;
	let submitColor = inkColor;
	let isSubmitDisabled = disabled || (!needsRetry && !canSubmit);
	let submitLabel = 'Solve';
	let puzzleTitle = 'Solve';
	const gemColor = colors.gems.earned;
	let gemTitle = 'First gem earned!';
	let keyboardBehavior: 'padding' | 'height' = 'height';
	let prompt = 'No card selected.';
	let statusMessage = '';
	let puzzleNotice = loadError || unlockMessage;
	let visibleCards = sentenceCards;
	let completionMessage =
		'Complete Solve+ and Solve++ and claim all 3 gems to unlock the next paragraph.';

	/**
	 * Screen reader descriptions
	 */
	let answerAccessibilityLabel = 'English answer';
	let answerPlaceholder = 'Type the English meaning';

	if (!hasEnoughInk) {
		inkColor = colors.ink.insufficient;
	}

	submitColor = inkColor;
	balanceColor.color = inkColor;

	if (isLoading) {
		puzzleNotice = 'Loading puzzle...';
	}

	if (isComplete && puzzle) {
		visibleCards = puzzle.positions;
	}

	if (paragraphNumber) {
		puzzleTitle = `Paragraph ${paragraphNumber} Puzzle ${stage}`;
	}

	if (Platform.OS === 'ios') {
		keyboardBehavior = 'padding';
	}

	if (stage === 2) {
		parchmentTint.backgroundColor = stageDefinition.backgroundTint;
		gemTitle = 'Second gem earned!';
		completionMessage = 'Complete Solve++ and claim your third gem to unlock the next paragraph.';
	}

	if (isFrenchAnswer) {
		answerAccessibilityLabel = 'French answer';
		answerPlaceholder = 'Type the French word';
	}

	if (selectedCard) {
		submitLabel = `Solve (${cardCost} Ink)`;
		prompt = `English meaning of “${selectedCard.text}”`;

		if (isFrenchAnswer) {
			prompt = `French word for “${selectedCard.englishPrompt}”`;
		}
	}

	if (isShowingNextSentence) {
		submitLabel = 'Next sentence';
		submitColor = storyColor;
		isSubmitDisabled = isNextSentenceDisabled;
		prompt = 'Sentence solved! Continue to the next sentence.';

		if (hasPendingSentenceRewards) {
			prompt = 'Claim the XP on this sentence’s solved cards to continue.';
		}
	}

	if (needsInk) {
		statusMessage = `You need ${cardCost} Ink. Close this puzzle and practice flashcards to earn more.`;
		statusTextStyle.backgroundColor = colors.light.warning;
	}

	if (needsRetry) {
		submitLabel = 'Retry save';
		statusMessage = 'Changes could not be saved.';
		statusTextStyle.backgroundColor = colors.light.danger;
	}

	if (disabled) {
		statusMessage = 'Saving...';
		statusTextStyle.backgroundColor = 'transparent';
	}

	if (isSubmitDisabled) {
		submitColor = colors.dark.border;
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
					const savedPuzzle = await getSolvePuzzle({
						database,
						userId,
						deckId,
						stage,
						fastSolveUnlocks,
					});
					const savedSentencePages = getSolveSentencePages(savedPuzzle);
					const sentencePageToOpen = getSolveSentencePageToOpen(savedSentencePages);

					if (isActive) {
						setPuzzle(savedPuzzle);
						setSelectedSentencePageIndex(sentencePageToOpen ?? 0);
						setSelectedPosition(undefined);
						setAnswer('');
						setAnswerSelection({
							start: 0,
							end: 0,
						});
						setFeedback(null);
						setNeedsRetry(false);
						pendingAttempt.current = null;
					}
				} catch (error) {
					console.error('Could not load Solve:', error);

					if (isActive) {
						setLoadError('Could not load this puzzle. Go back and try again.');
					}
				}
			}

			loadPuzzle();

			return () => {
				isActive = false;
			};
		}, [deckId, userId, stage, fastSolveUnlocks]),
	);

	/**
	 * Selects a word card and clears the previous answer and feedback.
	 */
	function handleSelectCard(position: number) {
		if (disabled || needsRetry || isBusy.current) {
			return;
		}

		setSelectedPosition(position);
		setAnswer('');
		setAnswerSelection({
			start: 0,
			end: 0,
		});
		setFeedback(null);
	}

	/**
	 * Opens the next sentence that needs answers or XP claims.
	 */
	function handleNextSentence() {
		if (
			isNextSentenceDisabled ||
			isBusy.current ||
			!isSentenceSolved ||
			nextSentencePageIndex === -1
		) {
			return;
		}

		setSelectedSentencePageIndex(nextSentencePageIndex);
		setSelectedPosition(undefined);
		setAnswer('');
		setAnswerSelection({
			start: 0,
			end: 0,
		});
		setFeedback(null);
		pendingAttempt.current = null;
	}

	/**
	 * Updates the cursor position used by the French character keyboard.
	 */
	function handleAnswerSelection(event: TextInputSelectionChangeEvent) {
		setAnswerSelection(event.nativeEvent.selection);
	}

	/**
	 * Insert a French character at the cursor and replace any selected letters.
	 */
	function handleInsertCharacter(character: string) {
		const textBeforeSelection = answer.slice(0, answerSelection.start);
		const textAfterSelection = answer.slice(answerSelection.end);
		const nextAnswer = textBeforeSelection + character + textAfterSelection;
		const cursorPosition = textBeforeSelection.length + character.length;
		const nextSelection: SolveAnswerSelection = {
			start: cursorPosition,
			end: cursorPosition,
		};

		if (isInputDisabled || isBusy.current) {
			return;
		}

		setAnswer(nextAnswer);
		setAnswerSelection(nextSelection);
		answerInput.current?.focus();
	}

	/**
	 * Shows the accepted answer and XP claims on every solved word.
	 */
	function updateSavedCard(position: number, result: SolveAttemptResult) {
		const acceptedAnswer = result.acceptedAnswer;

		if (acceptedAnswer === null) {
			return;
		}

		setPuzzle(current => {
			/**
			 * Current puzzle and answered word
			 */
			const answeredCard = current?.positions.find(card => card.position === position);

			if (!current || !answeredCard?.wordId) {
				return current;
			}

			const positions = current.positions.map(card => {
				if (card.wordId !== answeredCard.wordId || card.acceptedAnswer !== null) {
					return card;
				}

				return {
					...card,
					acceptedAnswer,
				};
			});
			let completedSolveStages = current.completedSolveStages;

			if (result.stageCompleted || result.firstGemEarned) {
				completedSolveStages = stage;
			}

			return {
				...current,
				positions,
				rewards: result.rewards ?? current.rewards,
				hasFirstGem: current.hasFirstGem || result.firstGemEarned,
				completedSolveStages,
			};
		});
	}

	/**
	 * Shows the solved card's usual success appearance after its XP has been claimed.
	 */
	function handleCardRewardClaimed(reward: SolveReward) {
		setPuzzle(current => {
			if (!current) {
				return current;
			}

			const updatedRewards = current.rewards.map(saved => {
				if (saved.kind === reward.kind && saved.position === reward.position) {
					return reward;
				}

				return saved;
			});

			return {
				...current,
				rewards: updatedRewards,
			};
		});
	}

	/**
	 * Submits a word answer or opens the next sentence when the current sentence is finished.
	 */
	async function handleSubmit() {
		if (isShowingNextSentence) {
			handleNextSentence();
			return;
		}

		if (disabled || isBusy.current || (!needsRetry && !canSubmit) || !selectedCard) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);
		setFeedback(null);

		try {
			if (!pendingAttempt.current) {
				pendingAttempt.current = {
					deckId,
					position: selectedCard.position,
					stage,
					answer,
					attemptId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
				};
			}

			const result = await writeSolveAttempt(pendingAttempt.current);

			if (result === false) {
				setNeedsRetry(true);
				return;
			}

			pendingAttempt.current = null;
			setNeedsRetry(false);
			setFeedback(getSolveFeedback(result, stage));
			updateSavedCard(selectedCard.position, result);

			if (result.status === 'exact' || result.status === 'close') {
				void playCorrectWord();
			}

			/**
			 * Clear wrong answers so a quick second tap
			 * cannot charge for the same answer again.
			 */
			if (result.status === 'incorrect') {
				setAnswer('');
				setAnswerSelection({
					start: 0,
					end: 0,
				});
			}
		} finally {
			isBusy.current = false;
			setIsSaving(false);
		}
	}

	/**
	 * Closes the puzzle and returns to the paragraph selection view.
	 */
	function handleClose() {
		if (isCloseDisabled || isBusy.current) {
			return;
		}

		if (router.canDismiss()) {
			router.dismiss();
			return;
		}

		if (chapter) {
			router.replace({
				pathname: '/ChapterDetail',
				params: {
					chapterId: chapter.id,
				},
			});
			return;
		}

		router.replace('/(tabs)');
	}

	return (
		<KeyboardAvoidingView
			style={[styles.container, containerInsets]}
			behavior={keyboardBehavior}
		>
			<BackgroundImage
				source={postcardBackground}
				style={[styles.postcard, postcardInsets]}
			>
				<View
					pointerEvents="none"
					style={[StyleSheet.absoluteFill, parchmentTint]}
				/>
				<View style={styles.header}>
					<View style={styles.titleRow}>
						<Text
							accessibilityRole="header"
							style={[styles.title, wordColor]}
						>
							{puzzleTitle}
						</Text>
						{puzzle?.isUnlocked && (stage === 1 || isComplete) && (
							<ReadingLink
								item={puzzle.deck}
								color={storyColor}
								style={styles.readLink}
							/>
						)}
					</View>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Close ${stageDefinition.label}`}
						accessibilityHint="Return to paragraph selection. Your solved cards are saved."
						accessibilityState={{
							disabled: isCloseDisabled,
						}}
						disabled={isCloseDisabled}
						onPress={handleClose}
						style={[styles.closeButton, isCloseDisabled && styles.disabledCloseButton]}
					>
						<MaterialSymbol
							name="close"
							size={24}
							color={storyColor}
						/>
					</Pressable>
				</View>
				<View style={styles.progressHeader}>
					{isEligible && (
						<View style={styles.progressDetails}>
							{!isComplete && !isShowingGemClaim && sentencePages.length > 0 && (
								<Text style={styles.progress}>
									Sentence {selectedSentencePageIndex + 1} of {sentencePages.length}
								</Text>
							)}
							<Text style={styles.progress}>
								{solvedCount} / {cards.length} cards solved
							</Text>
						</View>
					)}
					<View style={styles.ink}>
						<MaterialSymbol
							name="water_drop"
							size={18}
							color={inkColor}
						/>
						<Text style={[styles.text, balanceColor]}>
							{inkBalance} / {maxInkBalance}
						</Text>
					</View>
				</View>
				{!isEligible && <Text style={styles.notice}>{puzzleNotice}</Text>}
				{isEligible && (
					<>
						<ScrollView
							key={`${deckId}-${stage}-${selectedSentencePageIndex}`}
							style={styles.scroll}
							contentContainerStyle={styles.grid}
							keyboardShouldPersistTaps="handled"
							bounces={false}
							overScrollMode="never"
						>
							{visibleCards.map(card => (
								<SolveCard
									key={card.position}
									deckId={deckId}
									reward={rewards.find(
										reward => reward.kind === 'card' && reward.position === card.position,
									)}
									onRewardClaimed={handleCardRewardClaimed}
									card={card}
									stage={stage}
									isSelected={card.position === selectedPosition}
									disabled={disabled || needsRetry}
									storyColor={storyColor}
									onSelect={handleSelectCard}
								/>
							))}
						</ScrollView>
					</>
				)}
				<View style={styles.editor}>
					{isEligible && (
						<>
							{isComplete && (
								<View style={styles.completion}>
									<MaterialSymbol
										name="diamond"
										filled
										size={32}
										color={gemColor}
										style={styles.gem}
									/>
									<Text style={styles.word}>{gemTitle}</Text>
									<Text style={styles.text}>{completionMessage}</Text>
								</View>
							)}
							{!isComplete && isShowingGemClaim && pendingGem && (
								<SolveGemClaim
									deckId={deckId}
									reward={pendingGem}
									disabled={disabled}
									onClaimed={setClaimedGem}
								/>
							)}
							{!isComplete && !isShowingGemClaim && (
								<>
									<Text style={styles.text}>{prompt}</Text>
									{Boolean(statusMessage) && (
										<Text
											accessibilityLiveRegion="polite"
											style={styles.text}
										>
											<Text style={statusTextStyle}>{statusMessage}</Text>
										</Text>
									)}
									{feedback && (
										<Text
											accessibilityLiveRegion="polite"
											style={styles.text}
										>
											<Text style={feedbackTextStyle}>{feedback.text}</Text>
										</Text>
									)}
									{!isShowingNextSentence && (
										<TextInput
											ref={answerInput}
											accessibilityLabel={answerAccessibilityLabel}
											accessibilityState={{
												disabled: isInputDisabled,
											}}
											placeholder={answerPlaceholder}
											placeholderTextColor={colors.light.border}
											value={answer}
											selection={answerSelection}
											onChangeText={setAnswer}
											onSelectionChange={handleAnswerSelection}
											editable={!isInputDisabled}
											autoCorrect={false}
											autoCapitalize="none"
											returnKeyType="done"
											onSubmitEditing={handleSubmit}
											style={[styles.input, isInputDisabled && styles.disabledInput]}
										/>
									)}
									{isFrenchAnswer && !isShowingNextSentence && (
										<SolveCharacterKeyboard
											color={storyColor}
											disabled={isInputDisabled}
											onCharacterPress={handleInsertCharacter}
										/>
									)}
								</>
							)}
						</>
					)}
					<View style={styles.actions}>
						<View style={styles.actionButton}>
							<LinkButton
								SVGElement={
									<MaterialSymbol
										name="close"
										size={20}
										color={storyColor}
									/>
								}
								handler={handleClose}
								disabled={isCloseDisabled}
								accessibilityState={{
									disabled: isCloseDisabled,
								}}
								style={isCloseDisabled && styles.disabledCloseButton}
								color={storyColor}
								type="outline"
								useArrow={false}
								fullwidth
							>
								Close
							</LinkButton>
						</View>
						{isEligible && !isComplete && !isShowingGemClaim && (
							<View style={styles.solveActionButton}>
								<LinkButton
									handler={handleSubmit}
									disabled={isSubmitDisabled}
									accessibilityLabel={submitLabel}
									accessibilityState={{
										disabled: isSubmitDisabled,
										busy: isSaving,
									}}
									style={isSubmitDisabled && styles.disabledSubmit}
									color={submitColor}
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
		</KeyboardAvoidingView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	disabledCloseButton: {
		opacity: 0.4,
	},
	disabledSubmit: {
		opacity: 0.8,
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
	closeButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleRow: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	readLink: {
		fontSize: 14,
	},
	ink: {
		marginLeft: 'auto',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 8,
		gap: 4,
	},
	text: {
		fontFamily: 'lexend-400',
		color: colors.dark.text,
		fontSize: 14,
	},
	notice: {
		flex: 1,
		padding: 16,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
		fontSize: 16,
	},
	progressHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: 1,
		paddingHorizontal: 12,
		paddingBottom: 4,
	},
	progress: {
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	progressDetails: {
		flexShrink: 1,
		gap: 4,
	},
	scroll: {
		flex: 1,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		padding: 12,
	},
	word: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	editor: {
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
	completion: {
		alignItems: 'center',
		gap: 8,
	},
	gem: {
		textShadowOffset: {
			width: 0,
			height: 0,
		},
		textShadowRadius: 1,
		textShadowColor: colors.gems.glow,
	},
	input: {
		minHeight: 44,
		padding: 10,
		backgroundColor: '#FFFFFF',
		borderColor: colors.light.border,
		borderWidth: 1,
		borderRadius: 8,
		fontFamily: 'lexend-400',
		fontSize: 16,
		color: colors.dark.text,
	},
	disabledInput: {
		opacity: 0.6,
	},
});
