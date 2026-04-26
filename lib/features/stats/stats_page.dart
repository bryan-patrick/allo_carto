// Packages
import 'package:flutter/material.dart';

// Core
import '../../core/services/database_service.dart';
import '../../core/models/user_word_progress.dart';

class StatsPage extends StatefulWidget {
  const StatsPage({super.key});

  @override
  State<StatsPage> createState() => _StatsPageState();
}

class _StatsPageState extends State<StatsPage> {
  final DatabaseService _database = DatabaseService.instance;

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
  static const _cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  Map<String, Map<MasteryTier, int>> stats = _buildEmptyStats();

  static Map<String, Map<MasteryTier, int>> _buildEmptyStats() {
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

  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final reviewStats = await _database.getReviewStatsByLevel();

      if (!mounted) {
        return;
      }

      setState(() {
        stats = reviewStats;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Failed to load stats: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stats')),
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
      itemCount: _cefrLevels.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final level = _cefrLevels[index];
        final levelStats = stats[level]!;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(level, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final tier in MasteryTier.values)
                      _TierCountChip(tier: tier, count: levelStats[tier] ?? 0),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _TierCountChip extends StatelessWidget {
  const _TierCountChip({required this.tier, required this.count});

  final MasteryTier tier;
  final int count;

  ({String label, Color color, IconData icon}) get _tierProps {
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
    final props = _tierProps;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: props.color.withAlpha(24),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: props.color.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          Icon(props.icon, size: 16, color: props.color),
          const SizedBox(width: 6),
          Text(
            props.label,
            style: TextStyle(color: props.color, fontWeight: FontWeight.w600),
          ),
          const Spacer(), // Push the text to the right
          const SizedBox(width: 6),
          Text('$count', style: Theme.of(context).textTheme.labelLarge),
        ],
      ),
    );
  }
}
