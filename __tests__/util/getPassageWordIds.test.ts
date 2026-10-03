import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';

describe('passage unlock exemptions', () => {
	test('excludes exempt names and quoted English even when they have dictionary IDs', () => {
		const passage = [
			{ text: 'Wallace', wordId: 'name', unlockExempt: true },
			{ text: '« hello »', wordId: 'english', unlockExempt: true },
			{ text: 'pluie', wordId: 'rain' },
			{ text: 'pluie', wordId: 'rain' },
			{ text: '.', after: '' },
		];

		expect(getPassageWordIds(passage)).toEqual(['rain']);
		expect(makeMockCardDeck({ passage }).wordIds).toEqual(['rain']);
	});

	test('keeps non-exempt occurrences of the same word learnable', () => {
		expect(
			getPassageWordIds([
				{ text: 'Shadow', wordId: 'shadow', unlockExempt: true },
				{ text: 'ombre', wordId: 'shadow', unlockExempt: false },
			]),
		).toEqual(['shadow']);
	});
});
