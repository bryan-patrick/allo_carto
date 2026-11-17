import GettingStartedPage from './GettingStartedPage';

const description = `Welcome to Allô Carto! Study the flashcards to unlock puzzles. Complete the puzzles to unlock paragraphs. That's it!`;

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
