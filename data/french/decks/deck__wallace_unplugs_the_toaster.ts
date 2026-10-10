import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckWallaceUnplugsTheToaster = createCardDeck({
	id: 'deck__wallace_unplugs_the_toaster',
	title: 'Wallace Unplugs the Toaster',
	description: 'Wallace smells smoke and quickly unplugs the toaster.',
	chapter: 'Oh non!',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__the_card_turns_black', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'Wallace smells smoke. He quickly unplugs the toaster.',
	passage: [
		{ text: 'Wallace', unlockExempt: true },
		{ text: 'sent', wordId: 'word_verb_sent' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'fumée', wordId: 'word_noun_fumee', after: '. ' },
		{ text: 'Il', wordId: 'word_pronoun_il' },
		{ text: 'débranche', wordId: 'word_verb_debranche' },
		{ text: 'vite', wordId: 'word_adverb_vite' },
		{ text: 'le', wordId: 'word_article_le' },
		{ text: 'grille-pain', wordId: 'word_noun_grille_pain', after: '.' },
	],
});
