import { seedWords as frenchSeedWords } from '@/data/french/words';
import { getTipById } from '@/data/french/tips';
import { getDB, logThisIfItFails } from '../connection';

/**
 * Saves the active vocabulary and its flashcard details.
 */
export default async function seedWords(): Promise<void> {
	const database = await getDB();

	/**
	 * Seed the existing words
	 */
	for (const word of frenchSeedWords) {
		if (word.tipId && !getTipById(word.tipId)) {
			throw new Error(`Word ${word.id} refers to missing tip ${word.tipId}.`);
		}

		await logThisIfItFails(`Oops we messed up seeding word ${word.id}`, async () => {
			let savedEnglishPrefixes: string | null = null;

			if (word.englishPrefixes) {
				savedEnglishPrefixes = JSON.stringify(word.englishPrefixes);
			}

			await database.runAsync(
				`
				INSERT INTO words (
					id,
					frenchWord,
					englishWords,
					canonicalEnglish,
						tipId,
					frenchArticle,
					englishArticle,
					englishPrefixes,
					pronunciation,
					ipaPronunciation,
					isVulgar,
					isQuebecois,
					CEFR,
					lemmaId,
					form,
					tense,
					gender,
					partOfSpeech,
					correctCount,
					rarity
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT(id) DO UPDATE SET
					frenchWord = excluded.frenchWord,
					englishWords = excluded.englishWords,
					canonicalEnglish = excluded.canonicalEnglish,
					tipId = excluded.tipId,
					frenchArticle = excluded.frenchArticle,
					englishArticle = excluded.englishArticle,
					englishPrefixes = excluded.englishPrefixes,
					pronunciation = excluded.pronunciation,
					ipaPronunciation = excluded.ipaPronunciation,
					isVulgar = excluded.isVulgar,
					isQuebecois = excluded.isQuebecois,
					CEFR = excluded.CEFR,
					lemmaId = excluded.lemmaId,
					form = excluded.form,
					tense = excluded.tense,
					gender = excluded.gender,
					partOfSpeech = excluded.partOfSpeech,
					rarity = excluded.rarity
				`,
				[
					word.id,
					word.frenchWord,
					JSON.stringify(word.englishWords),
					word.canonicalEnglish ?? null,
					word.tipId ?? null,
					word.frenchArticle ?? null,
					word.englishArticle ?? null,
					savedEnglishPrefixes,
					word.pronunciation,
					word.ipaPronunciation,
					Number(word.isVulgar),
					Number(word.isQuebecois ?? false),
					word.CEFR,
					word.lemmaId ?? null,
					word.form ?? null,
					word.tense ?? null,
					word.gender ?? null,
					word.partOfSpeech ?? null,
					word.correctCount,
					word.rarity,
				],
			);
		});
	}
}
