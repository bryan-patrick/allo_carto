import { getDB, logThisIfItFails } from '../connection';

export default async function seedLocalUser(): Promise<void> {
	const database = await getDB();

	/**
	 * Create a local user
	 * isMonHomme just means local user
	 */
	await logThisIfItFails('Oops we messed up mon homme', async () => {
		await database.runAsync(
			`
			INSERT OR IGNORE INTO users (
				id,
				name,
				isMonHomme
			)
			VALUES (?, ?, ?);
			`,
			['monhomme', 'Mon Homme', 1],
		);
	});
}
