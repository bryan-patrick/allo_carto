/**
 * Typing
 */
export interface WordProps {
	id: string;
	translation: string;
	pronunciation: string;
	CEFRLevel: string;
	lemmaId?: string;
	frenchArticle?: string;
	englishArticle?: string;
	tense?: string;
	gender?: 'feminine' | 'masculine';
	partOfSpeech?: string;
	userScore: number;
}

export const initialWordState: WordProps = {
	id: '',
	translation: '',
	pronunciation: '',
	CEFRLevel: '',
	userScore: 0,
};
