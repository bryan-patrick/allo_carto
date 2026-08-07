import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import Loader from '@/src/components/Loader';
import CardDeckView from '@/src/components/Views/CardDeckView';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { Text } from 'react-native';

/**
 * Deck view - A route wrapper in (routes)
 */
export default function CardDeck() {
	const { cardDeckState, currentCard } = useCardDeck();
	const { progressById, status } = useUserProgress();

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load deck progress.</Text>;

	/**
	 * Block locked decks
	 */
	if (
		!isItemUnlocked({
			id: cardDeckState.cardDeck.id,
			progressById,
		})
	) {
		return <Text>This deck is locked.</Text>;
	}

	/**
	 * Render the deck
	 */
	return <CardDeckView currentCard={currentCard} />;
}
