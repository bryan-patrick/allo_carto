import { getDB } from '../connection';
import { runDatabaseTransaction } from '../runDatabaseTransaction';

interface SaveSelectedStoryProps {
	userId: string;
	storyId: string;
}

/*
 * Save currently selected story to the db.
 * We do this so that when we reopen or whatever then
 * we come back to the story we were on.
 */
export default async function saveSelectedStory({ userId, storyId }: SaveSelectedStoryProps) {
	const database = await getDB();
	const statement = 'UPDATE users SET selectedStoryId = ? WHERE id = ?;';

	await runDatabaseTransaction(database, async function saveStory(transaction) {
		const result = await transaction.runAsync(statement, storyId, userId);

		if (result.changes !== 1) {
			throw new Error('Could not save the selected story.');
		}
	});
}
