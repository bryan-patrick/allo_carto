import { StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Word } from '../CardDeck/cardDeckTypes';
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
	/**
	 * Render the card deck
	 */
	return (
		<>
			<Animated.View
				key={currentCard.id}
				entering={SlideInRight.duration(200)}
				exiting={SlideOutLeft.duration(200)}
				style={styles.wordCardAnimatedView}
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
const styles = StyleSheet.create({
	wordCardAnimatedView: {
		flex: 1,
		position: 'relative',
	},
});
