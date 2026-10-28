import SolveView from '@/src/components/Views/SolveView';
import { useUserContext } from '@/src/db/useUserContext';
import { useLocalSearchParams } from 'expo-router';

/**
 * Solve view
 */
export default function Solve() {
	const params = useLocalSearchParams();
	const deckId = typeof params.deckId === 'string' ? params.deckId : '';
	const stage = params.stage === '2' ? 2 : 1;
	const { id: userId } = useUserContext() ?? {};

	return (
		<SolveView
			key={`${userId}-${deckId}-${stage}`}
			deckId={deckId}
			stage={stage}
		/>
	);
}
