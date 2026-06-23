import {
  impactAsync,
  ImpactFeedbackStyle,
} from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Settings() {
  const { container, pressable, text } = styles;

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
  pressable: {
    padding: 32,
    margin: 4,
    borderWidth: 2,
    borderColor: '#FFAABB'
  },
  text: {
    color: '#ffffff'
  }
})
