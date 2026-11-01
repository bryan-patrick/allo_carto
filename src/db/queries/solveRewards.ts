import type { CardRarity, CEFR } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	SolveReward,
	SolveRewardReceipt,
	SolveRewardRequest,
} from '@/src/components/Solve/solveTypes';
import type { ProgressById } from '@/src/util/progression';
import {
	solveStages,
	type CompletedSolveStages,
	type SolveStage,
} from '@/src/util/solveProgression';
import { getActivityItemLabel } from '@/src/util/userActivity';
import {
	correctAnswerXPByRarity,
	correctAnswerXPMultiplierByCEFR,
	userExperienceConfig,
} from '@/src/util/userExperience';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserProgress from './getUserProgress';
import { recordSolveProgressActivity, recordXPActivity, saveUserActivity } from './userActivity';

interface SolveRewardsOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	stage: SolveStage;
}

interface SaveSolveCardRewardOptions extends SolveRewardsOptions {
	position: number;
	wordId: string;
}

interface ClaimSolveRewardOptions extends SolveRewardRequest {
	database: SQLiteDatabase;
	userId: string;
}

interface RewardWordRow {
	rarity: CardRarity;
	CEFR: CEFR;
}

interface SolveCompletionRow {
	completedSolveStages: CompletedSolveStages;
}

const statements = {
	getRewards: `
		SELECT stage, kind, position, xp, claimedAt FROM solveRewards
		WHERE userId = ? AND deckId = ? AND stage = ?;
	`,
	getWord: 'SELECT rarity, CEFR FROM words WHERE id = ?;',
	saveReward: `
		INSERT INTO solveRewards (userId, deckId, stage, kind, position, xp)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(userId, deckId, stage, kind, position) DO NOTHING;
	`,
	getCompletion: `
		SELECT completedSolveStages FROM solveCompletions WHERE userId = ? AND deckId = ?;
	`,
	saveFirstGem: `
		INSERT INTO solveCompletions (userId, deckId, completedAt, completedSolveStages)
		VALUES (?, ?, ?, 1);
	`,
	saveNextGem: `
		UPDATE solveCompletions SET completedSolveStages = ?
		WHERE userId = ? AND deckId = ? AND completedSolveStages = ?;
	`,
	claimReward: `
		UPDATE solveRewards SET claimedAt = ?
		WHERE userId = ? AND deckId = ? AND stage = ? AND kind = ? AND position = ?
			AND claimedAt IS NULL;
	`,
	addXP: 'UPDATE users SET totalXP = totalXP + ? WHERE id = ?;',
};

// Load this puzzle's pending and claimed rewards when it is opened again.
export async function getSolveRewards({
	database,
	userId,
	deckId,
	stage,
}: SolveRewardsOptions): Promise<SolveReward[]> {
	return database.getAllAsync<SolveReward>(statements.getRewards, userId, deckId, stage);
}

// Save twice the word's usual flashcard XP for the player to claim after solving it.
export async function saveSolveCardReward({
	database,
	userId,
	deckId,
	stage,
	position,
	wordId,
}: SaveSolveCardRewardOptions): Promise<void> {
	const word = await database.getFirstAsync<RewardWordRow>(statements.getWord, wordId);

	if (!word) {
		throw new Error('Could not find the solved word for its XP reward.');
	}

	const rarityXP = correctAnswerXPByRarity[word.rarity];
	const languageMultiplier = correctAnswerXPMultiplierByCEFR[word.CEFR];
	const flashcardXP = rarityXP * languageMultiplier;
	const xp = flashcardXP * userExperienceConfig.solveCardXPMultiplier;

	await database.runAsync(statements.saveReward, userId, deckId, stage, 'card', position, xp);
}

// Save a gem reward when the puzzle is solved. Claiming it will reveal the gem.
export async function saveSolveGemReward({
	database,
	userId,
	deckId,
	stage,
}: SolveRewardsOptions): Promise<void> {
	const savedReward = await database.runAsync(
		statements.saveReward,
		userId,
		deckId,
		stage,
		'gem',
		0,
		userExperienceConfig.solveGemXP,
	);
	const paragraphLabel = getActivityItemLabel(deckId);
	const puzzleLabel = solveStages[stage].label;

	if (savedReward.changes === 1) {
		await saveUserActivity({
			database,
			userId,
			type: 'puzzleCompleted',
			description: `${puzzleLabel} · ${paragraphLabel}`,
		});
	}
}

/*
 * Pay a solved card's XP or reveal a finished puzzle's gem after the player claims it.
 * Save the reward and XP together so retrying a claim cannot pay it twice.
 */
export async function claimSolveReward({
	database,
	userId,
	deckId,
	stage,
	kind,
	position,
}: ClaimSolveRewardOptions): Promise<SolveRewardReceipt> {
	let receipt: SolveRewardReceipt = {
		status: 'notReady',
		reward: null,
	};

	await database.withExclusiveTransactionAsync(async transaction => {
		const rewards = await getSolveRewards({
			database: transaction,
			userId,
			deckId,
			stage,
		});
		const reward = rewards.find(saved => saved.kind === kind && saved.position === position);
		const claimedAt = Date.now();
		const paragraphLabel = getActivityItemLabel(deckId);
		const puzzleLabel = solveStages[stage].label;
		const rewardLabel = kind === 'card' ? `Card ${position + 1}` : 'Gem reward';
		let previousProgress: ProgressById | undefined;

		if (!reward) {
			return;
		}

		if (reward.claimedAt !== null) {
			receipt = {
				status: 'alreadyClaimed',
				reward,
			};
			return;
		}

		if (kind === 'gem') {
			const hasPendingCards = rewards.some(
				saved => saved.kind === 'card' && saved.claimedAt === null,
			);
			const completion = await transaction.getFirstAsync<SolveCompletionRow>(
				statements.getCompletion,
				userId,
				deckId,
			);
			const completedStages = completion?.completedSolveStages ?? 0;

			if (hasPendingCards || completedStages !== stage - 1) {
				return;
			}

			previousProgress = await getUserProgress({
				database: transaction,
				userId,
			});

			if (stage === 1) {
				await transaction.runAsync(statements.saveFirstGem, userId, deckId, claimedAt);
			} else {
				const gem = await transaction.runAsync(
					statements.saveNextGem,
					stage,
					userId,
					deckId,
					stage - 1,
				);

				if (gem.changes !== 1) {
					throw new Error('Could not save the claimed gem.');
				}
			}
		}

		const claim = await transaction.runAsync(
			statements.claimReward,
			claimedAt,
			userId,
			deckId,
			stage,
			kind,
			position,
		);
		const award = await transaction.runAsync(statements.addXP, reward.xp, userId);

		if (claim.changes !== 1 || award.changes !== 1) {
			throw new Error('Could not save the claimed puzzle XP.');
		}

		await recordXPActivity({
			database: transaction,
			userId,
			xp: reward.xp,
			source: `${puzzleLabel} · ${rewardLabel} · ${paragraphLabel}`,
			isClaim: true,
		});

		if (previousProgress) {
			await recordSolveProgressActivity({
				database: transaction,
				userId,
				previousProgress,
			});
		}

		receipt = {
			status: 'claimed',
			reward: {
				...reward,
				claimedAt,
			},
		};
	});

	return receipt;
}
