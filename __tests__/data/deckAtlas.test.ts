import { deckAtlas, getDecks } from '@/data/french/deckAtlas';

describe('deck atlas', () => {
	it('gets every deck in chapter, place, and deck order', () => {
		const decks = getDecks();

		expect(decks.map((deck) => deck.id)).toEqual([
			'deck__dawn_at_the_drop_off',
			'deck__trouble_in_the_terminal',
			'deck__to_the_gate',
			'deck__lost_room_keys',
			'deck__elevator_epics',
			'deck__street_market_treasure_hunt',
		]);
		expect(decks.map((deck) => deck.requiredPreviousDeckRank)).toEqual([
			null,
			'bronze',
			'bronze',
			'bronze',
			'bronze',
			'bronze',
		]);
	});

	it('can flatten a supplied atlas', () => {
		const firstPlace = deckAtlas.chapters[0].places[0];

		expect(
			getDecks({
				chapters: [
					{
						...deckAtlas.chapters[0],
						places: [{ ...firstPlace, decks: [firstPlace.decks[1]] }],
					},
				],
			}),
		).toEqual([firstPlace.decks[1]]);
	});
});
