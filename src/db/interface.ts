import { seedWords } from '@/data/french/words';
import type { CardDeck } from '../components/CardDeck/cardDeckTypes';
import { CardRarity, CEFR, Word } from '../components/CardDeck/cardDeckTypes';
import wordRaffle from '../util/wordRaffle';
import { getDB, logThisIfItFails } from './connection';
import getDeckWordChoices from './queries/getDeckWordChoices';
export { deleteDB, getDB, setDB } from './connection';

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
	correctCount: number;
	rarity?: CardRarity;
}

interface WordRankRow {
	wordId: string;
	seenCount: number;
	correctCount: number;
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
export async function getTables() {
	try {
		const database = await getDB();

		/**
		 * Check/Create word table
		 */
		await logThisIfItFails(
			'Oops we messed up creating the words table somehows',
			async () => {
				return await database.execAsync(`
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
						correctCount INTEGER NOT NULL,
						rarity TEXT
					);
				`);
			},
		);

		/**
		 * Seed the existing words
		 */
		for (const word of seedWords) {
			await logThisIfItFails(
				`Oops we messed up seeding word ${word.id}`,
				async () => {
					await database.runAsync(
						`
					INSERT INTO words (
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
						correctCount,
						rarity
						)
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
						ON CONFLICT(id) DO UPDATE SET
							frenchWord = excluded.frenchWord,
							englishWords = excluded.englishWords,
							frenchArticle = excluded.frenchArticle,
							englishArticle = excluded.englishArticle,
							pronunciation = excluded.pronunciation,
							isVulgar = excluded.isVulgar,
							CEFR = excluded.CEFR,
							lemmaId = excluded.lemmaId,
							tense = excluded.tense,
							gender = excluded.gender,
							partOfSpeech = excluded.partOfSpeech,
							rarity = excluded.rarity
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
							word.correctCount,
							word.rarity ?? null,
						],
					);
				},
			);
		}

		/**
		 * Create users table
		 */
		await logThisIfItFails(
			'Oops we messed up the users table somehows mon homme',
			async () => {
				return await database.execAsync(`
					CREATE TABLE IF NOT EXISTS users (
						id TEXT PRIMARY KEY,
						name TEXT,
						isMonHomme INTEGER NOT NULL DEFAULT 1
					);
				`);
			},
		);

		/**
		 * Create user word score join table - many (users) to many (words).
		 * The table to store progress for a specific word per user.
		 *
		 * A user can only have one record for a given word
		 * so I made the primary key userId and wordId...should work...
		 */
		await logThisIfItFails('Oops our join table messed up', async () => {
			return await database.execAsync(`
				CREATE TABLE IF NOT EXISTS userWords (
					userId TEXT NOT NULL,
					wordId TEXT NOT NULL,
					seenCount INTEGER NOT NULL DEFAULT 0,
					correctCount INTEGER NOT NULL DEFAULT 0,
					PRIMARY KEY (userId, wordId),
					FOREIGN KEY (userId) REFERENCES users(id),
					FOREIGN KEY (wordId) REFERENCES words(id)
				)
			`);
		});

		/**
		 * Create a local user
		 * isMonHomme just means local user
		 */
		await logThisIfItFails('Oops we messed up mon homme', async () => {
			return await database.runAsync(
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
	} catch (error) {
		console.error('Failed to create tables.', error);
		throw error;
	}
}

interface GetDeckProps {
	deck: CardDeck;
	amount?: number;
	userId: string;
}

/**
 * Get a deck
 */
export async function getDeck({
	deck,
	amount = 6,
	userId,
}: GetDeckProps): Promise<CardDeck | undefined> {
	/**
	 * We need placeholder quest markers (?s)
	 */
	const quests: string = deck.wordIds.map(() => '?').join(',');

	/**
	 * Get the DB
	 * Select all the words in that deck (deck.wordIds)
	 * The word raffle happens after this query.
	 * We need all of the possible words here so every word
	 * has a chance to be selected.
	 */
	try {
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
		 * stored with a numeric value instead of a boolean.
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

		const uniqueLemmaWordsDeck: Word[] = words.filter(word => {
			if (seenLemmaIds.has(word.lemmaId ?? word.id)) return false;
			return Boolean(seenLemmaIds.add(word.lemmaId ?? word.id));
		});

		/**
		 * Draw the cards.
		 * wordRaffle is for determined rarity
		 */
		const selectedWords = wordRaffle(uniqueLemmaWordsDeck, amount);
		const selectedWordIds = selectedWords.map(word => word.id);
		const selectedWordQuests = selectedWords.map(() => '?').join(',');

		/**
		 * We need the join table's correct word counts for the
		 * WordRank badges and what not.
		 */
		const rankRows: WordRankRow[] = await database.getAllAsync(
			`
			SELECT ALL wordId, correctCount, seenCount
			FROM userWords
			WHERE userId = ?
			AND wordId IN (${selectedWordQuests});
			`,
			userId,
			...selectedWordIds,
		);

		/**
		 * Instead of finding every correctCount by nested
		 * id, we can use the ids for a lookup table.
		 *
		 * In other words, we're turning this:
		 * [{"correctCount": 1, "seenCount": 0, "wordId": "word_noun_cafe"}, ...]
		 *
		 * Into this (a lookup table):
		 * {word_noun_cafe: {"correctCount": 1, "seenCount": 0, "wordId": "word_noun_cafe"}, ...}
		 *
		 * This prevents us from having to iterate over
		 * the object for every single word
		 * just to get the correctCount.
		 */
		const keyedRankRows: Record<string, WordRankRow> = {};

		for (const row of rankRows) {
			keyedRankRows[row.wordId] = row;
		}

		/**
		 * Add in the correctCount/correctCounts
		 * These can be undefined if they have
		 * never been seen by the user.
		 */
		const withUniquecorrectCounts = selectedWords.map((word: Word): Word => {
			const wordRankRow: WordRankRow | undefined = keyedRankRows[word.id];
			const correctCount: number = wordRankRow?.correctCount ?? 0;

			/**
			 * Return (map) Word
			 */
			return {
				...word,
				correctCount,
			};
		});

		/**
		 * Return the deck
		 */
		return {
			...deck,
			words: withUniquecorrectCounts,
			wordChoices: await getDeckWordChoices({ wordIds: deck.wordIds }),
		};
	} catch (error) {
		console.error('Could not retrieve deck:', error);
	}
}
