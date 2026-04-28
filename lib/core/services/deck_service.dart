// Dart
import 'dart:math';

// Models
import '../models/user_word_progress.dart';
import '../models/word.dart';

// Services
import 'database_service.dart';

// The methods in this file build a user deck for the user to study and learn
const deckSize = 12;
const guaranteedBronze = 2;
const guaranteedSilver = 2;
const guaranteedGold = 2;

// 6 slots are filled with seen words (cascade) and then never seen words.
const cardSlots =
    deckSize - guaranteedBronze - guaranteedSilver - guaranteedGold;

class DeckService {
  DeckService._();

  static final DeckService instance = DeckService._();

  Future<List<Word>> assembleDeck() async {
    final allWords = await DatabaseService.instance.getAllWords();
    final progressMap = await DatabaseService.instance.getAllProgress();

    // Bucket words by mastery tier; platinum excluded from pool.
    final neverSeen = <Word>[];
    final bronze = <Word>[];
    final silver = <Word>[];
    final gold = <Word>[];

    final bucketsByTier = <MasteryTier, List<Word>?>{
      MasteryTier.none: neverSeen,
      MasteryTier.bronze: bronze,
      MasteryTier.silver: silver,
      MasteryTier.gold: gold,
      MasteryTier.platinum: null,
    };

    for (final word in allWords) {
      final tier = progressMap[word.id]?.masteryTier ?? MasteryTier.none;
      final bucket = bucketsByTier[tier];

      if (bucket != null) {
        bucket.add(word);
      }
    }

    // Shuffle each bucket so picks are random within a tier.
    for (final bucket in [neverSeen, bronze, silver, gold]) {
      bucket.shuffle(Random());
    }

    final picked = <Word>[];

    // Pick guaranteed slots from each tier.
    picked.addAll(drawFromBucket(bronze, guaranteedBronze));
    picked.addAll(drawFromBucket(silver, guaranteedSilver));
    picked.addAll(drawFromBucket(gold, guaranteedGold));

    // Fill the 6 flex slots bronze -> silver -> gold -> neverSeen.
    final allCards = [...bronze, ...silver, ...gold, ...neverSeen];

    for (final word in allCards) {
      if (picked.length >= deckSize) break;
      if (!picked.contains(word)) picked.add(word);
    }

    // If still short fill any remaining from neverSeen.
    for (final word in neverSeen) {
      if (picked.length >= deckSize) break;
      if (!picked.contains(word)) picked.add(word);
    }

    picked.shuffle(Random());

    return picked;
  }

  /// Picks [requestedCount] words from [bucket].
  /// Returns what was picked and removes those same words from the [bucket],
  /// so the same words won't be selected again later.
  List<Word> drawFromBucket(List<Word> bucket, int requestedCount) {
    final drawCount = requestedCount.clamp(0, bucket.length);
    final drawnWords = bucket.sublist(0, drawCount);

    bucket.removeRange(0, drawCount);

    return drawnWords;
  }
}
