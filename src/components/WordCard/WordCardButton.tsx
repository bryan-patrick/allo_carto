import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	impactAsync,
	ImpactFeedbackStyle,
	notificationAsync,
	NotificationFeedbackType,
} from 'expo-haptics';
import {
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Pressable,
	PressableProps,
	StyleSheet,
	Text,
	View,
} from 'react-native';
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
	const { isUpdatingProgress, recordCorrectAnswer } = useUserProgress();

	/**
	 * Style vars
	 */
	const {
		containerStyles,
		pressableStyles,
		successPressable,
		disabledPressable,
		textRow,
		textStyles,
		successText,
		disabledText,
	} = wordCardButtonStyles;

	const pressableStateStyle =
		cardState.progress === 'SUCCESS' ? successPressable : null;
	const textStateStyle = cardState.progress === 'SUCCESS' ? successText : null;

	/**
	 * State/prop vars
	 */
	const [isPressed, setIsPressed] = useState(false);
	const [isAnswerPending, setIsAnswerPending] = useState(false);

	/**
	 * Block very fast double presses
	 */
	const pressInFlight = useRef(false);
	const persistedCorrectAnswer = useRef<string | null>(null);

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
	 * Side effects (and haptics) for dispatching check answer
	 */
	useEffect(() => {
		if (cardState.attempts !== 0) {
			switch (`${cardState.stage}_${cardState.progress}`) {
				case 'CORRECT_SUCCESS': {
					const answerId = `${currentCard.id}:${cardState.attempts}`;

					/**
					 * Save this answer once
					 */
					if (persistedCorrectAnswer.current === answerId) break;
					persistedCorrectAnswer.current = answerId;

					async function persistCorrectAnswer() {
						const didWrite = await recordCorrectAnswer(currentCard.id);

						if (didWrite) {
							cardDeckDispatch({ type: 'INCREMENT_WORD_SCORE' });
							cardDeckDispatch({ type: 'ADD_CORRECT_WORD' });
							impactAsync(ImpactFeedbackStyle.Light);
						}

						pressInFlight.current = false;
						setIsAnswerPending(false);
					}

					persistCorrectAnswer();
					break;
				}
				case 'READY_WARNING':
					void Promise.resolve(
						notificationAsync(NotificationFeedbackType.Warning),
					).finally(() => {
						pressInFlight.current = false;
						setIsAnswerPending(false);
					});
					break;
				case 'INCORRECT_DANGER':
					void Promise.resolve(
						notificationAsync(NotificationFeedbackType.Warning),
					).finally(() => {
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
		currentCard.id,
		cardState.attempts,
		cardState.progress,
		cardState.stage,
		cardDeckDispatch,
		recordCorrectAnswer,
	]);

	/**
	 * Action handlers
	 */
	const handlePressIn = useCallback(() => {
		if (pressInFlight.current || isUpdatingProgress) return;

		pressInFlight.current = true;
		setIsPressed(true);
		setIsAnswerPending(true);
		checkAnswer();
	}, [checkAnswer, isUpdatingProgress]);

	const handlePressOut = useCallback(() => {
		setIsPressed(false);
	}, []);

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
		<Animated.View style={[containerStyles, animatedContainerStyle]}>
			<AnimatedPressable
				{...props}
				disabled={isDisabled}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				hitSlop={10}
				style={[
					pressableStyles,
					pressableStateStyle,
					animatedShadowStyle,
					isDisabled && disabledPressable,
				]}
			>
				<View
					style={textRow}
					testID="word-card-button-content"
				>
					<Text
						style={[textStyles, textStateStyle, isDisabled && disabledText]}
					>
						{children}
					</Text>
					{SVGElement}
				</View>
			</AnimatedPressable>
		</Animated.View>
	);
}

/**
 * Styles
 */
const wordCardButtonStyles = StyleSheet.create({
	containerStyles: {},
	pressableStyles: {
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.dark.border,
		backgroundColor: colors.dark.primary,
		borderRadius: 12,
		borderWidth: 2,
		padding: 16,
		gap: 16,
		shadowColor: colors.dark.border,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 1,
		shadowRadius: 0,
	},
	textStyles: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
	},
	successPressable: {
		backgroundColor: colors.light.success,
		shadowColor: colors.light.border,
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
	successText: {
		color: colors.dark.text,
	},
	disabledText: {
		color: colors.light.border,
	},
});
