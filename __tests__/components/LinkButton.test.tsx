import LinkButton from '@/src/components/LinkButton';
import { fireEvent, render } from '@testing-library/react-native';
import { useLinkProps } from 'expo-router/react-navigation';
import { Text } from 'react-native';

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

function TestIcon({ color }: { color?: string }) {
  return <Text testID="link-button-icon" style={{ color }} />;
}

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

  test('can span the full width', async () => {
    const { getByTestId } = await render(
      <LinkButton fullwidth testID="fullwidth-link-button">
        Full-width link
      </LinkButton>
    );

    expect(getByTestId('fullwidth-link-button')).toHaveStyle({ width: '100%' });
  });

  test('applies custom padding to the inner content row', async () => {
    const { getByTestId, getByText } = await render(
      <LinkButton
        contentPaddingHorizontal={24}
        contentPaddingVertical={10}
        style={{ marginTop: 6 }}
        testID="custom-padding-link-button"
      >
        Custom-padding link
      </LinkButton>
    );

    expect(getByTestId('custom-padding-link-button')).toHaveStyle({ marginTop: 6 });
    expect(getByText('Custom-padding link').parent).toHaveStyle({
      paddingHorizontal: 24,
      paddingVertical: 10,
    });
  });

  test('uses the color as its background when filled', async () => {
    const { getByTestId } = await render(
      <LinkButton color="#123456" testID="filled-link-button">
        Filled link
      </LinkButton>
    );

    expect(getByTestId('filled-link-button')).toHaveStyle({ backgroundColor: '#123456' });
  });

  test('uses the color for its outline, text, and icon when outlined', async () => {
    const { getByTestId, getByText } = await render(
      <LinkButton
        color="#654321"
        SVGElement={<TestIcon />}
        testID="outlined-link-button"
        type="outline"
        useArrow={false}
      >
        Outlined link
      </LinkButton>
    );

    expect(getByTestId('outlined-link-button')).toHaveStyle({
      backgroundColor: 'transparent',
      borderColor: '#654321',
    });
    expect(getByText('Outlined link')).toHaveStyle({ color: '#654321' });
    expect(getByTestId('link-button-icon')).toHaveStyle({ color: '#654321' });
  });
});
