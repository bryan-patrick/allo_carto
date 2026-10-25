import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';

export function hasParagraphContent(paragraph: CardDeck): boolean {
	return paragraph.passage.some(segment => segment.text.trim().length > 0);
}

export function hasChapterContent(chapter: DeckChapter): boolean {
	return chapter.decks.some(hasParagraphContent);
}

export function hasStoryContent(story: DeckStory): boolean {
	return story.chapters.some(hasChapterContent);
}
