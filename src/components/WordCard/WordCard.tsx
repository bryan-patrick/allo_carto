import { router } from 'expo-router';
import { useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { type LayoutChangeEvent, StyleSheet, TextStyle, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CardDeckContext } from '../CardDeck/cardDeckContext';
import { sharedWordCardStyles } from './sharedWordCardStyles';
import { useWordCardUI } from './useWordCardUI';
import WordCardBack from './WordCardBack';
import WordCardFront from './WordCardFront';

/**
 * Typing
 */
interface WordCardProps {
	isCurrent: boolean;
}

/**
 * WordCard Component
 *
 * Note: I couldn't get the parent to flip on its
 * own to do both front and back at the same time,
 * so these are done individually to create the
 * card flip effect.
 */
export default function WordCard({ isCurrent }: WordCardProps) {
	/**
	 * State
	 */
	const { cardState } = useWordCardUI();
	const { cardDeckState, cardDeckDispatch } = useContext(CardDeckContext);
	const hasArticleMistake = cardState.mistake === 'ARTICLE' || cardState.mistake === 'BOTH';
	const hasWordMistake = cardState.mistake === 'WORD' || cardState.mistake === 'BOTH';

	/**
	 * Style vars
	 */
	let feedbackStyle: TextStyle = {};
	let articleSlotStyle: TextStyle = {};
	let wordSlotStyle: TextStyle = {};

	switch (cardState.progress) {
		case 'SUCCESS':
			feedbackStyle = sharedWordCardStyles.feedbackSuccess;
			articleSlotStyle = sharedWordCardStyles.answerSlotSuccess;
			wordSlotStyle = sharedWordCardStyles.answerSlotSuccess;
			break;
		case 'WARNING':
			feedbackStyle = sharedWordCardStyles.feedbackWarning;
			if (hasArticleMistake) articleSlotStyle = sharedWordCardStyles.answerSlotWarning;
			if (hasWordMistake) wordSlotStyle = sharedWordCardStyles.answerSlotWarning;
			break;
		case 'DANGER':
			feedbackStyle = sharedWordCardStyles.feedbackError;
			articleSlotStyle = sharedWordCardStyles.answerSlotSuccess;
			wordSlotStyle = sharedWordCardStyles.answerSlotSuccess;

			if (hasArticleMistake) articleSlotStyle = sharedWordCardStyles.answerSlotError;
			if (hasWordMistake) wordSlotStyle = sharedWordCardStyles.answerSlotError;
			break;
	}

	/**
	 * Animation vars
	 */
	const articleWidth = useSharedValue(0);
	const wordWidth = useSharedValue(0);
	const flipDegrees = useSharedValue(0);
	const flipDuration = useSharedValue(400);

	/**
	 * Animation timing functions
	 */
	const timing = useMemo(
		() => ({
			duration: 120,
			easing: Easing.inOut(Easing.ease),
		}),
		[],
	);

	/**
	 * Animation styles
	 */
	const articleWidthStyle = useAnimatedStyle(() => ({
		width: articleWidth.get(),
	}));

	const wordWidthStyle = useAnimatedStyle(() => ({
		width: wordWidth.get(),
	}));

	const wordCardFrontFlippedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `-${flipDegrees.get()}deg` }],
	}));

	const wordCardBackFlippedStyle = useAnimatedStyle(() => ({
		transform: [{ perspective: 1000 }, { rotateY: `-${180 + flipDegrees.get()}deg` }],
	}));

	/**
	 * Handle setting the animated width of the selected word/article
	 * And the flip (These are side effects).
	 */
	const handleArticleWidth = (event: LayoutChangeEvent) => {
		articleWidth.set(withTiming(event.nativeEvent.layout.width, timing));
	};

	const handleWordWidth = (event: LayoutChangeEvent) => {
		wordWidth.set(withTiming(event.nativeEvent.layout.width, timing));
	};

	/**
	 * Handle the card flip
	 */
	useLayoutEffect(() => {
		const shouldFlip = cardState.progress === 'SUCCESS';

		flipDegrees.set(
			withTiming(shouldFlip ? 180 : 0, {
				duration: shouldFlip ? flipDuration.get() : 0,
				easing: Easing.inOut(Easing.cubic),
			}),
		);
	}, [flipDegrees, flipDuration, cardState.progress]);

	/**
	 * Trigger the next card on 'COMPLETED'.
	 * This fires when we have the correct state
	 * and the user hits the 'Next Card ->' button.
	 */
	useEffect(() => {
		if (isCurrent && cardState.stage === 'COMPLETED') {
			if (cardDeckState.currentIndex === cardDeckState.cardDeck.words.length - 1) {
				router.push('/DeckResults');
			} else {
				cardDeckDispatch({ type: 'NEXT_CARD' });
			}
		}
	}, [cardDeckState, isCurrent, cardState.stage, cardDeckDispatch]);

	/**
	 * Render the card
	 */
	return (
		<View style={styles.wordCard}>
			<WordCardFront
				handleWordWidth={handleWordWidth}
				handleArticleWidth={handleArticleWidth}
				articleWidthStyle={articleWidthStyle}
				wordWidthStyle={wordWidthStyle}
				wordCardFrontFlippedStyle={wordCardFrontFlippedStyle}
				feedbackStyle={feedbackStyle}
				articleSlotStyle={articleSlotStyle}
				wordSlotStyle={wordSlotStyle}
			/>
			<WordCardBack
				wordCardBackFlippedStyle={wordCardBackFlippedStyle}
				articleWidthStyle={articleWidthStyle}
				wordWidthStyle={wordWidthStyle}
				feedbackStyle={feedbackStyle}
				articleSlotStyle={articleSlotStyle}
				wordSlotStyle={wordSlotStyle}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	wordCard: {
		borderRadius: 8,
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
