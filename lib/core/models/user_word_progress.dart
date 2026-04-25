enum MasteryTier { none, bronze, silver, gold, platinum }

class UserWordProgress {
  const UserWordProgress({required this.wordId, required this.correctCount});

  final String wordId;
  final int correctCount;

  MasteryTier get masteryTier {
    if (correctCount >= 30) return MasteryTier.platinum;
    if (correctCount >= 15) return MasteryTier.gold;
    if (correctCount >= 8) return MasteryTier.silver;
    if (correctCount >= 3) return MasteryTier.bronze;

    return MasteryTier.none;
  }

  /// The correct-count threshold for the next mastery tier.
  /// Returns null when the user has already reached platinum.
  int? get nextTierAt {
    if (correctCount < 3) return 3;
    if (correctCount < 8) return 8;
    if (correctCount < 15) return 15;
    if (correctCount < 30) return 30;

    return null;
  }

  factory UserWordProgress.fromMap(Map<String, dynamic> map) {
    return UserWordProgress(
      wordId: map['word_id'] as String,
      correctCount: map['correct_count'] as int,
    );
  }

  Map<String, dynamic> toMap() {
    return {'word_id': wordId, 'correct_count': correctCount};
  }
}
