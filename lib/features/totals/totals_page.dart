// Packages
import 'package:flutter/material.dart';

// Core
import '../../core/services/database_service.dart';
import '../../core/models/user_word_progress.dart';

typedef Totals = Map<String, Map<MasteryTier, int>>;

class TotalsPage extends StatefulWidget {
  const TotalsPage({super.key});

  @override
  State<TotalsPage> createState() => TotalsPageState();
}

class TotalsPageState extends State<TotalsPage> {
  final DatabaseService database = DatabaseService.instance;

  /*
   * This is just a fancy way to make this shape dynamically
   * based on the enum:
   * 
   * {
   *  A1: {
   *   MasteryTier.none: 0, 
   *   MasteryTier.bronze: 0, 
   *   MasteryTier.silver: 0, 
   *   MasteryTier.gold: 0, 
   *   MasteryTier.platinum: 0
   *  },
   *  B2: ...etc.
   * }
   */
  static const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  Totals stats = buildEmptyStats();

  static Totals buildEmptyStats() => {
    for (final level in cefrLevels)
      level: {for (final tier in MasteryTier.values) tier: 0},
  };

  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    loadStats();
  }

  Future<void> loadStats() async {
    try {
      final reviewStats = await database.getReviewStatsByLevel();

      if (!mounted) {
        return;
      }

      setState(() {
        stats = reviewStats;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        error = 'Failed to load stats: $e';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stats')),
      body: buildBody(context),
    );
  }

  // https://api.flutter.dev/flutter/dart-core/Iterable/fold.html
  Map<MasteryTier, int> get overallTierTotals => {
    for (final tier in MasteryTier.values)
      tier: cefrLevels.fold<int>(
        0,
        (sum, level) => sum + (stats[level]?[tier] ?? 0),
      ),
  };

  Widget buildBody(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(
        child: Padding(padding: const EdgeInsets.all(16), child: Text(error!)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: cefrLevels.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          final totals = overallTierTotals;
          final grandTotal =
              (totals[MasteryTier.bronze] ?? 0) +
              (totals[MasteryTier.silver] ?? 0) +
              (totals[MasteryTier.gold] ?? 0) +
              (totals[MasteryTier.platinum] ?? 0);

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'All Levels Totals',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    Wrap(
                      children: [
                        for (final tier in MasteryTier.values)
                          TierCountChip(tier: tier, count: totals[tier] ?? 0),
                      ],
                    ),
                    const Divider(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 10,
                      ),
                      child: Row(
                        children: [
                          const Text('Grand total:'),
                          const Spacer(),
                          Text(
                            '$grandTotal',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        final level = cefrLevels[index - 1];
        final levelStats = stats[level]!;
        final medalTotal =
            (levelStats[MasteryTier.bronze] ?? 0) +
            (levelStats[MasteryTier.silver] ?? 0) +
            (levelStats[MasteryTier.gold] ?? 0) +
            (levelStats[MasteryTier.platinum] ?? 0);

        return Padding(
          padding: EdgeInsets.only(bottom: index == cefrLevels.length ? 0 : 8),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(level, style: Theme.of(context).textTheme.titleMedium),
                  Wrap(
                    children: [
                      for (final tier in MasteryTier.values)
                        TierCountChip(tier: tier, count: levelStats[tier] ?? 0),
                    ],
                  ),
                  const Divider(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 10,
                    ),
                    child: Row(
                      children: [
                        const Text('Total:'),
                        const Spacer(),
                        Text(
                          '$medalTotal',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class TierCountChip extends StatelessWidget {
  const TierCountChip({super.key, required this.tier, required this.count});

  final MasteryTier tier;
  final int count;

  ({String label, Color color, IconData icon}) get tierProps {
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
        color: Colors.grey,
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.gold => (
        label: 'Gold',
        color: Colors.amber,
        icon: Icons.military_tech_outlined,
      ),
      MasteryTier.platinum => (
        label: 'Platinum',
        color: Colors.cyan,
        icon: Icons.workspace_premium_outlined,
      ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final props = tierProps;

    return ListTile(
      leading: Icon(props.icon, size: 26, color: props.color),
      title: Text(props.label, style: TextStyle(color: props.color)),
      trailing: Text('$count', style: Theme.of(context).textTheme.titleMedium),
      dense: true,
    );
  }
}
