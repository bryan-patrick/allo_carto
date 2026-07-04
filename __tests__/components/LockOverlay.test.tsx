import LockOverlay from '@/src/components/LockOverlay';
import SVGCheck from '@/src/components/SVG/SVGCheck';
import colors from '@/src/app/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));
jest.mock('@/src/components/SVG/SVGCheck', () => jest.fn(() => null));

const mockMaterialIcon = jest.mocked(MaterialIcons);
const mockSVGCheck = jest.mocked(SVGCheck);

describe('<LockOverlay />', () => {
  beforeEach(() => {
    mockMaterialIcon.mockClear();
    mockSVGCheck.mockClear();
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

  test('renders a success check overlay when complete', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <LockOverlay
        completeAccessibilityHint="No cards remain here."
        completeAccessibilityLabel="New rank complete"
        isComplete
        isLocked={false}
      >
        <Text>Complete content</Text>
      </LockOverlay>
    );

    getByText('Complete content');
    getByTestId('complete-overlay');
    getByLabelText('New rank complete');
    expect(mockMaterialIcon).not.toHaveBeenCalled();
    expect(mockSVGCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        color: colors.dark.success,
        height: '32',
        width: '32',
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
