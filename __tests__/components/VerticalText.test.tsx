import VerticalText from '@/src/components/VerticalText';
import { render } from '@testing-library/react-native';

describe('<VerticalText />', () => {
	test('renders each character vertically while exposing the complete word', async () => {
		const { getByLabelText, getByText } = await render(<VerticalText word="Travel" />);

		expect(getByLabelText('Travel')).toHaveStyle({
			display: 'flex',
			flexDirection: 'column',
		});

		for (const character of Array.from('Travel')) {
			getByText(character);
		}
	});
});
