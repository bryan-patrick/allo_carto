// Packages
import 'package:flutter/material.dart';

// App
import 'app_shell.dart';

// Features
import '../features/home/home_page.dart';
import '../features/profile/profile_page.dart';
import '../features/stats/stats_page.dart';

/*
 * State for the containing shell of our app.
 * For now it just keeps track of deck index.
 * It returns a Scaffold, our main layout. 
 */
class AppShellState extends State<AppShell> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      const HomePage(),
      const StatsPage(),
      ProfilePage(
        themeMode: widget.themeMode,
        onThemeModeChanged: widget.onThemeModeChanged,
      ),
    ];

    return Scaffold(
      body: IndexedStack(index: selectedIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
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
    );
  }
}
