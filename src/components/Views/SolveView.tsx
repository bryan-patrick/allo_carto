import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import SecondaryButton from '@/src/components/SecondaryButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ReadingLink from '@/src/components/ReadingLink';
import SolveCard from '@/src/components/Solve/SolveCard';
import SolveCharacterKeyboard from '@/src/components/Solve/SolveCharacterKeyboard';
import type {
	SolveAttemptRequest,
	SolveAttemptResult,
	SolvePuzzle,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findCompletionPath, findNextParagraph } from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { inkConfig } from '@/src/util/ink';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
	type SolveWordStage,
} from '@/src/util/solveProgression';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
	ImageBackground,
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

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

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
			text: stage === 2 ? 'A French answer is required.' : 'An English answer is required.',
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

	return messages[result.status];
}

/**
 * Let the player select word cards and submit English or French answers for Ink.
 */
export default function SolveView({ deckId, stage }: SolveViewProps) {
	const router = useRouter();
	const { bottom, top } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { experience, progressById, inkBalance, isUpdatingProgress, writeSolveAttempt } =
		useUserProgress();
	const { settings } = useAppSettings();
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const stageDefinition = solveStages[stage];
	const isFrenchAnswer = stageDefinition.answerLanguage === 'french';
	const [puzzle, setPuzzle] = useState<SolvePuzzle>();
	const [loadError, setLoadError] = useState('');
	const [selectedPosition, setSelectedPosition] = useState<number>();
	const [answer, setAnswer] = useState('');
	const [answerSelection, setAnswerSelection] = useState<SolveAnswerSelection>({
		start: 0,
		end: 0,
	});
	const [feedback, setFeedback] = useState<SolveFeedback | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);
	const isBusy = useRef(false);
	const answerInput = useRef<TextInputInstance>(null);
	const pendingAttempt = useRef<SolveAttemptRequest | null>(null);
	const selectedCard = puzzle?.positions.find(card => card.position === selectedPosition);
	const cards = puzzle?.positions.filter(card => card.wordId) ?? [];
	const solvedCount = cards.filter(card => card.acceptedAnswer !== null).length;
	const savedCompletedStages = getCompletedSolveStages(progressById[deckId]);
	const puzzleCompletedStages = puzzle?.completedSolveStages ?? 0;
	const completedStages =
		savedCompletedStages >= puzzleCompletedStages ? savedCompletedStages : puzzleCompletedStages;
	const isComplete = cards.length > 0 && solvedCount === cards.length && completedStages >= stage;
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
	const cardCost = selectedCard?.inkCost ?? 0;
	const hasEnoughInk = selectedCard ? inkBalance >= cardCost : inkBalance > 0;
	const hasUnsolvedCard = Boolean(selectedCard?.wordId && selectedCard.acceptedAnswer === null);
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const disabled = isSaving || isUpdatingProgress;
	const isInputDisabled =
		disabled || needsRetry || !isEligible || !hasEnoughInk || !hasUnsolvedCard;
	const canSubmit = isEligible && hasUnsolvedCard && hasEnoughInk && Boolean(answer.trim());
	const isSubmitDisabled = disabled || (!needsRetry && !canSubmit);
	const submitColor = isSubmitDisabled ? colors.dark.border : inkColor;
	const needsInk = hasUnsolvedCard && !hasEnoughInk && !needsRetry;
	const storyColor = getDeckStoryColor(deckId);
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const nextParagraph = findNextParagraph(deckId);
	const isChapterComplete = nextParagraph?.chapter.id !== chapter?.id;
	const isLoading = !puzzle && !loadError;
	const wordColor = {
		color: storyColor,
	};
	const balanceColor = {
		color: inkColor,
	};
	const containerInsets = {
		paddingTop: top + 8,
	};
	const postcardInsets = {
		marginBottom: Math.max(bottom, 8),
	};
	const parchmentTint = {
		backgroundColor: stage === 2 ? stageDefinition.backgroundTint : 'transparent',
	};
	const gemColor = stage === 2 ? colors.gems.second : colors.gems.first;
	const gemTitle = stage === 2 ? 'Second gem earned!' : 'First gem earned!';
	const statusTextStyle = {
		backgroundColor: 'transparent',
	};
	const feedbackTextStyle = {
		backgroundColor: feedback?.backgroundColor ?? 'transparent',
	};
	let submitLabel =
		selectedCard ? `${stageDefinition.label} (${cardCost} Ink)` : stageDefinition.label;
	let prompt = 'No card selected.';
	let statusMessage = '';
	let completionMessage = 'All cards solved. The next paragraph is ready.';

	if (isChapterComplete) {
		completionMessage = 'Chapter complete! The next chapter is ready.';
	}

	if (!nextParagraph) {
		completionMessage = 'All paragraphs solved. Story complete!';
	}

	if (stage === 2) {
		completionMessage = 'All French word cards solved. Your second gem is saved.';
	}

	if (selectedCard) {
		prompt =
			isFrenchAnswer ?
				`French word for “${selectedCard.englishPrompt}”`
			:	`English meaning of “${selectedCard.text}”`;
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
		statusMessage = 'Saving…';
		statusTextStyle.backgroundColor = 'transparent';
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

					if (isActive) {
						setPuzzle(savedPuzzle);
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

	function handleSelectCard(position: number) {
		setSelectedPosition(position);
		setAnswer('');
		setAnswerSelection({
			start: 0,
			end: 0,
		});
		setFeedback(null);
	}

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

	function updateSavedCard(position: number, result: SolveAttemptResult) {
		if (result.acceptedAnswer === null) {
			return;
		}

		setPuzzle(current => {
			if (!current) {
				return current;
			}

			const positions = current.positions.map(card => {
				if (card.position !== position) {
					return card;
				}

				return {
					...card,
					acceptedAnswer: result.acceptedAnswer ?? card.acceptedAnswer,
				};
			});

			return {
				...current,
				positions,
				hasFirstGem: current.hasFirstGem || result.firstGemEarned,
				completedSolveStages:
					result.stageCompleted || result.firstGemEarned ? stage : current.completedSolveStages,
			};
		});
	}

	/**
	 * Submit a paid answer and keep its ID so retrying a failed save cannot charge twice.
	 */
	async function handleSubmit() {
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

			/**
			 * Clear wrong answers so a quick second tap cannot charge for the same text again.
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

	function handleClose() {
		if (disabled || isBusy.current) {
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
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
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
						style={[styles.title, wordColor]}
					>
						{stageDefinition.label} this paragraph
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Close ${stageDefinition.label}`}
						accessibilityHint="Return to paragraph selection. Your solved cards are saved."
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
					<View style={styles.paragraphDetails}>
						<Text style={styles.paragraphTitle}>{puzzle?.deck.title}</Text>
						{puzzle?.isUnlocked && (stage === 1 || isComplete) && (
							<ReadingLink
								item={puzzle.deck}
								color={storyColor}
								label="Read paragraph"
								style={styles.readLink}
							/>
						)}
					</View>
					<View style={styles.ink}>
						<MaterialSymbol
							name="water_drop"
							size={18}
							color={inkColor}
						/>
						<Text style={[styles.text, balanceColor]}>
							{inkBalance} / {inkConfig.maxBalance}
						</Text>
					</View>
				</View>
				{!isEligible && (
					<Text style={styles.notice}>
						{isLoading ? 'Loading puzzle…' : loadError || unlockMessage}
					</Text>
				)}
				{isEligible && (
					<>
						<Text style={styles.progress}>
							{solvedCount} / {cards.length} cards solved
						</Text>
						<ScrollView
							style={styles.scroll}
							contentContainerStyle={styles.grid}
							keyboardShouldPersistTaps="handled"
						>
							{puzzle?.positions.map(card => (
								<SolveCard
									key={card.position}
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
							{isComplete ?
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
							:	<>
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
									<TextInput
										ref={answerInput}
										accessibilityLabel={isFrenchAnswer ? 'French answer' : 'English answer'}
										accessibilityState={{
											disabled: isInputDisabled,
										}}
										placeholder={
											isFrenchAnswer ? 'Type the French word' : 'Type the English meaning'
										}
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
									{isFrenchAnswer && (
										<SolveCharacterKeyboard
											color={storyColor}
											disabled={isInputDisabled}
											onCharacterPress={handleInsertCharacter}
										/>
									)}
								</>
							}
							{!isComplete && (
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
							)}
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
		</KeyboardAvoidingView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
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
		padding: 12,
	},
	closeButton: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	details: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 12,
		paddingBottom: 8,
	},
	title: {
		flex: 1,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	paragraphDetails: {
		flex: 1,
		gap: 4,
	},
	paragraphTitle: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	readLink: {
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	ink: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		padding: 6,
		borderRadius: 8,
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
	progress: {
		paddingHorizontal: 12,
		paddingBottom: 12,
		fontFamily: 'lexend-400',
		fontSize: 14,
		alignSelf: 'flex-end',
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
		backgroundColor: colors.light.primary,
		borderColor: colors.light.border,
		borderWidth: 1,
		borderRadius: 8,
		fontFamily: 'lexend-400',
		fontSize: 16,
		color: colors.dark.text,
	},
	disabledInput: {
		backgroundColor: colors.light.background,
		opacity: 0.6,
	},
});
