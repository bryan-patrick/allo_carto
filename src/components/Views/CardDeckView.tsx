import { StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Word } from '../CardDeck/cardDeckTypes';
import DeckProgress from '../WordCard/DeckProgress';
import WordCardContainer from '../WordCard/WordCardContainer';

/**
 * Typing
 */
interface CardDeckViewProps {
	currentCard: Word;
}

/**
 * CardDeckView component
 */
export default function CardDeckView({ currentCard }: CardDeckViewProps) {
	const { wordCardAnimatedView } = cardDeckViewStyles;

	/**
	 * Render the card deck
	 */
	return (
		<>
			<DeckProgress />
			<Animated.View
				key={currentCard.id}
				entering={SlideInRight.duration(200)}
				exiting={SlideOutLeft.duration(200)}
				style={wordCardAnimatedView}
			>
				<WordCardContainer
					word={currentCard}
					isCurrent={true}
				/>
			</Animated.View>
		</>
	);
}

/**
 * Styles
 */
const cardDeckViewStyles = StyleSheet.create({
	wordCardAnimatedView: {
		flex: 1,
		position: 'relative',
	},
});
