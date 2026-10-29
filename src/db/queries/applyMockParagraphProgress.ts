import { getDecks } from '@/data/french/storyAtlas';
import { seedWords } from '@/data/french/words';
import type { CardDeck, Word } from '@/src/components/CardDeck/cardDeckTypes';
import { isMockParagraphPreset } from '@/src/settings/mockParagraphProgress';
import { hasParagraphContent } from '@/src/util/atlasContent';
import { getSolvePassage } from '@/src/util/getSolvePassage';
import { getCompletionPercentage } from '@/src/util/progression';
import type { CompletedSolveStages, SolveStage } from '@/src/util/solveProgression';
import { getSolveSentences, type SolveSentenceWord } from '@/src/util/solveSentences';
import { getWordOrderCards } from '@/src/util/solveWordOrder';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserProgress from './getUserProgress';
import updateUserProgress from './updateUserProgress';

interface ApplyMockParagraphProgressOptions {
	database: SQLiteDatabase;
	userId: string;
	completedStages: CompletedSolveStages;
}

interface MockSolveAnswer {
	stage: SolveStage;
	position: number;
	wordId: string | null;
	acceptedAnswer: string;
}

interface GetMockSolveAnswersOptions {
	paragraph: CardDeck;
	completedStages: CompletedSolveStages;
	vocabularyById: Map<string, Word>;
	sentenceWords: SolveSentenceWord[];
}

const statements = {
	markWordSeen: `
		INSERT INTO userWords (userId, wordId, seenCount)
		VALUES (?, ?, 1)
		ON CONFLICT(userId, wordId)
		DO UPDATE SET seenCount = MAX(seenCount, 1);
	`,
	markFlashcardsStarted: `
		INSERT INTO userProgress (userId, id, type, completionPercentage, hasStartedFlashcards)
		VALUES (?, ?, 'paragraph', 0, 1)
		ON CONFLICT(userId, id)
		DO UPDATE SET hasStartedFlashcards = 1;
	`,
	saveCompletion: `
		INSERT INTO solveCompletions (userId, deckId, completedAt, completedSolveStages)
		VALUES (?, ?, ?, ?);
	`,
	saveFirstStageAnswer: `
		INSERT INTO solvePositions (userId, deckId, position, wordId, acceptedAnswer)
		VALUES (?, ?, ?, ?, ?);
	`,
	saveLaterStageAnswer: `
		INSERT INTO solveStagePositions (userId, deckId, stage, position, wordId, acceptedAnswer)
		VALUES (?, ?, ?, ?, ?, ?);
	`,
	saveWordOrder: `
		INSERT INTO solveWordOrderDrafts (userId, deckId, positions)
		VALUES (?, ?, ?);
	`,
};

const clearSolveStatements = [
	'DELETE FROM solveStageAttempts WHERE userId = ?;',
	'DELETE FROM solveStagePositions WHERE userId = ?;',
	'DELETE FROM solveStageUnlocks WHERE userId = ?;',
	'DELETE FROM solveWordOrderDrafts WHERE userId = ?;',
	'DELETE FROM solveAttempts WHERE userId = ?;',
	'DELETE FROM solvePositions WHERE userId = ?;',
	'DELETE FROM solveUnlocks WHERE userId = ?;',
	'DELETE FROM solveCompletions WHERE userId = ?;',
];

/**
 * Builds solved word and sentence answers so mock gems match the paragraph's saved puzzles.
 */
function getMockSolveAnswers({
	paragraph,
	completedStages,
	vocabularyById,
	sentenceWords,
}: GetMockSolveAnswersOptions): MockSolveAnswer[] {
	const answers: MockSolveAnswer[] = [];
	const passage = getSolvePassage(paragraph.passage);

	if (completedStages === 0) {
		return answers;
	}

	for (const segment of passage) {
		const word = segment.wordId ? vocabularyById.get(segment.wordId) : undefined;

		if (segment.unlockExempt || !segment.wordId) {
			continue;
		}

		if (!word || !word.englishWords[0]) {
			throw new Error(`Could not find a mock answer for ${segment.text}.`);
		}

		answers.push({
			stage: 1,
			position: segment.position,
			wordId: word.id,
			acceptedAnswer: word.englishWords[0],
		});

		if (completedStages >= 2) {
			answers.push({
				stage: 2,
				position: segment.position,
				wordId: word.id,
				acceptedAnswer: word.frenchWord,
			});
		}
	}

	if (completedStages >= 4) {
		const sentences = getSolveSentences(paragraph, sentenceWords);

		for (const sentence of sentences) {
			const englishAnswer = sentence.englishText ?? paragraph.englishPassage?.trim();

			if (!englishAnswer) {
				throw new Error(`Paragraph ${paragraph.title} needs English text for this mock preset.`);
			}

			answers.push({
				stage: 4,
				position: sentence.position,
				wordId: null,
				acceptedAnswer: englishAnswer,
			});

			if (completedStages === 5) {
				answers.push({
					stage: 5,
					position: sentence.position,
					wordId: null,
					acceptedAnswer: sentence.frenchText,
				});
			}
		}
	}

	return answers;
}

/**
 * Replaces the player's paragraph puzzle progress with a chosen mock state for debugging.
 */
export default async function applyMockParagraphProgress({
	database,
	userId,
	completedStages,
}: ApplyMockParagraphProgressOptions): Promise<number> {
	const allParagraphs = getDecks();
	const paragraphs = allParagraphs.filter(hasParagraphContent);
	const vocabularyById = new Map<string, Word>();
	const sentenceWords: SolveSentenceWord[] = [];
	const paragraphWordIds = new Set<string>();
	const completedAt = Date.now();

	if (!isMockParagraphPreset(completedStages)) {
		throw new Error('Choose a supported mock paragraph state.');
	}

	if (paragraphs.length === 0) {
		throw new Error('There are no paragraphs available for this mock preset.');
	}

	for (const word of seedWords) {
		vocabularyById.set(word.id, word);
		sentenceWords.push({
			id: word.id,
			englishWords: word.englishWords,
			partOfSpeech: word.partOfSpeech ?? null,
		});
	}

	for (const paragraph of paragraphs) {
		for (const wordId of paragraph.wordIds) {
			paragraphWordIds.add(wordId);
		}
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		for (const statement of clearSolveStatements) {
			await transaction.runAsync(statement, userId);
		}

		for (const wordId of paragraphWordIds) {
			await transaction.runAsync(statements.markWordSeen, userId, wordId);
		}

		for (const paragraph of paragraphs) {
			const answers = getMockSolveAnswers({
				paragraph,
				completedStages,
				vocabularyById,
				sentenceWords,
			});
			const wordOrderCards = getWordOrderCards(paragraph);
			const wordOrderPositions = wordOrderCards.map(card => card.id);
			const savedWordOrder = JSON.stringify(wordOrderPositions);

			await transaction.runAsync(statements.markFlashcardsStarted, userId, paragraph.id);

			if (completedStages > 0) {
				await transaction.runAsync(
					statements.saveCompletion,
					userId,
					paragraph.id,
					completedAt,
					completedStages,
				);
			}

			for (const answer of answers) {
				if (answer.stage === 1) {
					await transaction.runAsync(
						statements.saveFirstStageAnswer,
						userId,
						paragraph.id,
						answer.position,
						answer.wordId,
						answer.acceptedAnswer,
					);
				} else {
					await transaction.runAsync(
						statements.saveLaterStageAnswer,
						userId,
						paragraph.id,
						answer.stage,
						answer.position,
						answer.wordId,
						answer.acceptedAnswer,
					);
				}
			}

			if (completedStages >= 3) {
				await transaction.runAsync(statements.saveWordOrder, userId, paragraph.id, savedWordOrder);
			}
		}

		const progressById = await getUserProgress({
			database: transaction,
			userId,
		});

		for (const progress of Object.values(progressById)) {
			if (progress.wordProgressCounts) {
				const completionPercentage = getCompletionPercentage({
					wordCount: progress.wordCount ?? 0,
					wordProgressCounts: progress.wordProgressCounts,
				});

				await updateUserProgress({
					database: transaction,
					userId,
					id: progress.id,
					type: progress.type,
					completionPercentage,
				});
			}
		}
	});

	return paragraphs.length;
}
