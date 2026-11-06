import GettingStartedPage from './GettingStartedPage';

const description = `In Allô Carto, you practice flashcards to progress a story one paragraph at a time.\n\nPracticing flashcards unlocks puzzles. 
Solving puzzles unlocks more paragraphs.`;

// Show where to open flashcards and explain what practice earns.
export default function FlashcardsPage() {
	return (
		<GettingStartedPage
			title="How it works"
			imageSource={require('@/src/app/assets/images/getting-started/flashcards.png')}
			imageLabel="Paragraph postcard with the Flashcards button circled"
			description={description}
		/>
	);
}
