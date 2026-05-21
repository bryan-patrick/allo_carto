import { Stack } from "@/node_modules/expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import alloTheme from './alloTheme';

/**
 * Stack navigator
 * https://docs.expo.dev/router/advanced/stack/
 */
const debug = true;

if (debug) {
  console.log(alloTheme);
}

/**
 * AppLayout Component
 * 
 * "Off we go again."
 * - Vladimir, Waiting for Godot
 */
export default function AppLayout() {
  const [loaded, error] = useFonts({
    'lexend-variable': require('./assets/fonts/lexend-variable.ttf')
  })

  if (debug) {
    console.log(`Loaded: ${loaded ?? 'Error:'}, ${error ?? 'No font error.'}`);
  }

  /**
   * The (tabs) dir are navigable routes on the bottom bar
   * All other routes go in dir (routes)
   */
  return (
    <ThemeProvider value={alloTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{
          headerShown: false,
          headerTitle: 'Home'
        }} />
        <Stack.Screen name="(routes)/deck" options={{
          headerShown: true,
          headerBackTitle: 'Home',
          headerTitle: 'Review a deck'
        }} />
      </Stack>
    </ThemeProvider>
  )
}
