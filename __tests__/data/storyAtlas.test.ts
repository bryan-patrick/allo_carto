import { DeckDawnAtTheDropOff } from '@/data/french/decks';
import { getDecks, storyAtlas } from '@/data/french/storyAtlas';
import { seedWords } from '@/data/french/words';

describe('story atlas content', () => {
	test('contains only Dawn at the Drop Off', () => {
		expect(getDecks()).toEqual([DeckDawnAtTheDropOff]);
	});

	test('seeds exactly the words used by Dawn at the Drop Off', () => {
		expect(seedWords.map(word => word.id)).toEqual(
			expect.arrayContaining(DeckDawnAtTheDropOff.wordIds),
		);
		expect(seedWords).toHaveLength(DeckDawnAtTheDropOff.wordIds.length);
	});

	test('keeps only the story and chapter that contain Dawn at the Drop Off', () => {
		expect(storyAtlas.stories).toHaveLength(1);
		expect(storyAtlas.stories[0].chapters).toHaveLength(1);
	});
});
