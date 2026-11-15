import { seedWords as frenchSeedWords } from '@/data/french/words';
import { getDB, logThisIfItFails } from '../connection';

export default async function seedWords(): Promise<void> {
	const database = await getDB();

	/**
	 * Seed the existing words
	 */
	for (const word of frenchSeedWords) {
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
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT(id) DO UPDATE SET
					frenchWord = excluded.frenchWord,
					englishWords = excluded.englishWords,
					canonicalEnglish = excluded.canonicalEnglish,
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
