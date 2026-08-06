import colors from '@/src/app/colors';
import { memo } from 'react';
import {
	type ViewStyle,
	StyleSheet,
	Text,
	TextStyle,
	View,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import formatFrenchWordWithArticle from '../../util/formatFrenchWordWithArticle';
import { useCardDeck } from '../CardDeck/useCardDeck';
import { sharedWordCardStyles } from './sharedWordCardStyles';
import { useWordCardUI } from './useWordCardUI';
import { FEEDBACK_TEXT_BACK } from './wordCardContext';
import WordCardHeader from './WordCardHeader';

/**
 * Typing
 */
interface WordCardBackProps {
	wordCardBackFlippedStyle: AnimatedStyle<ViewStyle>;
	wordWidthStyle: AnimatedStyle<TextStyle>;
	articleWidthStyle: AnimatedStyle<TextStyle>;
	feedbackStyle: TextStyle;
	articleSlotStyle: TextStyle;
	wordSlotStyle: TextStyle;
}

/**
 * WordCardBack Component
 */
const WordCardBack = memo(function WordCardBackMemo({
	wordCardBackFlippedStyle,
	wordWidthStyle,
	articleWidthStyle,
	feedbackStyle,
	articleSlotStyle,
	wordSlotStyle,
}: WordCardBackProps) {
	/**
	 * State
	 */
	const { cardState } = useWordCardUI();
	const { currentCard } = useCardDeck();

	/**
	 * Destructure Styles
	 */
	const { cardBack } = wordCardBackStyles;

	const {
		wordId,
		wordPronunciation,
		cardMain,
		answerSlotContainer,
		answerSlot,
		feedbackContainer,
		feedbackText,
		wordMetaContainer,
		wordForm,
	} = sharedWordCardStyles;

	/**
	 * Word data
	 */
	const {
		englishWords,
		pronunciation,
		englishArticle,
		frenchArticle,
		frenchWord,
		form,
		partOfSpeech,
	} = currentCard;

	const displayedFrenchWord = formatFrenchWordWithArticle({
		article: frenchArticle,
		word: frenchWord,
	});
	const displayedArticle = cardState.selectedArticle ?? englishArticle;
	const displayedWord = cardState.selectedWord ?? englishWords[0];

	const formCapitalized = (form ?? '')
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	const partOfSpeechCapitalized = (partOfSpeech ?? '')
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	/**
	 * Render the back of the WordCard
	 */
	return (
		<Animated.View
			style={[
				sharedWordCardStyles.wordCardInner,
				cardBack,
				wordCardBackFlippedStyle,
			]}
		>
			<WordCardHeader />
			<View style={cardMain}>
				<Text style={wordId}>{displayedFrenchWord}</Text>
				<Text style={wordPronunciation}>({pronunciation})</Text>
				<View style={wordMetaContainer}>
					{partOfSpeech && (
						<Text
							style={[
								wordForm,
								{
									borderRightWidth: formCapitalized ? 1 : 0,
									marginRight: formCapitalized ? 8 : 0,
									paddingRight: formCapitalized ? 8 : 0,
								},
							]}
						>
							{partOfSpeechCapitalized}
						</Text>
					)}
					{form && <Text style={wordForm}>{formCapitalized}</Text>}
				</View>
			</View>
			<View style={answerSlotContainer}>
				{englishArticle && (
					<Animated.Text
						numberOfLines={1}
						style={[answerSlot, articleSlotStyle, articleWidthStyle]}
					>
						{displayedArticle}
					</Animated.Text>
				)}
				<Animated.Text
					numberOfLines={1}
					style={[answerSlot, wordSlotStyle, wordWidthStyle]}
				>
					{displayedWord}
				</Animated.Text>
			</View>
			<View style={feedbackContainer}>
				<Text style={[feedbackText, feedbackStyle]}>
					{FEEDBACK_TEXT_BACK[cardState.feedbackKey] ?? ''}
				</Text>
			</View>
		</Animated.View>
	);
});

/**
 * Export memoized
 */
export default WordCardBack;

/**
 * Styles
 */
const wordCardBackStyles = StyleSheet.create({
	cardBack: {
		...StyleSheet.absoluteFill,
		zIndex: 10,
		height: '100%',
		backfaceVisibility: 'hidden',
		transform: [{ perspective: 1000 }, { rotateY: '180deg' }],
	},
	cardBackSuccess: {
		backgroundColor: colors.light.success,
	},
});
