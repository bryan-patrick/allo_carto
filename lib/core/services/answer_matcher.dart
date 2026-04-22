import 'dart:math' as math;

import 'package:diacritic/diacritic.dart';

enum AnswerFeedbackType {
  exact,
  closeEnough,
  missingArticle,
  wrongArticle,
  missingInfinitiveMarker,
  wrongInfinitiveMarker,
  wrong,
}

class AnswerMatchResult {
  const AnswerMatchResult({
    required this.isCorrect,
    required this.feedbackType,
    this.expectedMeaning,
    this.matchedMeaning,
  });

  final bool isCorrect;
  final AnswerFeedbackType feedbackType;
  final String? expectedMeaning;
  final String? matchedMeaning;
}

class AnswerMatcher {
  const AnswerMatcher._();

  static const _englishRules = _LanguageRules(
    articles: {'a', 'an', 'the'},
    infinitiveMarkers: {'to'},
  );

  static AnswerMatchResult match({
    required String userAnswer,
    required String expected,
  }) {
    final normalizedInput = _normalize(userAnswer);

    if (normalizedInput.isEmpty) {
      return const AnswerMatchResult(
        isCorrect: false,
        feedbackType: AnswerFeedbackType.wrong,
      );
    }

    final candidates = _extractCandidates(expected);

    if (candidates.isEmpty) {
      return const AnswerMatchResult(
        isCorrect: false,
        feedbackType: AnswerFeedbackType.wrong,
      );
    }

    AnswerMatchResult? bestIncorrectResult;

    for (final candidate in candidates) {
      final exactOrLenientResult = _matchCandidateLeniently(
        normalizedInput: normalizedInput,
        candidate: candidate,
      );
      if (exactOrLenientResult != null) {
        return exactOrLenientResult;
      }

      final articleResult = _matchLeadingTokenDifference(
        normalizedInput: normalizedInput,
        candidate: candidate,
        validTokens: _englishRules.articles,
        missingType: AnswerFeedbackType.missingArticle,
        wrongType: AnswerFeedbackType.wrongArticle,
      );
      if (articleResult != null) {
        bestIncorrectResult ??= articleResult;
      }

      final infinitiveResult = _matchLeadingTokenDifference(
        normalizedInput: normalizedInput,
        candidate: candidate,
        validTokens: _englishRules.infinitiveMarkers,
        missingType: AnswerFeedbackType.missingInfinitiveMarker,
        wrongType: AnswerFeedbackType.wrongInfinitiveMarker,
      );
      if (infinitiveResult != null) {
        bestIncorrectResult ??= infinitiveResult;
      }
    }

    return bestIncorrectResult ??
        AnswerMatchResult(
          isCorrect: false,
          feedbackType: AnswerFeedbackType.wrong,
          expectedMeaning: expected,
        );
  }

  static bool isCorrect({
    required String userAnswer,
    required String expected,
  }) {
    return match(userAnswer: userAnswer, expected: expected).isCorrect;
  }

  static AnswerMatchResult? _matchCandidateLeniently({
    required String normalizedInput,
    required String candidate,
  }) {
    if (normalizedInput == candidate) {
      return AnswerMatchResult(
        isCorrect: true,
        feedbackType: AnswerFeedbackType.exact,
        matchedMeaning: candidate,
      );
    }

    if (normalizedInput.contains(candidate)) {
      return AnswerMatchResult(
        isCorrect: true,
        feedbackType: AnswerFeedbackType.closeEnough,
        matchedMeaning: candidate,
      );
    }

    if (_letterDistance(normalizedInput, candidate) <= 1) {
      return AnswerMatchResult(
        isCorrect: true,
        feedbackType: AnswerFeedbackType.closeEnough,
        matchedMeaning: candidate,
      );
    }

    final inputWords = normalizedInput.split(' ');
    for (final word in inputWords) {
      if (_letterDistance(word, candidate) <= 1) {
        return AnswerMatchResult(
          isCorrect: true,
          feedbackType: AnswerFeedbackType.closeEnough,
          matchedMeaning: candidate,
        );
      }
    }

    return null;
  }

  static AnswerMatchResult? _matchLeadingTokenDifference({
    required String normalizedInput,
    required String candidate,
    required Set<String> validTokens,
    required AnswerFeedbackType missingType,
    required AnswerFeedbackType wrongType,
  }) {
    final candidateWords = candidate.split(' ');
    if (candidateWords.length < 2) {
      return null;
    }

    final expectedLead = candidateWords.first;
    if (!validTokens.contains(expectedLead)) {
      return null;
    }

    final expectedCore = candidateWords.skip(1).join(' ');
    if (normalizedInput == expectedCore) {
      return AnswerMatchResult(
        isCorrect: false,
        feedbackType: missingType,
        expectedMeaning: candidate,
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
      return AnswerMatchResult(
        isCorrect: false,
        feedbackType: wrongType,
        expectedMeaning: candidate,
        matchedMeaning: normalizedInput,
      );
    }

    return null;
  }

  static List<String> _extractCandidates(String expected) {
    final rawParts = expected.split(
      RegExp(r'\s*(?:/|;|,|\bor\b)\s*', caseSensitive: false),
    );

    return rawParts
        .map(_normalize)
        .map((part) => part.trim())
        .where((part) => part.isNotEmpty)
        .toSet()
        .toList();
  }

  static String _normalize(String value) {
    final withoutDiacritics = removeDiacritics(value.toLowerCase());
    final alphanumericOnly = withoutDiacritics.replaceAll(
      RegExp(r'[^a-z0-9\s]'),
      ' ',
    );

    return alphanumericOnly.replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  /*
   * Computes Levenshtein edit distance using dynamic programming. 
   * 
   * This is Wagner-Fischer DP table optimization with two rows
   * Search for DP "Levenshtein distance" and "Wagner-Fischer algorithm"
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

class _LanguageRules {
  const _LanguageRules({required this.articles, required this.infinitiveMarkers});

  final Set<String> articles;
  final Set<String> infinitiveMarkers;
}
