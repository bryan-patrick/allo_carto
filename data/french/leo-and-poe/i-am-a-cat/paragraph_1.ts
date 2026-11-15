import { createParagraph } from '@/src/util/createParagraph';

export const paragraph1 = createParagraph({
	id: 'deck__i_am_a_cat',
	requiredLevel: 1,
	description: 'Leo introduces himself.',
	CEFR: ['A1', 'A2'],
	englishPassage: 'Hello. I am a cat. My name is Leo.',
	passage: [
		{
			text: 'Bonjour',
			wordId: 'word_interjection_bonjour',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'suis',
			wordId: 'word_auxiliary_suis',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'chat',
			wordId: 'word_noun_chat',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'm’appelle',
			wordId: 'word_expression_m_appelle',
		},
		{
			text: 'Léo',
			unlockExempt: true,
			after: '.',
		},
	],
});
