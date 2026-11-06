import GettingStartedPage from './GettingStartedPage';

const description = `Some words belong to collections. Visit the Collections page to see what you have found!\n\nLeveling up these collections give you a lot of XP, and can unlock secrets.`;

// Explain how flashcard words reveal stamps and where to find them.
export default function CollectionsPage() {
	return (
		<GettingStartedPage
			title="You can collect stamps"
			imageSource={require('@/src/app/assets/images/getting-started/stamps.png')}
			imageLabel="Léo’s Kitchen collection with a discovered croissant stamp circled"
			description={description}
		/>
	);
}
