import { Stack } from "@/node_modules/expo-router";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import alloTheme from './alloTheme';

/*
 * Stack navigator
 * https://docs.expo.dev/router/advanced/stack/
 */
const debug = true;

if (debug) {
  console.log(alloTheme);
}

export default function AppLayout() {
  const [loaded, error] = useFonts({
    'lexend-variable': require('./assets/fonts/lexend-variable.ttf')
  })

  if (debug) {
    console.log(`Loaded: ${loaded ?? 'Error:'}, ${error ?? 'No font error.'}`);
  }

  return (
    <ThemeProvider value={alloTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="deck" options={{ headerShown: true, headerBackTitle: 'Home' }} />
      </Stack>
    </ThemeProvider>
  )
}
