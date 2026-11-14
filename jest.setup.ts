// React Native Worklets is a native library. Its official Jest mock prevents
// unit tests from attempting to initialize the native runtime.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));

// Reanimated 4.7's mock imports its native initializer, which requires a CSS event runtime.
jest.mock('react-native-reanimated/src/initializers', () => ({
	initializeReanimatedModule: jest.fn(),
}));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

// Keep sound effects available to components without starting native audio in Jest.
jest.mock('expo-audio', () => {
	const player = {
		volume: 1,
		seekTo: jest.fn(async () => {}),
		play: jest.fn(),
		pause: jest.fn(),
		addListener: jest.fn(() => ({
			remove: jest.fn(),
		})),
	};

	return {
		useAudioPlayer: jest.fn(() => player),
	};
});

// Jest has no Metro image loader. Let collection stamps use their usual placeholder.
jest.mock('@/src/util/collectionImages', () => ({
	getCollectionStampImage: jest.fn(() => undefined),
}));
