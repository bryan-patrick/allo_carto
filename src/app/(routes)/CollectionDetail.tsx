import { SolveXPFeedbackProvider } from '@/src/components/Solve/SolveXPFeedback';
import CollectionDetailView from '@/src/components/Views/CollectionDetailView';

/**
 * This is the view for each stamp collection
 */
export default function CollectionDetail() {
	return (
		<SolveXPFeedbackProvider>
			<CollectionDetailView />
		</SolveXPFeedbackProvider>
	);
}
