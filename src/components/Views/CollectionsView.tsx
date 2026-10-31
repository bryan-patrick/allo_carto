import { chapterSelectBackground } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import CollectionCard from '@/src/components/Collections/CollectionCard';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import type { CollectionSection } from '@/src/util/vocabularyCollections';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface CollectionSectionDefinition {
	key: CollectionSection;
	title: string;
}

const collectionSections: CollectionSectionDefinition[] = [
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

/*
 * Groups collection cards by progress so rewards ready to claim are easy to find.
 */
export default function CollectionsView() {
	const { collections, status, reloadProgress } = useUserProgress();

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return (
			<View style={styles.notice}>
				<Text style={styles.introduction}>Could not load your collections. Please try again.</Text>
				<LinkButton handler={reloadProgress}>Try again</LinkButton>
			</View>
		);
	}

	return (
		<BackgroundImage
			source={chapterSelectBackground}
			style={styles.background}
		>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.introduction}>Do flashcards to complete collections!</Text>
				{collectionSections.map(section => {
					const albums = collections.filter(progress => progress.section === section.key);

					if (albums.length === 0) {
						return null;
					}

					return (
						<View
							key={section.key}
							style={styles.section}
						>
							<View style={styles.sectionHeader}>
								<Text
									accessibilityRole="header"
									style={styles.sectionTitle}
								>
									{section.title}
								</Text>
								<Text style={styles.count}>{albums.length}</Text>
							</View>
							{albums.map(progress => (
								<CollectionCard
									key={progress.collection.id}
									progress={progress}
								/>
							))}
						</View>
					);
				})}
				{collections.length === 0 && (
					<Text style={styles.introduction}>New collections are on their way.</Text>
				)}
			</ScrollView>
		</BackgroundImage>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.dark.background,
	},
	content: {
		flexGrow: 1,
		padding: 16,
		gap: 24,
	},
	introduction: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 20,
		textAlign: 'center',
		color: colors.light.background,
	},
	section: {
		gap: 10,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	sectionTitle: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.light.secondary,
	},
	count: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.text,
		backgroundColor: colors.light.background,
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 6,
	},
	notice: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		gap: 16,
		backgroundColor: colors.dark.background,
	},
});
