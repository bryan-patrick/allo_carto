import colors from "@/src/app/styles"
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
    alignContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 4,
    paddingRight: 8,
    paddingLeft: 8,
    gap: 4,
  },
  cardCEFRLevel: {
    color: colors.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardUserScore: {
    color: colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMain: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    paddingRight: 8,
    paddingLeft: 8,
    marginTop: 16,
    gap: 8,
  },
  wordId: {
    color: colors.dark.text,
    fontSize: 24,
    fontWeight: '700',
  },
  wordPronunciation: {
    fontSize: 18,
    color: colors.dark.text
  },
  answerSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  answerSlot: {
    color: 'transparent',
    borderBottomWidth: 2,
    fontWeight: 700,
    fontSize: 18,
    padding: 8,
    paddingRight: 16,
    paddingLeft: 16,
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
