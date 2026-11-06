import GettingStartedPage from './GettingStartedPage';

// Share the inspiration for Léo and Poe and wish the player well.
export default function GoodLuckPage() {
	const description = `Enjoy reading about the adventures of Leo and Poe.\n\nI hope a little of their magic finds its way to you, as it did for me.`;

	return (
		<GettingStartedPage
			title="Bonne chance!"
			description={description}
			imageSource={require('@/src/app/assets/images/getting-started/poe-teases-leo.png')}
		/>
	);
}
