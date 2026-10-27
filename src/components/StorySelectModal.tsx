import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
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
import StorySelectView from './Views/StorySelectView';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface StorySelectModalProps {
	onRequestClose: () => void;
	onSelect: (story: DeckStory) => void;
	isSelecting: boolean;
	visible: boolean;
}

/**
 * Modal: We choose a story, then return to its chapters on Home view.
 */
export default function StorySelectModal({
	onRequestClose,
	onSelect,
	isSelecting,
	visible,
}: StorySelectModalProps) {
	const { bottom, top } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const sheetStyle = {
		height: Math.min(windowHeight * 0.82, windowHeight - top - 8),
		paddingBottom: Math.max(bottom, 16),
	};

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
					resizeMode="cover"
					source={postcardBackground}
					style={[styles.sheet, sheetStyle]}
				>
					<View style={styles.topBar}>
						<Text
							accessibilityRole="header"
							style={styles.title}
						>
							Choose a Story
						</Text>
						<Pressable
							accessibilityLabel="Close story selection"
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
					<Text style={styles.introduction}>Choose a story to explore its chapters.</Text>
					<ScrollView style={styles.storyList}>
						<StorySelectView
							onSelect={onSelect}
							isSelecting={isSelecting}
						/>
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
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
		paddingHorizontal: 20,
		paddingBottom: 12,
	},
	storyList: {
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
	},
});
