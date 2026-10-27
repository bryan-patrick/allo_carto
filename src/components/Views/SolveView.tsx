import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ReadingLink from '@/src/components/ReadingLink';
import SolveCard from '@/src/components/Solve/SolveCard';
import type {
	SolveAttemptRequest,
	SolveAttemptResult,
	SolvePuzzle,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findCompletionPath, findNextParagraph, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { inkConfig } from '@/src/util/ink';
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
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SolveViewProps {
	deckId: string;
}

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * We show the saved result so the feedback matches what happened to the player's Ink.
 */
function getSolveFeedback(result: SolveAttemptResult): string {
	const messages: Record<SolveAttemptResult['status'], string> = {
		exact: `Correct! ${result.acceptedAnswer}.`,
		close: `Accepted! The spelling is “${result.acceptedAnswer}”.`,
		incorrect: `Not quite. That attempt cost ${result.inkSpent} Ink.`,
		empty: 'Type an English answer first.',
		notEnoughInk: 'Study flashcards to earn more Ink.',
		alreadySolved: `Already solved: ${result.acceptedAnswer}.`,
		unavailable: 'Study every word in this paragraph before solving.',
		locked: 'Unlock this card before solving it.',
		unlocked: 'Card unlocked. Now type its English meaning.',
		alreadyUnlocked: 'This card is unlocked. Type its English meaning.',
	};

	return messages[result.status];
}

/**
 * Players unlock a card to reveal its word, then spend Ink to solve it.
 * Leaving this screen keeps both unlocked cards and correct answers saved.
 */
export default function SolveView({ deckId }: SolveViewProps) {
	const router = useRouter();
	const { bottom, top } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { inkBalance, isUpdatingProgress, progressById, writeSolveAttempt, unlockSolveCard } =
		useUserProgress();
	const [puzzle, setPuzzle] = useState<SolvePuzzle>();
	const [loadError, setLoadError] = useState('');
	const [selectedPosition, setSelectedPosition] = useState<number>();
	const [answer, setAnswer] = useState('');
	const [feedback, setFeedback] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [needsRetry, setNeedsRetry] = useState(false);
	const isBusy = useRef(false);
	const pendingAttempt = useRef<SolveAttemptRequest | null>(null);
	const selectedCard = puzzle?.positions.find(card => card.position === selectedPosition);
	const cards = puzzle?.positions.filter(card => card.wordId) ?? [];
	const solvedCount = cards.filter(card => card.acceptedAnswer !== null).length;
	const isComplete = cards.length > 0 && solvedCount === cards.length;
	const isEligible = Boolean(puzzle?.isUnlocked && puzzle.allWordsSeen);
	const cardCost = selectedCard ? inkConfig.cardCostByRarity[selectedCard.rarity] : 0;
	const hasEnoughInk = selectedCard ? inkBalance >= cardCost : inkBalance > 0;
	const isUnlocking = selectedCard?.isUnlocked === false;
	const hasUnsolvedCard = Boolean(selectedCard?.wordId && selectedCard.acceptedAnswer === null);
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const disabled = isSaving || isUpdatingProgress;
	const isInputDisabled =
		disabled || needsRetry || !isEligible || !hasEnoughInk || !hasUnsolvedCard || isUnlocking;
	const canSubmit =
		isEligible && hasUnsolvedCard && hasEnoughInk && (isUnlocking || Boolean(answer.trim()));
	const isSubmitDisabled = disabled || (!needsRetry && !canSubmit);
	const submitColor = isSubmitDisabled ? colors.dark.border : inkColor;
	const needsInk = hasUnsolvedCard && !hasEnoughInk && !needsRetry;
	const storyColor = getDeckStoryColor(deckId);
	const chapter = findCompletionPath({
		id: deckId,
	})[1];
	const nextParagraph = findNextParagraph(deckId);
	const isChapterComplete = nextParagraph?.chapter.id !== chapter?.id;
	const canReadNextParagraph = Boolean(
		nextParagraph &&
		isItemUnlocked({
			id: nextParagraph.paragraph.id,
			progressById,
		}),
	);
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
	const action = isUnlocking ? 'Unlock' : 'Solve';
	let submitLabel = selectedCard ? `${action} (${cardCost} Ink)` : 'Select a card';
	let prompt = 'Select a card to unlock or solve.';
	let completionMessage = 'All cards solved. The next paragraph is ready.';

	if (isChapterComplete) {
		completionMessage = 'Chapter complete! The next chapter is ready.';
	}

	if (!nextParagraph) {
		completionMessage = 'All paragraphs solved. Story complete!';
	}

	if (selectedCard) {
		prompt =
			isUnlocking ?
				`${selectedCard.rarity} card. Unlock it to reveal the word.`
			:	`English meaning of “${selectedCard.text}”`;
	}

	if (needsInk) {
		submitLabel = `Need ${cardCost} Ink to ${action.toLowerCase()}`;
	}

	if (needsRetry) {
		submitLabel = 'Retry save';
	}

	if (isSaving) {
		submitLabel = 'Saving…';
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
					});

					if (isActive) {
						setPuzzle(savedPuzzle);
						setSelectedPosition(undefined);
						setAnswer('');
						setFeedback('');
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
		}, [deckId, userId]),
	);

	function handleSelectCard(position: number) {
		setSelectedPosition(position);
		setAnswer('');
		setFeedback('');
	}

	function updateSavedCard(position: number, result: SolveAttemptResult) {
		const wasUnlocked = result.status === 'unlocked' || result.status === 'alreadyUnlocked';

		if (!wasUnlocked && result.acceptedAnswer === null) {
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
					isUnlocked: true,
					acceptedAnswer: result.acceptedAnswer ?? card.acceptedAnswer,
				};
			});

			return {
				...current,
				positions,
				hasFirstGem: current.hasFirstGem || result.firstGemEarned,
			};
		});
	}

	/**
	 * We keep the answer's ID after a failed save so retrying cannot charge twice.
	 * Unlock retries are safe because a card can only be unlocked once.
	 */
	async function handleSubmit() {
		let result: SolveAttemptResult | false;

		if (disabled || isBusy.current || (!needsRetry && !canSubmit) || !selectedCard) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);

		try {
			if (isUnlocking) {
				result = await unlockSolveCard({
					deckId,
					position: selectedCard.position,
				});
			} else {
				if (!pendingAttempt.current) {
					pendingAttempt.current = {
						deckId,
						position: selectedCard.position,
						answer,
						attemptId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
					};
				}

				result = await writeSolveAttempt(pendingAttempt.current);
			}

			if (result === false) {
				setNeedsRetry(true);
				setFeedback('Could not save this card. Tap Retry save.');
				return;
			}

			pendingAttempt.current = null;
			setNeedsRetry(false);
			setFeedback(getSolveFeedback(result));
			updateSavedCard(selectedCard.position, result);

			/**
			 * A wrong answer needs fresh input before another paid attempt.
			 * A second quick tap should not spend more Ink on the same answer.
			 */
			if (result.status === 'incorrect') {
				setAnswer('');
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
				<View style={styles.header}>
					<Text
						accessibilityRole="header"
						style={[styles.title, wordColor]}
					>
						Solve this paragraph
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close Solve"
						accessibilityHint="Return to paragraph selection. Your unlocked and solved cards are saved."
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
					<Text style={styles.paragraphTitle}>{puzzle?.deck.title}</Text>
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
						{isLoading ?
							'Loading puzzle…'
						:	loadError ||
							(!puzzle?.isUnlocked ?
								'This paragraph is locked.'
							:	'Study every word in this paragraph to open Solve.')
						}
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
									isSelected={card.position === selectedPosition}
									disabled={disabled || needsRetry}
									storyColor={storyColor}
									onSelect={handleSelectCard}
								/>
							))}
						</ScrollView>
						<View style={styles.editor}>
							{isComplete && puzzle?.hasFirstGem ?
								<View style={styles.completion}>
									<MaterialSymbol
										name="diamond"
										filled
										size={32}
										color={colors.rarity.Legendary}
									/>
									<Text style={styles.word}>First gem earned!</Text>
									<Text style={styles.text}>{completionMessage}</Text>
									{nextParagraph && canReadNextParagraph && (
										<ReadingLink
											item={nextParagraph.paragraph}
											label="Read next paragraph"
											color={storyColor}
										/>
									)}
								</View>
							:	<>
									<Text style={styles.text}>{prompt}</Text>
									{!isUnlocking && (
										<TextInput
											accessibilityLabel="English answer"
											accessibilityState={{
												disabled: isInputDisabled,
											}}
											placeholder="Type the English meaning"
											placeholderTextColor={colors.light.border}
											value={answer}
											onChangeText={setAnswer}
											editable={!isInputDisabled}
											autoCorrect={false}
											autoCapitalize="none"
											returnKeyType="done"
											onSubmitEditing={handleSubmit}
											style={[styles.input, isInputDisabled && styles.disabledInput]}
										/>
									)}
								</>
							}
							{Boolean(feedback) && (
								<Text
									accessibilityLiveRegion="polite"
									style={styles.text}
								>
									{feedback}
								</Text>
							)}
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
						</View>
					</>
				)}
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
	paragraphTitle: {
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
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
