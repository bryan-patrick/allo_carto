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
  cardMain: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  wordId: {
    color: colors.dark.text,
    fontSize: 22,
    fontFamily: 'lexend-600',
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
    fontFamily: 'lexend-600',
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontFamily: 'lexend-600',
    paddingHorizontal: 4,
    paddingVertical: 8,
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
