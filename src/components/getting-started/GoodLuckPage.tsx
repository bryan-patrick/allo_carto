import GettingStartedPage from './GettingStartedPage';

const description = `Good luck, enojoy reading about the adventures of Leo and Poe. We hope a little of their magic finds its way to you.`;

export default function GoodLuckPage() {
	return (
		<GettingStartedPage
			title="Bonne chance!"
			description={description}
			imageSource={require('@/src/app/assets/images/getting-started/poe-teases-leo.png')}
		/>
	);
}
