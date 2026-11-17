import Storage from 'expo-sqlite/kv-store';

/**
 * Typing
 */
interface ChapterSelection {
	userId: string;
	chapterId: string;
}

interface ParagraphSelection extends ChapterSelection {
	paragraphId: string;
}

/**
 * Builds the key for a player's selected paragraph in one chapter.
 */
function getSelectedParagraphKey({ userId, chapterId }: ChapterSelection): string {
	return `allo_carto.selectedParagraph.${userId}.${chapterId}`;
}

/**
 * Loads the paragraph the player last selected in a chapter.
 */
export function readSelectedParagraph(selection: ChapterSelection): string | null {
	if (!selection.userId) {
		return null;
	}

	try {
		return Storage.getItemSync(getSelectedParagraphKey(selection));
	} catch (error) {
		console.error('Could not load the selected paragraph:', error);
		return null;
	}
}

/**
 * Saves the selected paragraph so the chapter opens there next time.
 */
export function saveSelectedParagraph(selection: ParagraphSelection): void {
	if (!selection.userId) {
		return;
	}

	try {
		Storage.setItemSync(getSelectedParagraphKey(selection), selection.paragraphId);
	} catch (error) {
		console.error('Could not save the selected paragraph:', error);
	}
}
