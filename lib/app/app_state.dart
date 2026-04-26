// Packages
import 'package:flutter/material.dart';

// Themes
import 'theme/ac_theme.dart';
import 'theme/ac_dark_theme.dart';

// Features
import '../features/home/home_page.dart';
import '../features/profile/profile_page.dart';
import '../features/stats/stats_page.dart';

// App
import 'app.dart';

/*
 * Root shell state
 * Keep track of themeMode (dark, light), views, and currentView
 */
class AlloCartoAppState extends State<AlloCartoApp> {
  ThemeMode themeMode = ThemeMode.system;
  int currentView = 0;

  static const destinations = [
    NavigationDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: 'Home',
    ),
    NavigationDestination(
      icon: Icon(Icons.star_outline),
      selectedIcon: Icon(Icons.star),
      label: 'Stats',
    ),
    NavigationDestination(
      icon: Icon(Icons.settings_outlined),
      selectedIcon: Icon(Icons.settings),
      label: 'Settings',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      const HomePage(),
      const StatsPage(),
      ProfilePage(
        themeMode: themeMode,
        onThemeModeChanged: (mode) {
          setState(() {
            themeMode = mode;
          });
        },
      ),
    ];

    return MaterialApp(
      title: 'Allo Carto',
      debugShowCheckedModeBanner: false,
      darkTheme: darkThemeData,
      theme: themeData,
      themeMode: themeMode,
      home: Scaffold(
        body: IndexedStack(index: currentView, children: pages),
        bottomNavigationBar: NavigationBar(
          selectedIndex: currentView,
          onDestinationSelected: (index) {
            setState(() {
              currentView = index;
            });
          },
          destinations: destinations,
        ),
      ),
    );
  }
}
