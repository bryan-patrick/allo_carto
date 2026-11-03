import GettingStartedPage from './GettingStartedPage';

const description = `See every flashcard for a paragraph to unlock its puzzle. Solving the puzzle unlocks the next paragraph.`;

// Explain when Solve opens and how to earn more Ink.
export default function PuzzlesPage() {
	return (
		<GettingStartedPage
			title="Proof is in the puzzles"
			imageSource={require('@/src/app/assets/images/getting-started/solve.png')}
			imageLabel="Paragraph postcard with the Solve button circled"
			description={description}
		/>
	);
}
