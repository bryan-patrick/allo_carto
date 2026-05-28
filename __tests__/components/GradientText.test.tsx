import GradientText from '@/src/components/GradientText';
import { fireEvent, render } from '@testing-library/react-native';
import Svg, { LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

describe('<GradientText />', () => {
  it('renders measured text with a left-to-right gradient', () => {
    /**
     * Render the thing.
     */
    const { UNSAFE_getAllByType, UNSAFE_getByType, getByText } = render(
      <GradientText
        colors={['#111111', '#eeeeee']}
        fontSize={20}
        fontWeight="800"
        text="Bonjour"
      />
    );

    /**
     * Fake the native text measurement because jest has no real layout.
     */
    fireEvent(getByText('Bonjour'), 'layout', {
      nativeEvent: {
        layout: {
          height: 28,
          width: 120,
        },
      },
    });

    /**
     * Make sure the SVG uses size.
     */
    expect(UNSAFE_getByType(Svg).props).toEqual(
      expect.objectContaining({
        height: 28,
        viewBox: '0 0 120 28',
        width: 120,
      })
    );

    /**
     * Make sure the gradient runs left to right.
     */
    expect(UNSAFE_getByType(LinearGradient).props).toEqual(
      expect.objectContaining({
        x1: '0%',
        x2: '100%',
        y1: '0%',
        y2: '0%',
      })
    );

    /**
     * Make sure the boring props made it through.
     */
    expect(UNSAFE_getByType(SvgText).props.fontWeight).toBe('800');
    expect(UNSAFE_getAllByType(Stop)).toHaveLength(2);
  });
});
