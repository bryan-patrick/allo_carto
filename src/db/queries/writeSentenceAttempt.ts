import type { SentenceAttemptRequest, SolveAttemptResult } from '@/src/components/Solve/solveTypes';
import { solveStages } from '@/src/util/solveProgression';
import { checkFrenchSentenceAnswer, checkSentenceAnswer } from '@/src/util/solveSentenceAnswer';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveSentencePuzzle from './getSolveSentencePuzzle';
import { getSolveRewards, saveSolveGemReward } from './solveRewards';

/*
 * Typings
 */
interface WriteSentenceAttemptOptions extends SentenceAttemptRequest {
	database: SQLiteDatabase;
	userId: string;
	fastSolveUnlocks: boolean;
}

interface SentenceReceiptRow {
	deckId: string;
	stage: number;
	position: number;
	answer: string | null;
	status: SolveAttemptResult['status'];
	acceptedAnswer: string | null;
	inkSpent: number;
	stageCompleted: number;
}

/*
 * Charge for a sentence answer and prepare a gem claim after every sentence is solved.
 */
export default async function writeSentenceAttempt({
	database,
	userId,
	deckId,
	stage = 4,
	position,
	answer,
	attemptId,
	fastSolveUnlocks,
}: WriteSentenceAttemptOptions): Promise<SolveAttemptResult> {
	const statements = {
		getReceipt: `
			SELECT deckId, stage, position, answer, status, acceptedAnswer, inkSpent, stageCompleted
			FROM solveStageAttempts WHERE userId = ? AND attemptId = ?
			UNION ALL
			SELECT deckId, 1 AS stage, position, NULL AS answer, status, acceptedAnswer,
				inkSpent, 0 AS stageCompleted
			FROM solveAttempts WHERE userId = ? AND attemptId = ?;
		`,
		spendInk: `
			UPDATE userInk SET balance = balance - ?
			WHERE userId = ? AND balance >= ?;
		`,
		saveAnswer: `
			INSERT INTO solveStagePositions (userId, deckId, stage, position, acceptedAnswer)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(userId, deckId, stage, position)
			DO UPDATE SET acceptedAnswer = excluded.acceptedAnswer;
		`,
		saveReceipt: `
			INSERT INTO solveStageAttempts (
				userId, attemptId, deckId, stage, position, answer,
				status, acceptedAnswer, inkSpent, stageCompleted
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
	};
	const inkCost = solveStages[stage].attemptInkCost;
	let result: SolveAttemptResult = {
		status: 'unavailable',
		acceptedAnswer: null,
		inkSpent: 0,
		firstGemEarned: false,
		stageCompleted: false,
	};

	if (!attemptId || inkCost === null) {
		throw new Error('The sentence submission needs an ID and an Ink price.');
	}

	await database.withExclusiveTransactionAsync(async transaction => {
		const receipt = await transaction.getFirstAsync<SentenceReceiptRow>(
			statements.getReceipt,
			userId,
			attemptId,
			userId,
			attemptId,
		);

		if (receipt) {
			if (
				receipt.stage !== stage ||
				receipt.deckId !== deckId ||
				receipt.position !== position ||
				receipt.answer !== answer
			) {
				throw new Error('This submission ID was already used for another answer.');
			}

			const rewards = await getSolveRewards({
				database: transaction,
				userId,
				deckId,
				stage,
			});

			result = {
				status: receipt.status,
				acceptedAnswer: receipt.acceptedAnswer,
				inkSpent: receipt.inkSpent,
				firstGemEarned: false,
				stageCompleted: Boolean(receipt.stageCompleted),
				rewards,
			};
			return;
		}

		const puzzle = await getSolveSentencePuzzle({
			database: transaction,
			userId,
			deckId,
			stage,
			fastSolveUnlocks,
		});
		const sentence = puzzle.sentences.find(sentence => sentence.position === position);
		const remainingSentences = puzzle.sentences.filter(sentence => {
			return sentence.position !== position && sentence.acceptedAnswer === null;
		});

		if (!puzzle.isUnlocked || !sentence) {
			return;
		}

		if (sentence.acceptedAnswer !== null) {
			result.status = 'alreadySolved';
			result.acceptedAnswer = sentence.acceptedAnswer;
			result.rewards = puzzle.rewards;
			return;
		}

		if (!puzzle.isEligible) {
			return;
		}

		const checkAnswer = stage === 5 ? checkFrenchSentenceAnswer : checkSentenceAnswer;
		const checkedAnswer = checkAnswer({
			answer,
			sentence,
		});

		if (checkedAnswer.status === 'empty') {
			result.status = 'empty';
			return;
		}

		const charge = await transaction.runAsync(statements.spendInk, inkCost, userId, inkCost);

		if (charge.changes !== 1) {
			result.status = 'notEnoughInk';
			return;
		}

		if (checkedAnswer.acceptedAnswer !== null) {
			await transaction.runAsync(
				statements.saveAnswer,
				userId,
				deckId,
				stage,
				position,
				checkedAnswer.acceptedAnswer,
			);

			if (remainingSentences.length === 0) {
				await saveSolveGemReward({
					database: transaction,
					userId,
					deckId,
					stage,
				});
			}
		}

		await transaction.runAsync(
			statements.saveReceipt,
			userId,
			attemptId,
			deckId,
			stage,
			position,
			answer,
			checkedAnswer.status,
			checkedAnswer.acceptedAnswer,
			inkCost,
			0,
		);

		const rewards = await getSolveRewards({
			database: transaction,
			userId,
			deckId,
			stage,
		});

		result = {
			...checkedAnswer,
			inkSpent: inkCost,
			firstGemEarned: false,
			stageCompleted: false,
			rewards,
		};
	});

	return result;
}
