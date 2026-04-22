// Packages
import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({
    super.key,
    required this.themeMode,
    required this.onThemeModeChanged,
  });

  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Appearance', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Card(
            child: RadioGroup<ThemeMode>(
              groupValue: themeMode,
              onChanged: _handleThemeModeChanged,
              child: const Column(
                children: [
                  RadioListTile<ThemeMode>(
                    title: Text('Device'),
                    subtitle: Text('Use the system appearance'),
                    value: ThemeMode.system,
                  ),
                  RadioListTile<ThemeMode>(
                    title: Text('Light'),
                    value: ThemeMode.light,
                  ),
                  RadioListTile<ThemeMode>(
                    title: Text('Dark'),
                    value: ThemeMode.dark,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleThemeModeChanged(ThemeMode? mode) {
    if (mode != null) {
      onThemeModeChanged(mode);
    }
  }
}
