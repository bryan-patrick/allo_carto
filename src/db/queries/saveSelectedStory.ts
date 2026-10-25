import { getDB } from '../connection';

interface SaveSelectedStoryProps {
	userId: string;
	storyId: string;
}

/**
 * Save currently selected story to the db.
 * We do this so that when we reopen or whatever then
 * we come back to the story we were on.
 */
export default async function saveSelectedStory({ userId, storyId }: SaveSelectedStoryProps) {
	const database = await getDB();
	const result = await database.runAsync(
		'UPDATE users SET selectedStoryId = ? WHERE id = ?;',
		storyId,
		userId,
	);

	if (result.changes !== 1) {
		throw new Error('Could not save the selected story.');
	}
}
