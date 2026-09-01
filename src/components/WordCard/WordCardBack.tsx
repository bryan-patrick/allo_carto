import { memo } from 'react';
import {
	type ViewStyle,
	ImageBackground,
	ImageSourcePropType,
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

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

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
	background: ImageSourcePropType;
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
	background,
}: WordCardBackProps) {
	/**
	 * State
	 */
	const { cardState } = useWordCardUI();
	const { currentCard } = useCardDeck();

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
		<AnimatedImageBackground
			style={[sharedWordCardStyles.wordCardInner, styles.cardBack, wordCardBackFlippedStyle]}
			source={background}
			imageStyle={{ transform: [{ scaleX: -1 }] }}

			resizeMode="cover"
		>
			<WordCardHeader />
			<View style={sharedWordCardStyles.cardMain}>
				<Text style={sharedWordCardStyles.wordId}>{displayedFrenchWord}</Text>
				<Text style={sharedWordCardStyles.wordPronunciation}>({pronunciation})</Text>
				<View style={sharedWordCardStyles.wordMetaContainer}>
					{partOfSpeech && (
						<Text
							style={[
								sharedWordCardStyles.wordForm,
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
					{form && <Text style={sharedWordCardStyles.wordForm}>{formCapitalized}</Text>}
				</View>
			</View>
			<View style={sharedWordCardStyles.answerSlotContainer}>
				{englishArticle && (
					<Animated.Text
						numberOfLines={1}
						style={[sharedWordCardStyles.answerSlot, articleSlotStyle, articleWidthStyle]}
					>
						{displayedArticle}
					</Animated.Text>
				)}
				<Animated.Text
					numberOfLines={1}
					style={[sharedWordCardStyles.answerSlot, wordSlotStyle, wordWidthStyle]}
				>
					{displayedWord}
				</Animated.Text>
			</View>
			<View style={sharedWordCardStyles.feedbackContainer}>
				<Text style={[sharedWordCardStyles.feedbackText, feedbackStyle]}>
					{FEEDBACK_TEXT_BACK[cardState.feedbackKey] ?? ''}
				</Text>
			</View>
		</AnimatedImageBackground>
	);
});

/**
 * Export memoized
 */
export default WordCardBack;

/**
 * Styles
 */
const styles = StyleSheet.create({
	cardBack: {
		...StyleSheet.absoluteFill,
		zIndex: 10,
		height: '100%',
		backfaceVisibility: 'hidden',
		transform: [{ perspective: 1000 }, { rotateY: '180deg' }],
	},
});
