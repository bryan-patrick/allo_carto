import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import wordRaffle from '@/src/util/wordRaffle';

const firstWord = { id: 'word_one', rarity: 'Common' } as Word;
const secondWord = { id: 'word_two', rarity: 'Legendary' } as Word;

describe('wordRaffle', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('uses each word rarity to choose a word', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0.8);

		const result = wordRaffle([firstWord, secondWord], 1);

		expect(result).toEqual([firstWord]);
	});

	test('does not draw the same word twice', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0);

		const result = wordRaffle([firstWord, secondWord], 2);

		expect(result).toEqual([firstWord, secondWord]);
	});

	test('stops drawing when the raffle is empty', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0);

		const result = wordRaffle([firstWord], 10);

		expect(result).toEqual([firstWord]);
	});
});
