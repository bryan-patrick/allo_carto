import createTables from './schema/createTables';
import seedLocalUser from './seeders/seedLocalUser';
import seedWords from './seeders/seedWords';
import { validateCollectionAtlas } from '@/src/util/vocabularyCollections';

/**
 * Expo does the heavy lifting here for us.
 * This includes where the DB is stored and
 * init functions.
 *
 * Note we added "expo-sqlite" in package.json.
 * Also, expo comes with some cool SQLite expo TS features.
 * https://docs.expo.dev/versions/latest/sdk/sqlite/
 *
 * SQLite syntax
 * https://www.sqlite.org/lang.html
 *
 * Our DB dir is for our own seeders and queries/interface.
 */
export default async function getTables(): Promise<void> {
	try {
		validateCollectionAtlas();
		await createTables();
		await seedWords();
		await seedLocalUser();
	} catch (error) {
		console.error('Failed to create tables.', error);
		throw error;
	}
}
