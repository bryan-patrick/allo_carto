import colors from '@/src/app/colors';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface UserProgressModalProps {
	onRequestClose: () => void;
	visible: boolean;
}

/**
 * User progress modal shell
 */
export default function UserProgressModal({ onRequestClose, visible }: UserProgressModalProps) {
	const { bottom } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const sheetStyle = {
		height: windowHeight * 0.6,
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
				<View style={[styles.sheet, sheetStyle]}>
					<View style={styles.topBar}>
						<Text
							accessibilityRole="header"
							style={styles.title}
						>
							User progress
						</Text>
						<Pressable
							accessibilityLabel="Close user progress"
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
				</View>
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
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		overflow: 'hidden',
		paddingTop: 8,
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: 44,
		paddingHorizontal: 16,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	closeButton: {
		alignItems: 'center',
		height: 36,
		justifyContent: 'center',
		width: 36,
	},
});
