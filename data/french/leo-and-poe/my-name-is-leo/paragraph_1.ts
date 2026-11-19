import { introducingYourNameTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph1 = createParagraph({
	id: 'deck__i_am_a_cat',
	requiredLevel: 1,
	description: 'Léo introduces himself.',
	CEFR: ['A1'],
	englishPassage: 'Hello. My name is Léo. I am a cat.',
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
			text: 'm’appelle',
			wordId: 'word_expression_m_appelle',
			canonicalEnglish: ['call myself', 'am called'],
			tipId: introducingYourNameTip.id,
		},
		{
			text: 'Léo',
			unlockExempt: true,
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
			after: '.',
		},
	],
});
