import Spine from '@/src/components/Views/ChapterSelectView/Spine';
import { render } from '@testing-library/react-native';

describe('<Spine />', () => {
  test('blends the supplied chapter color over the spine image', async () => {
    const { getByTestId } = await render(<Spine color="#3c767d" />);

    expect(getByTestId('spine-color-overlay')).toHaveStyle({
      backgroundColor: '#3c767d',
      mixBlendMode: 'color',
    });
    expect(getByTestId('spine-shade-overlay')).toHaveStyle({
      backgroundColor: '#000000',
      opacity: 0.15,
    });
  });

  test('does not render a color overlay without a chapter color', async () => {
    const { queryByTestId } = await render(<Spine />);

    expect(queryByTestId('spine-color-overlay')).toBeNull();
    expect(queryByTestId('spine-shade-overlay')).toBeNull();
  });
});
