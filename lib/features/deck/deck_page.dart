// Packages
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

// Services
import '../../core/services/answer_matcher.dart';
import '../../core/services/deck_service.dart';
import '../../core/services/user_progress_service.dart';

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

  @override
  void initState() {
    super.initState();
    _deckFuture = _loadDeck();
  }

  Future<_DeckData> _loadDeck() async {
    final words = await DeckService.instance.assembleDeck();
    final progressMap = await UserProgressService.instance.getAllProgress();

    return _DeckData(words: words, progressMap: progressMap);
  }

  @override
  void dispose() {
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

      if (correct) {
        await UserProgressService.instance.incrementCorrect(currentWord.id);
      }

      if (!mounted) return;

      setState(() {
        _lastWasCorrect = correct;

        if (correct) {
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
      _feedback = null;
    });
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
      AnswerFeedbackType.missingInfinitiveMarker =>
        'Close! You forgot the infinitive.',
      AnswerFeedbackType.wrongInfinitiveMarker =>
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
      AnswerFeedbackType.missingInfinitiveMarker =>
        'Close! You forgot the infinitive marker. Expected: $expectedMeaning',
      AnswerFeedbackType.wrongInfinitiveMarker =>
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
          final mastery =
              data.progressMap[currentWord.id]?.masteryTier ?? MasteryTier.none;

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  Expanded(
                    child: WordCard(
                      word: currentWord,
                      mastery: mastery,
                      cardIndex: _currentIndex,
                      deckSize: data.words.length,
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
                      alignment: Alignment.centerLeft,
                      child: Text(
                        _feedback!,
                        style: TextStyle(
                          color: _lastWasCorrect ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => _checkOrAdvance(data),
                      child: Text(_isCheckingAnswer ? 'Check answer' : 'Next'),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
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
  final Map<String, UserWordProgress> progressMap;
}
