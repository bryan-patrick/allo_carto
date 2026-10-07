import colors from '@/src/app/colors';
import { Dispatch, memo, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useCardDeck } from '../CardDeck/useCardDeck';
import { useWordCardUI } from './useWordCardUI';
import { type CardProgress } from './wordCardContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Typing
 */
interface MappedWordsProps {
	selectionType: 'article' | 'word';
	words: string[];
	activeWord: string | null;
	handler: Dispatch<string>;
}

interface MappedButtonProps {
	word: string;
	isActive: boolean;
	isCorrectWord: boolean;
	isHighlighted: boolean;
	isSelectedWrong: boolean;
	progress: CardProgress;
	highlightStyle?: ViewStyle;
	highlightTextStyle?: TextStyle;
	handler: Dispatch<string>;
}

/**
 * Private MappedButton Component
 *
 * We need this component in addition to the other one
 * (below) so that we can create animations scoped per button.
 * We can't animate like this in a map.
 */
const MappedButton = memo(function MappedButtonMemo({
	word,
	isActive,
	isCorrectWord,
	isHighlighted,
	isSelectedWrong,
	progress,
	highlightStyle,
	highlightTextStyle,
	handler,
}: MappedButtonProps) {
	/**
	 * Animation vars
	 */
	const buttonBackgroundColor = useSharedValue(colors.light.background);
	const buttonBoxShadow = useSharedValue(`0 4px 0 -1px ${colors.light.border}`);
	const buttonY = useSharedValue(0);

	const selectionTiming = useMemo(
		() => ({
			duration: 70,
			easing: Easing.inOut(Easing.bounce),
		}),
		[],
	);

	const answerRevealTiming = useMemo(
		() => ({
			duration: 320,
			easing: Easing.out(Easing.cubic),
		}),
		[],
	);

	/**
	 * Style vars
	 */
	const activeButtonStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: buttonY.value }],
		backgroundColor: buttonBackgroundColor.value,
		boxShadow: buttonBoxShadow.value,
	}));

	/**
	 * Handle animation side effects
	 */
	useEffect(() => {
		switch (progress) {
			case 'SUCCESS':
			case 'DANGER':
				if (isCorrectWord) {
					buttonY.value = withTiming(-4, answerRevealTiming);
					buttonBackgroundColor.value = withTiming(colors.light.success, answerRevealTiming);
				} else {
					buttonBackgroundColor.value = withTiming(colors.light.border, answerRevealTiming);
					buttonY.value = withTiming(0, answerRevealTiming);
				}

				if (isSelectedWrong) {
					buttonY.value = withTiming(0, answerRevealTiming);
					buttonBackgroundColor.value = withTiming(colors.light.background, answerRevealTiming);
				}

				buttonBoxShadow.value = `0 4px 0 -1px ${colors.dark.border}`;
				break;
			default:
				if (isActive) {
					buttonBackgroundColor.value = colors.light.border;
					buttonY.value = withTiming(4, selectionTiming);
					buttonBoxShadow.value = `0 0 0 0 transparent`;
				} else {
					buttonY.value = withTiming(0, selectionTiming);
					buttonBackgroundColor.value = withTiming(colors.light.background, selectionTiming);
					buttonBoxShadow.value = `0 4px 0 -1px ${colors.light.border}`;
				}
				break;
		}
	}, [
		isCorrectWord,
		isSelectedWrong,
		progress,
		isActive,
		selectionTiming,
		answerRevealTiming,
		buttonY,
		buttonBackgroundColor,
		buttonBoxShadow,
	]);

	/**
	 * Render the words.
	 * Note the hitslop, it works well here.
	 */
	return (
		<Animated.View
			style={styles.buttonContainer}
			key={word}
		>
			<AnimatedPressable
				style={[styles.button, activeButtonStyle, isHighlighted && highlightStyle]}
				onPress={() => handler(word)}
				hitSlop={5}
			>
				<View style={styles.textContainer}>
					<Text style={[styles.text, isHighlighted && highlightTextStyle]}>{word}</Text>
				</View>
			</AnimatedPressable>
		</Animated.View>
	);
});

/**
 * MappedWords Component
 * Map the word buttons
 */
const MappedWords = memo(function MappedWordsMemo({
	selectionType,
	words,
	activeWord,
	handler,
}: MappedWordsProps) {
	/**
	 * Context
	 */
	const { currentCard } = useCardDeck();
	const { cardState } = useWordCardUI();

	/**
	 * Validate and highlight choices only against the slot they fill.
	 */
	let correctWords = currentCard.englishWords;
	let hasMistake = cardState.mistake === 'WORD' || cardState.mistake === 'BOTH';
	if (selectionType === 'article') {
		correctWords = [];
		if (currentCard.englishArticle) correctWords = [currentCard.englishArticle];
		hasMistake = cardState.mistake === 'ARTICLE' || cardState.mistake === 'BOTH';
	}

	let highlightedWord: string | null = null;
	let highlightStyle: ViewStyle | undefined;
	let highlightTextStyle: TextStyle | undefined;
	switch (cardState.progress) {
		case 'SUCCESS':
			highlightedWord = activeWord;
			highlightStyle = styles.highlightSuccess;
			highlightTextStyle = styles.highlightTextSuccess;
			break;
		case 'WARNING':
			if (hasMistake) highlightedWord = activeWord;
			highlightStyle = styles.highlightWarning;
			highlightTextStyle = styles.highlightTextWarning;
			break;
		case 'DANGER':
			if (hasMistake) highlightedWord = correctWords[0] ?? null;
			highlightStyle = styles.highlightDanger;
			highlightTextStyle = styles.highlightTextDanger;
			break;
	}

	return words.map((word: string) => {
		const isActive = word === activeWord;
		const isCorrectWord = correctWords.includes(word);
		const isSelectedWrong = isActive && !isCorrectWord;
		const isHighlighted = word === highlightedWord;

		return (
			<MappedButton
				key={word}
				word={word}
				isActive={isActive}
				isCorrectWord={isCorrectWord}
				isSelectedWrong={isSelectedWrong}
				isHighlighted={isHighlighted}
				progress={cardState.progress}
				highlightStyle={highlightStyle}
				highlightTextStyle={highlightTextStyle}
				handler={handler}
			/>
		);
	});
});

export default MappedWords;

/**
 * Styles
 */
const styles = StyleSheet.create({
	buttonContainer: {
		display: 'contents',
	},
	button: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		flexGrow: 1,
		borderRadius: 6,
		maxWidth: '50%',
		borderColor: colors.light.border,
		backgroundColor: colors.light.background,
		minWidth: 60,
	},
	textContainer: {
		width: '100%',
		flexGrow: 1,
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: colors.dark.border,
		borderRadius: 6,
	},
	text: {
		textAlign: 'center',
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	highlightSuccess: {
		backgroundColor: colors.light.success,
	},
	highlightWarning: {},
	highlightDanger: {
		borderBottomColor: colors.dark.success,
	},
	highlightTextSuccess: {
		color: colors.dark.success,
	},
	highlightTextWarning: {},
	highlightTextDanger: {},
});
