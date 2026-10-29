import { getDB } from './connection';
import getTables from './getTables';

/**
 * Resets local app data so development can start from a clean save.
 * Clears saved progress, Ink, and puzzle arrangements, then reloads the starting data, everything.
 */
export default async function resetDB(): Promise<void> {
	const database = await getDB();

	await database.execAsync(`
		DROP TABLE IF EXISTS collectionRewardClaims;
		DROP TABLE IF EXISTS solveWordOrderDrafts;
		DROP TABLE IF EXISTS solveStageAttempts;
		DROP TABLE IF EXISTS solveStagePositions;
		DROP TABLE IF EXISTS solveStageUnlocks;
		DROP TABLE IF EXISTS solveAttempts;
		DROP TABLE IF EXISTS solveCompletions;
		DROP TABLE IF EXISTS solveUnlocks;
		DROP TABLE IF EXISTS solvePositions;
		DROP TABLE IF EXISTS flashcardAwards;
		DROP TABLE IF EXISTS userInk;
		DROP TABLE IF EXISTS deckPassageFeedback;
		DROP TABLE IF EXISTS deckCompletions;
		DROP TABLE IF EXISTS userProgress;
		DROP TABLE IF EXISTS userWords;
		DROP TABLE IF EXISTS users;
		DROP TABLE IF EXISTS words;
	`);

	await getTables();
}
