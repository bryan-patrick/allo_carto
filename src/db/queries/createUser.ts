import { getDB, getTables } from '../interface';

/**
 * Typing
 */
interface CreateUserProps {
	id: string;
	name?: string;
	isMonHomme?: number;
}

/**
 * Creates a new row on the users table
 */
export async function createUser({
	id,
	name = '',
	isMonHomme = 1,
}: CreateUserProps) {
	await getTables();

	const database = await getDB();

	await database.runAsync(
		`
		INSERT OR IGNORE INTO users (
			id,
			name,
			isMonHomme
		)
		VALUES (?, ?, ?);
		`,
		[id, name, isMonHomme],
	);
}
