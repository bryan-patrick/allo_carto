import GettingStartedPage from './GettingStartedPage';

const description = `Puzzles are fun challenges to see how well you know the words in the current paragraph.`;

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
