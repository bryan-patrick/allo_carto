import GettingStartedPage from './GettingStartedPage';

const description = `Some flashcards unlock collectible stamps. You’ll be notified when you find one.\n\nVisit the Collections page to see everything you have found!`;

// Explain how flashcard words reveal stamps and where to find them.
export default function CollectionsPage() {
	return (
		<GettingStartedPage
			title="You can collect words"
			imageSource={require('@/src/app/assets/images/getting-started/stamps.png')}
			imageLabel="Léo’s Kitchen collection with a discovered croissant stamp circled"
			description={description}
		/>
	);
}
