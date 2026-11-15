import type { Paragraph, ParagraphDefinition } from '@/src/components/CardDeck/cardDeckTypes';
import { getPassageWordIds } from './getPassageWordIds';

/**
 * Uses the paragraph's word IDs from its passage to create the paragraph.
 */
export function createParagraph(paragraph: ParagraphDefinition): Paragraph {
	return {
		...paragraph,
		wordIds: getPassageWordIds(paragraph.passage),
	};
}
