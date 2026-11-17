import GettingStartedPage from './GettingStartedPage';

const description = `Flashcards show words from the current paragraph.`;

export default function ParagraphPage() {
	return (
		<GettingStartedPage
			title="It's story driven."
			imageSource={require('@/src/app/assets/images/getting-started/paragraph.png')}
			imageLabel="Flashcard with the View paragraph link circled"
			description={description}
		/>
	);
}
