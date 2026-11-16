import type { WordTip } from '@/src/components/CardDeck/cardDeckTypes';
import GettingStartedModal from '@/src/components/getting-started/GettingStartedModal';
import GettingStartedPage from '@/src/components/getting-started/GettingStartedPage';
import TipRewardClaim from './TipRewardClaim';

/**
 * Typing
 */
interface WordTipModalProps {
	tip: WordTip;
	visible: boolean;
	onClose: () => void;
}

/**
 * Shows a word's tip in the tutorial modal.
 */
export default function WordTipModal({ tip, visible, onClose }: WordTipModalProps) {
	return (
		<GettingStartedModal
			visible={visible}
			onFinish={onClose}
			label="French tip"
			finishButtonLabel="Got it!"
		>
			<GettingStartedPage
				title={tip.title}
				description={tip.description}
			/>
			<TipRewardClaim
				key={tip.id}
				tip={tip}
			/>
		</GettingStartedModal>
	);
}
