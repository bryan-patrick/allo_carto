import colors from '@/src/app/colors';
import { StyleSheet } from 'react-native';

/**
 * Shared style - front and back of cards
 */
export const sharedWordCardStyles = StyleSheet.create({
	wordCardContainer: {
		borderRadius: 12,
		borderWidth: 3,
		borderColor: colors.light.border,
		overflow: 'hidden',
	},
	wordCardInner: {
		display: 'flex',
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.dark.border,
		borderRadius: 9,
	},
	cardMain: {
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		gap: 4,
		marginTop: 12,
	},
	wordId: {
		color: colors.dark.text,
		flexShrink: 1,
		fontSize: 22,
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	wordMetaContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	wordDetailText: {
		fontFamily: 'lexend-400',
		color: colors.dark.text,
		fontSize: 14,
		lineHeight: 16,
		gap: 12,
	},
	wordDetailDivider: {
		borderLeftColor: colors.dark.text,
		borderLeftWidth: 1,
		height: 22,
	},
	answerSlotContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		fontFamily: 'lexend-400',
	},
	answerSlot: {
		color: 'transparent',
		fontFamily: 'lexend-600',
		fontSize: 16,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginVertical: 8,
		borderBottomWidth: 2,
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
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: colors.dark.border,
	},
	feedbackText: {
		textAlign: 'center',
		fontSize: 15,
		lineHeight: 22,
		minHeight: 22,
		fontFamily: 'lexend-600',
		paddingHorizontal: 4,
		paddingVertical: 4,
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
