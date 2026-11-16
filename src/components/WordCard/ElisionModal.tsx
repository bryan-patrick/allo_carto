import { elisionTip } from '@/data/french/tips';
import WordTipModal from './WordTipModal';

/**
 * Typing
 */
interface ElisionModalProps {
	visible: boolean;
	onClose: () => void;
}

/**
 * Opens the shared elision tip from a flashcard.
 */
export default function ElisionModal({ visible, onClose }: ElisionModalProps) {
	return (
		<WordTipModal
			tip={elisionTip}
			visible={visible}
			onClose={onClose}
		/>
	);
}
