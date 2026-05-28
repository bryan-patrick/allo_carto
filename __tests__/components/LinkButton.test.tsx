import LinkButton from '@/src/components/LinkButton';
import { useLinkProps } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';

const mockLinkPress = jest.fn();

/**
 * Mock navigation so we can check the link press
 */
jest.mock('@react-navigation/native', () => ({
  useLinkProps: jest.fn(() => ({
    onPress: mockLinkPress,
  })),
}));

/**
 * Mock audio since our button boops
 */
jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    volume: 0,
    seekTo: jest.fn(),
    play: jest.fn(),
  })),
}));


const mockUseLinkProps = jest.mocked(useLinkProps);

/**
 * LinkButton component test
 */
describe('<LinkButton />', () => {
  beforeEach(() => {
    mockLinkPress.mockClear();
    mockUseLinkProps.mockClear();
  });

  test('renders text and presses the link', () => {
    const { getByText } = render(
      <LinkButton screen="TestingScreen">
        Testing link text
      </LinkButton>
    );

    /**
     * The button should show its child text.
     */
    const linkText = getByText('Testing link text');

    /**
     * Pressing the visible text should trigger the link press.
     */
    fireEvent.press(linkText);

    expect(mockLinkPress).toHaveBeenCalled();

    /**
     * LinkButton should ask React Navigation for props to the target screen.
     */
    expect(mockUseLinkProps).toHaveBeenCalledWith(
      expect.objectContaining({
        screen: 'TestingScreen',
      }),
    );
  });
});
