import LockOverlay from '@/src/components/LockOverlay';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));

const mockMaterialIcon = jest.mocked(MaterialIcons);

describe('<LockOverlay />', () => {
  beforeEach(() => {
    mockMaterialIcon.mockClear();
  });

  test('renders children without an overlay when unlocked', () => {
    const { getByText, queryByTestId } = render(
      <LockOverlay isLocked={false}>
        <Text>Unlocked content</Text>
      </LockOverlay>
    );

    getByText('Unlocked content');
    expect(queryByTestId('lock-overlay')).toBeNull();
    expect(mockMaterialIcon).not.toHaveBeenCalled();
  });

  test('renders a soft lock overlay when locked', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <LockOverlay
        isLocked
        lockedAccessibilityHint="Earn more cards to unlock this."
        lockedAccessibilityLabel="Test area locked"
      >
        <Text>Locked content</Text>
      </LockOverlay>
    );

    getByText('Locked content');
    getByTestId('lock-overlay');
    getByLabelText('Test area locked');
    expect(mockMaterialIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'lock',
        size: 32,
      }),
      undefined,
    );
  });

  test('captures presses on the overlay when locked', () => {
    const handleChildPress = jest.fn();
    const { getByTestId } = render(
      <LockOverlay isLocked>
        <Pressable onPress={handleChildPress}>
          <Text>Locked button</Text>
        </Pressable>
      </LockOverlay>
    );

    fireEvent.press(getByTestId('lock-overlay'));

    expect(handleChildPress).not.toHaveBeenCalled();
  });
});
