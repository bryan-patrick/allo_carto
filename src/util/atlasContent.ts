import type { Chapter, Story } from '@/data/french/storyAtlas';
import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';

export function hasParagraphContent(paragraph: Paragraph): boolean {
	return paragraph.passage.some(segment => segment.text.trim().length > 0);
}

export function hasChapterContent(chapter: Chapter): boolean {
	return chapter.paragraphs.some(hasParagraphContent);
}

export function hasStoryContent(story: Story): boolean {
	return story.chapters.some(hasChapterContent);
}
