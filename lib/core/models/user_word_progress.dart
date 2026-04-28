// Handles the badge / state of how well a user knows a word / card (aka "MasteryTier")
enum MasteryTier { none, bronze, silver, gold, platinum }

class MasteryProgress {
  const MasteryProgress({required this.wordId, required this.correctCount});

  final String wordId;
  final int correctCount;

  // Short circuit returns. I really don't like this.
  // Maybe there's a better way?
  MasteryTier get masteryTier {
    if (correctCount >= 30) return MasteryTier.platinum;
    if (correctCount >= 15) return MasteryTier.gold;
    if (correctCount >= 8) return MasteryTier.silver;
    if (correctCount >= 3) return MasteryTier.bronze;

    return MasteryTier.none;
  }

  int? get nextTierAt {
    if (correctCount < 3) return 3;
    if (correctCount < 8) return 8;
    if (correctCount < 15) return 15;
    if (correctCount < 30) return 30;

    return null;
  }

  factory MasteryProgress.fromMap(Map<String, dynamic> map) {
    return MasteryProgress(
      wordId: map['word_id'] as String,
      correctCount: map['correct_count'] as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {'word_id': wordId, 'correct_count': correctCount};
  }
}
