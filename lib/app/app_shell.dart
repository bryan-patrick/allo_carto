// Packages
import 'package:flutter/material.dart';

// App
import 'app_shell_state.dart';

// Contruct the actual StatefulWidget that is our App shell.
// Note: setting finals to constructor vars is shorthand to
// actually set that value (they aren't undefined).
class AppShell extends StatefulWidget {
  const AppShell({
    super.key,
    required this.themeMode,
    required this.onThemeModeChanged,
  });

  final ThemeMode themeMode;
  final ValueChanged<ThemeMode> onThemeModeChanged;

  @override
  State<AppShell> createState() => AppShellState();
}
