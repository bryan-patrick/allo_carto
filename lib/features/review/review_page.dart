// Packages
import 'package:flutter/material.dart';

// Core
import '../../core/models/word.dart';
import '../../core/services/database_service.dart';

class ReviewPage extends StatefulWidget {
  const ReviewPage({super.key});

  @override
  State<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends State<ReviewPage> {
  final DatabaseService _database = DatabaseService.instance;

  List<Word> _words = const [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  Future<void> _loadWords() async {
    try {
      final words = await _database.getAllWords();
      if (!mounted) {
        return;
      }
      setState(() {
        _words = words;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Failed to load words: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Review')),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(padding: const EdgeInsets.all(16), child: Text(_error!)),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _words.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final word = _words[index];
        return Card(
          child: ListTile(
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(word.french),
                if (word.pronunciation != null &&
                    word.pronunciation!.isNotEmpty)
                  Text(
                    word.pronunciation!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
            subtitle: Text(word.english),
            trailing: Text(word.cefrLevel),
          ),
        );
      },
    );
  }
}
