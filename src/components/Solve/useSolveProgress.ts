import { useUserProgress } from '@/src/db/useUserProgress';
import {
	findParagraphById,
	getChapterSolveUnlockLevel,
	isItemUnlocked,
} from '@/src/util/atlasCompletion';
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
	hasStartedCurrentStage: boolean;
}

/**
 * Finds the paragraph's next puzzle and reports whether it is unlocked or already started.
 */
export function useSolveProgress(deckId: string): SolveProgress {
	const { progressById, experience } = useUserProgress();
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
			hasStartedCurrentStage: false,
			isEligible: false,
			lockReason: 'completed',
			requiredPlayerLevel: 0,
		};
	}

	eligibility = getSolveStageEligibility({
		stage: nextStage,
		chapterUnlockLevel: getChapterSolveUnlockLevel(deckId, nextStage),
		completedStages,
		playerLevel: experience.level,
		isParagraphUnlocked,
		wordCount: deck?.wordIds.length ?? 0,
		seenWordCount: progress?.seenWordCount ?? 0,
	});

	return {
		...eligibility,
		completedStages,
		nextStage,
		definition: solveStages[nextStage],
		hasStartedCurrentStage: progress?.startedSolveStages?.includes(nextStage) ?? false,
		unlockMessage: getSolveUnlockMessage({
			stage: nextStage,
			eligibility,
			wordCount: deck?.wordIds.length ?? 0,
			seenWordCount: progress?.seenWordCount ?? 0,
		}),
	};
}
