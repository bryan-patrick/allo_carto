import colors from '@/src/app/colors';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import CollectionGems from '@/src/components/CollectionGems';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type {
	SentenceAttemptRequest,
	SolveAttemptResult,
	SolveSentencePuzzle,
} from '@/src/components/Solve/solveTypes';
import { getDB, getDeck } from '@/src/db/interface';
import getSolveSentencePuzzle from '@/src/db/queries/getSolveSentencePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findCompletionPath } from '@/src/util/atlasCompletion';
import { getCardsPerDeck } from '@/src/util/cardsPerDeck';
import { createDeckSession } from '@/src/util/createDeckSession';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { inkConfig } from '@/src/util/ink';
import type { UserProgressRow } from '@/src/util/progression';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
} from '@/src/util/solveProgression';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
	Alert,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SolveSentenceViewProps {
	deckId: string;
}

interface SentenceFeedback {
	text: string;
	backgroundColor: string;
	needsInk?: boolean;
}

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Show the result and Ink cost after a sentence answer is submitted.
 */
function getSentenceFeedback(result: SolveAttemptResult): SentenceFeedback {
	const messages: Partial<Record<SolveAttemptResult['status'], SentenceFeedback>> = {
		exact: {
			text: 'Correct! Sentence saved.',
			backgroundColor: colors.light.success,
		},
		incorrect: {
			text: `Not quite. That answer cost ${result.inkSpent} Ink.`,
			backgroundColor: colors.light.danger,
		},
		empty: {
			text: 'Type the English sentence before submitting.',
			backgroundColor: colors.light.warning,
		},
		notEnoughInk: {
			text: 'Not enough Ink. Practice flashcards to earn more.',
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
 * Let the player translate each French sentence into English to earn glowing gems.
 */
export default function SolveSentenceView({ deckId }: SolveSentenceViewProps) {
	const router = useRouter();
	const { top, bottom } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { progressById, experience, inkBalance, isUpdatingProgress, writeSentenceAttempt } =
		useUserProgress();
	const { cardDeckDispatch } = useCardDeck();
	const { settings } = useAppSettings();
	const [puzzle, setPuzzle] = useState<SolveSentencePuzzle>();
	const [selectedPosition, setSelectedPosition] = useState(0);
	const [answer, setAnswer] = useState('');
	const [loadError, setLoadError] = useState('');
	const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);
	const isBusy = useRef(false);
	const pendingAttempt = useRef<SentenceAttemptRequest | null>(null);
	const fastSolveUnlocks = settings.fastSolveUnlocks;
	const stageDefinition = solveStages[4];
	const inkCost = stageDefinition.attemptInkCost ?? stageDefinition.incorrectAttemptInkCost;
	const progress = progressById[deckId];
	const savedCompletedStages = getCompletedSolveStages(progress);
	const puzzleCompletedStages = puzzle?.completedSolveStages ?? 0;
	const completedStages =
		savedCompletedStages >= puzzleCompletedStages ? savedCompletedStages : puzzleCompletedStages;
	const sentences = puzzle?.sentences ?? [];
	const selectedIndex = sentences.findIndex(sentence => sentence.position === selectedPosition);
	const selectedSentence = sentences[selectedIndex];
	const solvedCount = sentences.filter(sentence => sentence.acceptedAnswer !== null).length;
	const isComplete = completedStages >= 4;
	const isSentenceSolved = Boolean(selectedSentence && selectedSentence.acceptedAnswer !== null);
	const eligibility = getSolveStageEligibility({
		stage: 4,
		completedStages,
		playerLevel: experience.level,
		fastSolveUnlocks,
		isParagraphUnlocked: puzzle?.isUnlocked ?? false,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progress?.seenWordCount ?? 0,
	});
	const unlockMessage = getSolveUnlockMessage({
		stage: 4,
		eligibility,
		wordCount: puzzle?.deck.wordIds.length ?? 0,
		seenWordCount: progress?.seenWordCount ?? 0,
	});
	const isEligible = Boolean(puzzle && eligibility.isEligible);
	const hasEnoughInk = inkBalance >= inkCost;
	const disabled = isSaving || isUpdatingProgress;
	const inputDisabled = disabled || needsRetry || !isEligible || !hasEnoughInk || isSentenceSolved;
	const submitDisabled =
		disabled || isComplete || (!needsRetry && (inputDisabled || !answer.trim()));
	const navigationDisabled = disabled || needsRetry;
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const storyColor = getDeckStoryColor(deckId);
	const cardsPerDeck = getCardsPerDeck(experience.level, settings.cardsPerDeck);
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const showFlashcards =
		Boolean(puzzle) &&
		!isComplete &&
		(!hasEnoughInk || feedback?.needsInk || eligibility.lockReason === 'playerLevelRequired');
	const completionProgress: UserProgressRow = {
		...progress,
		userId: userId ?? '',
		id: deckId,
		type: 'paragraph',
		completionPercentage: progress?.completionPercentage ?? 0,
		hasFirstGem: completedStages > 0,
		completedSolveStages: completedStages,
	};
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
					const savedPuzzle = await getSolveSentencePuzzle({
						database,
						userId,
						deckId,
						fastSolveUnlocks,
					});
					const firstUnsolved = savedPuzzle.sentences.find(
						sentence => sentence.acceptedAnswer === null,
					);

					if (isActive) {
						setPuzzle(savedPuzzle);
						setSelectedPosition(firstUnsolved?.position ?? 0);
						setAnswer('');
						setFeedback(null);
						setNeedsRetry(false);
						pendingAttempt.current = null;
					}
				} catch (error) {
					console.error('Could not load the sentence puzzle:', error);

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

	function handleAnswerChange(nextAnswer: string) {
		if (inputDisabled || isBusy.current) {
			return;
		}

		setAnswer(nextAnswer);
		setFeedback(null);
		pendingAttempt.current = null;
	}

	function selectSentence(index: number) {
		const sentence = sentences[index];

		if (!sentence || navigationDisabled || isBusy.current) {
			return;
		}

		setSelectedPosition(sentence.position);
		setAnswer('');
		setFeedback(null);
		pendingAttempt.current = null;
	}

	function handlePreviousSentence() {
		selectSentence(selectedIndex - 1);
	}

	function handleNextSentence() {
		selectSentence(selectedIndex + 1);
	}

	/**
	 * Save the accepted sentence on screen and move to the next unfinished one.
	 */
	function updateSavedSentence(position: number, result: SolveAttemptResult) {
		const acceptedAnswer = result.acceptedAnswer;

		if (!puzzle || acceptedAnswer === null) {
			return;
		}

		const updatedSentences = puzzle.sentences.map(sentence => {
			if (sentence.position !== position) {
				return sentence;
			}

			return {
				...sentence,
				acceptedAnswer,
			};
		});
		const nextUnsolved = updatedSentences.find(sentence => sentence.acceptedAnswer === null);

		setPuzzle({
			...puzzle,
			sentences: updatedSentences,
			completedSolveStages: result.stageCompleted ? 4 : puzzle.completedSolveStages,
		});
		setAnswer('');

		if (nextUnsolved) {
			setSelectedPosition(nextUnsolved.position);
		}
	}

	/**
	 * Submit one paid sentence answer and keep its ID if the save needs to be retried.
	 */
	async function handleSubmit() {
		let attempt = pendingAttempt.current;

		if (submitDisabled || isBusy.current || !selectedSentence || (!needsRetry && attempt)) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);
		setFeedback(null);

		if (!attempt) {
			attempt = {
				deckId,
				position: selectedSentence.position,
				answer,
				attemptId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			};
			pendingAttempt.current = attempt;
		}

		try {
			const result = await writeSentenceAttempt(attempt);

			if (result === false) {
				setNeedsRetry(true);
				setFeedback({
					text: 'The answer could not be saved. Retry to recover the same attempt.',
					backgroundColor: colors.light.warning,
				});
				return;
			}

			setNeedsRetry(false);
			setFeedback(getSentenceFeedback(result));
			updateSavedSentence(attempt.position, result);

			if (result.status === 'incorrect') {
				setAnswer('');
			} else {
				pendingAttempt.current = null;
			}
		} finally {
			isBusy.current = false;
			setIsSaving(false);
		}
	}

	/**
	 * Open this paragraph's flashcards to earn more Ink while keeping solved sentences saved.
	 */
	async function handleOpenFlashcards() {
		if (!userId || !puzzle || disabled || needsRetry || isBusy.current) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);

		try {
			const selectedDeck = await getDeck({
				deck: puzzle.deck,
				amount: cardsPerDeck,
				userId,
			});
			const session = createDeckSession(experience.totalXP);

			if (!selectedDeck || selectedDeck.words.length === 0) {
				Alert.alert('Could not start session', 'Please try again.');
				return;
			}

			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck,
				session,
			});
			router.replace('/CardDeck');
		} catch (error) {
			console.error('Could not open flashcards:', error);
			Alert.alert('Could not start session', 'Please try again.');
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
						style={[styles.title, titleColor]}
					>
						{stageDefinition.label}
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close Solve+++"
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
				<ScrollView
					contentContainerStyle={styles.body}
					keyboardShouldPersistTaps="handled"
				>
					{!puzzle ?
						<Text style={styles.text}>{loadError || 'Loading puzzle…'}</Text>
					: isComplete ?
						<View style={styles.completion}>
							<CollectionGems
								title={puzzle.deck.title}
								progress={completionProgress}
								size={32}
							/>
							<Text style={styles.title}>Glowing gems earned!</Text>
							<Text style={[styles.text, styles.centeredText]}>
								Every sentence is solved. All three gems now glow.
							</Text>
							<LinkButton
								handler={handleClose}
								color={storyColor}
								useArrow={false}
							>
								Close
							</LinkButton>
						</View>
					: !isEligible ?
						<Text style={styles.text}>{unlockMessage}</Text>
					: selectedSentence ?
						<>
							{!isSentenceSolved && (
								<Text style={styles.text}>Translate the sentence to english.</Text>
							)}
							<View style={styles.sentenceCard}>
								<Text
									style={styles.frenchSentence}
									accessibilityLabel={`French sentence: ${selectedSentence.frenchText}`}
								>
									{selectedSentence.frenchText}
								</Text>
								{isSentenceSolved ?
									<View style={styles.savedAnswer}>
										<Text style={styles.text}>✓ Sentence solved</Text>
										<Text style={styles.text}>{selectedSentence.acceptedAnswer}</Text>
									</View>
								:	<>
										<TextInput
											accessibilityLabel="English sentence answer"
											value={answer}
											onChangeText={handleAnswerChange}
											editable={!inputDisabled}
											placeholder="Type the English sentence"
											placeholderTextColor={colors.light.border}
											autoCorrect={false}
											autoCapitalize="sentences"
											multiline
											style={[styles.input, inputDisabled && styles.disabled]}
										/>
										{!hasEnoughInk && (
											<Text
												accessibilityLiveRegion="polite"
												style={styles.text}
											>
												You need {inkCost} Ink to type an answer. Practice flashcards to earn more.
											</Text>
										)}
									</>
								}
							</View>
							<View style={styles.sentenceNavigation}>
								<View style={styles.navigation}>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel="Previous sentence"
										onPress={handlePreviousSentence}
										disabled={navigationDisabled || selectedIndex <= 0}
										style={[
											styles.navigationButton,
											(navigationDisabled || selectedIndex <= 0) && styles.disabled,
										]}
									>
										<MaterialSymbol
											name="arrow_back"
											size={16}
											color={colors.dark.text}
										/>
										<Text style={styles.text}>Previous</Text>
									</Pressable>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel="Next sentence"
										onPress={handleNextSentence}
										disabled={navigationDisabled || selectedIndex >= sentences.length - 1}
										style={[
											styles.navigationButton,
											(navigationDisabled || selectedIndex >= sentences.length - 1) &&
												styles.disabled,
										]}
									>
										<Text style={styles.text}>Next</Text>
										<MaterialSymbol
											name="arrow_forward"
											size={16}
											color={colors.dark.text}
										/>
									</Pressable>
								</View>
								<Text style={[styles.text, styles.centeredText]}>
									{solvedCount} / {sentences.length} sentences solved
								</Text>
							</View>
						</>
					:	null}
				</ScrollView>
				{puzzle && !isComplete && (
					<View style={styles.footer}>
						{feedback && (
							<Text
								accessibilityLiveRegion="polite"
								style={styles.text}
							>
								<Text style={feedbackStyle}>{feedback.text}</Text>
							</Text>
						)}
						{showFlashcards && (
							<LinkButton
								handler={handleOpenFlashcards}
								disabled={disabled || needsRetry}
								color={storyColor}
								fullwidth
							>
								Flashcards
							</LinkButton>
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
					</View>
				)}
			</ImageBackground>
		</KeyboardAvoidingView>
	);
}

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
	body: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 12,
		gap: 16,
	},
	sentenceCard: {
		padding: 12,
		gap: 12,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
	},
	sentenceNavigation: {
		gap: 8,
	},
	navigation: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	navigationButton: {
		flex: 1,
		minHeight: 44,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
	},
	frenchSentence: {
		fontFamily: 'lexend-400',
		fontSize: 18,
		lineHeight: 27,
		color: colors.dark.text,
	},
	text: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	centeredText: {
		textAlign: 'center',
	},
	input: {
		minHeight: 96,
		maxHeight: 160,
		padding: 10,
		textAlignVertical: 'top',
		backgroundColor: colors.light.primary,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
		fontFamily: 'lexend-400',
		fontSize: 16,
		color: colors.dark.text,
	},
	savedAnswer: {
		padding: 12,
		gap: 8,
		borderRadius: 8,
		backgroundColor: colors.light.success,
	},
	completion: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 16,
	},
	footer: {
		padding: 12,
		gap: 8,
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	disabled: {
		opacity: 0.5,
	},
});
