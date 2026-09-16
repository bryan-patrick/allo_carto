import { DeckAnAmberApproach, DeckDawnAtTheDropOff } from '@/data/french/decks';
import { getDecks, storyAtlas } from '@/data/french/storyAtlas';
import { seedWords, words_a1, words_an_amber_approach } from '@/data/french/words';

describe('story atlas content', () => {
	test('contains the two airport decks in story order', () => {
		expect(getDecks()).toEqual([DeckDawnAtTheDropOff, DeckAnAmberApproach]);
	});

	test('seeds exactly the words used by the playable decks', () => {
		const deckWordIds = new Set(getDecks().flatMap(deck => deck.wordIds));
		const seedWordIds = new Set(seedWords.map(word => word.id));

		expect(seedWordIds).toEqual(deckWordIds);
	});

	test('keeps both decks in the airport story and chapter', () => {
		expect(storyAtlas.stories).toHaveLength(1);
		expect(storyAtlas.stories[0].chapters).toHaveLength(1);
	});

	test('preserves the complete An Amber Approach passage', () => {
		const renderedPassage = DeckAnAmberApproach.passage
			?.map(({ text, after }) => `${text}${after ?? ' '}`)
			.join('');

		expect(renderedPassage).toBe(
			'Plus tard dans la soirée, notre avion a amorcé sa descente. Les lumières ambrées de la piste brillaient dans l’obscurité. Après une courte attente, nous sommes sortis de l’avion et sommes entrés dans l’aéroport. C’était calme et chaleureux.\n\n' +
				'En marchant vers la zone de récupération des bagages, j’ai aperçu un grand panneau où il était écrit : « Aéroport international Jean-Lesage ». Je me suis demandé qui était Jean Lesage. Une plaque tout près expliquait qu’il avait été avocat et premier ministre du Québec. Son gouvernement avait contribué à transformer les écoles, le gouvernement et l’économie de la province pendant une période appelée la Révolution tranquille.\n\n' +
				'Là d’où je viens, on ne nous avait jamais rien appris sur le Québec. J’étais curieux et j’avais hâte d’en apprendre davantage. Je me demandais si j’allais trouver d’autres plaques un peu partout dans la ville.',
		);
	});

	test('keeps article answers in their own slot and avoids synonym clutter', () => {
		expect(words_an_amber_approach.find(word => word.id === 'word_noun_soiree')).toMatchObject({
			frenchArticle: 'la',
			englishArticle: 'the',
			englishWords: ['evening'],
		});
		expect(words_an_amber_approach.find(word => word.id === 'word_noun_panneau')).toMatchObject({
			frenchArticle: 'un',
			englishArticle: 'a',
			englishWords: ['sign'],
		});
		expect(words_a1.find(word => word.id === 'word_adverb_peu')).toMatchObject({
			englishArticle: 'a',
			englishWords: ['little'],
		});
		expect(words_a1.find(word => word.id === 'word_preposition_au')).toMatchObject({
			englishWords: ['at the'],
		});
		expect(
			words_an_amber_approach
				.filter(word => word.englishWords.length > 1)
				.map(word => ({ id: word.id, englishWords: word.englishWords })),
		).toEqual([{ id: 'word_pronoun_nous', englishWords: ['we', 'us'] }]);
	});
});
