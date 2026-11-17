import GettingStartedPage from './GettingStartedPage';

const description = `Unlock the first puzzle by seeing all flashcards in a paragraph once. Solve the first three puzzles to unlock the next paragraph.`;

export default function PuzzlesPage() {
	return (
		<GettingStartedPage
			title="The proof is in the puzzles."
			imageSource={require('@/src/app/assets/images/getting-started/solve.png')}
			imageLabel="Paragraph postcard with the puzzle buttons circled"
			description={description}
		/>
	);
}
