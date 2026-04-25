// Packages
import 'package:flutter/material.dart';

// Themes
import 'theme/ac_theme.dart';
import 'theme/ac_dark_theme.dart';

// Features
import '../features/home/home_page.dart';
import '../features/profile/profile_page.dart';
import '../features/review/review_page.dart';

// App
import 'app.dart';

/*
 * Root shell state
 * Keep track of themeMode (dark, light) and currentPage
 */
class AlloCartoAppState extends State<AlloCartoApp> {
  ThemeMode themeMode = ThemeMode.system;
  int currentPage = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const HomePage(),
      const ReviewPage(),
      ProfilePage(
        themeMode: themeMode,
        onThemeModeChanged: _handleThemeModeChanged,
      ),
    ];

    return MaterialApp(
      title: 'Allo Carto',
      debugShowCheckedModeBanner: false,
      darkTheme: darkThemeData,
      theme: themeData,
      themeMode: themeMode,
      home: Scaffold(
        body: IndexedStack(index: currentPage, children: pages),
        bottomNavigationBar: NavigationBar(
          selectedIndex: currentPage,
          onDestinationSelected: (index) {
            setState(() {
              currentPage = index;
            });
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.quiz_outlined),
              selectedIcon: Icon(Icons.quiz),
              label: 'Review',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_outlined),
              selectedIcon: Icon(Icons.settings),
              label: 'Settings',
            ),
            NavigationDestination(
              icon: Icon(Icons.auto_graph),
              selectedIcon: Icon(Icons.auto_awesome),
              label: 'Stats',
            ),
          ],
        ),
      ),
    );
  }

  void _handleThemeModeChanged(ThemeMode mode) {
    setState(() {
      themeMode = mode;
    });
  }
}
