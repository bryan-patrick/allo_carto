// Packages
import 'dart:math' as math;
import 'package:flutter/material.dart';

// Models
import '../../core/models/user_word_progress.dart';
import '../../core/models/word.dart';

class WordCard extends StatefulWidget {
  const WordCard({
    super.key,
    required this.word,
    required this.mastery,
    required this.correctCount,
    required this.cardIndex,
    required this.deckSize,
    required this.flipped,
  });

  final Word word;
  final MasteryTier mastery;
  final int correctCount;
  final int cardIndex;
  final int deckSize;
  final bool flipped;

  @override
  State<WordCard> createState() => _WordCardState();
}

class _WordCardState extends State<WordCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
  }

  @override
  void didUpdateWidget(WordCard oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.flipped && !oldWidget.flipped) {
      _controller.forward();
    } else if (!widget.flipped && oldWidget.flipped) {
      _controller.reset();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        final angle = _animation.value * math.pi;
        final showBack = angle > math.pi / 2;

        // The back face needs to be mirrored so text reads correctly.
        final transform = Matrix4.identity()
          ..setEntry(3, 2, 0.001) // perspective
          ..rotateY(showBack ? angle - math.pi : angle);

        return Transform(
          alignment: Alignment.center,
          transform: transform,
          child: showBack
              ? _CardFace.back(widget: widget, context: context)
              : _CardFace.front(widget: widget, context: context),
        );
      },
    );
  }
}

class _CardFace extends StatelessWidget {
  const _CardFace({required this.widget, required this.isBack});

  final WordCard widget;
  final bool isBack;

  factory _CardFace.front({
    required WordCard widget,
    required BuildContext context,
  }) {
    return _CardFace(widget: widget, isBack: false);
  }

  factory _CardFace.back({
    required WordCard widget,
    required BuildContext context,
  }) {
    return _CardFace(widget: widget, isBack: true);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final w = widget;

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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _CEFRBadge(level: w.word.cefrLevel),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _MasteryBadge(tier: w.mastery),
                      const SizedBox(width: 8),
                      _CountBadge(
                        value: w.correctCount,
                        colorScheme: colorScheme,
                        textTheme: theme.textTheme,
                      ),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              // French word
              Text(
                w.word.french,
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              if (w.word.pronunciation != null) ...[
                const SizedBox(height: 12),
                Text(
                  '(${w.word.pronunciation!})',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              // English answer — only visible on back
              if (isBack) ...[
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.withAlpha(24),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.green.withAlpha(80),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    w.word.english,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: Colors.green.shade700,
                      fontWeight: FontWeight.w700,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const Spacer(),
              Text(
                '${w.cardIndex + 1} / ${w.deckSize}',
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

class _CountBadge extends StatelessWidget {
  const _CountBadge({
    required this.value,
    required this.colorScheme,
    required this.textTheme,
  });

  final int value;
  final ColorScheme colorScheme;
  final TextTheme textTheme;

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 250),
      transitionBuilder: (child, animation) {
        return ScaleTransition(
          scale: CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          child: FadeTransition(opacity: animation, child: child),
        );
      },
      child: Container(
        key: ValueKey(value),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: colorScheme.outlineVariant, width: 1),
        ),
        child: Text(
          '$value',
          style: textTheme.bodySmall?.copyWith(
            color: colorScheme.onSurfaceVariant,
            fontVariations: const [FontVariation('wght', 600)],
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
