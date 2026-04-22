// Packages
import 'package:flutter/material.dart';

// App
import 'app_shell.dart';

class AlloCartoApp extends StatefulWidget {
  const AlloCartoApp({super.key});

  @override
  State<AlloCartoApp> createState() => _AlloCartoAppState();
}

class _AlloCartoAppState extends State<AlloCartoApp> {
  ThemeMode _themeMode = ThemeMode.system;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Allo Carto',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.red,
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.red,
          brightness: Brightness.dark,
        ),
      ),
      themeMode: _themeMode,
      home: AppShell(
        themeMode: _themeMode,
        onThemeModeChanged: _handleThemeModeChanged,
      ),
    );
  }

  void _handleThemeModeChanged(ThemeMode mode) {
    setState(() {
      _themeMode = mode;
    });
  }
}
