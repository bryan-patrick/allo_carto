import GettingStartedPage from './GettingStartedPage';

const description = `Good luck, and enjoy reading about the adventures of Leo and Poe. I hope a little of their magic finds its way to you as it did for me.`;

export default function GoodLuckPage() {
	return (
		<GettingStartedPage
			title="Bonne chance!"
			description={description}
			imageSource={require('@/src/app/assets/images/getting-started/poe-teases-leo.png')}
		/>
	);
}
