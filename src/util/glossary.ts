import { getParagraphs } from '@/data/french/storyAtlas';
import { elisionTip, getAllTips } from '@/data/french/tips';
import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import type { FrenchTip } from '@/src/components/Tips/tipTypes';
import type { UserWordProgressById } from '@/src/db/queries/getUserWordProgress';
import type { WordProgressKey } from './wordProgress';

/**
 * Glossary words and letter sections
 */
export interface GlossaryEntry {
	word: Word;
	progress: WordProgressKey;
	otherForms: Word[];
	tips: FrenchTip[];
}

export interface GlossarySection {
	letter: string;
	entries: GlossaryEntry[];
}

export const glossaryLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const frenchWordOrder = new Intl.Collator('fr', {
	sensitivity: 'base',
});

/**
 * Finds the A–Z heading for a French word without its article.
 */
function getGlossaryLetter(word: Word): string {
	const frenchSpelling = word.frenchWord.toLocaleUpperCase('fr');
	const expandedSpelling = frenchSpelling.replace(/Œ/g, 'OE').replace(/Æ/g, 'AE');
	const unaccentedSpelling = expandedSpelling.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	return unaccentedSpelling.charAt(0);
}

/**
 * Sorts glossary entries by their French spelling.
 */
function compareGlossaryEntries(firstEntry: GlossaryEntry, secondEntry: GlossaryEntry): number {
	return frenchWordOrder.compare(firstEntry.word.frenchWord, secondEntry.word.frenchWord);
}

/**
 * Collects each word's default tips and the tips attached to its active paragraphs.
 */
function getGlossaryTipIds(): Map<string, Set<string>> {
	const tipIdsByWordId = new Map<string, Set<string>>();
	const paragraphs = getParagraphs();

	for (const word of seedWords) {
		const tipIds = new Set<string>();
		const frenchWordWithArticle = `${word.frenchArticle ?? ''}${word.frenchWord}`;

		if (word.tipId) {
			tipIds.add(word.tipId);
		}

		if (/['’ʼ]/u.test(frenchWordWithArticle)) {
			tipIds.add(elisionTip.id);
		}

		tipIdsByWordId.set(word.id, tipIds);
	}

	for (const paragraph of paragraphs) {
		for (const segment of paragraph.passage) {
			if (segment.wordId && segment.tipId) {
				tipIdsByWordId.get(segment.wordId)?.add(segment.tipId);
			}
		}
	}

	return tipIdsByWordId;
}

const glossaryTipIdsByWordId = getGlossaryTipIds();

/**
 * Groups seen French words and their seen related forms under A–Z headings.
 */
export function getGlossarySections(wordProgressById: UserWordProgressById): GlossarySection[] {
	/**
	 * Active vocabulary, tips, and letter groups
	 */
	const seenWords = seedWords.filter(word => {
		const progress = wordProgressById[word.id];

		return Boolean(progress && progress !== 'unseen');
	});
	const tips = getAllTips();
	const sectionsByLetter = new Map<string, GlossarySection>();
	const sections: GlossarySection[] = [];

	for (const word of seenWords) {
		const letter = getGlossaryLetter(word);
		const tipIds = glossaryTipIdsByWordId.get(word.id);
		const entry: GlossaryEntry = {
			word,
			progress: wordProgressById[word.id] ?? 'new',
			otherForms: seenWords.filter(candidate => {
				return Boolean(
					word.lemmaId && candidate.lemmaId === word.lemmaId && candidate.id !== word.id,
				);
			}),
			tips: tips.filter(tip => tipIds?.has(tip.id)),
		};
		let section = sectionsByLetter.get(letter);

		if (!section) {
			section = {
				letter,
				entries: [],
			};
			sectionsByLetter.set(letter, section);
		}

		section.entries.push(entry);
	}

	for (const letter of glossaryLetters) {
		const section = sectionsByLetter.get(letter);

		if (section) {
			section.entries.sort(compareGlossaryEntries);
			sections.push(section);
		}
	}

	return sections;
}
