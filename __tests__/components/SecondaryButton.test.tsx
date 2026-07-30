import SecondaryButton from '@/src/components/SecondaryButton';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

function TestIcon({ color }: { color?: string }) {
  return <Text testID="secondary-button-icon" style={{ color }} />;
}

describe('<SecondaryButton />', () => {
  test('can span the full width', async () => {
    const { getByTestId } = await render(
      <SecondaryButton fullwidth testID="fullwidth-secondary-button">
        Full-width secondary button
      </SecondaryButton>
    );

    expect(getByTestId('fullwidth-secondary-button')).toHaveStyle({ width: '100%' });
  });

  test('uses the color as its background when filled', async () => {
    const { getByTestId } = await render(
      <SecondaryButton color="#123456" testID="filled-secondary-button">
        Filled secondary button
      </SecondaryButton>
    );

    expect(getByTestId('filled-secondary-button')).toHaveStyle({ backgroundColor: '#123456' });
  });

  test('uses the color for its outline, text, and icon when outlined', async () => {
    const { getByTestId, getByText } = await render(
      <SecondaryButton
        color="#654321"
        SVGElement={<TestIcon />}
        testID="outlined-secondary-button"
        type="outline"
      >
        Outlined secondary button
      </SecondaryButton>
    );

    expect(getByTestId('outlined-secondary-button')).toHaveStyle({
      backgroundColor: 'transparent',
      borderColor: '#654321',
    });
    expect(getByText('Outlined secondary button')).toHaveStyle({ color: '#654321' });
    expect(getByTestId('secondary-button-icon')).toHaveStyle({ color: '#654321' });
  });
});
