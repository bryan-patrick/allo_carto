import CollectionsSection from '@/src/components/Collections/CollectionsSection';
import { collectionsPageStyles } from '@/src/components/Collections/collectionsPageStyles';
import type { CollectionsPageScrollProps } from '@/src/components/Collections/collectionsPageTypes';
import TipCard from '@/src/components/Tips/TipCard';
import type { FrenchTip, TipProgress } from '@/src/components/Tips/tipTypes';
import WordTipModal from '@/src/components/WordCard/WordTipModal';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useState } from 'react';
import { Animated, Text } from 'react-native';

/**
 * Typing
 */
interface TipsSectionProps {
	title: string;
	tips: TipProgress[];
	emptyMessage: string;
	onSelectTip: (tip: FrenchTip) => void;
}

/**
 * Shows tips by section
 */
function TipsSection({ title, tips, emptyMessage, onSelectTip }: TipsSectionProps) {
	return (
		<CollectionsSection
			title={title}
			count={tips.length}
		>
			{tips.map(progress => (
				<TipCard
					key={progress.tip.id}
					progress={progress}
					onSelectTip={onSelectTip}
				/>
			))}
			{tips.length === 0 && <Text style={collectionsPageStyles.introduction}>{emptyMessage}</Text>}
		</CollectionsSection>
	);
}

/**
 * Lists discovered and undiscovered tips and opens the selected tip's modal.
 */
export default function TipsView(scrollProps: CollectionsPageScrollProps) {
	/**
	 * Saved progress and selected tip
	 */
	const { tips } = useUserProgress();
	const [selectedTip, setSelectedTip] = useState<FrenchTip | null>(null);
	const discoveredTips = tips.filter(progress => progress.isDiscovered);
	const undiscoveredTips = tips.filter(progress => !progress.isDiscovered);

	return (
		<>
			<Animated.ScrollView
				{...scrollProps}
				bounces={false}
				overScrollMode="never"
				scrollEventThrottle={16}
				style={collectionsPageStyles.scrollView}
				contentContainerStyle={collectionsPageStyles.content}
			>
				<Text style={collectionsPageStyles.introduction}>
					Open tips on flashcards to add them here!
				</Text>
				<TipsSection
					title="Discovered"
					tips={discoveredTips}
					emptyMessage="Your discovered tips will appear here."
					onSelectTip={setSelectedTip}
				/>
				<TipsSection
					title="Undiscovered"
					tips={undiscoveredTips}
					emptyMessage="You've discovered every tip so far!"
					onSelectTip={setSelectedTip}
				/>
			</Animated.ScrollView>
			{selectedTip && (
				<WordTipModal
					key={selectedTip.id}
					tip={selectedTip}
					visible
					onClose={() => setSelectedTip(null)}
				/>
			)}
		</>
	);
}
