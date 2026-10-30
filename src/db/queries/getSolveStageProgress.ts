import type {
	AdditionalSolveStage,
	SavedSolveStageProgress,
	SolveStageSolvedPosition,
} from '@/src/components/Solve/solveTypes';
import type { SQLiteDatabase } from 'expo-sqlite';

interface GetSolveStageProgressOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	stage: AdditionalSolveStage;
}

/*
 * Loads saved progress for a specific paragraph and Solve stage
 */
export default async function getSolveStageProgress({
	database,
	userId,
	deckId,
	stage,
}: GetSolveStageProgressOptions): Promise<SavedSolveStageProgress> {
	const getAnswersStatement = `
		SELECT position, wordId, acceptedAnswer FROM solveStagePositions
		WHERE userId = ? AND deckId = ? AND stage = ? ORDER BY position;
	`;
	const solvedPositions = await database.getAllAsync<SolveStageSolvedPosition>(
		getAnswersStatement,
		userId,
		deckId,
		stage,
	);

	return {
		stage,
		solvedPositions,
	};
}
