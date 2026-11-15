import GettingStartedPage from './GettingStartedPage';

const description = `Some words belong to collections. Visit the Collections page to see what you have found!`;

export default function CollectionsPage() {
	return (
		<GettingStartedPage
			title="Find stamps."
			imageSource={require('@/src/app/assets/images/getting-started/stamps.png')}
			imageLabel="Léo’s Kitchen collection with a discovered croissant stamp circled"
			description={description}
		/>
	);
}
