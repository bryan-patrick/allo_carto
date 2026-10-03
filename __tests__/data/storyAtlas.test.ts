import { getDecks } from '@/data/french/storyAtlas';
import { seedWords } from '@/data/french/words';

// Broken references make passage words impossible to practice or complete.
describe('story atlas content', () => {
	test('playable passages reference usable dictionary entries within the deck CEFR levels', () => {
		const wordsById = new Map(seedWords.map(word => [word.id, word]));
		const invalidReferences: string[] = [];

		for (const deck of getDecks()) {
			for (const segment of deck.passage) {
				if (segment.unlockExempt) continue;

				const word = wordsById.get(segment.wordId ?? '');
				if (
					!word ||
					!word.englishWords.length ||
					!word.pronunciation.trim() ||
					!deck.CEFR.includes(word.CEFR)
				) {
					invalidReferences.push(`${deck.id}: ${segment.wordId ?? segment.text}`);
				}
			}
		}

		expect(invalidReferences).toEqual([]);
	});
});
