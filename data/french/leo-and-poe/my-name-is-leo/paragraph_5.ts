import { createParagraph } from '@/src/util/createParagraph';

export const paragraph5 = createParagraph({
	id: 'leo-and-poe-chapter-1-paragraph-5',
	description: 'Léo sees two colorful birds at the park.',
	CEFR: ['A1'],
	englishPassage:
		'Today, I see two birds at the park. One is small and red. One is big and purple.',
	passage: [
		{
			text: 'Aujourd’hui',
			wordId: 'word_adverb_aujourdhui',
			after: ', ',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'vois',
			wordId: 'word_verb_vois',
		},
		{
			text: 'deux',
			wordId: 'word_numeral_deux',
		},
		{
			text: 'oiseaux',
			wordId: 'word_noun_oiseaux',
		},
		{
			text: 'au',
			wordId: 'word_preposition_au',
			canonicalEnglish: ['at the'],
		},
		{
			text: 'parc',
			wordId: 'word_noun_parc',
			after: '. ',
		},
		{
			text: 'Un',
			wordId: 'word_numeral_un',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'petit',
			wordId: 'word_adjective_petit',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'rouge',
			wordId: 'word_adjective_rouge',
			after: '. ',
		},
		{
			text: 'L’autre',
			wordId: 'word_pronoun_l_autre',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'grand',
			wordId: 'word_adjective_grand',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'violet',
			wordId: 'word_adjective_violet',
			after: '.',
		},
	],
});
