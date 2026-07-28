import GradientText from '@/src/components/GradientText';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

describe('<GradientText />', () => {
  it('renders text through a masked linear gradient', async () => {
    /**
     * Render the thing.
     */
    const { getAllByText, getByTestId } = await render(
        <GradientText
          colors={['#111111', '#eeeeee']}
          fontSize={20}
          fontWeight={700}
          text="Bonjour"
        />
    );

    const textNodes = getAllByText('Bonjour');

    /**
     * Make sure the library pieces are wired together.
     */
    expect(getByTestId('gradient-text-mask')).toBeTruthy();
    expect(getByTestId('gradient-text-fill').props).toEqual(
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
