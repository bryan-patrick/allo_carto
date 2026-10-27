import { seedWords } from '@/data/french/words';
import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';

export interface SolvePassageSegment extends PassageSegment {
	position: number;
}

/**
 * We match dictionary contractions regardless of capitalization or apostrophe style.
 */
function getContractionKey(text: string): string {
	const lowerCaseText = text.toLowerCase();

	return lowerCaseText.replace(/[’ʼ]/gu, "'");
}

const contractionWordIds = new Map<string, string>();

for (const word of seedWords) {
	const key = getContractionKey(word.frenchWord);

	if (key.includes("'") && !/\s/u.test(key)) {
		contractionWordIds.set(key, word.id);
	}
}

/**
 * Get the paragraph and join the segments for the puzzle solve
 */
export function getSolvePassage(passage: PassageSegment[]): SolvePassageSegment[] {
	const segments: SolvePassageSegment[] = [];

	for (let position = 0; position < passage.length; position++) {
		const segment = passage[position];
		const nextSegment = passage[position + 1];
		const joinedText = segment.text + (nextSegment?.text ?? '');
		const contractionKey = getContractionKey(joinedText);
		const contractionWordId = contractionWordIds.get(contractionKey);
		const canJoin = segment.after === '' && /['’ʼ]$/u.test(segment.text);
		const bothAreVocabulary =
			segment.wordId && !segment.unlockExempt && nextSegment?.wordId && !nextSegment.unlockExempt;

		if (canJoin && bothAreVocabulary && contractionWordId) {
			segments.push({
				...nextSegment,
				position,
				text: joinedText,
				wordId: contractionWordId,
			});
			position++;
		} else {
			segments.push({ ...segment, position });
		}
	}

	return segments;
}
