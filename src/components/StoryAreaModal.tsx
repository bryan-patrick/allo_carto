import type { StoryArea } from '@/data/french/storyAreas';
import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { formatAreaLevelRange, getStoriesForArea } from '@/src/util/storyAreas';
import {
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialSymbol from './MaterialSymbol';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface StoryAreaModalProps {
	areas: StoryArea[];
	onRequestClose: () => void;
	onSelect: (area: StoryArea) => void;
	selectedAreaId: string;
	stories: DeckStory[];
	userLevel: number;
	visible: boolean;
}

interface StoryAreaOptionProps {
	area: StoryArea;
	isSelected: boolean;
	onSelect: (area: StoryArea) => void;
	storyCount: number;
	userLevel: number;
}

/**
 * Show the unlock requirement without allowing locked areas to be selected.
 */
function StoryAreaOption({
	area,
	isSelected,
	onSelect,
	storyCount,
	userLevel,
}: StoryAreaOptionProps) {
	const isLocked = userLevel < area.minLevel;
	const levelRange = formatAreaLevelRange(area);
	const areaStyle = { borderLeftColor: area.color };
	const iconStyle = { backgroundColor: `${area.color}18` };
	const unlockLabel = `Unlocks at Lvl. ${area.minLevel}`;

	if (isLocked) {
		return (
			<Pressable
				accessibilityLabel={`${unlockLabel}, ${levelRange}`}
				accessibilityRole="button"
				accessibilityState={{ disabled: true }}
				disabled
				style={[styles.areaCard, areaStyle]}
			>
				<View style={styles.areaHeading}>
					<View style={[styles.areaIcon, iconStyle]}>
						<MaterialSymbol
							color={area.color}
							name="lock"
							size={28}
						/>
					</View>
					<View style={styles.areaTitleContainer}>
						<Text style={styles.areaName}>{unlockLabel}</Text>
						<Text style={styles.areaLevels}>{levelRange}</Text>
					</View>
				</View>
			</Pressable>
		);
	}

	let storyLabel = `${storyCount} stories`;

	if (storyCount === 1) storyLabel = '1 story';
	if (storyCount === 0) storyLabel = 'No stories yet';

	const accessibilityLabel = `${area.name}, ${levelRange}, Unlocked, ${storyLabel}`;

	return (
		<Pressable
			accessibilityHint="Shows the stories in this area"
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button"
			accessibilityState={{ selected: isSelected }}
			onPress={() => onSelect(area)}
			style={({ pressed }) => [
				styles.areaCard,
				areaStyle,
				isSelected && styles.selectedArea,
				pressed && styles.pressedArea,
			]}
		>
			<View style={styles.areaHeading}>
				<View style={[styles.areaIcon, iconStyle]}>
					<MaterialSymbol
						color={area.color}
						name={area.materialSymbolName}
						size={28}
					/>
				</View>
				<View style={styles.areaTitleContainer}>
					<Text style={styles.areaName}>{area.name}</Text>
					<Text style={styles.areaLevels}>{levelRange}</Text>
				</View>
				{isSelected && (
					<MaterialSymbol
						color={area.color}
						name="check_circle"
						size={24}
					/>
				)}
			</View>
			<Text style={styles.areaDescription}>{area.description}</Text>
			<View style={styles.areaFooter}>
				<View style={styles.areaStatus}>
					<MaterialSymbol
						color={area.color}
						name="lock_open"
						size={16}
					/>
					<Text style={[styles.areaStatusText, { color: area.color }]}>Unlocked</Text>
				</View>
				<Text style={styles.storyCount}>{storyLabel}</Text>
			</View>
		</Pressable>
	);
}

/**
 * Explore the level areas of the story atlas.
 */
export default function StoryAreaModal({
	areas,
	onRequestClose,
	onSelect,
	selectedAreaId,
	stories,
	userLevel,
	visible,
}: StoryAreaModalProps) {
	const { bottom, top } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const sheetStyle = {
		height: Math.min(windowHeight * 0.82, windowHeight - top - 8),
		paddingBottom: Math.max(bottom, 16),
	};
	const areaOptions = areas.map(area => ({
		area,
		storyCount: getStoriesForArea(stories, area).length,
	}));

	return (
		<Modal
			accessibilityViewIsModal
			animationType="slide"
			onRequestClose={onRequestClose}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.backdrop}>
				<ImageBackground
					imageStyle={styles.backgroundImage}
					resizeMode="cover"
					source={postcardBackground}
					style={[styles.sheet, sheetStyle]}
				>
					<View style={styles.topBar}>
						<Text
							accessibilityRole="header"
							style={styles.title}
						>
							Explore areas
						</Text>
						<Pressable
							accessibilityLabel="Close area selection"
							accessibilityRole="button"
							hitSlop={12}
							onPress={onRequestClose}
							style={styles.closeButton}
						>
							<MaterialSymbol
								color={colors.dark.text}
								name="close"
								size={22}
							/>
						</Pressable>
					</View>
					<Text style={styles.introduction}>
						Your level: Lvl. {userLevel}. Choose an area to explore its stories.
					</Text>
					<ScrollView contentContainerStyle={styles.areaList}>
						{areaOptions.map(({ area, storyCount }) => (
							<StoryAreaOption
								area={area}
								isSelected={area.id === selectedAreaId}
								key={area.id}
								onSelect={onSelect}
								storyCount={storyCount}
								userLevel={userLevel}
							/>
						))}
					</ScrollView>
				</ImageBackground>
			</View>
		</Modal>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: 'rgba(18, 18, 18, 0.8)',
		justifyContent: 'flex-end',
		flex: 1,
	},
	sheet: {
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		paddingTop: 8,
		overflow: 'hidden',
	},
	backgroundImage: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: 44,
		paddingHorizontal: 20,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 22,
	},
	closeButton: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		width: 36,
	},
	introduction: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 14,
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	areaList: {
		gap: 8,
		paddingHorizontal: 16,
	},
	areaCard: {
		borderColor: colors.light.goldenBorder,
		borderRadius: 2,
		borderWidth: 1,
		borderLeftWidth: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
		gap: 12,
		padding: 12,
	},
	selectedArea: {
		borderColor: colors.dark.primary,
		borderLeftWidth: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
	},
	pressedArea: {
		opacity: 0.75,
	},
	areaHeading: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	areaIcon: {
		alignItems: 'center',
		borderRadius: 0,
		justifyContent: 'center',
		height: 44,
		width: 44,
	},
	areaTitleContainer: {
		flex: 1,
		gap: 4,
	},
	areaName: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	areaLevels: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	areaDescription: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	areaFooter: {
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'space-between',
	},
	areaStatus: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4,
	},
	areaStatusText: {
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
	storyCount: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
});
