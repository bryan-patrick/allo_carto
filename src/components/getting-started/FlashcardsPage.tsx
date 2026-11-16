import GettingStartedPage from './GettingStartedPage';

const description = `Welcome to Allô Carto! The app is simple. You study one paragraph at a time. Study the flashcards to unlock the puzzles.\n\nComplete the puzzles to unlock the next paragraph. That's it!`;

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
