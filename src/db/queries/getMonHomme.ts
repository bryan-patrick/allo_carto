import { getDB } from '../interface';

/**
 * Typing
 */
export interface UserRow {
	id: string;
	name: string | null;
	isMonHomme: number;
}

/**
 * Gets the local user
 */
export default async function getMonHomme() {
	const database = await getDB();

	return await database.getFirstAsync<UserRow | null>(
		`
		SELECT
			id,
			name,
			isMonHomme
		FROM users
		WHERE isMonHomme = 1
		LIMIT 1;
		`,
	);
}
