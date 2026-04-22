// Packages
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

// Models
import '../models/user_word_progress.dart';
import '../models/word.dart';

class DatabaseService {
  DatabaseService._();

  static final DatabaseService instance = DatabaseService._();
  static Database? _db;

  Future<Database> get database async {
    _db ??= await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'allo_carto.db');

    return openDatabase(
      path,
      version: 4,
      onCreate: (db, version) async {
        await _createWordsTable(db);
        await _createUserWordProgressTable(db);
        await _seedWords(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await _createUserWordProgressTable(db);
        }
        if (oldVersion < 3) {
          await _addWordFormColumns(db);
        }
        if (oldVersion < 4) {
          await _updateStarterWordMeanings(db);
        }
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
        subcategory TEXT NOT NULL,
        example_fr TEXT,
        example_en TEXT,
        gender TEXT
      )
    ''');
  }

  Future<void> _addWordFormColumns(Database db) async {
    await db.execute('ALTER TABLE words ADD COLUMN lemma_id TEXT');
    await db.execute('ALTER TABLE words ADD COLUMN form_type TEXT');
    await db.execute('ALTER TABLE words ADD COLUMN tense TEXT');
    await db.execute('ALTER TABLE words ADD COLUMN mood TEXT');
    await db.execute('ALTER TABLE words ADD COLUMN person TEXT');
    await db.execute('ALTER TABLE words ADD COLUMN grammatical_number TEXT');
  }

  Future<void> _createUserWordProgressTable(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS user_word_progress (
        word_id TEXT PRIMARY KEY,
        correct_count INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  Future<void> _updateStarterWordMeanings(Database db) async {
    await db.update(
      'words',
      {'english': 'big / tall / large'},
      where: 'id = ?',
      whereArgs: ['grand'],
    );
  }

  Future<void> _seedWords(Database db) async {
    final words = _starterWords;
    final batch = db.batch();

    for (final word in words) {
      batch.insert('words', word.toMap());
    }
    await batch.commit(noResult: true);
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
      orderBy: 'subcategory, french',
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

  // --- User Progress Queries ---

  Future<Map<String, UserWordProgress>> getAllProgress() async {
    final db = await database;
    final rows = await db.query('user_word_progress');

    return {
      for (final row in rows)
        row['word_id'] as String: UserWordProgress.fromMap(row),
    };
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

// Example seed data

const _starterWords = [
  Word(
    id: 'bonjour',
    french: 'bonjour',
    pronunciation: 'bon-zhoor',
    english: 'hello',
    partOfSpeech: 'interjection',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Greetings',
    exampleFr: 'Bonjour, comment ça va?',
    exampleEn: 'Hello, how are you?',
  ),
  Word(
    id: 'au_revoir',
    french: 'au revoir',
    pronunciation: 'oh-ruh-vwar',
    english: 'goodbye',
    partOfSpeech: 'interjection',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Greetings',
    exampleFr: 'Au revoir, à demain!',
    exampleEn: 'Goodbye, see you tomorrow!',
  ),
  Word(
    id: 'merci',
    french: 'merci',
    pronunciation: 'mehr-see',
    english: 'thank you',
    partOfSpeech: 'interjection',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Politeness',
    exampleFr: 'Merci beaucoup!',
    exampleEn: 'Thank you very much!',
  ),
  Word(
    id: 'sil_vous_plait',
    french: "s'il vous plaît",
    pronunciation: 'seel-voo-pleh',
    english: 'please',
    partOfSpeech: 'expression',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Politeness',
    exampleFr: "Un café, s'il vous plaît.",
    exampleEn: 'A coffee, please.',
  ),
  Word(
    id: 'oui',
    french: 'oui',
    pronunciation: 'wee',
    english: 'yes',
    partOfSpeech: 'adverb',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Responses',
  ),
  Word(
    id: 'non',
    french: 'non',
    pronunciation: 'nohn',
    english: 'no',
    partOfSpeech: 'adverb',
    cefrLevel: 'A1',
    category: 'Social',
    subcategory: 'Responses',
  ),
  Word(
    id: 'chat',
    french: 'chat',
    pronunciation: 'shah',
    english: 'cat',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'Animals',
    subcategory: 'Pets',
    gender: 'masculine',
    exampleFr: 'Le chat dort sur le canapé.',
    exampleEn: 'The cat is sleeping on the sofa.',
  ),
  Word(
    id: 'chien',
    french: 'chien',
    pronunciation: 'shee-ehn',
    english: 'dog',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'Animals',
    subcategory: 'Pets',
    gender: 'masculine',
    exampleFr: 'Mon chien aime courir.',
    exampleEn: 'My dog loves to run.',
  ),
  Word(
    id: 'maison',
    french: 'maison',
    pronunciation: 'may-zohn',
    english: 'house',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'Home',
    subcategory: 'Buildings',
    gender: 'feminine',
    exampleFr: 'La maison est grande.',
    exampleEn: 'The house is big.',
  ),
  Word(
    id: 'eau',
    french: 'eau',
    pronunciation: 'oh',
    english: 'water',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'Food & Drink',
    subcategory: 'Drinks',
    gender: 'feminine',
    exampleFr: "J'ai besoin d'eau.",
    exampleEn: 'I need water.',
  ),
  Word(
    id: 'manger',
    french: 'manger',
    pronunciation: 'mahn-zhay',
    english: 'to eat',
    partOfSpeech: 'verb',
    lemmaId: 'manger',
    formType: 'infinitive',
    cefrLevel: 'A1',
    category: 'Food & Drink',
    subcategory: 'Actions',
    exampleFr: "J'aime manger des crêpes.",
    exampleEn: 'I love eating crêpes.',
  ),
  Word(
    id: 'mange_present_1s',
    french: 'mange',
    pronunciation: 'mahnzh',
    english: 'I eat',
    partOfSpeech: 'verb',
    lemmaId: 'manger',
    formType: 'conjugated',
    tense: 'present',
    mood: 'indicative',
    person: 'first',
    grammaticalNumber: 'singular',
    cefrLevel: 'A1',
    category: 'Food & Drink',
    subcategory: 'Actions',
    exampleFr: 'Je mange une pomme.',
    exampleEn: 'I eat an apple.',
  ),
  Word(
    id: 'mangerai_future_1s',
    french: 'mangerai',
    pronunciation: 'mahn-zhuh-ray',
    english: 'I will eat',
    partOfSpeech: 'verb',
    lemmaId: 'manger',
    formType: 'conjugated',
    tense: 'future',
    mood: 'indicative',
    person: 'first',
    grammaticalNumber: 'singular',
    cefrLevel: 'A2',
    category: 'Food & Drink',
    subcategory: 'Actions',
    exampleFr: 'Je mangerai plus tard.',
    exampleEn: 'I will eat later.',
  ),
  Word(
    id: 'boire',
    french: 'boire',
    pronunciation: 'bwar',
    english: 'to drink',
    partOfSpeech: 'verb',
    lemmaId: 'boire',
    formType: 'infinitive',
    cefrLevel: 'A1',
    category: 'Food & Drink',
    subcategory: 'Actions',
    exampleFr: 'Il aime boire du café.',
    exampleEn: 'He likes to drink coffee.',
  ),
  Word(
    id: 'bois_present_1s',
    french: 'bois',
    pronunciation: 'bwah',
    english: 'I drink',
    partOfSpeech: 'verb',
    lemmaId: 'boire',
    formType: 'conjugated',
    tense: 'present',
    mood: 'indicative',
    person: 'first',
    grammaticalNumber: 'singular',
    cefrLevel: 'A1',
    category: 'Food & Drink',
    subcategory: 'Actions',
    exampleFr: 'Je bois de l’eau.',
    exampleEn: 'I drink water.',
  ),
  Word(
    id: 'rouge',
    french: 'rouge',
    pronunciation: 'roozh',
    english: 'red',
    partOfSpeech: 'adjective',
    cefrLevel: 'A1',
    category: 'Colors',
    subcategory: 'Basic Colors',
    exampleFr: 'La rose est rouge.',
    exampleEn: 'The rose is red.',
  ),
  Word(
    id: 'bleu',
    french: 'bleu',
    pronunciation: 'bluh',
    english: 'blue',
    partOfSpeech: 'adjective',
    cefrLevel: 'A1',
    category: 'Colors',
    subcategory: 'Basic Colors',
    exampleFr: 'Le ciel est bleu.',
    exampleEn: 'The sky is blue.',
  ),
  Word(
    id: 'grand',
    french: 'grand',
    pronunciation: 'grahn',
    english: 'big / tall / large',
    partOfSpeech: 'adjective',
    cefrLevel: 'A1',
    category: 'Descriptions',
    subcategory: 'Size',
    exampleFr: "C'est un grand homme.",
    exampleEn: 'He is a tall man.',
  ),
  Word(
    id: 'petit',
    french: 'petit',
    pronunciation: 'puh-tee',
    english: 'small / little',
    partOfSpeech: 'adjective',
    cefrLevel: 'A1',
    category: 'Descriptions',
    subcategory: 'Size',
    exampleFr: 'Elle a un petit chien.',
    exampleEn: 'She has a small dog.',
  ),
  Word(
    id: 'ami',
    french: 'ami',
    pronunciation: 'ah-mee',
    english: 'friend',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'People',
    subcategory: 'Relationships',
    gender: 'masculine',
    exampleFr: "C'est mon meilleur ami.",
    exampleEn: 'He is my best friend.',
  ),
  Word(
    id: 'ville',
    french: 'ville',
    pronunciation: 'veel',
    english: 'city / town',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    category: 'Places',
    subcategory: 'Urban',
    gender: 'feminine',
    exampleFr: 'Paris est une belle ville.',
    exampleEn: 'Paris is a beautiful city.',
  ),
  Word(
    id: 'travailler',
    french: 'travailler',
    pronunciation: 'trah-vai-yay',
    english: 'to work',
    partOfSpeech: 'verb',
    lemmaId: 'travailler',
    formType: 'infinitive',
    cefrLevel: 'A1',
    category: 'Work',
    subcategory: 'Actions',
    exampleFr: 'Je travaille tous les jours.',
    exampleEn: 'I work every day.',
  ),
  Word(
    id: 'apprendre',
    french: 'apprendre',
    pronunciation: 'ah-prahn-druh',
    english: 'to learn',
    partOfSpeech: 'verb',
    lemmaId: 'apprendre',
    formType: 'infinitive',
    cefrLevel: 'A2',
    category: 'Education',
    subcategory: 'Actions',
    exampleFr: "J'apprends le français.",
    exampleEn: 'I am learning French.',
  ),
];
