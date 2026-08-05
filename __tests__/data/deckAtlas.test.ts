import { deckAtlas, getDecks } from '@/data/french/deckAtlas';

describe('deck atlas', () => {
	it('chains chapters and places only to their previous sibling', () => {
		expect(deckAtlas.chapters.map(chapter => ({
			id: chapter.id,
			unlockRequirements: chapter.unlockRequirements,
		}))).toEqual([
			{
				id: 'a-very-french-travel-day',
				unlockRequirements: undefined,
			},
			{
				id: 'lost-and-secret-decks',
				unlockRequirements: [
					{
						id: 'a-very-french-travel-day',
						requiredCompletionPercentage: 50,
					},
				],
			},
		]);

		expect(deckAtlas.chapters[0].places.map(place => ({
			id: place.id,
			unlockRequirements: place.unlockRequirements,
		}))).toEqual([
			{
				id: 'aeroport-oiseau',
				unlockRequirements: undefined,
			},
			{
				id: 'hotel-bonne-chance',
				unlockRequirements: [
					{
						id: 'aeroport-oiseau',
						requiredCompletionPercentage: 50,
					},
				],
			},
		]);

		expect(
			deckAtlas.chapters[1].places[0].unlockRequirements,
		).toBeUndefined();
	});

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
		expect(decks.map((deck) => deck.unlockRequirements)).toEqual([
			undefined,
			[
				{
					id: 'deck__dawn_at_the_drop_off',
					requiredCompletionPercentage: 50,
				},
			],
			[
				{
					id: 'deck__trouble_in_the_terminal',
					requiredCompletionPercentage: 50,
				},
			],
			undefined,
			[
				{
					id: 'deck__lost_room_keys',
					requiredCompletionPercentage: 50,
				},
			],
			undefined,
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
