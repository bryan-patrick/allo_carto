// Dart
import 'dart:math';

// Models
import '../models/user_word_progress.dart';
import '../models/word.dart';

// Services
import 'database_service.dart';
import 'user_progress_service.dart';

const _deckSize = 12;
const _guaranteedBronze = 2;
const _guaranteedSilver = 2;
const _guaranteedGold = 2;

// 6 slots are filled with seen words (cascade) and then never seen words.
const cardSlots =
    _deckSize - _guaranteedBronze - _guaranteedSilver - _guaranteedGold;

class DeckService {
  DeckService._();

  static final DeckService instance = DeckService._();

  final _rng = Random();

  Future<List<Word>> assembleDeck() async {
    final allWords = await DatabaseService.instance.getAllWords();
    final progressMap = await UserProgressService.instance.getAllProgress();

    // Bucket words by mastery tier; platinum excluded from pool.
    final neverSeen = <Word>[];
    final bronze = <Word>[];
    final silver = <Word>[];
    final gold = <Word>[];

    for (final word in allWords) {
      final tier = progressMap[word.id]?.masteryTier ?? MasteryTier.none;

      switch (tier) {
        case MasteryTier.none:
          neverSeen.add(word);
        case MasteryTier.bronze:
          bronze.add(word);
        case MasteryTier.silver:
          silver.add(word);
        case MasteryTier.gold:
          gold.add(word);
        case MasteryTier.platinum:
          break;
      }
    }

    // Shuffle each bucket so picks are random within a tier.
    for (final bucket in [neverSeen, bronze, silver, gold]) {
      bucket.shuffle(_rng);
    }

    final picked = <Word>[];

    // Step 1: Pick guaranteed slots from each tier.
    picked.addAll(_drawFromBucket(bronze, _guaranteedBronze));
    picked.addAll(_drawFromBucket(silver, _guaranteedSilver));
    picked.addAll(_drawFromBucket(gold, _guaranteedGold));

    // Step 2: Fill the 6 flex slots bronze -> silver -> gold -> neverSeen.
    final allCards = [...bronze, ...silver, ...gold, ...neverSeen];

    for (final word in allCards) {
      if (picked.length >= _deckSize) break;
      if (!picked.contains(word)) picked.add(word);
    }

    // Step 3: If still short fill any remaining from neverSeen.
    for (final word in neverSeen) {
      if (picked.length >= _deckSize) break;
      if (!picked.contains(word)) picked.add(word);
    }

    picked.shuffle(_rng);

    return picked;
  }

  /// Draws up to [requestedCount] words from the front of [bucket].
  /// This returns the drawn words and mutates [bucket] by removing them,
  /// so the same words cannot be selected again later.
  List<Word> _drawFromBucket(List<Word> bucket, int requestedCount) {
    final drawCount = requestedCount.clamp(0, bucket.length);
    final drawnWords = bucket.sublist(0, drawCount);

    bucket.removeRange(0, drawCount);

    return drawnWords;
  }
}
