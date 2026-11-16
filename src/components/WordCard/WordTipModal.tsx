import { elisionTip } from '@/data/french/tips';
import type { FrenchTip } from '@/src/components/Tips/tipTypes';
import { useTipDiscovery } from '@/src/components/Tips/useTipDiscovery';
import GettingStartedModal from '@/src/components/getting-started/GettingStartedModal';
import GettingStartedPage from '@/src/components/getting-started/GettingStartedPage';
import type { ImageSourcePropType } from 'react-native';
import TipRewardClaim from './TipRewardClaim';

/**
 * Typing
 */
interface WordTipModalProps {
	tip: FrenchTip;
	visible: boolean;
	onClose: () => void;
}

interface TipIllustration {
	source: ImageSourcePropType;
	label: string;
}

const tipIllustrations: Record<string, TipIllustration> = {
	[elisionTip.id]: {
		source: require('@/src/app/assets/images/getting-started/elision.png'),
		label: 'Je + habite becomes J’habite, Le + ami becomes L’ami, and La + école becomes L’école',
	},
};

/**
 * Shows a French tip and its XP reward in a modal.
 */
export default function WordTipModal({ tip, visible, onClose }: WordTipModalProps) {
	/**
	 * Discovery and optional illustration
	 */
	const illustration = tipIllustrations[tip.id];

	useTipDiscovery(tip.id, visible);

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
				imageSource={illustration?.source}
				imageLabel={illustration?.label}
			/>
			<TipRewardClaim
				key={tip.id}
				tip={tip}
			/>
		</GettingStartedModal>
	);
}
