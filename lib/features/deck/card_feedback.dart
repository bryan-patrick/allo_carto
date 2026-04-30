import '../../core/services/answer_matcher.dart';

class CardFeedback {
  // Possibilities
  static const successMessages = {
    AnswerFeedbackType.closeEnough: 'Close enough. I counted that as correct.',
  };

  static const retryMessages = {
    AnswerFeedbackType.missingArticle: 'Close! Remember the article!',
    AnswerFeedbackType.wrongArticle: "Close! That's the wrong article.",
    AnswerFeedbackType.missingInfinitive: 'Close! You forgot the infinitive.',
    AnswerFeedbackType.wrongInfinitive:
        'Close! That infinitive marker is not right. Try again.',
  };

  static const finalMessagePrefixes = {
    AnswerFeedbackType.missingArticle: 'Close! You forgot the article.',
    AnswerFeedbackType.wrongArticle: 'Close! The article is not right.',
    AnswerFeedbackType.missingInfinitive:
        'Close! You forgot the infinitive marker.',
    AnswerFeedbackType.wrongInfinitive:
        'Close! The infinitive marker is not right.',
  };

  // Getters
  String successFeedback(AnswerFeedbackType feedbackType) =>
      successMessages[feedbackType] ?? 'Nice. Correct answer.';

  String retryFeedback(AnswerMatchResult result) =>
      retryMessages[result.feedbackType] ?? 'Not quite. Try again.';

  String finalFeedback(AnswerMatchResult result, String expectedMeaning) {
    final prefix = finalMessagePrefixes[result.feedbackType] ?? 'Not quite.';
    return '$prefix Expected: $expectedMeaning';
  }
}
