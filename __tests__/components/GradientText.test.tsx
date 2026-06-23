import GradientText from '@/src/components/GradientText';
import MaskedView from '@react-native-masked-view/masked-view';
import { render } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

describe('<GradientText />', () => {
  it('renders text through a masked linear gradient', () => {
    /**
     * Render the thing.
     */
    const { UNSAFE_getAllByType, UNSAFE_getByType } = render(
        <GradientText
          colors={['#111111', '#eeeeee']}
          fontSize={20}
          fontWeight={700}
          text="Bonjour"
        />
    );

    const textNodes = UNSAFE_getAllByType(Text);

    /**
     * Make sure the library pieces are wired together.
     */
    expect(UNSAFE_getByType(MaskedView)).toBeTruthy();
    expect(UNSAFE_getByType(LinearGradient).props).toEqual(
      expect.objectContaining({
        colors: ['#111111', '#eeeeee'],
        end: { x: 1, y: 0 },
        start: { x: 0, y: 0 },
      })
    );

    /**
     * Make sure both the mask and measured gradient text share typography.
     */
    textNodes.forEach(textNode => {
      expect(textNode.props.children).toBe('Bonjour');
      expect(StyleSheet.flatten(textNode.props.style)).toEqual(
        expect.objectContaining({
          fontFamily: 'lexend-700',
          fontSize: 20,
        })
      );
    });
  });
});
