import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import { getSolvePassage, type SolvePassageSegment } from './getSolvePassage';

export interface SentencePassage {
	text: string;
	segments: SolvePassageSegment[];
}

/*
 * Splits the French paragraph into sentences and keeps its words and punctuation.
 */
export function splitFrenchSentences(deck: CardDeck): SentencePassage[] {
	const passage = getSolvePassage(deck.passage);
	const sentences: SentencePassage[] = [];
	let text = '';
	let segments: SolvePassageSegment[] = [];

	for (const segment of passage) {
		const textWithPunctuation = segment.text + (segment.after ?? ' ');
		const endsSentence = /[.!?…][\s»”"'’)\]]*$/u.test(textWithPunctuation);
		const isClosingPunctuation = /^[\s»”’)\]]+$/u.test(textWithPunctuation);
		const previousSentence = sentences[sentences.length - 1];

		if (!text && previousSentence && isClosingPunctuation) {
			previousSentence.text += ` ${textWithPunctuation.trim()}`;
			previousSentence.segments.push(segment);
			continue;
		}

		text += textWithPunctuation;
		segments.push(segment);

		if (endsSentence) {
			sentences.push({
				text: text.trim(),
				segments,
			});
			text = '';
			segments = [];
		}
	}

	if (/[\p{L}\p{N}]/u.test(text)) {
		sentences.push({
			text: text.trim(),
			segments,
		});
	} else if (text.trim() && sentences.length > 0) {
		const previousSentence = sentences[sentences.length - 1];

		previousSentence.text += ` ${text.trim()}`;
		previousSentence.segments.push(...segments);
	}

	return sentences;
}
