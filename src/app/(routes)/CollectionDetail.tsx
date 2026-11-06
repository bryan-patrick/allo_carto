import { SolveXPFeedbackProvider } from '@/src/components/Solve/SolveXPFeedback';
import CollectionDetailView from '@/src/components/Views/CollectionDetailView';

// Keep earned XP floating above the album when its claim button changes.
export default function CollectionDetail() {
	return (
		<SolveXPFeedbackProvider>
			<CollectionDetailView />
		</SolveXPFeedbackProvider>
	);
}
