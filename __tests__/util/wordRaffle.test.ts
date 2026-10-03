import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import wordRaffle from '@/src/util/wordRaffle';

const firstWord: Word = {
	id: 'word_one',
	frenchWord: 'un',
	englishWords: ['one'],
	pronunciation: 'un',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 0,
	rarity: 'Common',
};

const secondWord: Word = {
	id: 'word_two',
	frenchWord: 'deux',
	englishWords: ['two'],
	pronunciation: 'duh',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 0,
	rarity: 'Legendary',
};

describe('wordRaffle', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('uses each word rarity to choose a word', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0.8);

		const result = wordRaffle([firstWord, secondWord], 1);

		expect(result).toEqual([firstWord]);
	});

	test('draws each word once and stops when the pool is exhausted', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0);

		const result = wordRaffle([firstWord, secondWord], 10);

		expect(result).toEqual([firstWord, secondWord]);
	});
});
