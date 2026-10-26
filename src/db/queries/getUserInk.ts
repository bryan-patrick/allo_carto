import type { SQLiteDatabase } from 'expo-sqlite';

interface GetUserInkOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface UserInkRow {
	inkBalance: number;
}

/**
 * Loads the user's ink! Ink is used to solve our paragraph puzzles
 */
export default async function getUserInk({ database, userId }: GetUserInkOptions): Promise<number> {
	const statement = `
		SELECT COALESCE(userInk.balance, 0) AS inkBalance
		FROM users
		LEFT JOIN userInk ON userInk.userId = users.id
		WHERE users.id = ?;
	`;

	const user = await database.getFirstAsync<UserInkRow>(statement, userId);

	if (!user) {
		throw new Error(`Could not load Ink for user ${userId}.`);
	}

	return user.inkBalance;
}
