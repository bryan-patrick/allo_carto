// Add or reorder page files here to change the steps.
import type { ComponentType } from 'react';
import CollectionsPage from './CollectionsPage';
import FlashcardsPage from './FlashcardsPage';
import GoodLuckPage from './GoodLuckPage';
import ParagraphPage from './ParagraphPage';
import PuzzlesPage from './PuzzlesPage';
import ReadingPage from './ReadingPage';
import WelcomePage from './WelcomePage';

/*
 * This is the order of the pages
 */
export default [
	WelcomePage,
	FlashcardsPage,
	ParagraphPage,
	ReadingPage,
	PuzzlesPage,
	CollectionsPage,
	GoodLuckPage,
] as ComponentType[];
