import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckStudyAndReadAgain = createCardDeck({
	id: 'deck__study_and_read_again',
	title: 'Study and Read Again',
	description: 'Study a deck, then return to its passage.',
	chapter: 'How it works',
	CEFR: ['A1', 'A2', 'B1'],
	unlockRequirements: [
		{ id: 'deck__stories_chapters_and_decks', requiredCompletionPercentage: 20 },
	],
	words: [],
	wordChoices: [],
	englishPassage:
		'Each deck has a short passage. Study the decks, then read the passage again. It will get easier.',
	passage: [
		{ text: 'Chaque', wordId: 'word_determiner_chaque' },
		{ text: 'deck', wordId: 'word_noun_deck' },
		{ text: 'contient', wordId: 'word_verb_contient' },
		{ text: 'un', wordId: 'word_article_un' },
		{ text: 'court', wordId: 'word_adjective_court' },
		{ text: 'passage', wordId: 'word_noun_passage', after: '. ' },
		{ text: 'Étudie', wordId: 'word_verb_etudie' },
		{ text: 'les', wordId: 'word_article_les' },
		{ text: 'decks', wordId: 'word_noun_decks', after: ', ' },
		{ text: 'puis', wordId: 'word_conjunction_puis' },
		{ text: 'lis', wordId: 'word_verb_lis' },
		{ text: 'le', wordId: 'word_article_le' },
		{ text: 'passage', wordId: 'word_noun_passage' },
		{ text: 'de nouveau', wordId: 'word_expression_de_nouveau', after: '. ' },
		{ text: 'Ça', wordId: 'word_pronoun_ca' },
		{ text: 'deviendra', wordId: 'word_verb_deviendra' },
		{ text: 'plus', wordId: 'word_adverb_plus' },
		{ text: 'facile', wordId: 'word_adjective_facile', after: '.' },
	],
});
