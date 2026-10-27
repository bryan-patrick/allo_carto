import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type {
	SolveAttemptRequest,
	SolveAttemptResult,
	SolvePuzzle,
} from '@/src/components/Solve/solveTypes';
import { getDB } from '@/src/db/interface';
import getSolvePuzzle from '@/src/db/queries/getSolvePuzzle';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findCompletionPath } from '@/src/util/atlasCompletion';
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
 * Gets the feedback for the solve attempts
 */
function getSolveFeedback(result: SolveAttemptResult): string {
	const messages: Record<SolveAttemptResult['status'], string> = {
		exact: `Correct! ${result.acceptedAnswer}.`,
		close: `Accepted! The spelling is “${result.acceptedAnswer}”.`,
		incorrect: 'Not quite. Try again when you are ready.',
		empty: 'Type an English answer first.',
		notEnoughInk: 'Study flashcards to earn more Ink.',
		alreadySolved: `Already solved: ${result.acceptedAnswer}.`,
		unavailable: 'Study every word in this paragraph before solving.',
	};

	return messages[result.status];
}

/**
 * We keep the answer box above the keyboard while the paragraph's cards scroll.
 * Leaving this screen keeps every answer that has already been saved.
 */
export default function SolveView({ deckId }: SolveViewProps) {
	const router = useRouter();
	const { bottom, top } = useSafeAreaInsets();
	const { id: userId } = useUserContext() ?? {};
	const { inkBalance, isUpdatingProgress, writeSolveAttempt } = useUserProgress();
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
	const hasEnoughInk = inkBalance >= inkConfig.firstSolveAttempt;
	const inkColor = hasEnoughInk ? colors.ink.available : colors.ink.insufficient;
	const disabled = isSaving || isUpdatingProgress;
	const isInputDisabled =
		disabled || needsRetry || !isEligible || !hasEnoughInk || selectedCard?.acceptedAnswer !== null;
	const canSubmit = !isInputDisabled && Boolean(answer.trim());
	const isSubmitDisabled = disabled || (!needsRetry && !canSubmit);
	const needsInk = !hasEnoughInk && !isComplete && !needsRetry;
	const storyColor = getDeckStoryColor(deckId);
	const chapter = findCompletionPath({ id: deckId })[1];
	const isLoading = !puzzle && !loadError;
	let submitLabel = `Solve · ${inkConfig.firstSolveAttempt} Ink`;

	if (needsInk) {
		submitLabel = `Need ${inkConfig.firstSolveAttempt} Ink to solve`;
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
					const savedPuzzle = await getSolvePuzzle({ database, userId, deckId });

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

	/**
	 * We keep the same attempt ID after a failed save so retrying cannot charge twice.
	 */
	async function handleSubmit() {
		let result: SolveAttemptResult | false;

		if (disabled || isBusy.current || (!needsRetry && !canSubmit) || !selectedCard) {
			return;
		}

		isBusy.current = true;
		setIsSaving(true);

		if (!pendingAttempt.current) {
			pendingAttempt.current = {
				deckId,
				position: selectedCard.position,
				answer,
				attemptId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			};
		}

		try {
			result = await writeSolveAttempt(pendingAttempt.current);

			if (result === false) {
				setNeedsRetry(true);
				setFeedback('Could not save your answer. Tap Retry save.');
				return;
			}

			pendingAttempt.current = null;
			setNeedsRetry(false);
			setFeedback(getSolveFeedback(result));

			/**
			 * A wrong answer needs fresh input before another paid attempt.
			 * This keeps a second quick tap from spending more Ink on the same submission.
			 */
			if (result.status === 'incorrect') {
				setAnswer('');
			}

			if (result.acceptedAnswer !== null) {
				const acceptedAnswer = result.acceptedAnswer;

				setPuzzle(current => {
					if (!current) {
						return current;
					}

					const positions = current.positions.map(card => {
						if (card.position === selectedCard.position) {
							return { ...card, acceptedAnswer };
						}

						return card;
					});

					return { ...current, positions };
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
			router.replace({ pathname: '/ChapterDetail', params: { chapterId: chapter.id } });
			return;
		}

		router.replace('/(tabs)');
	}

	return (
		<KeyboardAvoidingView
			style={[styles.container, { paddingTop: top + 8 }]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ImageBackground
				source={postcardBackground}
				style={[styles.postcard, { marginBottom: Math.max(bottom, 8) }]}
			>
				<View style={styles.header}>
					<Text
						accessibilityRole="header"
						style={[styles.title, { color: storyColor }]}
					>
						Solve this paragraph
					</Text>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Close Solve"
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
					<Text style={styles.paragraphTitle}>{puzzle?.deck.title}</Text>
					<View style={styles.ink}>
						<MaterialSymbol
							name="water_drop"
							size={18}
							color={inkColor}
						/>
						<Text style={[styles.text, { color: inkColor }]}>
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
							{puzzle?.positions.map(card => {
								const isSolved = card.acceptedAnswer !== null;
								const isSelected = card.position === selectedPosition;

								if (!card.wordId) {
									return (
										<View
											key={card.position}
											style={[styles.card, styles.exemptCard]}
										>
											<Text style={[styles.word, { color: storyColor }]}>
												{card.text}
												{card.after}
											</Text>
										</View>
									);
								}

								return (
									<Pressable
										key={card.position}
										accessibilityRole="button"
										accessibilityLabel={`${card.text}, card ${card.position + 1}${isSolved ? `, solved: ${card.acceptedAnswer}` : ''}`}
										accessibilityState={{
											selected: isSelected,
											disabled: isSolved || disabled || needsRetry,
										}}
										disabled={isSolved || disabled || needsRetry}
										onPress={() => {
											setSelectedPosition(card.position);
											setAnswer('');
											setFeedback('');
										}}
										style={[
											styles.card,
											isSolved && styles.solvedCard,
											isSelected && !isSolved && { borderColor: storyColor, borderWidth: 2 },
										]}
									>
										<Text style={[styles.word, { color: storyColor }]}>
											{card.text}
											{card.after}
										</Text>
										{isSolved && <Text style={styles.translation}>✓ {card.acceptedAnswer}</Text>}
									</Pressable>
								);
							})}
						</ScrollView>
						<View style={styles.editor}>
							{isComplete ?
								<Text style={styles.word}>All cards solved!</Text>
							:	<>
									<Text style={styles.text}>
										{selectedCard ?
											`English meaning of “${selectedCard.text}”`
										:	'Select a card to solve.'}
									</Text>
									<TextInput
										accessibilityLabel="English answer"
										accessibilityState={{ disabled: isInputDisabled }}
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
									accessibilityState={{ disabled: isSubmitDisabled, busy: isSaving }}
									style={isSubmitDisabled && styles.disabledSubmit}
									SVGElement={
										needsInk ?
											<MaterialSymbol
												name="lock"
												size={18}
												color={colors.light.text}
											/>
										:	undefined
									}
									color={inkColor}
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
		fontSize: 13,
		lineHeight: 19,
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
		fontSize: 13,
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
	card: {
		width: '30%',
		flexGrow: 1,
		minHeight: 72,
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderWidth: 1,
		borderRadius: 8,
	},
	solvedCard: {
		backgroundColor: colors.light.success,
		borderColor: 'transparent',
	},
	exemptCard: {
		backgroundColor: 'transparent',
		borderColor: 'transparent',
	},
	word: {
		fontSize: 16,
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	translation: {
		fontSize: 12,
		fontFamily: 'lexend-400',
		color: colors.dark.success,
		textAlign: 'center',
	},
	editor: {
		padding: 12,
		gap: 8,
		borderTopWidth: 1,
		borderColor: colors.light.goldenBorder,
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
