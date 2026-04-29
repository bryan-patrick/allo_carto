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
    required this.isSkipping,
  });

  final Word word;
  final MasteryTier mastery;
  final int correctCount;
  final int cardIndex;
  final int deckSize;
  final bool flipped;
  final bool isSkipping;

  @override
  State<WordCard> createState() => WordCardState();
}

class WordCardState extends State<WordCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController animationController;
  late final Animation<double> animation;

  @override
  void initState() {
    super.initState();
    animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    animation = CurvedAnimation(
      parent: animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void didUpdateWidget(WordCard oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.flipped && !oldWidget.flipped) {
      animationController.forward();
    } else if (!widget.flipped && oldWidget.flipped) {
      animationController.reset();
    }
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        final angle = animation.value * math.pi;
        final showBack = angle > math.pi / 2;

        // Always rotate the whole card. If back is visible, flip only that face
        // so text reads normally instead of mirrored.
        final transform = Matrix4.identity()
          ..setEntry(3, 2, 0.002) // perspective
          ..rotateY(angle);

        final face = showBack
            ? Transform(
                alignment: Alignment.center,
                transform: Matrix4.rotationY(math.pi),
                child: CardFace(widget: widget, isBack: true),
              )
            : CardFace(widget: widget, isBack: false);

        return Transform(
          alignment: Alignment.center,
          transform: transform,
          child: face,
        );
      },
    );
  }
}

class CardFace extends StatelessWidget {
  const CardFace({super.key, required this.widget, required this.isBack});

  final WordCard widget;
  final bool isBack;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CEFRBadge(level: widget.word.cefrLevel),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      MasteryBadge(tier: widget.mastery),
                      const SizedBox(width: 8),
                      CountBadge(
                        value: widget.correctCount,
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
                widget.word.french,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
              ),
              if (widget.word.pronunciation != null) ...[
                Text(
                  '(${widget.word.pronunciation})',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              // English answer — only visible on back
              if (isBack) ...[
                Container(
                  margin: const EdgeInsets.all(12),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: widget.isSkipping
                        ? Colors.grey.withAlpha(12)
                        : Colors.green.withAlpha(24),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: widget.isSkipping
                          ? Colors.grey.withAlpha(24)
                          : Colors.green.withAlpha(24),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    widget.word.english,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: widget.isSkipping
                          ? Colors.grey.shade400
                          : Colors.green.shade700,
                      fontSize: 18,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              const Spacer(),
              Text(
                '${widget.cardIndex + 1} / ${widget.deckSize}',
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

class CountBadge extends StatelessWidget {
  const CountBadge({
    super.key,
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

class CEFRBadge extends StatelessWidget {
  const CEFRBadge({super.key, required this.level});

  final String level;

  Color levelColor(BuildContext context) {
    return switch (level) {
      'A1' => Colors.yellow.shade700,
      'A2' => Colors.orange.shade700,
      'B1' => Colors.green.shade700,
      'B2' => Colors.blue.shade700,
      'C1' => Colors.purple.shade700,
      'C2' => Colors.deepPurple.shade700,
      _ => Colors.red.shade700,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: levelColor(context).withAlpha(30),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        level,
        style: TextStyle(
          color: levelColor(context),
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

class MasteryBadge extends StatelessWidget {
  const MasteryBadge({super.key, required this.tier});

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
        color: Colors.brown.shade700,
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.silver => (
        label: 'Silver',
        color: Colors.grey.shade700,
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
