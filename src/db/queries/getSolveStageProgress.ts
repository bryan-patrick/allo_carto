import type {
	AdditionalSolveStage,
	SavedSolveStageProgress,
	SolveStageSolvedPosition,
	SolveStageUnlockedPosition,
} from '@/src/components/Solve/solveTypes';
import type { SQLiteDatabase } from 'expo-sqlite';

interface GetSolveStageProgressOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	stage: AdditionalSolveStage;
}

/**
 * Loads saved progress for a specific paragraph and Solve stage
 */
export default async function getSolveStageProgress({
	database,
	userId,
	deckId,
	stage,
}: GetSolveStageProgressOptions): Promise<SavedSolveStageProgress> {
	const statements = {
		getUnlocks: `
			SELECT position, wordId FROM solveStageUnlocks
			WHERE userId = ? AND deckId = ? AND stage = ? ORDER BY position;
		`,
		getAnswers: `
			SELECT position, wordId, acceptedAnswer FROM solveStagePositions
			WHERE userId = ? AND deckId = ? AND stage = ? ORDER BY position;
		`,
	};
	const unlockedPositions = await database.getAllAsync<SolveStageUnlockedPosition>(
		statements.getUnlocks,
		userId,
		deckId,
		stage,
	);
	const solvedPositions = await database.getAllAsync<SolveStageSolvedPosition>(
		statements.getAnswers,
		userId,
		deckId,
		stage,
	);

	return {
		stage,
		unlockedPositions,
		solvedPositions,
	};
}
