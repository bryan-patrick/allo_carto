import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckStudyAndReadAgain = createCardDeck({
	id: 'deck__study_and_read_again',
	requiredLevel: 5,
	title: 'Study and Read Again',
	description: 'Study a paragraph’s words, then read it again.',
	chapter: 'How it works',
	CEFR: ['A1', 'A2', 'B1'],
	unlockRequirements: [{ id: 'deck__stories_chapters_and_decks', requiredWordProgress: 'new' }],
	words: [],
	wordChoices: [],
	englishPassage:
		'Read each paragraph. Study the words, then read the passage again. It will get easier.',
	passage: [
		{ text: 'Lis', wordId: 'word_verb_lis' },
		{ text: 'chaque', wordId: 'word_determiner_chaque' },
		{ text: 'paragraphe', wordId: 'word_noun_paragraphe', after: '. ' },
		{ text: 'Étudie', wordId: 'word_verb_etudie' },
		{ text: 'les', wordId: 'word_article_les' },
		{ text: 'mots', wordId: 'word_noun_mots', after: ', ' },
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
