import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import {
	getCompletedSolveStages,
	getNextSolveStage,
	getSolveStageEligibility,
	getSolveUnlockMessage,
	solveStages,
	type CompletedSolveStages,
	type SolveStage,
	type SolveStageDefinition,
	type SolveStageEligibility,
} from '@/src/util/solveProgression';

export interface SolveProgress extends SolveStageEligibility {
	completedStages: CompletedSolveStages;
	nextStage: SolveStage | null;
	definition: SolveStageDefinition | null;
	unlockMessage: string;
}

/**
 * This hook works out the next Solve stage for a
 * paragraph and whether the player can open it.
 *
 * It reads completed stages, player level, and Fast Solve Unlocks,
 * then returns the next stage’s label, required level, and any reason it’s locked.
 */
export function useSolveProgress(deckId: string): SolveProgress {
	const { progressById, experience } = useUserProgress();
	const { settings } = useAppSettings();
	const deck = findParagraphById(deckId);
	const progress = progressById[deckId];
	const completedStages = getCompletedSolveStages(progress);
	const nextStage = getNextSolveStage(completedStages);
	const isParagraphUnlocked = isItemUnlocked({
		id: deckId,
		progressById,
	});
	let eligibility: SolveStageEligibility;

	if (nextStage === null) {
		return {
			completedStages,
			nextStage,
			definition: null,
			unlockMessage: '',
			isEligible: false,
			lockReason: 'completed',
			requiredPlayerLevel: 0,
		};
	}

	eligibility = getSolveStageEligibility({
		stage: nextStage,
		completedStages,
		playerLevel: experience.level,
		fastSolveUnlocks: settings.fastSolveUnlocks,
		isParagraphUnlocked,
		wordCount: deck?.wordIds.length ?? 0,
		seenWordCount: progress?.seenWordCount ?? 0,
	});

	return {
		...eligibility,
		completedStages,
		nextStage,
		definition: solveStages[nextStage],
		unlockMessage: getSolveUnlockMessage({
			stage: nextStage,
			eligibility,
			wordCount: deck?.wordIds.length ?? 0,
			seenWordCount: progress?.seenWordCount ?? 0,
		}),
	};
}
