import GettingStartedPage from './GettingStartedPage';

const description = `Unlock the first puzzle by seeing all flashcards in a paragraph once.\n\nEarn a gem each time you solve a puzzle. There are 5 levels of puzzles per paragraph!`;

// Explain when Solve opens and how to earn more Ink.
export default function PuzzlesPage() {
	return (
		<GettingStartedPage
			title="The proof is in the puzzles."
			imageSource={require('@/src/app/assets/images/getting-started/solve.png')}
			imageLabel="Paragraph postcard with the Solve button circled"
			description={description}
		/>
	);
}
