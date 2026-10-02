import {
	DeckACabAndACloseCall,
	DeckAnAmberApproach,
	DeckDawnAtTheDropOff,
} from '@/data/french/decks';
import { getDecks, storyAtlas } from '@/data/french/storyAtlas';
import { seedWords, words_a1, words_an_amber_approach } from '@/data/french/words';

describe('story atlas content', () => {
	test('contains the airport decks in story order', () => {
		expect(getDecks()).toEqual([DeckDawnAtTheDropOff, DeckAnAmberApproach, DeckACabAndACloseCall]);
	});

	test('seeds exactly the words used by the playable decks', () => {
		const deckWordIds = new Set(getDecks().flatMap(deck => deck.wordIds));
		const seedWordIds = new Set(seedWords.map(word => word.id));

		expect(seedWordIds).toEqual(deckWordIds);
	});

	test('keeps the decks in the airport story and chapter', () => {
		expect(storyAtlas.stories).toHaveLength(2);
		expect(storyAtlas.stories[0].chapters).toHaveLength(1);
	});

	test('includes the empty History story with its former deck-select background', () => {
		expect(storyAtlas.stories[1]).toMatchObject({
			id: 'stories-on-the-plains',
			name: 'Stories on the Plains',
			description:
				'Born from walking les plaines d’Abraham, these decks follow the plaques and monuments that reveal Québec’s past.',
			category: 'History',
			image: require('@/src/app/assets/images/decks/deck-select-bg.jpg'),
			materialSymbolName: 'history_edu',
			chapters: [],
		});
	});

	test('unlocks A Cab and a Close Call at one percent of the previous deck', () => {
		expect(DeckACabAndACloseCall.unlockRequirements).toEqual([
			{
				id: 'deck__an_amber_approach',
				requiredCompletionPercentage: 1,
			},
		]);
	});

	test('preserves the complete A Cab and a Close Call passage', () => {
		const renderedPassage = DeckACabAndACloseCall.passage
			?.map(({ text, after }) => `${text}${after ?? ' '}`)
			.join('');

		expect(renderedPassage).toBe(
			'Un vent frais m’a frappé pendant que j’attendais dehors. C’était l’été, alors l’air frais faisait du bien. Mon chauffeur de taxi est arrivé et m’a aidé avec mes bagages. « Je viens du Cameroun », m’a-t-il dit. « Et toi, tu viens d’où? » « Je viens des États-Unis », j’ai répondu. En route vers mon hôtel, il m’a raconté son arrivée au Québec. Au début, ça a été difficile. Il faisait trop froid et son pays lui manquait. Mais avec le temps, il est tombé amoureux des gens et des collines. On a parlé et il m’a montré quelques endroits en chemin. Tout à coup, il a freiné brusquement. Il y avait un écureuil dans la rue! Il s’est sauvé juste à temps. Chanceux, l’écureuil! « Achète-toi un bon manteau si tu veux rester ici! » m’a-t-il dit pendant que je sortais de la voiture.',
		);
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
