import {
  impactAsync,
  ImpactFeedbackStyle,
} from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../colors';
import { resetDB } from '../../db/interface';

export default function Settings() {
  const {
    container,
    debugSection,
    disabledPressable,
    heading,
    pressable,
    resetPressable,
    text,
  } = styles;

  /**
   * State
   */
  const [isResettingDB, setIsResettingDB] = useState(false);

  /**
   * Reset the local DB, then rebuild the seed data.
   */
  async function handleResetDB() {
    setIsResettingDB(true);

    try {
      await impactAsync(ImpactFeedbackStyle.Heavy);
      await resetDB();

      Alert.alert('DB reset', 'The local database has been reset.');
    } catch (error) {
      console.error('Failed to reset the DB:', error);

      Alert.alert('Reset failed', 'Could not reset the local database.');
    } finally {
      setIsResettingDB(false);
    }
  }

  function confirmResetDB() {
    Alert.alert(
      'Reset DB?',
      'This will clear local progress and rebuild the seeded data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset DB',
          style: 'destructive',
          onPress: handleResetDB,
        },
      ],
    );
  }

  return (
    <View style={container}>
      <Pressable
        style={pressable}
        onPress={
          () => impactAsync(ImpactFeedbackStyle.Light)
        }
      >
        <Text style={text}>
          Light
        </Text>
      </Pressable>
      <Pressable
        style={pressable}
        onPress={
          () => impactAsync(ImpactFeedbackStyle.Medium)
        }
      >
        <Text style={text}>
          Medium
        </Text>
      </Pressable>
      <Pressable
        style={pressable}
        onPress={
          () => impactAsync(ImpactFeedbackStyle.Heavy)
        }
      >
        <Text style={text}>
          Heavy
        </Text>
      </Pressable>
      <Pressable
        style={pressable}
        onPress={
          () => impactAsync(ImpactFeedbackStyle.Rigid)
        }
      >
        <Text style={text}>
          Rigid
        </Text>
      </Pressable>
      <Pressable
        style={pressable}
        onPress={
          () => impactAsync(ImpactFeedbackStyle.Soft)
        }
      >
        <Text style={text}>
          Soft
        </Text>
      </Pressable>
      <View style={debugSection}>
        <Text style={heading}>
          Debug
        </Text>
        <Pressable
          disabled={isResettingDB}
          style={[
            pressable,
            resetPressable,
            isResettingDB && disabledPressable,
          ]}
          onPress={confirmResetDB}
        >
          <Text style={text}>
            {isResettingDB ? 'Resetting DB...' : 'Reset DB'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8,
  },
  debugSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  heading: {
    color: colors.light.text,
    fontFamily: 'lexend-700',
    fontSize: 20,
  },
  pressable: {
    padding: 32,
    margin: 4,
    borderWidth: 2,
    borderColor: '#FFAABB'
  },
  resetPressable: {
    borderColor: colors.light.danger,
  },
  disabledPressable: {
    opacity: 0.6,
  },
  text: {
    color: '#ffffff'
  }
})
