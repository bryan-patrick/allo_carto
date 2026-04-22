import '../models/user_word_progress.dart';
import 'database_service.dart';

class UserProgressService {
  UserProgressService._();

  static final UserProgressService instance = UserProgressService._();

  Future<Map<String, UserWordProgress>> getAllProgress() {
    return DatabaseService.instance.getAllProgress();
  }

  Future<void> incrementCorrect(String wordId) {
    return DatabaseService.instance.incrementCorrectCount(wordId);
  }
}
