import { getUserExperience as getUserXP, type UserExperience } from '@/src/util/userExperience';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Typing
 */
interface LoadUserXPType {
	database: SQLiteDatabase;
	userId: string;
}

/**
 * Get user XP and calculate the current player level
 */
export default async function loadUserXP({
	database,
	userId,
}: LoadUserXPType): Promise<UserExperience> {
	const user = await database.getFirstAsync<{ totalXP: number }>(
		'SELECT totalXP FROM users WHERE id = ?;',
		userId,
	);

	if (!user) {
		throw new Error(`Could not load XP for user ${userId}.`);
	}

	return getUserXP(user.totalXP);
}
