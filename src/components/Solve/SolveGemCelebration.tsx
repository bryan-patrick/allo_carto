import type { ReadingPassage } from '@/src/components/CardDeck/cardDeckTypes';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import { getDB, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import type { SolveStage } from '@/src/util/solveProgression';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

/*
 * Typing
 */
interface SolveGemCelebrationProps {
	deck: ReadingPassage;
	stage: SolveStage;
	onClose: () => void;
}

interface PassageProgress {
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/*
 * Load the paragraph's saved word progress and open it half a second after a gem claim.
 * We want the user to be nudged to read the paragraph after claiming one.
 */
export default function SolveGemCelebration({ deck, stage, onClose }: SolveGemCelebrationProps) {
	const { id: userId } = useUserContext() ?? {};
	const [passageProgress, setPassageProgress] = useState<PassageProgress>();
	const [hasOpeningDelayElapsed, setHasOpeningDelayElapsed] = useState(false);

	useEffect(() => {
		const openingTimeout = setTimeout(() => {
			setHasOpeningDelayElapsed(true);
		}, 500);

		return () => clearTimeout(openingTimeout);
	}, []);

	useEffect(() => {
		let isActive = true;

		async function loadPassageProgress() {
			if (!userId) {
				return;
			}

			try {
				const database = await getDB();
				const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
					getDeckWordProgressCounts({
						database,
						userId,
						wordIds: deck.wordIds,
					}),
					getWordProgressById({
						userId,
						passage: deck.passage,
					}),
				]);

				if (isActive) {
					setPassageProgress({
						wordProgressCounts,
						wordProgressKeyByWordId,
					});
				}
			} catch (error) {
				console.error('Could not open the claimed gem paragraph:', error);

				if (isActive) {
					Alert.alert(
						'Could not open paragraph',
						'Your gem and XP are saved. You can open the paragraph with its Read button.',
					);
				}
			}
		}

		void loadPassageProgress();

		return () => {
			isActive = false;
		};
	}, [deck, userId]);

	if (!passageProgress || !hasOpeningDelayElapsed) {
		return null;
	}

	return (
		<DeckBoxModal
			deck={deck}
			celebrationStage={stage}
			modalVisible
			setModalVisible={onClose}
			wordProgressCounts={passageProgress.wordProgressCounts}
			wordProgressKeyByWordId={passageProgress.wordProgressKeyByWordId}
		/>
	);
}
