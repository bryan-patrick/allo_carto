import { elisionTip } from '@/data/french/tips';
import GettingStartedModal from '@/src/components/getting-started/GettingStartedModal';
import GettingStartedPage from '@/src/components/getting-started/GettingStartedPage';
import type { ComponentType } from 'react';
import TipRewardClaim from './TipRewardClaim';

/**
 * Explanation and illustration
 */
const elisionImage = require('@/src/app/assets/images/getting-started/elision.png');
const elisionPages: ComponentType[] = [ElisionPage];

/**
 * Typing
 */
interface ElisionModalProps {
	visible: boolean;
	onClose: () => void;
}

/**
 * Explains French elisions with examples and an illustration.
 */
function ElisionPage() {
	return (
		<>
			<GettingStartedPage
				title={elisionTip.title}
				description={elisionTip.description}
				imageSource={elisionImage}
				imageLabel="Je + habite becomes J’habite, Le + ami becomes L’ami, and La + école becomes L’école"
			/>
			<TipRewardClaim tip={elisionTip} />
		</>
	);
}

/**
 * Shows the elision explanation in the same modal as the getting-started guide.
 */
export default function ElisionModal({ visible, onClose }: ElisionModalProps) {
	return (
		<GettingStartedModal
			visible={visible}
			onFinish={onClose}
			pages={elisionPages}
			label="French tip"
			finishButtonLabel="Got it!"
		/>
	);
}
