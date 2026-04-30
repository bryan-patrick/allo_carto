// Models
import '../../core/models/user_word_progress.dart';

// Services
import '../../core/services/answer_matcher.dart';

// Feedback
import 'card_feedback.dart';

class CheckAnswer {
  const CheckAnswer({
    required this.attemptsUsed,
    required this.sessionCorrectIncrement,
    required this.shouldAdvanceToNextCard,
    required this.isCheckingAnswer,
    required this.isCardFlipped,
    required this.lastWasCorrect,
    required this.isSkipping,
    required this.persistCorrectIncrement,
    required this.shouldPlayConfetti,
    required this.feedback,
  });

  final int attemptsUsed;
  final int sessionCorrectIncrement;
  final bool shouldAdvanceToNextCard;
  final bool isCheckingAnswer;
  final bool isCardFlipped;
  final bool lastWasCorrect;
  final bool isSkipping;
  final bool persistCorrectIncrement;
  final bool shouldPlayConfetti;
  final String? feedback;

  static CheckAnswer evaluate({
    required int attemptsUsed,
    required int maxAttemptsPerCard,
    required int previousCorrectCount,
    required bool skip,
    required bool isCheckingAnswer,
    required String answer,
    required String expectedMeaning,
    required String wordId,
    required CardFeedback feedback,
  }) {
    if (skip) {
      return CheckAnswer(
        attemptsUsed: attemptsUsed,
        sessionCorrectIncrement: 0,
        shouldAdvanceToNextCard: false,
        isCheckingAnswer: false,
        isCardFlipped: true,
        lastWasCorrect: false,
        isSkipping: true,
        persistCorrectIncrement: false,
        shouldPlayConfetti: false,
        feedback: null,
      );
    }

    if (!isCheckingAnswer) {
      return CheckAnswer(
        attemptsUsed: 0,
        sessionCorrectIncrement: 0,
        shouldAdvanceToNextCard: true,
        isCheckingAnswer: true,
        isCardFlipped: false,
        lastWasCorrect: false,
        isSkipping: false,
        persistCorrectIncrement: false,
        shouldPlayConfetti: false,
        feedback: null,
      );
    }

    final matchResult = AnswerMatcher.match(
      userAnswer: answer,
      expected: expectedMeaning,
    );

    if (matchResult.isCorrect) {
      final previousTier = MasteryProgress(
        wordId: wordId,
        correctCount: previousCorrectCount,
      ).masteryTier;
      final nextTier = MasteryProgress(
        wordId: wordId,
        correctCount: previousCorrectCount + 1,
      ).masteryTier;

      final shouldCelebrateLevelUp = nextTier.index > previousTier.index;

      return CheckAnswer(
        attemptsUsed: attemptsUsed,
        sessionCorrectIncrement: 1,
        shouldAdvanceToNextCard: false,
        isCheckingAnswer: false,
        isCardFlipped: true,
        lastWasCorrect: true,
        isSkipping: false,
        persistCorrectIncrement: true,
        shouldPlayConfetti: shouldCelebrateLevelUp,
        feedback: feedback.successFeedback(matchResult.feedbackType),
      );
    }

    final nextAttemptsUsed = attemptsUsed + 1;
    final attemptsRemaining = maxAttemptsPerCard - nextAttemptsUsed;

    if (attemptsRemaining > 0) {
      return CheckAnswer(
        attemptsUsed: nextAttemptsUsed,
        sessionCorrectIncrement: 0,
        shouldAdvanceToNextCard: false,
        isCheckingAnswer: true,
        isCardFlipped: false,
        lastWasCorrect: false,
        isSkipping: false,
        persistCorrectIncrement: false,
        shouldPlayConfetti: false,
        feedback: feedback.retryFeedback(matchResult),
      );
    }

    return CheckAnswer(
      attemptsUsed: nextAttemptsUsed,
      sessionCorrectIncrement: 0,
      shouldAdvanceToNextCard: false,
      isCheckingAnswer: false,
      isCardFlipped: true,
      lastWasCorrect: false,
      isSkipping: false,
      persistCorrectIncrement: false,
      shouldPlayConfetti: false,
      feedback: feedback.finalFeedback(matchResult, expectedMeaning),
    );
  }
}
