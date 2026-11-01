import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialSymbol from './MaterialSymbol';
import StorySelectView from './Views/StorySelectView';

const storySelectBackground = require('@/src/app/assets/images/stories/page-background.jpg');

/*
 * Typing
 */
interface StorySelectModalProps {
	onRequestClose: () => void;
	onSelect: (story: DeckStory) => void;
	isSelecting: boolean;
	visible: boolean;
}

/*
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
	};
	const storyListPaddingStyle = {
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
				<BackgroundImage
					source={storySelectBackground}
					resizeMode="cover"
					style={[styles.sheet, sheetStyle]}
				>
					<View
						pointerEvents="box-none"
						style={styles.topBar}
					>
						<Pressable
							accessibilityLabel="Close story selection"
							accessibilityRole="button"
							hitSlop={12}
							onPress={onRequestClose}
							style={styles.closeButton}
						>
							<MaterialSymbol
								color={colors.light.text}
								name="close"
								size={22}
							/>
						</Pressable>
					</View>
					<ScrollView
						contentContainerStyle={[styles.storyListContent, storyListPaddingStyle]}
						style={styles.storyList}
					>
						<StorySelectView
							onSelect={onSelect}
							isSelecting={isSelecting}
						/>
					</ScrollView>
				</BackgroundImage>
			</View>
		</Modal>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: 'rgba(18, 18, 18, 0.8)',
		justifyContent: 'flex-end',
		flex: 1,
	},
	sheet: {
		backgroundColor: '#F8F1E7',
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		paddingVertical: 16,
		paddingHorizontal: 8,
		overflow: 'hidden',
	},
	topBar: {
		position: 'absolute',
		top: 8,
		left: 0,
		right: 0,
		zIndex: 1,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
	},
	closeButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.dark.primary,
		borderWidth: 2,
		borderColor: colors.light.border,
		borderRadius: 4,
		height: 36,
		width: 36,
	},
	storyList: {
		flex: 1,
	},
	storyListContent: {
		flexGrow: 1,
	},
});
