import GettingStartedPage from './GettingStartedPage';

const description = `Some words also appear in stamp albums! Check the collections page to see what you have found.`;

export default function CollectionsPage() {
	return (
		<GettingStartedPage
			title="Collect stamps!"
			imageSource={require('@/src/app/assets/images/getting-started/stamps.png')}
			imageLabel="Léo’s Kitchen collection with a discovered croissant stamp circled"
			description={description}
		/>
	);
}
