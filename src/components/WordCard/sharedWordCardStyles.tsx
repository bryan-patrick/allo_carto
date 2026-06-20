import colors from "@/src/app/colors"
import { StyleSheet } from "react-native"

/**
 * Shared style - front and back of cards
 */
export const sharedWordCardStyles = StyleSheet.create({
  wordCardInner: {
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 8,
  },
  cardGradient: {
    borderBottomWidth: 1,
    borderColor: colors.light.border,
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  CEFRContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderRightWidth: 1,
  },
  cardCEFRLevel: {
    width: '100%',
    paddingRight: 8,
    paddingLeft: 8,
    fontFamily: 'red-hat-variable',
    fontSize: 14,
    borderColor: colors.light.border,
  },
  cardcorrectCount: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMain: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingRight: 8,
    paddingLeft: 8,
    marginTop: 16,
    gap: 8,
  },
  wordId: {
    color: colors.dark.text,
    fontSize: 22,
    fontWeight: '700',
  },
  wordPronunciation: {
    fontSize: 18,
    color: colors.dark.text
  },
  answerSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  answerSlot: {
    color: 'transparent',
    borderBottomWidth: 2,
    fontWeight: 700,
    fontSize: 18,
    padding: 8,
    paddingRight: 12,
    paddingLeft: 12,
  },
  answerSlotSuccess: {
    color: colors.dark.success,
    borderBottomColor: colors.dark.success
  },
  answerSlotWarning: {
    color: colors.dark.warning,
    backgroundColor: colors.light.warning,
  },
  answerSlotError: {
    color: colors.dark.danger,
    backgroundColor: colors.light.danger
  },
  feedbackContainer: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  feedbackText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    paddingTop: 8,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    color: colors.dark.success,
  },
  feedbackSuccess: {
    color: colors.dark.success,
    backgroundColor: colors.light.success
  },
  feedbackWarning: {
    color: colors.dark.warning,
    backgroundColor: colors.light.warning
  },
  feedbackError: {
    color: colors.dark.danger,
    backgroundColor: colors.light.danger
  }
})
