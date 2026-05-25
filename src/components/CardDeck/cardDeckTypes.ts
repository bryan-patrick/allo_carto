/**
 * Typing
 */
export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Word type
 * As a general rule, ids should always be slug-safe (no accents or anything)
 * IDs are "word_partOfSpeech_frenchword(no special chars)"
 * E.G. "word_noun_apres" (note the lack of the accent over the é)
 *
 * Important: prop frenchWord ALWAYS gets its special characters.
 *
 * TODO: REALLY big todo!
 * english word will need to be refactored to an array.
 * This is a serious issue, some logic will need to be fixed to
 */
export interface Word {
	id: string;
	frenchWord: string;
	englishWord: string;
	frenchArticle?: string;
	englishArticle?: string;
	pronunciation: string;
	isVulgar: boolean;
	CEFR: CEFR;
	lemmaId?: string;
	tense?: string;
	gender?: 'Feminine' | 'Masculine';
	partOfSpeech?: string;
	userScore: number;
	rarity?: CardRarity;
}

export const initialWordState: Word = {
	id: '',
	frenchWord: '',
	englishWord: '',
	pronunciation: '',
	isVulgar: false,
	CEFR: 'A1',
	userScore: 0,
};
