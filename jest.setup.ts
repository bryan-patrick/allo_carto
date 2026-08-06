// React Native Worklets is a native library. Its official Jest mock prevents
// unit tests from attempting to initialize the native runtime.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
