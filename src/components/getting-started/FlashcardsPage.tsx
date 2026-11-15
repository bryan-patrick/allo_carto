import GettingStartedPage from './GettingStartedPage';

const description = `Welcome to Allô Carto! Practice flashcards to progress a story one paragraph at a time. Do flashcards to unlock the puzzles.\n\nComplete the first 3 puzzles and to unlock the next paragraph.`;

export default function FlashcardsPage() {
	return (
		<GettingStartedPage
			title="How it works."
			imageSource={require('@/src/app/assets/images/getting-started/flashcards.png')}
			imageLabel="Paragraph postcard with the Flashcards button circled"
			description={description}
		/>
	);
}
