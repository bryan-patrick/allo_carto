import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
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
	const { cardDeckDispatch, currentCard } = useCardDeck();
	const { isUpdatingProgress, writeCorrectAnswer: recordCorrectAnswer } = useUserProgress();
	const { settings } = useAppSettings();

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
	const persistedCorrectAnswer = useRef<string | null>(null);
	const isSavingAnswer = useRef(false);
	const isRevealDisabled = cardState.stage !== 'READY' || isAnswerPending || isUpdatingProgress;

	const isDisabled = useMemo(() => {
		if (
			cardState.progress === 'WARNING' ||
			isAnswerPending ||
			isUpdatingProgress ||
			(currentCard.englishArticle && !cardState.selectedArticle) ||
			!cardState.selectedWord
		) {
			return true;
		}
		return false;
	}, [
		currentCard.englishArticle,
		cardState.progress,
		cardState.selectedArticle,
		cardState.selectedWord,
		isAnswerPending,
		isUpdatingProgress,
	]);
	let buttonContent = children;

	if (hasSaveError) {
		buttonContent = 'Retry saving';
	}

	/**
	 * Animation vars
	 */
	const top = useSharedValue(0);
	const shadowOffsetHeight = useSharedValue(8);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		top: top.get(),
		borderRadius: 8,
	}));

	const animatedShadowStyle = useAnimatedStyle(() => ({
		shadowOffset: {
			width: 0,
			height: shadowOffsetHeight.get(),
		},
	}));

	/**
	 * Check the user's answer
	 */
	const checkAnswer = useCallback(() => {
		wordCardUIDispatch({ type: 'CHECK_ANSWER', currentCard });
	}, [currentCard, wordCardUIDispatch]);

	/**
	 * Save this correct answer once and add its earned XP to the review results.
	 * Update the button only after the save finishes.
	 */
	const persistCorrectAnswer = useCallback(() => {
		const answerId = `${currentCard.id}:${cardState.attempts}`;

		if (persistedCorrectAnswer.current === answerId || isSavingAnswer.current) {
			return;
		}

		persistedCorrectAnswer.current = answerId;
		isSavingAnswer.current = true;

		return recordCorrectAnswer(currentCard.id)
			.then(
				award => {
					if (award) {
						cardDeckDispatch({ type: 'INCREMENT_WORD_SCORE' });
						cardDeckDispatch({ type: 'ADD_CORRECT_WORD', award });
						impactAsync(ImpactFeedbackStyle.Light);
					} else {
						setHasSaveError(true);
					}
				},
				() => {
					setHasSaveError(true);
				},
			)
			.finally(() => {
				isSavingAnswer.current = false;
				pressInFlight.current = false;
				setIsAnswerPending(false);
			});
	}, [currentCard.id, cardState.attempts, cardDeckDispatch, recordCorrectAnswer]);

	/**
	 * Side effects (and haptics) for dispatching check answer
	 */
	useEffect(() => {
		if (cardState.attempts !== 0) {
			switch (`${cardState.stage}_${cardState.progress}`) {
				case 'CORRECT_SUCCESS': {
					if (cardState.isAnswerRevealed) {
						cardDeckDispatch({ type: 'ADD_INCORRECT_WORD', skipped: true });

						void Promise.resolve(impactAsync(ImpactFeedbackStyle.Light)).finally(() => {
							pressInFlight.current = false;
							setIsAnswerPending(false);
						});

						break;
					}

					persistCorrectAnswer();

					break;
				}
				case 'READY_WARNING':
					void Promise.resolve(notificationAsync(NotificationFeedbackType.Warning)).finally(() => {
						pressInFlight.current = false;
						setIsAnswerPending(false);
					});

					break;
				case 'INCORRECT_DANGER':
					void Promise.resolve(notificationAsync(NotificationFeedbackType.Warning)).finally(() => {
						pressInFlight.current = false;
						setIsAnswerPending(false);
					});

					cardDeckDispatch({ type: 'ADD_INCORRECT_WORD' });

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
		persistCorrectAnswer,
	]);

	/**
	 * Action handlers
	 */
	const handlePressIn = useCallback(() => {
		if (pressInFlight.current || isUpdatingProgress) {
			return;
		}

		pressInFlight.current = true;
		setIsPressed(true);
		setIsAnswerPending(true);

		if (hasSaveError) {
			persistedCorrectAnswer.current = null;
			setHasSaveError(false);
			persistCorrectAnswer();
			return;
		}

		checkAnswer();
	}, [checkAnswer, isUpdatingProgress, hasSaveError, persistCorrectAnswer]);

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
			{hasSaveError && <Text style={styles.saveError}>Could not save your XP. Tap to retry.</Text>}
			{settings.showSkipWordLink && (
				<Pressable
					accessibilityRole="link"
					disabled={isRevealDisabled}
					onPress={handleRevealAnswer}
					style={[styles.revealLink, isRevealDisabled && styles.disabledRevealLink]}
				>
					<Text style={styles.revealText}>I don&apos;t know (will not award XP)</Text>
				</Pressable>
			)}
			<Animated.View style={animatedContainerStyle}>
				<AnimatedPressable
					{...props}
					disabled={isDisabled}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					hitSlop={10}
					style={[
						styles.pressable,
						pressableStateStyle,
						animatedShadowStyle,
						isDisabled && styles.disabledPressable,
					]}
				>
					<View
						style={styles.textRow}
						testID="word-card-button-content"
					>
						<Text style={[styles.text, textStateStyle, isDisabled && styles.disabledText]}>
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
		alignSelf: 'center',
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	disabledRevealLink: {
		opacity: 0.5,
	},
	revealText: {
		color: colors.light.primary,
		fontFamily: 'lexend-400',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
	pressable: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		backgroundColor: colors.dark.primary,
		borderRadius: 12,
		borderWidth: 2,
		paddingHorizontal: 12,
		paddingVertical: 12,
		gap: 16,
		shadowColor: colors.dark.border,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 0,
	},
	successPressable: {
		backgroundColor: colors.light.success,
		shadowColor: colors.dark.success,
	},
	disabledPressable: {
		backgroundColor: colors.dark.border,
		top: 6,
		shadowColor: 'transparent',
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
