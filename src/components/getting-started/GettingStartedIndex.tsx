import type { ComponentType } from 'react';
import CollectionsPage from './CollectionsPage';
import FlashcardsPage from './FlashcardsPage';
import GoodLuckPage from './GoodLuckPage';
import ParagraphPage from './ParagraphPage';
import PuzzlesPage from './PuzzlesPage';
import ReadingPage from './ReadingPage';

/**
 * This is the order of the pages
 */
export default [
	FlashcardsPage,
	ParagraphPage,
	ReadingPage,
	PuzzlesPage,
	CollectionsPage,
	GoodLuckPage,
] as ComponentType[];
