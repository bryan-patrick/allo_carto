import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import DeckPassageView from '@/src/components/DeckPassageView';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { ImageBackground, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Images
 */
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface DeckBoxModalProps {
	deck: CardDeck;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Standalone passage modal used by the fallback deck selection route
 */
export default function DeckBoxModal({
	deck,
	modalVisible,
	setModalVisible,
	wordProgressCounts,
	wordProgressKeyByWordId,
}: DeckBoxModalProps) {
	const { bottom, top } = useSafeAreaInsets();

	/**
	 * Render the modal
	 */
	return (
		<Modal
			animationType="slide"
			onRequestClose={() => setModalVisible(false)}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={modalVisible}
		>
			<View style={styles.backdrop}>
				<ImageBackground
					imageStyle={styles.backgroundImage}
					resizeMode="cover"
					source={postcardBackground}
					style={[
						styles.sheet,
						{
							marginTop: top + 8,
							paddingBottom: Math.max(bottom, 16),
						},
					]}
				>
					<View style={styles.topBar}>
						<View style={styles.topBarSpacer} />
						<Pressable
							accessibilityLabel="Hide passage"
							accessibilityRole="button"
							hitSlop={12}
							onPress={() => setModalVisible(false)}
							style={styles.closeButton}
						>
							<MaterialSymbol
								color={colors.dark.text}
								name="close"
								size={22}
							/>
						</Pressable>
					</View>
					<DeckPassageView
						deck={deck}
						wordProgressCounts={wordProgressCounts}
						wordProgressKeyByWordId={wordProgressKeyByWordId}
					/>
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
		backgroundColor: 'rgba(18, 18, 18, 0.72)',
		flex: 1,
	},
	sheet: {
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		flex: 1,
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
		paddingHorizontal: 16,
		paddingTop: 4,
	},
	topBarSpacer: {
		height: 36,
		width: 36,
	},
	closeButton: {
		alignItems: 'center',
		height: 36,
		justifyContent: 'center',
		width: 36,
	},
});
