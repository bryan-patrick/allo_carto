import { seedWords as frenchSeedWords } from '@/data/french/words';
import { getDB, logThisIfItFails } from '../connection';

export default async function seedWords(): Promise<void> {
	const database = await getDB();

	/**
	 * Seed the existing words
	 */
	for (const word of frenchSeedWords) {
		await logThisIfItFails(`Oops we messed up seeding word ${word.id}`, async () => {
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
		});
	}
}
