import LinkButton from '@/src/components/LinkButton';
import { fireEvent, render } from '@testing-library/react-native';
import { useLinkProps } from 'expo-router/react-navigation';

const mockLinkPress = jest.fn();

/**
 * Mock navigation so we can check the link press
 */
jest.mock('expo-router/react-navigation', () => ({
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

  test('renders text and presses the link', async () => {
    const { getByText } = await render(
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
    await fireEvent.press(linkText);

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

  test('runs handler on press instead of press in', async () => {
    const handler = jest.fn();
    const { getByText } = await render(
      <LinkButton handler={handler}>
        Testing handler
      </LinkButton>
    );

    await fireEvent(getByText('Testing handler'), 'pressIn');

    expect(handler).not.toHaveBeenCalled();

    await fireEvent.press(getByText('Testing handler'));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
