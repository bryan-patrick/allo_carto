import CollectionCard from '@/src/components/Collections/CollectionCard';
import CollectionsSection from '@/src/components/Collections/CollectionsSection';
import { collectionsPageStyles } from '@/src/components/Collections/collectionsPageStyles';
import { useUserProgress } from '@/src/db/useUserProgress';
import type {
	CollectionSection,
	VocabularyCollectionProgress,
} from '@/src/util/vocabularyCollections';
import { ScrollView, Text } from 'react-native';

/**
 * Typing
 */
interface StampSectionDefinition {
	key: CollectionSection;
	title: string;
}

interface StampSectionProps {
	section: StampSectionDefinition;
	collections: VocabularyCollectionProgress[];
}

const stampSections: StampSectionDefinition[] = [
	{
		key: 'ready',
		title: 'Ready to Claim',
	},
	{
		key: 'inProgress',
		title: 'In Progress',
	},
	{
		key: 'undiscovered',
		title: 'Undiscovered',
	},
	{
		key: 'completed',
		title: 'Completed',
	},
];

/**
 * Shows stamp albums. They're separated by the sections above.
 */
function StampSection({ section, collections }: StampSectionProps) {
	const albums = collections.filter(progress => progress.section === section.key);

	if (albums.length === 0) {
		return null;
	}

	return (
		<CollectionsSection
			title={section.title}
			count={albums.length}
		>
			{albums.map(progress => (
				<CollectionCard
					key={progress.collection.id}
					progress={progress}
				/>
			))}
		</CollectionsSection>
	);
}

/**
 * Groups stamp albums by their sectionsd
 */
export default function StampsView() {
	/**
	 * Saved collections
	 */
	const { collections } = useUserProgress();

	return (
		<ScrollView
			style={collectionsPageStyles.scrollView}
			contentContainerStyle={collectionsPageStyles.content}
		>
			<Text style={collectionsPageStyles.introduction}>Do flashcards to complete collections!</Text>
			{stampSections.map(section => (
				<StampSection
					key={section.key}
					section={section}
					collections={collections}
				/>
			))}
			{collections.length === 0 && (
				<Text style={collectionsPageStyles.introduction}>New collections are on their way.</Text>
			)}
		</ScrollView>
	);
}
