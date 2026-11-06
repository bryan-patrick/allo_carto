import GettingStartedPage from './GettingStartedPage';

const description = `Every flashcard comes from the paragraph you're currently on, so you can stay focused on learning the current paragraph.`;

// Show how to find a flashcard's word in the story.
export default function ParagraphPage() {
	return (
		<GettingStartedPage
			title="It's story driven"
			imageSource={require('@/src/app/assets/images/getting-started/paragraph.png')}
			imageLabel="Flashcard with the View paragraph link circled"
			description={description}
		/>
	);
}
