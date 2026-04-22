// Packages
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

class WordCard extends StatelessWidget {
  const WordCard({
    super.key,
    required this.word,
    required this.mastery,
    required this.cardIndex,
    required this.deckSize,
  });

  final Word word;
  final MasteryTier mastery;
  final int cardIndex;
  final int deckSize;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              /**
               * CEFR badge row
               */
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _CEFRBadge(level: word.cefrLevel),
                  _MasteryBadge(tier: mastery),
                ],
              ),
              const Spacer(),
              /**
               * Word
               * TODO: Convert from french only to any lang
               */
              Text(
                word.french,
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              if (word.pronunciation != null) ...[
                const SizedBox(height: 12),
                Text(
                  word.pronunciation!,
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              const Spacer(),
              /**
               * Card position
               */
              Text(
                '${cardIndex + 1} / $deckSize',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CEFRBadge extends StatelessWidget {
  const _CEFRBadge({required this.level});

  final String level;

  Color _color(BuildContext context) {
    return switch (level) {
      'A1' || 'A2' => Colors.green.shade600,
      'B1' || 'B2' => Colors.orange.shade700,
      _ => Colors.red.shade700,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color(context).withAlpha(30),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _color(context), width: 1),
      ),
      child: Text(
        level,
        style: TextStyle(
          color: _color(context),
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _MasteryBadge extends StatelessWidget {
  const _MasteryBadge({required this.tier});

  final MasteryTier tier;

  ({String label, Color color, IconData icon}) get _attrs {
    return switch (tier) {
      MasteryTier.none => (
        label: 'New',
        color: Colors.blueGrey,
        icon: Icons.fiber_new_outlined,
      ),
      MasteryTier.bronze => (
        label: 'Bronze',
        color: const Color(0xFFCD7F32),
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.silver => (
        label: 'Silver',
        color: Colors.grey.shade500,
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.gold => (
        label: 'Gold',
        color: Colors.amber.shade700,
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.platinum => (
        label: 'Platinum',
        color: Colors.cyan.shade700,
        icon: Icons.workspace_premium_outlined,
      ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final a = _attrs;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(a.icon, size: 16, color: a.color),
        const SizedBox(width: 4),
        Text(
          a.label,
          style: TextStyle(
            color: a.color,
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
