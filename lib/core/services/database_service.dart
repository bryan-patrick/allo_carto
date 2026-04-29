// TODO: Refactor. This file is a disaster.
//
// schema and data.
// Spins up a SQLlite DB for storing word progress and stats.

// Packages
import 'package:csv/csv.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

// Models
import '../models/user_word_progress.dart';
import '../models/word.dart';

class DatabaseService {
  DatabaseService._();

  static const List<String> _cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  static const List<String> _seedCsvAssets = [
    'assets/data/seed_words_a1.csv',
    'assets/data/seed_words_a2.csv',
    'assets/data/seed_words_b1.csv',
    'assets/data/seed_words_b2.csv',
    'assets/data/seed_words_c1.csv',
    'assets/data/seed_words_c2.csv',
  ];
  static final DatabaseService instance = DatabaseService._();
  static Database? _db;

  Future<Database> get database async {
    _db ??= await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'allo_carto_v9.db');

    // Temporary hard reset while iterating on schema/seed changes.
    await deleteDatabase(path);

    return openDatabase(
      path,
      version: 9,
      onCreate: (db, version) async {
        await _createWordsTable(db);
        await _createUserWordProgressTable(db);
        await _seedWords(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        await db.execute('DROP TABLE IF EXISTS user_word_progress');
        await db.execute('DROP TABLE IF EXISTS words');
        await _createWordsTable(db);
        await _createUserWordProgressTable(db);
        await _seedWords(db);
      },
    );
  }

  Future<void> _createWordsTable(Database db) async {
    await db.execute('''
      CREATE TABLE words (
        id TEXT PRIMARY KEY,
        french TEXT NOT NULL,
        pronunciation TEXT,
        english TEXT NOT NULL,
        part_of_speech TEXT NOT NULL,
        lemma_id TEXT,
        form_type TEXT,
        tense TEXT,
        mood TEXT,
        person TEXT,
        grammatical_number TEXT,
        cefr_level TEXT NOT NULL,
        category TEXT NOT NULL,
        variant TEXT NOT NULL DEFAULT 'shared',
        example_fr TEXT,
        example_en TEXT,
        gender TEXT
      )
    ''');
  }

  Future<void> _createUserWordProgressTable(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS user_word_progress (
        word_id TEXT PRIMARY KEY,
        correct_count INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  Future<void> _seedWords(Database db) async {
    final words = await _loadSeedWordsFromCsv();
    final batch = db.batch();

    for (final word in words) {
      batch.insert(
        'words',
        word.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  Future<List<Word>> _loadSeedWordsFromCsv() async {
    final words = <Word>[];

    for (final assetPath in _seedCsvAssets) {
      final csvText = await rootBundle.loadString(assetPath);
      final rows = const CsvToListConverter(
        shouldParseNumbers: false,
        eol: '\n',
      ).convert(csvText);

      if (rows.length <= 1) {
        continue;
      }

      final headers = rows.first
          .map((h) => h.toString())
          .toList(growable: false);

      for (final row in rows.skip(1)) {
        if (row.every((cell) => cell.toString().trim().isEmpty)) {
          continue;
        }

        final record = <String, String>{
          for (var i = 0; i < headers.length; i++)
            headers[i]: i < row.length ? row[i].toString().trim() : '',
        };

        String requiredField(String key) {
          final value = record[key];
          if (value == null || value.isEmpty) {
            throw FormatException(
              'Missing required CSV field "$key" in $assetPath',
            );
          }
          return value;
        }

        String? optionalField(String key) {
          final value = record[key];
          if (value == null || value.isEmpty) {
            return null;
          }
          return value;
        }

        words.add(
          Word(
            id: requiredField('id'),
            french: requiredField('french'),
            pronunciation: optionalField('pronunciation'),
            english: requiredField('english'),
            partOfSpeech: requiredField('part_of_speech'),
            lemmaId: optionalField('lemma_id'),
            formType: optionalField('form_type'),
            tense: optionalField('tense'),
            mood: optionalField('mood'),
            person: optionalField('person'),
            grammaticalNumber: optionalField('grammatical_number'),
            cefrLevel: requiredField('cefr_level'),
            category: requiredField('category'),
            variant: optionalField('variant') ?? 'shared',
            gender: optionalField('gender'),
          ),
        );
      }
    }

    return words;
  }

  // --- Queries ---

  Future<List<Word>> getAllWords() async {
    final db = await database;
    final rows = await db.query('words', orderBy: 'cefr_level, french');
    return rows.map(Word.fromMap).toList();
  }

  Future<List<Word>> getWordsByCategory(String category) async {
    final db = await database;
    final rows = await db.query(
      'words',
      where: 'category = ?',
      whereArgs: [category],
      orderBy: 'category, french',
    );

    return rows.map(Word.fromMap).toList();
  }

  Future<List<Word>> getWordsByLevel(String cefrLevel) async {
    final db = await database;
    final rows = await db.query(
      'words',
      where: 'cefr_level = ?',
      whereArgs: [cefrLevel],
      orderBy: 'french',
    );

    return rows.map(Word.fromMap).toList();
  }

  Future<List<String>> getCategories() async {
    final db = await database;
    final rows = await db.rawQuery(
      'SELECT DISTINCT category FROM words ORDER BY category',
    );

    return rows.map((r) => r['category'] as String).toList();
  }

  Future<void> insertWord(Word word) async {
    final db = await database;

    await db.insert(
      'words',
      word.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /*
   * Get user progress (by word)
   */
  Future<Map<String, MasteryProgress>> getAllProgress() async {
    final db = await database;
    final rows = await db.query('user_word_progress');

    return <String, MasteryProgress>{
      for (final row in rows)
        row['word_id'] as String: MasteryProgress.fromMap(row),
    };
  }

  static Map<String, Map<MasteryTier, int>> _buildEmptyReviewStats() {
    final emptyStats = <String, Map<MasteryTier, int>>{};

    for (final level in _cefrLevels) {
      final tierCounts = <MasteryTier, int>{};

      for (final tier in MasteryTier.values) {
        tierCounts[tier] = 0;
      }

      emptyStats[level] = tierCounts;
    }

    return emptyStats;
  }

  /*
   * This is for the review page. We need stats for words by MasteryTier
   * We don't want to duplicate a prop for count so we need the query.
   * 
   * IDK how to do this in SQL, there's probably a better way.
   */
  Future<Map<String, Map<MasteryTier, int>>> getReviewStatsByLevel() async {
    final db = await database;
    final rows = await db.rawQuery('''
      SELECT
        w.cefr_level AS cefr_level,
        CASE
          WHEN COALESCE(p.correct_count, 0) >= 30 THEN 'platinum'
          WHEN COALESCE(p.correct_count, 0) >= 15 THEN 'gold'
          WHEN COALESCE(p.correct_count, 0) >= 8 THEN 'silver'
          WHEN COALESCE(p.correct_count, 0) >= 3 THEN 'bronze'
          ELSE 'none'
        END AS mastery_tier,
        COUNT(*) AS word_count
      FROM words w
      LEFT JOIN user_word_progress p ON p.word_id = w.id
      GROUP BY
        w.cefr_level,
        CASE
          WHEN COALESCE(p.correct_count, 0) >= 30 THEN 'platinum'
          WHEN COALESCE(p.correct_count, 0) >= 15 THEN 'gold'
          WHEN COALESCE(p.correct_count, 0) >= 8 THEN 'silver'
          WHEN COALESCE(p.correct_count, 0) >= 3 THEN 'bronze'
          ELSE 'none'
        END
      ORDER BY w.cefr_level
    ''');

    final stats = _buildEmptyReviewStats();

    for (final row in rows) {
      final level = row['cefr_level'] as String;
      final tierName = row['mastery_tier'] as String;
      final count = (row['word_count'] as num).toInt();
      final tier = MasteryTier.values.byName(tierName);

      stats[level]?[tier] = count;
    }

    return stats;
  }

  Future<void> incrementCorrectCount(String wordId) async {
    final db = await database;

    await db.rawInsert(
      '''
      INSERT INTO user_word_progress (word_id, correct_count)
      VALUES (?, 1)
      ON CONFLICT(word_id) DO UPDATE SET correct_count = correct_count + 1
      ''',
      [wordId],
    );
  }
}
