// Packages
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

// Services
import '../../core/services/database_service.dart';
import '../../core/services/deck_service.dart';

// Widgets
import 'word_card.dart';
import 'deck_is_completed.dart';
import 'confetti_section.dart';

// Feedback
import 'card_feedback.dart';
import 'check_answer.dart';

// Types
typedef DeckData = ({
  List<Word> words,
  Map<String, MasteryProgress> progressMap,
});

// Init the DeckPage widget
class DeckPage extends StatefulWidget {
  const DeckPage({super.key});

  @override
  State<DeckPage> createState() => DeckPageState();
}

// Controller for DeskPageState
class DeckPageState extends State<DeckPage> {
  late Future<DeckData> deck;
  final TextEditingController answerController = TextEditingController();
  static const int maxAttemptsPerCard = 3;
  final cardFeedback = CardFeedback();
  String? feedback;
  bool lastWasCorrect = false;
  bool isCheckingAnswer = true;
  bool isCardFlipped = false;
  bool isSkipping = false;
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

  // Check Answer
  //
  // Correct answer path:
  // 1. Get "previousTier"" and "nextTier" and see if we leveled up.
  // 2. Persist +1 correct answer to the DB.
  // 3. Confetti if the answer is in a new mastery tier.
  Future<void> checkAnswer(DeckData data, {bool skip = false}) async {
    final currentWord = data.words[currentIndex];
    final previousCorrectCount =
        (data.progressMap[currentWord.id]?.correctCount ?? 0) +
        (sessionCorrects[currentWord.id] ?? 0);

    final answerResult = CheckAnswer.evaluate(
      skip: skip,
      isCheckingAnswer: isCheckingAnswer,
      answer: answerController.text,
      expectedMeaning: currentWord.english,
      attemptsUsed: attemptsUsed,
      maxAttemptsPerCard: maxAttemptsPerCard,
      previousCorrectCount: previousCorrectCount,
      wordId: currentWord.id,
      feedback: cardFeedback,
    );

    if (answerResult.persistCorrectIncrement) {
      await DatabaseService.instance.incrementCorrectCount(currentWord.id);
    }

    if (answerResult.shouldPlayConfetti) {
      confettiController.play();
    }

    if (answerResult.shouldAdvanceToNextCard) {
      advanceToNextCard();
      confettiController.stop();
      return;
    }

    setState(() {
      if (answerResult.sessionCorrectIncrement == 1) {
        sessionCorrects[currentWord.id] =
            (sessionCorrects[currentWord.id] ?? 0) + 1;
      }

      lastWasCorrect = answerResult.lastWasCorrect;
      isCheckingAnswer = answerResult.isCheckingAnswer;
      isCardFlipped = answerResult.isCardFlipped;
      feedback = answerResult.feedback;
      isSkipping = answerResult.isSkipping;
      attemptsUsed = answerResult.attemptsUsed;
    });
  }

  void advanceToNextCard() {
    setState(() {
      currentIndex += 1;
      answerController.clear();
      isCheckingAnswer = true;
      isCardFlipped = false;
      attemptsUsed = 0;
      lastWasCorrect = false;
      feedback = null;
      isSkipping = false;
    });
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
            return DeckIsCompleted(
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
                          flipped: isCardFlipped,
                          isSkipping: isSkipping,
                        ),
                      ),
                      TextField(
                        controller: answerController,
                        enabled: isCheckingAnswer,
                        textInputAction: TextInputAction.done,
                        onSubmitted: (_) => checkAnswer(data),
                        decoration: const InputDecoration(
                          labelText: 'Type the meaning in English',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 4),
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
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton(
                              onPressed: () => checkAnswer(data),
                              style: !isCheckingAnswer && lastWasCorrect
                                  ? FilledButton.styleFrom(
                                      backgroundColor: ColorScheme.fromSeed(
                                        seedColor: isSkipping
                                            ? Colors.orange
                                            : Colors.green,
                                        brightness: Theme.of(
                                          context,
                                        ).brightness,
                                      ).primary,
                                    )
                                  : null,
                              child: Text(
                                isCheckingAnswer ? 'Check answer' : 'Next',
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          OutlinedButton(
                            onPressed: isCheckingAnswer
                                ? () => checkAnswer(data, skip: true)
                                : null,
                            child: Text('Skip'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
                ConfettiSection(confettiController: confettiController),
              ],
            ),
          );
        },
      ),
    );
  }
}
