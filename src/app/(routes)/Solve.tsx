import { SolveXPFeedbackProvider } from '@/src/components/Solve/SolveXPFeedback';
import SolveSentenceView from '@/src/components/Views/SolveSentenceView';
import SolveView from '@/src/components/Views/SolveView';
import SolveWordOrderView from '@/src/components/Views/SolveWordOrderView';
import { useUserContext } from '@/src/db/useUserContext';
import { useLocalSearchParams } from 'expo-router';

// Keep floating XP visible while the puzzle replaces its claimed cards and gem button.
export default function Solve() {
	return (
		<SolveXPFeedbackProvider>
			<SolveStageView />
		</SolveXPFeedbackProvider>
	);
}

// Open the paragraph's puzzle screen for the requested Solve stage.
function SolveStageView() {
	const params = useLocalSearchParams();
	const deckId = typeof params.deckId === 'string' ? params.deckId : '';
	const stage = typeof params.stage === 'string' ? Number(params.stage) : 1;
	const { id: userId } = useUserContext() ?? {};

	switch (stage) {
		case 1:
		case 2:
			return (
				<SolveView
					key={`${userId}-${deckId}-${stage}`}
					deckId={deckId}
					stage={stage}
				/>
			);
		case 3:
			return (
				<SolveWordOrderView
					key={`${userId}-${deckId}-${stage}`}
					deckId={deckId}
				/>
			);
		case 4:
		case 5:
			return (
				<SolveSentenceView
					key={`${userId}-${deckId}-${stage}`}
					deckId={deckId}
					stage={stage}
				/>
			);
		default:
			return null;
	}
}
