import { useHeaderHeight } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import BackgroundImage from '../BackgroundImage';
import { Word } from '../CardDeck/cardDeckTypes';
import WordCardContainer from '../WordCard/WordCardContainer';

const cardPageBackground = require('@/src/app/assets/images/card-bgs/card-page-bg.jpg');

/*
 * Typing
 */
interface CardDeckViewProps {
	currentCard: Word;
	wordActions?: ReactNode;
}

// Show each flashcard over the page background, leaving room for the header controls.
export default function CardDeckView({ currentCard, wordActions }: CardDeckViewProps) {
	const headerHeight = useHeaderHeight();
	const contentInsetStyle = {
		paddingTop: headerHeight,
	};

	/*
	 * Render the card deck
	 */
	return (
		<BackgroundImage
			source={cardPageBackground}
			resizeMode="cover"
			style={[styles.background, contentInsetStyle]}
		>
			<Animated.View
				key={currentCard.id}
				entering={SlideInRight.duration(200)}
				exiting={SlideOutLeft.duration(200)}
				style={styles.wordCardAnimatedView}
			>
				<WordCardContainer
					word={currentCard}
					isCurrent={true}
					wordActions={wordActions}
				/>
			</Animated.View>
		</BackgroundImage>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	wordCardAnimatedView: {
		flex: 1,
		position: 'relative',
	},
});
