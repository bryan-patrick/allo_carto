// Core
import 'dart:math' as math;

// Packages
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

// Types
typedef DeckData = ({
  List<Word> words,
  Map<String, MasteryProgress> progressMap,
});

class DeckPage extends StatefulWidget {
  const DeckPage({super.key});

  @override
  State<DeckPage> createState() => _DeckPageState();
}

class _DeckPageState extends State<DeckPage> {
  final TextEditingController answerController = TextEditingController();
  late Future<DeckData> deck;
  static const int maxAttemptsPerCard = 3;
  String? feedback;
  bool isCheckingAnswer = true;
  bool lastWasCorrect = false;
  int currentIndex = 0;
  int attemptsUsed = 0;

  late final ConfettiController confettiController;
  final Map<String, int> sessionCorrects = {};

  @override
  void initState() {
    super.initState();
    confettiController = ConfettiController(
      duration: const Duration(milliseconds: 380),
    );
    deck = loadDeck();
  }

  Future<DeckData> loadDeck() async {
    final words = await DeckService.instance.assembleDeck();
    final progressMap = await DatabaseService.instance.getAllProgress();

    return (words: words, progressMap: progressMap);
  }

  // Cleanup
  @override
  void dispose() {
    confettiController.dispose();
    answerController.dispose();
    super.dispose();
  }

  // Check or Advance
  //
  // Correct answer path:
  // 1. Get "previousTier"" and "nextTier" and see if we leveled up.
  // 2. Persist +1 correct answer to the DB.
  // 3. Confetti if the answer is in a new mastery tier.
  Future<void> _checkOrAdvance(DeckData data) async {
    final currentWord = data.words[currentIndex];

    // Check the answer
    // Evaluate user's answer against the current card's expected meaning.
    if (isCheckingAnswer) {
      bool shouldCelebrateLevelUp = false;
      final answer = answerController.text;
      final matchResult = AnswerMatcher.match(
        userAnswer: answer,
        expected: currentWord.english,
      );
      final correct = matchResult.isCorrect;

      // See if the next tier is going to level up
      if (correct) {
        final previousCorrectCount =
            (data.progressMap[currentWord.id]?.correctCount ?? 0) +
            (sessionCorrects[currentWord.id] ?? 0);
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

        if (shouldCelebrateLevelUp) {
          confettiController.play();
        }
      }

      // Update local UI state for this card attempt.
      // On success, increment with a local var (so it happens instantly)
      setState(() {
        lastWasCorrect = correct;

        if (correct) {
          sessionCorrects[currentWord.id] =
              (sessionCorrects[currentWord.id] ?? 0) + 1;
          feedback = successFeedback(matchResult.feedbackType);
          isCheckingAnswer = false;

          return;
        }

        attemptsUsed += 1;

        final attemptsRemaining = maxAttemptsPerCard - attemptsUsed;

        if (attemptsRemaining > 0) {
          feedback = retryFeedback(matchResult);
          isCheckingAnswer = true;
        } else {
          feedback = finalFeedback(matchResult, currentWord.english);
          isCheckingAnswer = false;
        }
      });
      return;
    }

    // The current card is done increment the index and reset the state
    setState(() {
      currentIndex += 1;
      answerController.clear();
      isCheckingAnswer = true;
      attemptsUsed = 0;
      lastWasCorrect = false;
      feedback = null;
    });

    confettiController.stop();
  }

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

  String successFeedback(AnswerFeedbackType feedbackType) =>
      successMessages[feedbackType] ?? 'Nice. Correct answer.';

  String retryFeedback(AnswerMatchResult result) =>
      retryMessages[result.feedbackType] ?? 'Not quite. Try again.';

  String finalFeedback(AnswerMatchResult result, String expectedMeaning) {
    final prefix = finalMessagePrefixes[result.feedbackType] ?? 'Not quite.';
    return '$prefix Expected: $expectedMeaning';
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
      body: FutureBuilder<DeckData>(
        future: deck,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final data = snapshot.data!;

          if (currentIndex >= data.words.length) {
            return _DeckCompleteView(
              totalCards: data.words.length,
              onClose: () => Navigator.of(context).pop(),
            );
          }

          final currentWord = data.words[currentIndex];
          final liveCorrectCount =
              (data.progressMap[currentWord.id]?.correctCount ?? 0) +
              (sessionCorrects[currentWord.id] ?? 0);
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
                          cardIndex: currentIndex,
                          deckSize: data.words.length,
                          flipped: lastWasCorrect,
                        ),
                      ),
                      TextField(
                        controller: answerController,
                        enabled: isCheckingAnswer,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => _checkOrAdvance(data),
                        decoration: const InputDecoration(
                          labelText: 'Type the meaning in English',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 10),
                      if (feedback != null)
                        Align(
                          alignment: Alignment.center,
                          child: Text(
                            feedback!,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: lastWasCorrect
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
                          style: !isCheckingAnswer && lastWasCorrect
                              ? FilledButton.styleFrom(
                                  backgroundColor: ColorScheme.fromSeed(
                                    seedColor: Colors.green,
                                    brightness: Theme.of(context).brightness,
                                  ).primary,
                                )
                              : null,
                          child: Text(
                            isCheckingAnswer ? 'Check answer' : 'Next',
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
                            confettiController: confettiController,
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
                            confettiController: confettiController,
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
                            confettiController: confettiController,
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
