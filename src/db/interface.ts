import { CardDeck } from '@/data/french/decks/deckTyps';
import { seedWords } from '@/data/french/words';
import * as SQLite from 'expo-sqlite';
import { CardRarity, CEFR, Word } from '../components/CardDeck/cardDeckTypes';
import shuffleArray from '../util/shuffleArray';

/**
 * Typing
 */
interface WordRow {
	id: string;
	frenchWord: string;
	englishWords: string;
	frenchArticle?: string;
	englishArticle?: string;
	pronunciation: string;
	isVulgar: number; // SQL Boolean
	CEFR: CEFR;
	lemmaId?: string;
	tense?: string;
	gender?: Word['gender'];
	partOfSpeech?: string;
	userScore: number;
	rarity?: CardRarity;
}

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
let db: SQLite.SQLiteDatabase | null = null;
let tablesReady = false;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
	try {
		if (db) {
			return db;
		}

		db = await SQLite.openDatabaseAsync('allo_carto.db');

		if (!db) {
			throw new Error('DB not found, SQLite.openDatabaseAsync failed.');
		}

		return db;
	} catch (e) {
		console.error('Failed to init db:', e);
		throw e;
	}
}

/**
 * Check if are tables exist and are seeded.
 * If not, call the seeder
 */
export async function getTables() {
	try {
		if (tablesReady) {
			return;
		}

		const database = await getDB();

		/**
		 * Check/Create word table
		 */
		await database.execAsync(`
				CREATE TABLE IF NOT EXISTS words (
					id TEXT PRIMARY KEY,
					frenchWord TEXT NOT NULL,
					englishWords TEXT NOT NULL,
					frenchArticle TEXT,
					englishArticle TEXT,
					pronunciation TEXT NOT NULL,
					isVulgar INTEGER NOT NULL,
					CEFR TEXT NOT NULL,
					lemmaId TEXT,
					tense TEXT,
					gender TEXT,
					partOfSpeech TEXT,
					userScore INTEGER NOT NULL,
					rarity TEXT
				);
			`);

		for (const word of seedWords) {
			await database.runAsync(
				`
					INSERT OR IGNORE INTO words (
						id,
						frenchWord,
						englishWords,
						frenchArticle,
						englishArticle,
						pronunciation,
						isVulgar,
						CEFR,
						lemmaId,
						tense,
						gender,
						partOfSpeech,
						userScore,
						rarity
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`,
				[
					word.id,
					word.frenchWord,
					JSON.stringify(word.englishWords),
					word.frenchArticle ?? null,
					word.englishArticle ?? null,
					word.pronunciation,
					word.isVulgar ? 1 : 0,
					word.CEFR,
					word.lemmaId ?? null,
					word.tense ?? null,
					word.gender ?? null,
					word.partOfSpeech ?? null,
					word.userScore,
					word.rarity ?? null,
				],
			);
		}

		tablesReady = true;
	} catch (error) {
		console.error('Failed to create tables.', error);
	}
}

/**
 * Delete the sqlite DB for testing
 * (It's safe, we have seeders)
 */
export async function deleteDB() {
	try {
		await SQLite.deleteDatabaseAsync('allo_carto.db');
	} catch (error) {
		console.error('Could not delete the allo_carto.db:', error);
	}
}

/**
 * Get a deck
 *
 * TODO:
 * Need to shuffle
 * Need to include lemma's that are unique
 * Need to limit amount
 */
export async function getDeck(
	deck: CardDeck,
	amount: number = 8,
): Promise<CardDeck | undefined> {
	const quests: string = deck.wordIds.map(() => '?').join(',');

	try {
		await getTables();
		const database = await getDB();
		const rows = await database.getAllAsync<WordRow>(
			`
			SELECT *
			FROM words
			WHERE id IN (${quests});
			`,
			deck.wordIds,
		);

		/**
		 * We have to add back in englishWords and isVulgar
		 * since we have to parse the array and isVulgar is
		 * stored as a number instead of a boolean.
		 */
		const words: Word[] =
			rows?.map((row: WordRow) => ({
				...row,
				englishWords: JSON.parse(row.englishWords),
				isVulgar: Boolean(row.isVulgar),
			})) ?? [];

		/**
		 * Let's build decks with only one card per lemma (infinitives, etc.)
		 * E.G. we don't want both manger and mange
		 */
		const seenLemmaIds = new Set<string>();

		const uniqueLemmaWords = words.filter(word => {
			if (seenLemmaIds.has(word.lemmaId ?? word.id)) return false;
			return Boolean(seenLemmaIds.add(word.lemmaId ?? word.id));
		});

		/**
		 * Shuffle!
		 */
		const shuffledUniqueLemmaWords = shuffleArray(uniqueLemmaWords);

		return {
			...deck,
			words: shuffledUniqueLemmaWords.slice(0, amount),
		};
	} catch (error) {
		console.error('Could not retrieve deck:', error);
	}
}
