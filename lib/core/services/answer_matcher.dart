// Dart
import 'dart:math' as math;

// Packages
import 'package:diacritic/diacritic.dart';

/*
 * We want to be helpful and somewhat relaxed
 * when it comes to user answers. It is 
 * important that we be extremely clear
 * with users if their answer is wrong.
 */
enum AnswerFeedbackType {
  exact,
  closeEnough,
  missingArticle,
  wrongArticle,
  missingInfinitive,
  wrongInfinitive,
  wrong,
}

typedef AnswerMatchResult = ({
  bool isCorrect,
  AnswerFeedbackType feedbackType,
  String? expectedMeaning,
  String? matchedMeaning,
});

typedef LanguageRules = ({Set<String> articles, Set<String> infinitiveMarkers});

/*
 * Namespace for matching utilities
 */
class AnswerMatcher {
  const AnswerMatcher._();

  static const LanguageRules englishRules = (
    articles: {'a', 'an', 'the'},
    infinitiveMarkers: {'to'},
  );

  static AnswerMatchResult match({
    required String userAnswer,
    required String expected,
  }) {
    /*
     * Step 1: clean up the user's answer so case, accents,
     * punctuation, and weird spacing do not get in the way.
     */
    final normalizedInput = normalize(userAnswer);

    if (normalizedInput.isEmpty) {
      return (
        isCorrect: false,
        feedbackType: AnswerFeedbackType.wrong,
        expectedMeaning: null,
        matchedMeaning: null,
      );
    }

    /*
     * Step 2: split the expected answer into every acceptable
     * answer so we can check each one in turn.
     */
    final acceptedAnswers = extractAcceptedAnswers(expected);

    if (acceptedAnswers.isEmpty) {
      return (
        isCorrect: false,
        feedbackType: AnswerFeedbackType.wrong,
        expectedMeaning: null,
        matchedMeaning: null,
      );
    }

    /*
     * Step 3: If the answer is close enough, 
     * or just a tiny typo away, we stop here.
     */
    final correctResult = findCorrectMatch(
      normalizedInput: normalizedInput,
      acceptedAnswers: acceptedAnswers,
    );

    if (correctResult != null) {
      return correctResult;
    }

    /*
     * Step 4: nothing counted as correct, so now we look for a
     * near miss like an article.
     */
    final nearMissResult = findNearMiss(
      normalizedInput: normalizedInput,
      acceptedAnswers: acceptedAnswers,
    );

    if (nearMissResult != null) {
      return nearMissResult;
    }

    /*
     * Step 5: if we got this far, the answer was just plain wrong,
     * so return the fallback result with the expected meaning and
     * call the user a loser
     */
    return (
      isCorrect: false,
      feedbackType: AnswerFeedbackType.wrong,
      expectedMeaning: expected,
      matchedMeaning: null,
    );
  }

  static bool isCorrect({
    required String userAnswer,
    required String expected,
  }) {
    return match(userAnswer: userAnswer, expected: expected).isCorrect;
  }

  /*
   * First pass: check every accepted answer for anything we are willing to
   * accept as correct, from exact matches to tiny typo tolerance.
   */
  static AnswerMatchResult? findCorrectMatch({
    required String normalizedInput,
    required List<String> acceptedAnswers,
  }) {
    for (final acceptedAnswer in acceptedAnswers) {
      final result = _matchAcceptedAnswerLeniently(
        normalizedInput: normalizedInput,
        acceptedAnswer: acceptedAnswer,
      );
      if (result != null) {
        return result;
      }
    }

    return null;
  }

  /*
   * Second pass: if nothing was correct, try to spot a specific kind
   * of almost-right answer so the UI can give a nicer hint.
   */
  static AnswerMatchResult? findNearMiss({
    required String normalizedInput,
    required List<String> acceptedAnswers,
  }) {
    AnswerMatchResult? bestIncorrectResult;

    for (final acceptedAnswer in acceptedAnswers) {
      final articleResult = _matchLeadingTokenDifference(
        normalizedInput: normalizedInput,
        acceptedAnswer: acceptedAnswer,
        validTokens: englishRules.articles,
        missingType: AnswerFeedbackType.missingArticle,
        wrongType: AnswerFeedbackType.wrongArticle,
      );
      if (articleResult != null) {
        bestIncorrectResult ??= articleResult;
      }

      final infinitiveResult = _matchLeadingTokenDifference(
        normalizedInput: normalizedInput,
        acceptedAnswer: acceptedAnswer,
        validTokens: englishRules.infinitiveMarkers,
        missingType: AnswerFeedbackType.missingInfinitive,
        wrongType: AnswerFeedbackType.wrongInfinitive,
      );
      if (infinitiveResult != null) {
        bestIncorrectResult ??= infinitiveResult;
      }
    }

    return bestIncorrectResult;
  }

  static AnswerMatchResult? _matchAcceptedAnswerLeniently({
    required String normalizedInput,
    required String acceptedAnswer,
  }) {
    if (normalizedInput == acceptedAnswer) {
      return (
        isCorrect: true,
        feedbackType: AnswerFeedbackType.exact,
        expectedMeaning: null,
        matchedMeaning: acceptedAnswer,
      );
    }

    if (normalizedInput.contains(acceptedAnswer)) {
      return (
        isCorrect: true,
        feedbackType: AnswerFeedbackType.closeEnough,
        expectedMeaning: null,
        matchedMeaning: acceptedAnswer,
      );
    }

    if (_letterDistance(normalizedInput, acceptedAnswer) <= 1) {
      return (
        isCorrect: true,
        feedbackType: AnswerFeedbackType.closeEnough,
        expectedMeaning: null,
        matchedMeaning: acceptedAnswer,
      );
    }

    final inputWords = normalizedInput.split(' ');
    for (final word in inputWords) {
      if (_letterDistance(word, acceptedAnswer) <= 1) {
        return (
          isCorrect: true,
          feedbackType: AnswerFeedbackType.closeEnough,
          expectedMeaning: null,
          matchedMeaning: acceptedAnswer,
        );
      }
    }

    return null;
  }

  static AnswerMatchResult? _matchLeadingTokenDifference({
    required String normalizedInput,
    required String acceptedAnswer,
    required Set<String> validTokens,
    required AnswerFeedbackType missingType,
    required AnswerFeedbackType wrongType,
  }) {
    final acceptedAnswerWords = acceptedAnswer.split(' ');
    if (acceptedAnswerWords.length < 2) {
      return null;
    }

    final expectedLead = acceptedAnswerWords.first;
    if (!validTokens.contains(expectedLead)) {
      return null;
    }

    final expectedCore = acceptedAnswerWords.skip(1).join(' ');
    if (normalizedInput == expectedCore) {
      return (
        isCorrect: false,
        feedbackType: missingType,
        expectedMeaning: acceptedAnswer,
        matchedMeaning: expectedCore,
      );
    }

    final inputWords = normalizedInput.split(' ');
    if (inputWords.length < 2) {
      return null;
    }

    final inputLead = inputWords.first;
    final inputCore = inputWords.skip(1).join(' ');
    if (validTokens.contains(inputLead) &&
        inputLead != expectedLead &&
        inputCore == expectedCore) {
      return (
        isCorrect: false,
        feedbackType: wrongType,
        expectedMeaning: acceptedAnswer,
        matchedMeaning: normalizedInput,
      );
    }

    return null;
  }

  static List<String> extractAcceptedAnswers(String expected) {
    final rawParts = expected.split(
      RegExp(r'\s*(?:/|;|,|\bor\b)\s*', caseSensitive: false),
    );

    return rawParts
        .map(normalize)
        .map((part) => part.trim())
        .where((part) => part.isNotEmpty)
        .toSet()
        .toList();
  }

  static String normalize(String value) {
    final withoutDiacritics = removeDiacritics(value.toLowerCase());
    final alphanumericOnly = withoutDiacritics.replaceAll(
      RegExp(r'[^a-z0-9\s]'),
      ' ',
    );

    return alphanumericOnly.replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  /*
   * I have no fucking clue how this works. It's a dynamic programming solution.
   * 
   * I am a little concerned that it has three loops though so I'll note to look
   * at it more in depth some other time. 
   * 
   * TODO: Look into this algo to see if we really need something this grand
   * Google "Levenshtein distance" and "Wagner-Fischer algorithm" 
   */
  static int _letterDistance(String a, String b) {
    if (a == b) {
      return 0;
    }

    if (a.isEmpty) {
      return b.length;
    }

    if (b.isEmpty) {
      return a.length;
    }

    final previous = List<int>.generate(b.length + 1, (i) => i);
    final current = List<int>.filled(b.length + 1, 0);

    for (var i = 1; i <= a.length; i++) {
      current[0] = i;

      for (var j = 1; j <= b.length; j++) {
        final substitutionCost = a[i - 1] == b[j - 1] ? 0 : 1;

        current[j] = math.min(
          current[j - 1] + 1,
          math.min(previous[j] + 1, previous[j - 1] + substitutionCost),
        );
      }

      for (var j = 0; j <= b.length; j++) {
        previous[j] = current[j];
      }
    }

    return previous[b.length];
  }
}
