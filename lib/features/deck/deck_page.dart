// Packages
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

// Services
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
  late Future<_DeckData> _deckFuture;
  int _currentIndex = 0;

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

          return _DeckView(
            data: data,
            currentIndex: _currentIndex,
            onPageChanged: (index) => setState(() => _currentIndex = index),
          );
        },
      ),
    );
  }
}

class _DeckView extends StatelessWidget {
  const _DeckView({
    required this.data,
    required this.currentIndex,
    required this.onPageChanged,
  });

  final _DeckData data;
  final int currentIndex;
  final ValueChanged<int> onPageChanged;

  @override
  Widget build(BuildContext context) {
    return PageView.builder(
      itemCount: data.words.length,
      onPageChanged: onPageChanged,
      itemBuilder: (context, index) {
        final word = data.words[index];
        final tier = data.progressMap[word.id]?.masteryTier ?? MasteryTier.none;
        return WordCard(
          word: word,
          mastery: tier,
          cardIndex: index,
          deckSize: data.words.length,
        );
      },
    );
  }
}

class _DeckData {
  const _DeckData({required this.words, required this.progressMap});

  final List<Word> words;
  final Map<String, UserWordProgress> progressMap;
}
