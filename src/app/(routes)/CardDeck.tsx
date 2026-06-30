import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import CardDeckView from "@/src/components/Views/CardDeckView";

/**
 * Deck view - A route wrapper in (routes)
 */
export default function CardDeck() {
  const { currentCard } = useCardDeck();

  return (
    <CardDeckView currentCard={currentCard} />
  )
}
