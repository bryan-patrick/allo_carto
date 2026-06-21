import type { CardRarity, Word } from '../components/CardDeck/cardDeckTypes';

/**
 * More tickets make a word easier to draw.
 * Fewer tickets make a word harder to draw.
 * 
 * 	Common: 10,
	Rare: 5,
	Epic: 3,
	Legendary: 1,
 */
const numberOfTicketsByRarity: Record<CardRarity, number> = {
	Common: 10,
	Rare: 5,
	Epic: 3,
	Legendary: 1,
};

/**
 * Draw words from a weighted raffle.
 *
 * This is for drawing words from a deck based on actual rarity.
 */
export default function wordRaffle(
	words: Word[],
	numberOfWordsToDraw: number,
): Word[] {
	const wordsInRaffle = [...words];
	const winningWords: Word[] = [];

	/**
	 * Keep drawing until the deck has enough words
	 * or the raffle is empty.
	 */
	while (
		winningWords.length < numberOfWordsToDraw &&
		wordsInRaffle.length > 0
	) {
		let totalRaffleTickets = 0;

		/**
		 * Count all of the raffle tickets
		 * currently in the draw.
		 */
		for (const word of wordsInRaffle) {
			const wordRarity = word.rarity ?? 'Common';
			const wordRaffleTickets = numberOfTicketsByRarity[wordRarity];

			totalRaffleTickets = totalRaffleTickets + wordRaffleTickets;
		}

		/**
		 * Pick one winning ticket from all
		 * of the tickets in the draw.
		 *
		 * Each word owns a range of ticket numbers. The word whose
		 * range contains this number will be drawn.
		 */
		const winningTicketNumber = Math.random() * totalRaffleTickets;
		let raffleTicketsCounted = 0;
		let winningWordIndex = 0;

		/**
		 * Count each word's tickets in order.
		 *
		 * The word holding the winning ticket
		 * (has the number within the range)
		 * is the word we draw.
		 */
		for (let index = 0; index < wordsInRaffle.length; index++) {
			const word = wordsInRaffle[index];
			const wordRarity = word.rarity ?? 'Common';
			const wordRaffleTickets = numberOfTicketsByRarity[wordRarity];

			raffleTicketsCounted = raffleTicketsCounted + wordRaffleTickets;

			if (winningTicketNumber < raffleTicketsCounted) {
				winningWordIndex = index;

				break;
			}
		}

		/**
		 * Take the winning word out of the raffle and put it in the deck.
		 */
		const wordsRemovedFromRaffle = wordsInRaffle.splice(winningWordIndex, 1);
		const winningWord = wordsRemovedFromRaffle[0];

		winningWords.push(winningWord);
	}

	return winningWords;
}
