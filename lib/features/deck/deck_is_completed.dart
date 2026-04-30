// Packages
import 'package:flutter/material.dart';

class DeckIsCompleted extends StatelessWidget {
  const DeckIsCompleted({
    super.key,
    required this.totalCards,
    required this.onClose,
  });

  final int totalCards;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Deck complete',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text('You reviewed $totalCards cards.'),
            const SizedBox(height: 8),
            FilledButton(onPressed: onClose, child: const Text('Close deck')),
          ],
        ),
      ),
    );
  }
}
