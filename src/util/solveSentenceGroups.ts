import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import { splitFrenchSentences, type SentencePassage } from './splitFrenchSentences';

export interface SolveSentenceGroup extends SentencePassage {
	originalSentencePositions: number[];
}

/**
 * Groups puzzle sentences. One word sentences suck so we group them with
 * the next (or previous) sentence.
 */
export function getSolveSentenceGroups(paragraph: Paragraph): SolveSentenceGroup[] {
	/**
	 * Sentences and their puzzle pages
	 */
	const sentences = splitFrenchSentences(paragraph);
	const groups: SolveSentenceGroup[] = [];
	let pendingGroup: SolveSentenceGroup | undefined;

	for (const [sentencePosition, sentence] of sentences.entries()) {
		const wordCards = sentence.segments.filter(segment => /[\p{L}\p{N}]/u.test(segment.text));

		if (!pendingGroup) {
			pendingGroup = {
				text: '',
				segments: [],
				originalSentencePositions: [],
			};
		}

		if (pendingGroup.text) {
			pendingGroup.text += ' ';
		}

		pendingGroup.text += sentence.text;
		pendingGroup.segments.push(...sentence.segments);
		pendingGroup.originalSentencePositions.push(sentencePosition);

		if (wordCards.length > 1) {
			groups.push(pendingGroup);
			pendingGroup = undefined;
		}
	}

	if (pendingGroup) {
		const previousGroup = groups[groups.length - 1];

		if (previousGroup) {
			previousGroup.text += ` ${pendingGroup.text}`;
			previousGroup.segments.push(...pendingGroup.segments);
			previousGroup.originalSentencePositions.push(...pendingGroup.originalSentencePositions);
		} else {
			groups.push(pendingGroup);
		}
	}

	return groups;
}
