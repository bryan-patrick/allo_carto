/*
 * Gives the properties of each of the words for the cards
 */
class Word {
  const Word({
    required this.id,
    required this.french,
    required this.pronunciation,
    required this.english,
    required this.partOfSpeech,
    this.lemmaId,
    this.formType,
    this.tense,
    this.mood,
    this.person,
    this.grammaticalNumber,
    required this.cefrLevel,
    required this.category,
    required this.subcategory,
    this.exampleFr,
    this.exampleEn,
    this.gender,
  });

  final String id;
  final String french;
  final String? pronunciation;
  final String english;
  final String partOfSpeech;
  final String? lemmaId;
  final String? formType;
  final String? tense;
  final String? mood;
  final String? person;
  final String? grammaticalNumber;
  final String cefrLevel;
  final String category;
  final String subcategory;
  final String? exampleFr;
  final String? exampleEn;
  final String? gender;

  factory Word.fromMap(Map<String, dynamic> map) {
    return Word(
      id: map['id'] as String,
      french: map['french'] as String,
      pronunciation: map['pronunciation'] as String?,
      english: map['english'] as String,
      partOfSpeech: map['part_of_speech'] as String,
      lemmaId: map['lemma_id'] as String?,
      formType: map['form_type'] as String?,
      tense: map['tense'] as String?,
      mood: map['mood'] as String?,
      person: map['person'] as String?,
      grammaticalNumber: map['grammatical_number'] as String?,
      cefrLevel: map['cefr_level'] as String,
      category: map['category'] as String,
      subcategory: map['subcategory'] as String,
      exampleFr: map['example_fr'] as String?,
      exampleEn: map['example_en'] as String?,
      gender: map['gender'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'french': french,
      'pronunciation': pronunciation,
      'english': english,
      'part_of_speech': partOfSpeech,
      'lemma_id': lemmaId,
      'form_type': formType,
      'tense': tense,
      'mood': mood,
      'person': person,
      'grammatical_number': grammaticalNumber,
      'cefr_level': cefrLevel,
      'category': category,
      'subcategory': subcategory,
      'example_fr': exampleFr,
      'example_en': exampleEn,
      'gender': gender,
    };
  }
}
