import type { DeckStory } from '@/data/french/storyAtlas';
import { storyAtlas } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialSymbol from '../../MaterialSymbol';
import Story from './Story';

const rueStVallierO = require('@/src/app/assets/images/stories/rue-st-vallier-o.jpg');

/**
 * Component story select view
 */
export default function StorySelectView() {
	const { stories } = storyAtlas;
	const { progressById, status } = useUserProgress();
	const paddingTop = useSafeAreaInsets().top;

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load story progress.</Text>;

	/**
	 * Render the component
	 */
	return (
		<ImageBackground
			style={styles.background}
			source={rueStVallierO}
		>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollViewContainer}
			>
				<View style={[styles.titleContainer, { paddingTop }]}>
					<MaterialSymbol
						name="auto_stories"
						size={32}
						style={styles.storyIcon}
						color={colors.light.goldenBorder}
					/>
					<Text style={styles.title}>Select a Story</Text>
					<Text style={styles.description}>Continue your French journey.</Text>
				</View>
				{stories.map((story: DeckStory) => {
					const { id } = story;
					const isLocked = !isItemUnlocked({ id, progressById });
					const progressPercent = progressById[id]?.completionPercentage ?? 0;

					return (
						<Story
							story={story}
							isLocked={isLocked}
							key={id}
							progressById={progressById}
							progressPercent={progressPercent}
						/>
					);
				})}
			</ScrollView>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		height: '100%',
	},
	titleContainer: {
		marginTop: 32,
		gap: 4,
		padding: 4,
	},
	storyIcon: {
		textShadowColor: '#000000',
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		textAlign: 'center',
		color: colors.light.background,
		textShadowColor: '#000000',
		textShadowRadius: 50,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	description: {
		textAlign: 'center',
		fontFamily: 'lexend-400',
		color: colors.light.goldenBorder,
		textShadowColor: '#000000',
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	scrollView: {
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
	},
	scrollViewContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: 24,
		paddingVertical: 16,
	},
});
