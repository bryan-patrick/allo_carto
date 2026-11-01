import type { SolveSentencePuzzle } from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import { getSolvePassage } from '@/src/util/getSolvePassage';
import {
	getCompletedSolveStages,
	getSolveStageEligibility,
	type SolveSentenceStage,
} from '@/src/util/solveProgression';
import { getSolveSentences, type SolveSentenceWord } from '@/src/util/solveSentences';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveStageProgress from './getSolveStageProgress';
import loadUserXP from './getUserExperience';
import getUserProgress from './getUserProgress';
import { getSolveRewards } from './solveRewards';

interface GetSolveSentencePuzzleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	stage?: SolveSentenceStage;
	fastSolveUnlocks: boolean;
}

interface SentenceWordRow {
	id: string;
	englishWords: string;
	partOfSpeech: string | null;
}

/*
 * Load sentence prompts and saved answers for the chosen Solve stage.
 */
export default async function getSolveSentencePuzzle({
	database,
	userId,
	deckId,
	stage = 4,
	fastSolveUnlocks,
}: GetSolveSentencePuzzleOptions): Promise<SolveSentencePuzzle> {
	const deck = findParagraphById(deckId);
	let wordRows: SentenceWordRow[] = [];

	if (!deck) {
		throw new Error('This paragraph could not be found.');
	}

	const passage = getSolvePassage(deck.passage);
	const wordIds = getPassageWordIds(passage);
	const placeholders = wordIds.map(() => '?').join(',');
	const getWordsStatement = `
		SELECT id, englishWords, partOfSpeech FROM words
		WHERE id IN (${placeholders});
	`;
	const progressById = await getUserProgress({
		database,
		userId,
	});
	const experience = await loadUserXP({
		database,
		userId,
	});
	const savedStage = await getSolveStageProgress({
		database,
		userId,
		deckId,
		stage,
	});
	const englishStage =
		stage === 5 ?
			await getSolveStageProgress({
				database,
				userId,
				deckId,
				stage: 4,
			})
		:	null;
	const progress = progressById[deckId];
	const completedSolveStages = getCompletedSolveStages(progress);
	const isUnlocked = isItemUnlocked({
		id: deckId,
		progressById,
	});
	const eligibility = getSolveStageEligibility({
		stage,
		completedStages: completedSolveStages,
		playerLevel: experience.level,
		fastSolveUnlocks,
		isParagraphUnlocked: isUnlocked,
		wordCount: deck.wordIds.length,
		seenWordCount: progress?.seenWordCount ?? 0,
	});

	if (wordIds.length > 0) {
		wordRows = await database.getAllAsync<SentenceWordRow>(getWordsStatement, ...wordIds);
	}

	const words: SolveSentenceWord[] = wordRows.map(word => ({
		id: word.id,
		englishWords: JSON.parse(word.englishWords),
		partOfSpeech: word.partOfSpeech,
	}));
	const sentenceDefinitions = getSolveSentences(deck, words);
	const sentences = sentenceDefinitions.map(sentence => {
		const saved = savedStage.solvedPositions.find(
			position => position.position === sentence.position,
		);
		const savedEnglishAnswer = englishStage?.solvedPositions.find(
			position => position.position === sentence.position,
		);

		return {
			...sentence,
			englishText: sentence.englishText ?? savedEnglishAnswer?.acceptedAnswer ?? null,
			acceptedAnswer: saved?.acceptedAnswer ?? null,
		};
	});

	if (sentences.length === 0) {
		throw new Error('This paragraph has no sentences to solve.');
	}

	if (stage === 5 && eligibility.isEligible && sentences.some(sentence => !sentence.englishText)) {
		throw new Error('This paragraph needs matching English sentences before Solve++++ can open.');
	}

	const rewards = await getSolveRewards({
		database,
		userId,
		deckId,
		stage,
	});

	return {
		...eligibility,
		rewards,
		deck,
		isUnlocked,
		sentences,
		completedSolveStages,
	};
}
