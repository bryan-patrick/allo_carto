import { type CardDeckStateProps } from './cardDeckContext';
import { type CardDeck, type Word } from './cardDeckTypes';

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
	},
];

/**
 * Mock deck
 */
export const mockCardDeck: CardDeck = {
	title: 'Testing deck',
	description: 'A deck for tests',
	CEFR: ['A1'],
	wordIds: mockWords.map(word => word.id),
	words: mockWords,
	image: undefined,
	wordChoices: mockWords.map(word => ({
		englishWords: word.englishWords,
		partOfSpeech: word.partOfSpeech,
	})),
};

/**
 * Make a mock deck with overrides.
 */
export function makeMockCardDeck(overrides: Partial<CardDeck> = {}): CardDeck {
	const words = overrides.words ?? mockCardDeck.words;

	return {
		...mockCardDeck,
		...overrides,
		words,
		wordIds: overrides.wordIds ?? words.map(word => word.id),
		wordChoices:
			overrides.wordChoices ?? words.map(word => ({
				englishWords: word.englishWords,
				partOfSpeech: word.partOfSpeech,
			})),
	};
}

/**
 * Make mock card deck state with overrides.
 */
export function makeMockCardDeckState(
	overrides: Partial<CardDeckStateProps> = {},
): CardDeckStateProps {
	const cardDeck = overrides.cardDeck ?? mockCardDeck;

	return {
		currentIndex: 0,
		currentId: cardDeck.words[0]?.id ?? '',
		cardDeck,
		correctWords: [],
		incorrectWords: [],
		...overrides,
	};
}
