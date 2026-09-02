import colors from '@/src/app/colors';
import { StyleSheet } from 'react-native';

/**
 * Shared style - front and back of cards
 */
export const sharedWordCardStyles = StyleSheet.create({
	wordCardInner: {
		display: 'flex',
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		overflow: 'hidden',
		borderWidth: 4,
		borderColor: colors.light.border,
	},
	cardMain: {
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		marginTop: 16,
		gap: 8,
	},
	wordId: {
		color: colors.dark.text,
		fontSize: 22,
		fontFamily: 'lexend-600',
	},
	wordMetaContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	wordPronunciation: {
		fontSize: 16,
		color: colors.dark.text,
		fontFamily: 'lexend-400',
	},
	wordForm: {
		fontSize: 16,
		color: colors.dark.text,
		fontFamily: 'lexend-400',
	},
	answerSlotContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		fontFamily: 'lexend-400',
	},
	answerSlot: {
		color: 'transparent',
		borderBottomWidth: 2,
		fontFamily: 'lexend-600',
		fontSize: 18,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginVertical: 8,
	},
	answerSlotSuccess: {
		color: colors.dark.success,
		borderBottomColor: colors.dark.success,
	},
	answerSlotWarning: {
		color: colors.dark.warning,
		backgroundColor: colors.light.warning,
	},
	answerSlotError: {
		color: colors.dark.danger,
		backgroundColor: colors.light.danger,
	},
	feedbackContainer: {
		position: 'relative',
		width: '100%',
		height: 'auto',
		marginTop: 16,
		borderTopWidth: 1,
		borderTopColor: colors.light.border,
	},
	feedbackText: {
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 20,
		minHeight: 36,
		fontFamily: 'lexend-600',
		paddingHorizontal: 4,
		paddingVertical: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		color: colors.dark.success,
	},
	feedbackSuccess: {
		color: colors.dark.success,
		backgroundColor: `${colors.light.success}`,
	},
	feedbackWarning: {
		color: colors.dark.warning,
		backgroundColor: `${colors.light.warning}`,
	},
	feedbackError: {
		color: colors.dark.danger,
		backgroundColor: `${colors.light.danger}`,
	},
});
