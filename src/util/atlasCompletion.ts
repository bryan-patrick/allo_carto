import type { DeckAtlas, DeckChapter, DeckPlace } from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { ProgressById, Progression, ProgressType } from './progression';

/**
 * Typing
 */
interface AtlasCompletionItem {
	id: string;
	type: ProgressType;
	wordIds: string[];
}

interface GetAtlasItemsContainingWordProps {
	atlas?: DeckAtlas;
	wordId: string;
}

interface FindCompletionPathProps {
	atlas?: DeckAtlas;
	id: string;
}

interface IsItemUnlockedProps extends FindCompletionPathProps {
	progressById: ProgressById;
}

/**
 * Get the unique word ids from a group of decks.
 */
function getUniqueWordIds(decks: CardDeck[]): string[] {
	const uniqueWordIds = new Set<string>();

	for (const deck of decks) {
		for (const wordId of deck.wordIds) {
			uniqueWordIds.add(wordId);
		}
	}

	return Array.from(uniqueWordIds);
}

/**
 * Get every deck from every place in a chapter.
 */
function getChapterDecks(chapter: DeckChapter): CardDeck[] {
	const chapterDecks: CardDeck[] = [];

	for (const place of chapter.places) {
		chapterDecks.push(...place.decks);
	}

	return chapterDecks;
}

/**
 * Get every chapter, place, and deck with the words used to calculate its completion.
 */
export function getAtlasCompletionItems(atlas: DeckAtlas = deckAtlas): AtlasCompletionItem[] {
	const completionItems: AtlasCompletionItem[] = [];

	for (const chapter of atlas.chapters) {
		completionItems.push({
			id: chapter.id,
			type: 'chapter',
			wordIds: getUniqueWordIds(getChapterDecks(chapter)),
		});

		for (const place of chapter.places) {
			completionItems.push({
				id: place.id,
				type: 'place',
				wordIds: getUniqueWordIds(place.decks),
			});

			for (const deck of place.decks) {
				completionItems.push({
					id: deck.id,
					type: 'deck',
					wordIds: getUniqueWordIds([deck]),
				});
			}
		}
	}

	return completionItems;
}

/**
 * Get every chapter, place, and deck that contains a word.
 */
export function getAtlasItemsContainingWord({
	atlas = deckAtlas,
	wordId,
}: GetAtlasItemsContainingWordProps): AtlasCompletionItem[] {
	const matchingItems: AtlasCompletionItem[] = [];

	for (const completionItem of getAtlasCompletionItems(atlas)) {
		if (completionItem.wordIds.includes(wordId)) {
			matchingItems.push(completionItem);
		}
	}

	return matchingItems;
}

/**
 * Get the path from a chapter (top level) to an item (chapter/place/deck).
 *
 * A chapter returns [chapter], a place returns [chapter, place], and a deck returns [chapter, place, deck].
 */
function findCompletionPath({ atlas = deckAtlas, id }: FindCompletionPathProps): Progression[] {
	for (const chapter of atlas.chapters) {
		if (chapter.id === id) return [chapter];

		for (const place of chapter.places) {
			if (place.id === id) return [chapter, place];

			for (const deck of place.decks) {
				if (deck.id === id) return [chapter, place, deck];
			}
		}
	}

	return [];
}

/**
 * An item is only unlocked when it and all of its parents have met their unlock requirements.
 */
export function isItemUnlocked({
	atlas = deckAtlas,
	id,
	progressById,
}: IsItemUnlockedProps): boolean {
	const path = findCompletionPath({ atlas, id });

	if (path.length === 0) return false;

	for (const item of path) {
		for (const requirement of item.unlockRequirements ?? []) {
			const completionPercentage = progressById[requirement.id]?.completionPercentage ?? 0;

			if (completionPercentage < requirement.requiredCompletionPercentage) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Find a chapter by its progress id.
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
 * Find a place by its progress id.
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
 * Get the display name for any item.
 */
function getItemName(id: string, atlas: DeckAtlas = deckAtlas): string {
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
 * Build each UI explanation for unlocking an item.
 */
export function getUnlockCriteria(item: Progression, atlas: DeckAtlas = deckAtlas): string[] {
	const requirements = item.unlockRequirements ?? [];

	return requirements.map(requirement => {
		const required = getItemName(requirement.id, atlas);
		const percentage = requirement.requiredCompletionPercentage;

		return `Reach ${percentage}% in ${required} to unlock.`;
	});
}
