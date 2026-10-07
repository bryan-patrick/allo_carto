import type { CardRarity, CEFR } from '@/src/components/CardDeck/cardDeckTypes';

export const correctAnswerXPByRarity: Record<CardRarity, number> = {
	Common: 10,
	Rare: 15,
	Epic: 20,
	Legendary: 50,
};

/**
 * Each higher language level doubles the XP
 */
export const correctAnswerXPMultiplierByCEFR: Record<CEFR, number> = {
	A1: 1,
	A2: 2,
	B1: 4,
	B2: 8,
	C1: 16,
	C2: 32,
};

export const userExperienceConfig = {
	learningLevelBonusMultiplier: 3,
	deckCompletionXP: 50,
	firstDeckCompletionXP: 15,
	perfectDeckXP: 50,
};

interface UserLevelDefinition {
	level: number;
	toNext: number | null;
}

/**
 * XP required to advance from each level. The capped level has no requirement.
 */
export const userLevels: readonly UserLevelDefinition[] = [
	{ level: 1, toNext: 400 },
	{ level: 2, toNext: 900 },
	{ level: 3, toNext: 1400 },
	{ level: 4, toNext: 2100 },
	{ level: 5, toNext: 2800 },
	{ level: 6, toNext: 3600 },
	{ level: 7, toNext: 4500 },
	{ level: 8, toNext: 5400 },
	{ level: 9, toNext: 6500 },
	{ level: 10, toNext: 7600 },
	{ level: 11, toNext: 8800 },
	{ level: 12, toNext: 10100 },
	{ level: 13, toNext: 11400 },
	{ level: 14, toNext: 12900 },
	{ level: 15, toNext: 14400 },
	{ level: 16, toNext: 16000 },
	{ level: 17, toNext: 17700 },
	{ level: 18, toNext: 19400 },
	{ level: 19, toNext: 21300 },
	{ level: 20, toNext: 23200 },
	{ level: 21, toNext: 25200 },
	{ level: 22, toNext: 27300 },
	{ level: 23, toNext: 29400 },
	{ level: 24, toNext: 31700 },
	{ level: 25, toNext: 34000 },
	{ level: 26, toNext: 36400 },
	{ level: 27, toNext: 38900 },
	{ level: 28, toNext: 41400 },
	{ level: 29, toNext: 44300 },
	{ level: 30, toNext: null },
];

/**
 * I think the only exception to types not going at the top
 */
export interface UserExperience {
	totalXP: number;
	level: number;
	isMaxLevel: boolean;
	xpIntoLevel: number;
	xpForNextLevel: number;
	progressPercentage: number;
}

/**
 * Look up the player's level using the XP table.
 */
export function getUserExperience(totalXP: number): UserExperience {
	let levelIndex = 0;
	let currentLevel = userLevels[levelIndex];
	let xpIntoLevel = totalXP;

	while (currentLevel.toNext !== null && xpIntoLevel >= currentLevel.toNext) {
		xpIntoLevel -= currentLevel.toNext;
		levelIndex += 1;
		currentLevel = userLevels[levelIndex];
	}

	if (currentLevel.toNext === null) {
		return {
			totalXP,
			level: currentLevel.level,
			isMaxLevel: true,
			xpIntoLevel: 0,
			xpForNextLevel: 0,
			progressPercentage: 100,
		};
	}

	const xpForNextLevel = currentLevel.toNext;

	return {
		totalXP,
		level: currentLevel.level,
		isMaxLevel: false,
		xpIntoLevel,
		xpForNextLevel,
		progressPercentage: (xpIntoLevel / xpForNextLevel) * 100,
	};
}
