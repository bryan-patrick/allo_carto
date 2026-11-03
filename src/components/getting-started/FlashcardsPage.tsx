import GettingStartedPage from './GettingStartedPage';

const description = ` Flashcards unlock puzzles. 
Puzzles unlock paragraphs.
Paragraphs unlock chapters.`;

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
