import { createCardDeck } from '@/src/util/createCardDeck';
import { type CardDeckStateProps } from './cardDeckContext';
import { type CardDeck, type CardDeckDefinition, type Word } from './cardDeckTypes';

/**
 * Mock words
 */
export const mockWords: Word[] = [
	{
		id: 'word_noun_chien',
		frenchWord: 'chien',
		englishWords: ['dog'],
		isVulgar: false,
		lemmaId: 'chien',
		frenchArticle: 'le',
		englishArticle: 'The',
		partOfSpeech: 'noun',
		CEFR: 'A1',
		gender: 'Masculine',
		pronunciation: 'luh shee-ehn',
		correctCount: 14,
		seenCount: 14,
		rarity: 'Common',
	},
	{
		id: 'word_noun_maison',
		frenchWord: 'maison',
		englishWords: ['house'],
		isVulgar: false,
		lemmaId: 'maison',
		frenchArticle: 'la',
		englishArticle: 'The',
		partOfSpeech: 'noun',
		CEFR: 'A1',
		gender: 'Feminine',
		pronunciation: 'lah meh-zohn',
		correctCount: 14,
		seenCount: 14,
		rarity: 'Common',
	},
	{
		id: 'word_noun_livre',
		frenchWord: 'livre',
		englishWords: ['book'],
		isVulgar: false,
		lemmaId: 'livre',
		frenchArticle: 'le',
		englishArticle: 'The',
		partOfSpeech: 'noun',
		CEFR: 'A1',
		gender: 'Masculine',
		pronunciation: 'luh leev-uh',
		correctCount: 7,
		seenCount: 7,
		rarity: 'Common',
	},
	{
		id: 'word_noun_pomme',
		frenchWord: 'pomme',
		englishWords: ['apple'],
		isVulgar: false,
		lemmaId: 'pomme',
		frenchArticle: 'la',
		englishArticle: 'The',
		partOfSpeech: 'noun',
		CEFR: 'A1',
		gender: 'Feminine',
		pronunciation: 'lah pom',
		correctCount: 11,
		seenCount: 11,
		rarity: 'Common',
	},
];

/**
 * Mock deck
 */
export const mockCardDeck: CardDeck = createCardDeck({
	id: 'deck__testing',
	title: 'Testing deck',
	description: 'A deck for tests',
	chapter: 'Testing Chapter',
	CEFR: ['A1'],
	passage: mockWords.map(word => ({ text: word.frenchWord, wordId: word.id })),
	words: mockWords,
	wordChoices: mockWords.map(word => ({
		englishWords: word.englishWords,
		partOfSpeech: word.partOfSpeech,
	})),
});

/**
 * Make a mock deck with overrides.
 */
export function makeMockCardDeck(overrides: Partial<CardDeckDefinition> = {}): CardDeck {
	const words = overrides.words ?? mockCardDeck.words;

	return createCardDeck({
		...mockCardDeck,
		...overrides,
		words,
		passage: overrides.passage ?? words.map(word => ({ text: word.frenchWord, wordId: word.id })),
		wordChoices:
			overrides.wordChoices ??
			words.map(word => ({
				englishWords: word.englishWords,
				partOfSpeech: word.partOfSpeech,
			})),
	});
}

/**
 * Make mock card deck state with overrides.
 */
export function makeMockCardDeckState(
	overrides: Partial<CardDeckStateProps> = {},
): CardDeckStateProps {
	const cardDeck = overrides.cardDeck ?? mockCardDeck;

	return {
		isComplete: false,
		currentIndex: 0,
		currentId: cardDeck.words[0]?.id ?? '',
		cardDeck,
		correctWords: [],
		incorrectWords: [],
		...overrides,
	};
}
