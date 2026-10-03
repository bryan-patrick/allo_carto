import { DeckRainyNight, DeckWindowWatcher } from '@/data/french/decks';
import { getDecks, storyAtlas } from '@/data/french/storyAtlas';
import { seedWords } from '@/data/french/words';
import colors from '@/src/app/colors';
import { getAtlasCompletionItems } from '@/src/util/atlasCompletion';

const frenchPassages = [
	'Il était trois heures du matin, un lundi, dans l’appartement de Wallace. La pluie tapait en rythme contre la fenêtre à côté de son lit. Il faisait chaud près du radiateur et froid partout ailleurs dans la pièce. Dehors, la rue avait presque perdu toutes ses couleurs. Le pavé sombre. Les silhouettes des bâtiments. La lumière orange des lampadaires. De temps en temps, des phares blancs glissaient sur les murs et le plafond, projetant d’étranges ombres dans la pièce.',
	'Wallace remonta sa couverture et ferma les yeux. Quelques secondes plus tard, quelque chose tapa contre la fenêtre. Ce n’était pas la pluie. Il repoussa la couverture et ouvrit de nouveau les yeux. Deux grands yeux jaunes le fixaient à travers la vitre. Les yeux clignèrent. Wallace cligna des yeux à son tour. Un miaulement étouffé se fit entendre à travers la vitre.',
];

const englishPassages = [
	'It was three o’clock in the morning on a Monday in Wallace’s apartment. Rain tapped rhythmically against the window beside his bed. The room was warm near the radiator and cold everywhere else. Outside, the street had lost its color. Dark pavement. Outlines of buildings. Orange light from the lamps. Occasionally, white headlights moved across the wall and ceiling, throwing strange shadows around the room.',
	'Wallace pulled his blanket higher and closed his eyes. A few seconds later, something tapped against the window. It was not rain. He threw off the blanket and opened his eyes again. Two big yellow eyes were staring back at him through the glass. The eyes blinked. Wallace blinked. The sound of a muffled meow came through the glass.',
];

describe('story atlas content', () => {
	test('contains only the new playable decks in story order', () => {
		expect(getDecks()).toEqual([DeckRainyNight, DeckWindowWatcher]);
		expect(storyAtlas.stories).toHaveLength(2);
		expect(storyAtlas.stories[0]).toMatchObject({
			id: 'meet-leo',
			name: 'Meet Leo',
			category: 'Cat Files',
			chapters: [
				{
					id: 'a-visitor-in-the-night',
					label: 'Chapter 1',
					name: 'A visitor in the night',
					image: require('@/src/app/assets/images/dep/dawn-at-the-drop-off.jpg'),
					decks: [DeckRainyNight, DeckWindowWatcher],
				},
			],
		});
	});

	test('keeps the mock History story', () => {
		expect(storyAtlas.stories[1]).toMatchObject({
			id: 'walking-the-plains',
			name: 'Walking the Plains',
			category: 'History',
			image: require('@/src/app/assets/images/chapters/chapters-bg.jpg'),
			materialSymbolName: 'history_edu',
			chapters: [],
		});
	});

	test('supports the nine final categories', () => {
		expect(Object.keys(colors.category)).toEqual([
			'Travel',
			'History',
			'Dining',
			'Social',
			'Health',
			'Directions',
			'Shopping',
			'Everyday',
			'Cat Files',
		]);
	});

	test.each([
		{ deck: DeckRainyNight, index: 0, wordCount: 58 },
		{ deck: DeckWindowWatcher, index: 1, wordCount: 39 },
	])('preserves both passages and vocabulary for $deck.title', ({ deck, index, wordCount }) => {
		expect(deck.passage.map(({ text, after }) => `${text}${after ?? ' '}`).join('')).toBe(
			frenchPassages[index],
		);
		expect(deck.englishPassage).toBe(englishPassages[index]);
		expect(deck.wordIds).toHaveLength(wordCount);
		const wordsById = new Map(seedWords.map(word => [word.id, word]));
		for (const segment of deck.passage) {
			if (segment.unlockExempt) continue;
			expect(segment.wordId).toBeDefined();
			const word = wordsById.get(segment.wordId!);
			expect(word).toBeDefined();
			expect(word?.englishWords.length).toBeGreaterThan(0);
			expect(word?.pronunciation.length).toBeGreaterThan(0);
			expect(['Common', 'Rare', 'Epic', 'Legendary']).toContain(word?.rarity);
			expect(deck.CEFR).toContain(word?.CEFR);
		}
	});

	test('keeps Wallace readable without dictionary cards or completion requirements', () => {
		for (const deck of getDecks()) {
			const names = deck.passage.filter(segment => segment.text === 'Wallace');
			expect(names.length).toBeGreaterThan(0);
			expect(names.every(segment => segment.unlockExempt && !segment.wordId)).toBe(true);
		}
		expect(seedWords.some(word => word.frenchWord === 'Wallace')).toBe(false);
		expect(
			getAtlasCompletionItems().every(item => item.wordIds.every(id => !id.includes('wallace'))),
		).toBe(true);
	});

	test('uses the article and object pronoun in their respective contexts', () => {
		expect(DeckRainyNight.passage.find(segment => segment.text === 'Le')?.wordId).toBe(
			'word_article_le',
		);
		const headlights = DeckRainyNight.passage.findIndex(segment => segment.text === 'phares');
		expect(DeckRainyNight.passage[headlights - 1].wordId).toBe('word_article_des');
		const staring = DeckWindowWatcher.passage.findIndex(segment => segment.text === 'fixaient');
		expect(DeckWindowWatcher.passage[staring - 1].wordId).toBe('word_pronoun_le');
	});

	test('unlocks Window Watcher at one percent of Rainy Night', () => {
		expect(DeckRainyNight.unlockRequirements).toBeUndefined();
		expect(DeckWindowWatcher.unlockRequirements).toEqual([
			{ id: 'deck__rainy_night', requiredCompletionPercentage: 1 },
		]);
	});
});
