import colors from '@/src/app/colors';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GettingStartedModal from './getting-started/GettingStartedModal';
import LevelBadge from './LevelBadge';
import MaterialSymbol from './MaterialSymbol';

// Show the player level and a guide that opens automatically for new players.
export default function ChapterSelectHeader() {
	const insets = useSafeAreaInsets();
	const user = useUserContext();
	const { progressById, status } = useUserProgress();
	// Follow saved progress until the player opens or finishes the guide.
	const [gettingStartedVisibility, setGettingStartedVisibility] = useState<boolean | null>(null);
	const hasCompletedGettingStarted = user?.hasCompletedGettingStarted;
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
	});
	const storyColor =
		selectedStory ? colors.categoryLight[selectedStory.category] : colors.light.primary;
	const headerBorderStyle = {
		borderBottomColor: `${storyColor}30`,
	};
	const insetStyle = {
		paddingTop: insets.top + 8,
		paddingLeft: Math.max(insets.left, 12),
		paddingRight: Math.max(insets.right, 12),
	};
	const isReady = status === 'ready' && selectedStory;
	const isGettingStartedVisible =
		gettingStartedVisibility ?? (status === 'ready' && hasCompletedGettingStarted === 0);

	function handleFinishGettingStarted() {
		setGettingStartedVisibility(false);

		if (hasCompletedGettingStarted === 0) {
			void user?.completeGettingStarted();
		}
	}

	return (
		<View style={[styles.header, insetStyle, headerBorderStyle]}>
			<View style={styles.headerRow}>
				<View style={styles.guideColumn}>
					{isReady && (
						<Pressable
							accessibilityLabel="Getting started"
							accessibilityRole="button"
							onPress={() => setGettingStartedVisibility(true)}
							style={styles.gettingStartedLink}
						>
							<Text style={styles.gettingStartedText}>Getting started</Text>
							<MaterialSymbol
								name="help"
								color={colors.light.text}
								size={20}
							/>
						</Pressable>
					)}
				</View>
				<View style={styles.levelColumn}>
					<LevelBadge />
				</View>
			</View>
			<GettingStartedModal
				visible={isGettingStartedVisible}
				onFinish={handleFinishGettingStarted}
			/>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		backgroundColor: colors.dark.background,
		marginBottom: 8,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	guideColumn: {
		flex: 1,
		minWidth: 0,
	},
	levelColumn: {
		flexShrink: 0,
	},
	gettingStartedLink: {
		alignSelf: 'flex-start',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		gap: 4,
	},
	gettingStartedText: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
		textDecorationLine: 'underline',
	},
});
