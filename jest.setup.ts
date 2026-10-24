// React Native Worklets is a native library. Its official Jest mock prevents
// unit tests from attempting to initialize the native runtime.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));

// Reanimated 4.7's mock imports its native initializer, which requires a CSS event runtime.
jest.mock('react-native-reanimated/src/initializers', () => ({
	initializeReanimatedModule: jest.fn(),
}));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
