import type { OtherWordForm } from '@/src/db/queries/getOtherWordForms';
import formatFrenchWordWithArticle from './formatFrenchWordWithArticle';

export default function formatOtherWordForm(candidate: OtherWordForm): string {
	const word = formatFrenchWordWithArticle({
		article: candidate.frenchArticle,
		word: candidate.frenchWord,
	});
	const details = [
		...new Set(
			[candidate.partOfSpeech, candidate.form, candidate.tense, candidate.gender].filter(Boolean),
		),
	].join(', ');

	return details ? `${word} (${details})` : word;
}
