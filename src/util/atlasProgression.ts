import type {
	DeckAtlas,
	DeckChapter,
	DeckPlace,
} from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	ProgressById,
	Progression,
	ProgressType,
} from './progression';
import { isUnlocked } from './progression';

/**
 * Typing
 */
export interface ProgressItem extends Progression {
	type: ProgressType;
	wordIds: string[];
}

/**
 * Get unique words from some decks
 */
function getUniqueWordIds(decks: CardDeck[]): string[] {
	const result: string[] = [];

	for (const deck of decks) {
		for (const wordId of deck.wordIds) {
			if (!result.includes(wordId)) result.push(wordId);
		}
	}

	return result;
}

/**
 * Get every deck in a chapter
 */
function getChapterDecks(chapter: DeckChapter): CardDeck[] {
	const result: CardDeck[] = [];

	for (const place of chapter.places) {
		result.push(...place.decks);
	}

	return result;
}

/**
 * Get every progress item
 */
export function getProgressItems(atlas: DeckAtlas = deckAtlas): ProgressItem[] {
	const result: ProgressItem[] = [];

	for (const chapter of atlas.chapters) {
		result.push({
			id: chapter.id,
			type: 'chapter',
			unlockRequirements: chapter.unlockRequirements,
			wordIds: getUniqueWordIds(getChapterDecks(chapter)),
		});

		for (const place of chapter.places) {
			result.push({
				id: place.id,
				type: 'place',
				unlockRequirements: place.unlockRequirements,
				wordIds: getUniqueWordIds(place.decks),
			});

			for (const deck of place.decks) {
				result.push({
					id: deck.id,
					type: 'deck',
					unlockRequirements: deck.unlockRequirements,
					wordIds: [...new Set(deck.wordIds)],
				});
			}
		}
	}

	return result;
}

/**
 * Get everything that uses a word
 */
export function getProgressItemsForWord({
	atlas = deckAtlas,
	wordId,
}: {
	atlas?: DeckAtlas;
	wordId: string;
}): ProgressItem[] {
	const result: ProgressItem[] = [];

	for (const item of getProgressItems(atlas)) {
		if (item.wordIds.includes(wordId)) result.push(item);
	}

	return result;
}

/**
 * Get the parents for an item
 */
export function getProgressPath({
	atlas = deckAtlas,
	id,
}: {
	atlas?: DeckAtlas;
	id: string;
}): Progression[] {
	const result: Progression[] = [];

	for (const chapter of atlas.chapters) {
		if (chapter.id === id) return [chapter];

		for (const place of chapter.places) {
			if (place.id === id) return [chapter, place];

			for (const deck of place.decks) {
				if (deck.id === id) return [chapter, place, deck];
			}
		}
	}

	return result;
}

/**
 * Check the item and its parents
 */
export function isProgressAccessible({
	atlas = deckAtlas,
	id,
	progressById,
}: {
	atlas?: DeckAtlas;
	id: string;
	progressById: ProgressById;
}): boolean {
	const path = getProgressPath({ atlas, id });
	let result = path.length > 0;

	for (const item of path) {
		if (!isUnlocked({
			requirements: item.unlockRequirements,
			progressById,
		})) {
			result = false;
			break;
		}
	}

	return result;
}

/**
 * Make sure progression data is valid
 */
export function validateProgression(atlas: DeckAtlas = deckAtlas): void {
	const items = getProgressItems(atlas);
	const itemById: Record<string, ProgressItem> = {};

	for (const item of items) {
		if (itemById[item.id]) {
			throw new Error(`Duplicate progression ID: ${item.id}`);
		}

		itemById[item.id] = item;
	}

	for (const item of items) {
		for (const requirement of item.unlockRequirements ?? []) {
			if (!itemById[requirement.id]) {
				throw new Error(
					`Unknown unlock requirement ${requirement.id} on ${item.id}`,
				);
			}

			if (requirement.id === item.id) {
				throw new Error(`${item.id} cannot require itself`);
			}

			if (
				requirement.requiredCompletionPercentage < 0 ||
				requirement.requiredCompletionPercentage > 100
			) {
				throw new Error(
					`Invalid unlock percentage on ${item.id}: ${requirement.requiredCompletionPercentage}`,
				);
			}
		}
	}
}

/**
 * Find a chapter
 */
export function findChapterById(
	id: string | undefined,
	atlas: DeckAtlas = deckAtlas,
): DeckChapter | undefined {
	for (const chapter of atlas.chapters) {
		if (chapter.id === id) return chapter;
	}
}

/**
 * Find a place
 */
export function findPlaceById(
	id: string | undefined,
	atlas: DeckAtlas = deckAtlas,
): DeckPlace | undefined {
	for (const chapter of atlas.chapters) {
		for (const place of chapter.places) {
			if (place.id === id) return place;
		}
	}
}

/**
 * Get a progress item's name
 */
export function getProgressName(
	id: string,
	atlas: DeckAtlas = deckAtlas,
): string {
	for (const chapter of atlas.chapters) {
		if (chapter.id === id) return chapter.name;

		for (const place of chapter.places) {
			if (place.id === id) return place.name;

			for (const deck of place.decks) {
				if (deck.id === id) return deck.title;
			}
		}
	}

	return id;
}

/**
 * Get the unlock message
 */
export function getUnlockCriteria(
	item: Progression,
	atlas: DeckAtlas = deckAtlas,
): string {
	let result = '';
	const requirements = item.unlockRequirements ?? [];

	for (let index = 0; index < requirements.length; index++) {
		const requirement = requirements[index];
		const separator = index === 0 ? '' : '\n';

		result += `${separator}Reach ${requirement.requiredCompletionPercentage}% in ${getProgressName(requirement.id, atlas)} to unlock.`;
	}

	return result;
}
