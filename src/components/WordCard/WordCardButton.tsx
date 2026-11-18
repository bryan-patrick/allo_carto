import colors from '@/src/app/colors';
import { buttonContentStyles } from '@/src/components/buttonContentStyles';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getEnglishPrefixes } from '@/src/util/englishWordParts';
import { useSoundEffect } from '@/src/util/useSoundEffect';
import {
	impactAsync,
	ImpactFeedbackStyle,
	notificationAsync,
	NotificationFeedbackType,
} from 'expo-haptics';
import { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useCardDeck } from '../CardDeck/useCardDeck';
import { useWordCardUI } from './useWordCardUI';

/**
 * Essentially Animated.Pressable
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Typing
 */
interface WordCardButtonProps extends PressableProps {
	SVGElement?: ReactElement;
	children?: ReactNode;
}

/**
 * WordCardButton Component
 * Handles checking/next card actions
 */
export default function WordCardButton({
	children,
	SVGElement,
	style,
	...props
}: WordCardButtonProps) {
	const { cardState, wordCardUIDispatch } = useWordCardUI();
	const { cardDeckState, cardDeckDispatch, currentCard } = useCardDeck();
	const sessionId = cardDeckState.session?.id;
	const {
		isUpdatingProgress,
		writeCorrectAnswer: recordCorrectAnswer,
		writeIncorrectAnswer: recordIncorrectAnswer,
	} = useUserProgress();
	const { settings } = useAppSettings();
	const playIncorrect = useSoundEffect('incorrect');
	const lastSoundedAnswer = useRef<string | null>(null);
	const isEnglishPrefixRequired = getEnglishPrefixes(currentCard).length > 0;

	/**
	 * Style vars
	 */
	let pressableStateStyle;
	let textStateStyle;
	if (cardState.progress === 'SUCCESS') {
		pressableStateStyle = styles.successPressable;
		textStateStyle = styles.successText;
	}

	/**
	 * State/prop vars
	 */
	const [isPressed, setIsPressed] = useState(false);
	const [isAnswerPending, setIsAnswerPending] = useState(false);
	const [hasSaveError, setHasSaveError] = useState(false);

	/**
	 * Block very fast double presses
	 */
	const pressInFlight = useRef(false);
	const persistedAnswer = useRef<string | null>(null);
	const isSavingAnswer = useRef(false);
	const isRevealDisabled =
		!sessionId || cardState.stage !== 'READY' || isAnswerPending || isUpdatingProgress;

	const isDisabled = useMemo(() => {
		if (
			!sessionId ||
			cardState.progress === 'WARNING' ||
			isAnswerPending ||
			isUpdatingProgress ||
			(isEnglishPrefixRequired && !cardState.selectedArticle) ||
			!cardState.selectedWord
		) {
			return true;
		}
		return false;
	}, [
		isEnglishPrefixRequired,
		cardState.progress,
		cardState.selectedArticle,
		cardState.selectedWord,
		isAnswerPending,
		isUpdatingProgress,
		sessionId,
	]);
	/**
	 * Saving blocks extra taps and keeps color/text changes
	 * in sync
	 */
	const isButtonVisuallyDisabled =
		!sessionId ||
		cardState.progress === 'WARNING' ||
		(isEnglishPrefixRequired && !cardState.selectedArticle) ||
		!cardState.selectedWord;
	let buttonContent = children;

	if (hasSaveError) {
		buttonContent = 'Retry saving';
	}

	/**
	 * Animation vars
	 */
	const top = useSharedValue(0);
	const shadowOffsetHeight = useSharedValue(8);
	let buttonShadowColor = colors.dark.border;

	if (cardState.progress === 'SUCCESS') {
		buttonShadowColor = colors.dark.success;
	}

	if (isButtonVisuallyDisabled) {
		buttonShadowColor = 'transparent';
	}

	const animatedContainerStyle = useAnimatedStyle(() => ({
		top: top.get(),
		borderRadius: 8,
	}));

	const animatedShadowStyle = useAnimatedStyle(() => ({
		boxShadow: `0 ${shadowOffsetHeight.get()}px 0 0 ${buttonShadowColor}`,
	}));

	/**
	 * Check the user's answer
	 */
	const checkAnswer = useCallback(() => {
		wordCardUIDispatch({ type: 'CHECK_ANSWER', currentCard });
	}, [currentCard, wordCardUIDispatch]);

	/**
	 * Saves each answer and its rewards before allowing the next card.
	 */
	const persistAnswer = useCallback(
		function persistAnswer() {
			const answerId = `${currentCard.id}:${cardState.attempts}`;
			const skipped = cardState.isAnswerRevealed;
			const isCorrect = cardState.stage === 'CORRECT' && !skipped;

			async function saveAnswer(answerSessionId: string): Promise<boolean> {
				if (isCorrect) {
					const award = await recordCorrectAnswer({
						wordId: currentCard.id,
						sessionId: answerSessionId,
					});

					if (!award) {
						return false;
					}

					cardDeckDispatch({
						type: 'INCREMENT_WORD_SCORE',
					});
					cardDeckDispatch({
						type: 'ADD_CORRECT_WORD',
						award,
					});
					impactAsync(ImpactFeedbackStyle.Light);
				} else {
					const didSave = await recordIncorrectAnswer({
						wordId: currentCard.id,
						sessionId: answerSessionId,
						skipped,
					});

					if (!didSave) {
						return false;
					}

					cardDeckDispatch({
						type: 'ADD_INCORRECT_WORD',
						skipped,
					});

					if (skipped) {
						impactAsync(ImpactFeedbackStyle.Light);
					} else {
						notificationAsync(NotificationFeedbackType.Warning);
					}
				}

				return true;
			}

			if (!sessionId || persistedAnswer.current === answerId || isSavingAnswer.current) {
				return;
			}

			persistedAnswer.current = answerId;
			isSavingAnswer.current = true;

			void saveAnswer(sessionId)
				.then(didSave => {
					setHasSaveError(!didSave);
				})
				.catch(error => {
					console.error('Could not save the flashcard answer:', error);
					setHasSaveError(true);
				})
				.finally(() => {
					isSavingAnswer.current = false;
					pressInFlight.current = false;
					setIsAnswerPending(false);
				});
		},
		[
			currentCard.id,
			cardState.attempts,
			cardState.stage,
			cardState.isAnswerRevealed,
			cardDeckDispatch,
			recordCorrectAnswer,
			recordIncorrectAnswer,
			sessionId,
		],
	);

	/**
	 * Play the incorrect answer if it's wrong.
	 */
	useEffect(() => {
		const isIncorrect =
			(cardState.stage === 'READY' && cardState.progress === 'WARNING') ||
			(cardState.stage === 'INCORRECT' && cardState.progress === 'DANGER');
		const answerId = `${currentCard.id}:${cardState.attempts}`;

		if (cardState.attempts === 0 || cardState.isAnswerRevealed) {
			return;
		}

		if (!isIncorrect || lastSoundedAnswer.current === answerId) {
			return;
		}

		lastSoundedAnswer.current = answerId;

		void playIncorrect();
	}, [
		currentCard.id,
		cardState.attempts,
		cardState.stage,
		cardState.progress,
		cardState.isAnswerRevealed,
		playIncorrect,
	]);

	/**
	 * Side effects (and haptics) for dispatching check answer
	 */
	useEffect(() => {
		if (cardState.attempts !== 0) {
			switch (`${cardState.stage}_${cardState.progress}`) {
				case 'CORRECT_SUCCESS': {
					persistAnswer();

					break;
				}
				case 'READY_WARNING':
					void Promise.resolve(notificationAsync(NotificationFeedbackType.Warning)).finally(() => {
						pressInFlight.current = false;
						setIsAnswerPending(false);
					});

					break;
				case 'INCORRECT_DANGER':
					persistAnswer();

					break;
				case 'COMPLETED_DANGER':
					notificationAsync(NotificationFeedbackType.Error);

					break;
			}
		}
	}, [
		cardState.attempts,
		cardState.progress,
		cardState.stage,
		cardState.isAnswerRevealed,
		cardDeckDispatch,
		persistAnswer,
	]);

	/**
	 * This handles a press on the answer button.
	 * It either checks a new answer or retries saving an answer that failed.
	 */
	const handlePress = useCallback(() => {
		if (pressInFlight.current || isUpdatingProgress) {
			return;
		}

		pressInFlight.current = true;
		setIsAnswerPending(true);

		if (hasSaveError) {
			persistedAnswer.current = null;
			setHasSaveError(false);
			persistAnswer();
			return;
		}

		checkAnswer();
	}, [checkAnswer, isUpdatingProgress, hasSaveError, persistAnswer]);

	const handlePressIn = useCallback(() => {
		setIsPressed(true);
	}, []);

	const handlePressOut = useCallback(() => {
		setIsPressed(false);
	}, []);

	const handleRevealAnswer = useCallback(() => {
		if (pressInFlight.current || isUpdatingProgress || cardState.stage !== 'READY') {
			return;
		}

		pressInFlight.current = true;
		setIsAnswerPending(true);
		wordCardUIDispatch({ type: 'REVEAL_ANSWER', currentCard });
	}, [cardState.stage, currentCard, isUpdatingProgress, wordCardUIDispatch]);

	/**
	 * Side effect that sets the styles
	 * when a user presses the button.
	 */
	useEffect(() => {
		if (isPressed) {
			top.set(
				withTiming(6, {
					duration: 100,
					easing: Easing.inOut(Easing.ease),
				}),
			);

			shadowOffsetHeight.set(
				withTiming(0, {
					duration: 100,
					easing: Easing.inOut(Easing.ease),
				}),
			);
		} else {
			top.set(0);
			shadowOffsetHeight.set(8);
		}
	}, [isPressed, shadowOffsetHeight, top]);

	/**
	 * Render the WordCard
	 */
	return (
		<View style={styles.actions}>
			{hasSaveError && (
				<Text style={styles.saveError}>Could not save your answer. Tap to retry.</Text>
			)}
			{settings.showSkipWordLink && (
				<Pressable
					accessibilityRole="link"
					disabled={isRevealDisabled}
					onPress={handleRevealAnswer}
					style={({ pressed }) => [
						styles.revealLink,
						isRevealDisabled && styles.disabledRevealLink,
						pressed && buttonContentStyles.pressedMiniButton,
					]}
				>
					<Text style={styles.revealText}>I don&apos;t know (no XP or Ink)</Text>
				</Pressable>
			)}
			<Animated.View style={animatedContainerStyle}>
				<AnimatedPressable
					{...props}
					disabled={isDisabled}
					onPress={handlePress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					hitSlop={10}
					style={[
						styles.pressable,
						pressableStateStyle,
						animatedShadowStyle,
						isButtonVisuallyDisabled && styles.disabledPressable,
					]}
				>
					<View
						style={styles.textRow}
						testID="word-card-button-content"
					>
						<Text
							style={[styles.text, textStateStyle, isButtonVisuallyDisabled && styles.disabledText]}
						>
							{buttonContent}
						</Text>
						{SVGElement}
					</View>
				</AnimatedPressable>
			</Animated.View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	actions: {
		gap: 8,
	},
	saveError: {
		color: colors.light.danger,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
	},
	revealLink: {
		...buttonContentStyles.miniButton,
		borderColor: colors.light.primary,
		alignSelf: 'center',
	},
	disabledRevealLink: {
		opacity: 0.5,
	},
	revealText: {
		...buttonContentStyles.label,
		color: colors.light.primary,
	},
	pressable: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.dark.primary,
		borderRadius: 12,
		paddingHorizontal: 20,
		paddingVertical: 14,
		gap: 16,
	},
	successPressable: {
		backgroundColor: colors.light.success,
	},
	disabledPressable: {
		backgroundColor: colors.dark.border,
		top: 6,
	},
	textRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		/**
		 * Keep the button the same height before and after its 24px arrow appears.
		 */
		minHeight: 24,
	},
	text: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
	},
	successText: {
		color: colors.dark.text,
	},
	disabledText: {
		color: colors.light.border,
	},
});
