import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckStoriesChaptersAndDecks = createCardDeck({
	id: 'deck__stories_chapters_and_decks',
	title: 'Stories, Chapters, and Decks',
	description: 'Explore the chapters and decks in each story.',
	chapter: 'How it works',
	CEFR: ['A1', 'A2'],
	words: [],
	wordChoices: [],
	englishPassage:
		'Every story has chapters. Every chapter has decks, like the one you are reading now.',
	passage: [
		{ text: 'Chaque', wordId: 'word_determiner_chaque' },
		{ text: 'histoire', wordId: 'word_noun_histoire' },
		{ text: 'a', wordId: 'word_auxiliary_a' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'chapitres', wordId: 'word_noun_chapitres', after: '. ' },
		{ text: 'Chaque', wordId: 'word_determiner_chaque' },
		{ text: 'chapitre', wordId: 'word_noun_chapitre' },
		{ text: 'a', wordId: 'word_auxiliary_a' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'decks', wordId: 'word_noun_decks', after: ', ' },
		{ text: 'comme', wordId: 'word_conjunction_comme' },
		{ text: 'celui', wordId: 'word_pronoun_celui' },
		{ text: 'que', wordId: 'word_conjunction_que' },
		{ text: 'tu', wordId: 'word_pronoun_tu' },
		{ text: 'lis', wordId: 'word_verb_lis' },
		{ text: 'en', wordId: 'word_preposition_en' },
		{ text: 'ce', wordId: 'word_pronoun_ce' },
		{ text: 'moment', wordId: 'word_noun_moment', after: '.' },
	],
});
