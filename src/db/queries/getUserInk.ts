import { getMaxInkBalance } from '@/src/util/ink';
import { getUserExperience } from '@/src/util/userExperience';
import type { SQLiteDatabase } from 'expo-sqlite';

interface GetUserInkOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface UserInkRow {
	inkBalance: number;
	totalXP: number;
}

/*
 * Load the player's saved Ink and limit it to the space allowed by their level.
 */
export default async function getUserInk({ database, userId }: GetUserInkOptions): Promise<number> {
	const statement = `
		SELECT COALESCE(userInk.balance, 0) AS inkBalance, users.totalXP
		FROM users
		LEFT JOIN userInk ON userInk.userId = users.id
		WHERE users.id = ?;
	`;

	const user = await database.getFirstAsync<UserInkRow>(statement, userId);

	if (!user) {
		throw new Error(`Could not load Ink for user ${userId}.`);
	}

	const experience = getUserExperience(user.totalXP);
	const maxInkBalance = getMaxInkBalance(experience.level);

	return Math.min(user.inkBalance, maxInkBalance);
}
