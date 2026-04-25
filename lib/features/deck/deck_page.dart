// Packages
import 'dart:math' as math;

import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

// Services
import '../../core/services/answer_matcher.dart';
import '../../core/services/database_service.dart';
import '../../core/services/deck_service.dart';

// Widgets
import 'word_card.dart';

class DeckPage extends StatefulWidget {
  const DeckPage({super.key});

  @override
  State<DeckPage> createState() => _DeckPageState();
}

class _DeckPageState extends State<DeckPage> {
  static const int _maxAttemptsPerCard = 2;

  late Future<_DeckData> _deckFuture;
  int _currentIndex = 0;
  final TextEditingController _answerController = TextEditingController();
  bool _isCheckingAnswer = true;
  int _attemptsUsed = 0;
  bool _lastWasCorrect = false;
  String? _feedback;
  late final ConfettiController _confettiController;
  // Tracks correct answers earned in this session so WordCard shows live counts.
  final Map<String, int> _sessionCorrects = {};

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(
      duration: const Duration(milliseconds: 380),
    );
    _deckFuture = _loadDeck();
  }

  Future<_DeckData> _loadDeck() async {
    final words = await DeckService.instance.assembleDeck();
    final progressMap = await DatabaseService.instance.getAllProgress();

    return _DeckData(words: words, progressMap: progressMap);
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _checkOrAdvance(_DeckData data) async {
    if (_currentIndex >= data.words.length) {
      return;
    }

    final currentWord = data.words[_currentIndex];

    if (_isCheckingAnswer) {
      final answer = _answerController.text;
      final matchResult = AnswerMatcher.match(
        userAnswer: answer,
        expected: currentWord.english,
      );
      final correct = matchResult.isCorrect;
      var shouldCelebrateLevelUp = false;

      if (correct) {
        final previousCorrectCount =
            (data.progressMap[currentWord.id]?.correctCount ?? 0) +
            (_sessionCorrects[currentWord.id] ?? 0);
        final previousTier = MasteryProgress(
          wordId: currentWord.id,
          correctCount: previousCorrectCount,
        ).masteryTier;
        final nextTier = MasteryProgress(
          wordId: currentWord.id,
          correctCount: previousCorrectCount + 1,
        ).masteryTier;
        shouldCelebrateLevelUp = nextTier.index > previousTier.index;

        await DatabaseService.instance.incrementCorrectCount(currentWord.id);
        if (!mounted) return;
        if (shouldCelebrateLevelUp) {
          _confettiController.play();
        }
      }

      if (!mounted) return;

      setState(() {
        _lastWasCorrect = correct;

        if (correct) {
          _sessionCorrects[currentWord.id] =
              (_sessionCorrects[currentWord.id] ?? 0) + 1;
          _feedback = _successFeedback(matchResult.feedbackType);
          _isCheckingAnswer = false;
          return;
        }

        _attemptsUsed += 1;
        final attemptsRemaining = _maxAttemptsPerCard - _attemptsUsed;
        if (attemptsRemaining > 0) {
          _feedback = _retryFeedback(matchResult);
          _isCheckingAnswer = true;
        } else {
          _feedback = _finalFeedback(matchResult, currentWord.english);
          _isCheckingAnswer = false;
        }
      });
      return;
    }

    setState(() {
      _currentIndex += 1;
      _answerController.clear();
      _isCheckingAnswer = true;
      _attemptsUsed = 0;
      _lastWasCorrect = false;
      _feedback = null;
    });
    _confettiController.stop();
  }

  String _successFeedback(AnswerFeedbackType feedbackType) {
    return switch (feedbackType) {
      AnswerFeedbackType.closeEnough =>
        'Close enough. I counted that as correct.',
      _ => 'Nice. Correct answer.',
    };
  }

  String _retryFeedback(AnswerMatchResult result) {
    return switch (result.feedbackType) {
      AnswerFeedbackType.missingArticle => 'Close! Remember the article!',
      AnswerFeedbackType.wrongArticle => 'Close! That\'s the wrong article.',
      AnswerFeedbackType.missingInfinitive =>
        'Close! You forgot the infinitive.',
      AnswerFeedbackType.wrongInfinitive =>
        'Close! That infinitive marker is not right. Try again.',
      _ => 'Not quite. Try again.',
    };
  }

  String _finalFeedback(AnswerMatchResult result, String expectedMeaning) {
    return switch (result.feedbackType) {
      AnswerFeedbackType.missingArticle =>
        'Close! You forgot the article. Expected: $expectedMeaning',
      AnswerFeedbackType.wrongArticle =>
        'Close! The article is not right. Expected: $expectedMeaning',
      AnswerFeedbackType.missingInfinitive =>
        'Close! You forgot the infinitive marker. Expected: $expectedMeaning',
      AnswerFeedbackType.wrongInfinitive =>
        'Close! The infinitive marker is not right. Expected: $expectedMeaning',
      _ => 'Not quite. Expected: $expectedMeaning',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Open a Deck'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          tooltip: 'Close deck',
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: FutureBuilder<_DeckData>(
        future: _deckFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final data = snapshot.data!;

          if (data.words.isEmpty) {
            return const Center(
              child: Text(
                'No words available. Add more words to build a deck.',
              ),
            );
          }

          if (_currentIndex >= data.words.length) {
            return _DeckCompleteView(
              totalCards: data.words.length,
              onClose: () => Navigator.of(context).pop(),
            );
          }

          final currentWord = data.words[_currentIndex];
          final liveCorrectCount =
              (data.progressMap[currentWord.id]?.correctCount ?? 0) +
              (_sessionCorrects[currentWord.id] ?? 0);
          final mastery = MasteryProgress(
            wordId: currentWord.id,
            correctCount: liveCorrectCount,
          ).masteryTier;

          return SafeArea(
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
                      Expanded(
                        child: WordCard(
                          key: ValueKey(currentWord.id),
                          word: currentWord,
                          mastery: mastery,
                          correctCount: liveCorrectCount,
                          cardIndex: _currentIndex,
                          deckSize: data.words.length,
                          flipped: _lastWasCorrect,
                        ),
                      ),
                      TextField(
                        controller: _answerController,
                        enabled: _isCheckingAnswer,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _checkOrAdvance(data),
                        decoration: const InputDecoration(
                          labelText: 'Type the meaning in English',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 10),
                      if (_feedback != null)
                        Align(
                          alignment: Alignment.center,
                          child: Text(
                            _feedback!,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: _lastWasCorrect
                                  ? Colors.green
                                  : Colors.orange,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: () => _checkOrAdvance(data),
                          style: !_isCheckingAnswer && _lastWasCorrect
                              ? FilledButton.styleFrom(
                                  backgroundColor: ColorScheme.fromSeed(
                                    seedColor: Colors.green,
                                    brightness: Theme.of(context).brightness,
                                  ).primary,
                                )
                              : null,
                          child: Text(
                            _isCheckingAnswer ? 'Check answer' : 'Next',
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
                Positioned.fill(
                  child: IgnorePointer(
                    child: Stack(
                      children: [
                        Align(
                          alignment: Alignment.bottomCenter,
                          child: ConfettiWidget(
                            confettiController: _confettiController,
                            blastDirection: -math.pi / 2 + 0.16,
                            blastDirectionality:
                                BlastDirectionality.directional,
                            emissionFrequency: 0.03,
                            numberOfParticles: 5,
                            shouldLoop: false,
                            gravity: 0.20,
                            maxBlastForce: 90,
                            minBlastForce: 45,
                          ),
                        ),
                        Align(
                          alignment: Alignment.bottomCenter,
                          child: ConfettiWidget(
                            confettiController: _confettiController,
                            blastDirection: -math.pi / 2,
                            blastDirectionality:
                                BlastDirectionality.directional,
                            emissionFrequency: 0.03,
                            numberOfParticles: 6,
                            shouldLoop: false,
                            gravity: 0.20,
                            maxBlastForce: 90,
                            minBlastForce: 45,
                          ),
                        ),
                        Align(
                          alignment: Alignment.bottomCenter,
                          child: ConfettiWidget(
                            confettiController: _confettiController,
                            blastDirection: -math.pi / 2 - 0.16,
                            blastDirectionality:
                                BlastDirectionality.directional,
                            emissionFrequency: 0.03,
                            numberOfParticles: 5,
                            shouldLoop: false,
                            gravity: 0.20,
                            maxBlastForce: 90,
                            minBlastForce: 45,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DeckCompleteView extends StatelessWidget {
  const _DeckCompleteView({required this.totalCards, required this.onClose});

  final int totalCards;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Deck complete',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text('You reviewed $totalCards cards.'),
            const SizedBox(height: 16),
            FilledButton(onPressed: onClose, child: const Text('Close deck')),
          ],
        ),
      ),
    );
  }
}

class _DeckData {
  const _DeckData({required this.words, required this.progressMap});

  final List<Word> words;
  final Map<String, MasteryProgress> progressMap;
}
