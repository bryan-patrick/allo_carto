import colors from '@/src/app/colors';
import { memo } from 'react';
import {
	ImageBackground,
	ImageSourcePropType,
	type LayoutChangeEvent,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
} from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import formatFrenchWordWithArticle from '../../util/formatFrenchWordWithArticle';
import { useCardDeck } from '../CardDeck/useCardDeck';
import { sharedWordCardStyles } from './sharedWordCardStyles';
import { useWordCardUI } from './useWordCardUI';
import { FEEDBACK_TEXT_FRONT } from './wordCardContext';
import WordCardHeader from './WordCardHeader';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

/**
 * Typing
 */
interface WordCardFrontProps {
	wordWidthStyle: AnimatedStyle<TextStyle>;
	articleWidthStyle: AnimatedStyle<TextStyle>;
	wordCardFrontFlippedStyle: AnimatedStyle<ViewStyle>;
	feedbackStyle: TextStyle;
	articleSlotStyle: TextStyle;
	wordSlotStyle: TextStyle;
	handleArticleWidth: (event: LayoutChangeEvent) => void;
	handleWordWidth: (event: LayoutChangeEvent) => void;
	background: ImageSourcePropType;
}

/**
 * WordCardFront component
 */
const WordCardFront = memo(function WordCardFrontMemo({
	handleWordWidth,
	handleArticleWidth,
	articleWidthStyle,
	wordCardFrontFlippedStyle,
	wordWidthStyle,
	feedbackStyle,
	articleSlotStyle,
	wordSlotStyle,
	background,
}: WordCardFrontProps) {
	const { cardState } = useWordCardUI();
	const { currentCard } = useCardDeck();

	/**
	 * Word data
	 */
	const {
		pronunciation,
		frenchArticle,
		englishArticle,
		englishWords,
		frenchWord,
		form,
		partOfSpeech,
	} = currentCard;

	/**
	 * Render the articlea and word the user has selected.
	 * These will animated when changing size, which is cool.
	 */
	const displayedArticle = cardState.selectedArticle ?? englishArticle;
	const displayedWord = cardState.selectedWord ?? englishWords[0];
	const displayedFrenchWord = formatFrenchWordWithArticle({
		article: frenchArticle,
		word: frenchWord,
	});
	const articleVisibilityStyle = {
		color: cardState.selectedArticle ? colors.dark.text : 'transparent',
	};
	const wordVisibilityStyle = {
		color: cardState.selectedWord ? colors.dark.text : 'transparent',
	};

	const formCapitalized = (form ?? '')
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	const partOfSpeechCapitalized = (partOfSpeech ?? '')
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	/**
	 * Render the front of the WordCard
	 */
	return (
		<AnimatedImageBackground
			style={[sharedWordCardStyles.wordCardInner, styles.cardFront, wordCardFrontFlippedStyle]}
			source={background}
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
					<>
						<Text
							numberOfLines={1}
							onLayout={handleArticleWidth}
							style={[sharedWordCardStyles.answerSlot, styles.hiddenMeasureText]}
						>
							{displayedArticle}
						</Text>
						<Animated.Text
							numberOfLines={1}
							style={[
								sharedWordCardStyles.answerSlot,
								articleVisibilityStyle,
								articleWidthStyle,
								cardState.progress !== 'SUCCESS' && cardState.selectedArticle && articleSlotStyle,
							]}
						>
							{cardState.selectedArticle && displayedArticle}
						</Animated.Text>
					</>
				)}
				<Text
					numberOfLines={1}
					onLayout={handleWordWidth}
					style={[sharedWordCardStyles.answerSlot, styles.hiddenMeasureText]}
				>
					{displayedWord}
				</Text>
				<Animated.Text
					numberOfLines={1}
					style={[
						sharedWordCardStyles.answerSlot,
						wordVisibilityStyle,
						wordWidthStyle,
						cardState.progress !== 'SUCCESS' && cardState.selectedWord && wordSlotStyle,
					]}
				>
					{cardState.selectedWord && displayedWord}
				</Animated.Text>
			</View>
			<View style={sharedWordCardStyles.feedbackContainer}>
				<Text
					style={[
						sharedWordCardStyles.feedbackText,
						cardState.progress !== 'SUCCESS' && feedbackStyle,
					]}
				>
					{FEEDBACK_TEXT_FRONT[cardState.feedbackKey] ?? ''}
				</Text>
			</View>
		</AnimatedImageBackground>
	);
});

/**
 * Styles
 */
const styles = StyleSheet.create({
	cardFront: {
		backfaceVisibility: 'hidden',
		width: '100%',
		transform: [{ perspective: 1000 }, { rotateY: '0deg' }],
	},
	hiddenMeasureText: {
		position: 'absolute',
		opacity: 0,
		borderBottomWidth: 0,
	},
});

export default WordCardFront;
