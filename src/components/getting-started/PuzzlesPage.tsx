import GettingStartedPage from './GettingStartedPage';

const description = `Unlock the first puzzle by seeing all flashcards in a paragraph once.\n\nComplete Solve, Solve+, and Solve++ and claim all 3 gems to unlock the next paragraph. The last 2 puzzles make your gems glow, then turn prismatic!`;

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
