import { introducingYourNameTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph1 = createParagraph({
	id: 'deck__i_am_a_cat',
	requiredLevel: 1,
	description: 'Leo introduces himself.',
	CEFR: ['A1'],
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
			text: 'm’',
			wordId: 'word_pronoun_me_elision',
			canonicalEnglish: ['myself', 'me'],
			tipId: introducingYourNameTip.id,
			after: '',
		},
		{
			text: 'appelle',
			wordId: 'word_verb_appelle',
			tipId: introducingYourNameTip.id,
		},
		{
			text: 'Léo',
			unlockExempt: true,
			after: '.',
		},
	],
});
