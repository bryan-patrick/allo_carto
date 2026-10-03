import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import DeckPassageView from '@/src/components/DeckPassageView';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { DeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useState } from 'react';
import {
	ImageBackground,
	Modal,
	Pressable,
	StyleSheet,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Images
 */
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface DeckBoxModalProps {
	currentWordId?: string;
	deck: CardDeck;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Standalone passage modal with a close button
 */
export default function DeckBoxModal({
	currentWordId,
	deck,
	modalVisible,
	setModalVisible,
	wordProgressCounts,
	wordProgressKeyByWordId,
}: DeckBoxModalProps) {
	const { bottom, top } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const [passageMeasurement, setPassageMeasurement] = useState<{
		deckId: string;
		height: number;
	}>();
	const contentHeight =
		passageMeasurement?.deckId === deck.id ? passageMeasurement.height : undefined;

	/*
	 * Use 60% of the screen until we know how tall the passage is.
	 * Then fit the passage and controls, leaving room for the safe areas.
	 * Long passages scroll instead of making the modal taller.
	 */
	const bottomPadding = Math.max(bottom, 16);
	const initialSheetHeight = windowHeight * 0.6;
	const maximumSheetHeight = Math.max(initialSheetHeight, windowHeight - top - 8);
	const sheetHeight =
		contentHeight === undefined ? initialSheetHeight : (
			Math.min(contentHeight + 44 + bottomPadding, maximumSheetHeight)
		);

	/**
	 * Render the modal
	 */
	return (
		<Modal
			accessibilityViewIsModal
			animationType="slide"
			onRequestClose={() => setModalVisible(false)}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={modalVisible}
		>
			<View style={styles.backdrop}>
				<ImageBackground
					testID="passage-modal-sheet"
					imageStyle={styles.backgroundImage}
					resizeMode="cover"
					source={postcardBackground}
					style={[
						styles.sheet,
						{
							height: sheetHeight,
							paddingBottom: bottomPadding,
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
						key={deck.id}
						currentWordId={currentWordId}
						deck={deck}
						onContentHeightChange={height => setPassageMeasurement({ deckId: deck.id, height })}
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
		justifyContent: 'flex-end',
	},
	sheet: {
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
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
