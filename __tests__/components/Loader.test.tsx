import Loader from '@/src/components/Loader';
import { render } from '@testing-library/react-native';

describe('<Loader />', () => {
  test('The loader is rendering the correct text', () => {
    const { getByText } = render(
      <Loader />
    );

    getByText('Loading...');
  });
});
