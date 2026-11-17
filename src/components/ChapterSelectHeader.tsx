import colors from '@/src/app/colors';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GettingStartedModal from './getting-started/GettingStartedModal';
import LevelBadge from './LevelBadge';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface ChapterSelectHeaderProps {
	showBackButton?: boolean;
}

/**
 * Shows the player level, getting started guide, and an optional back button.
 */
export default function ChapterSelectHeader({ showBackButton = false }: ChapterSelectHeaderProps) {
	/**
	 * Navigation, screen edges, and player progress
	 */
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const user = useUserContext();
	const { progressById, status } = useUserProgress();

	/**
	 * Guide visibility and selected story
	 */
	const [gettingStartedVisibility, setGettingStartedVisibility] = useState<boolean | null>(null);
	const hasCompletedGettingStarted = user?.hasCompletedGettingStarted;
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
	});
	const isChapterProgressReady = status === 'ready' && Boolean(selectedStory);
	const isGettingStartedVisible =
		gettingStartedVisibility ?? (status === 'ready' && hasCompletedGettingStarted === 0);

	/**
	 * Header color and screen edges
	 */
	let storyColor = colors.light.primary;

	if (selectedStory) {
		storyColor = colors.categoryLight[selectedStory.category];
	}

	const headerBorderStyle = {
		borderBottomColor: `${storyColor}30`,
	};
	const insetStyle = {
		paddingTop: insets.top + 8,
		paddingLeft: Math.max(insets.left, 12),
		paddingRight: Math.max(insets.right, 12),
	};

	/**
	 * Returns to the chapter selection screen.
	 */
	function handleGoBack() {
		router.back();
	}

	/**
	 * Closes the guide and saves that the player has finished it.
	 */
	function handleFinishGettingStarted() {
		setGettingStartedVisibility(false);

		if (hasCompletedGettingStarted === 0) {
			void user?.completeGettingStarted();
		}
	}

	return (
		<View style={[styles.header, insetStyle, headerBorderStyle]}>
			<View style={styles.headerRow}>
				{showBackButton && (
					<Pressable
						accessibilityLabel="Back to chapters"
						accessibilityRole="button"
						onPress={handleGoBack}
						hitSlop={8}
						style={styles.backButton}
					>
						<MaterialSymbol
							name="arrow_back"
							color={colors.light.text}
							size={24}
						/>
					</Pressable>
				)}
				<View style={styles.guideColumn}>
					{isChapterProgressReady && (
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

/**
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
	backButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 32,
		minHeight: 44,
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
