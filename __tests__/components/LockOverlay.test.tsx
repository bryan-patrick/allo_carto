import LockOverlay from '@/src/components/LockOverlay';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));
jest.mock('@/src/components/SVG/SVGCheck', () => jest.fn(() => null));

describe('<LockOverlay />', () => {
	test('renders a blocking overlay when locked', async () => {
		const { getByTestId } = await render(
			<LockOverlay isLocked>
				<Text>Locked content</Text>
			</LockOverlay>,
		);

		getByTestId('lock-overlay');
	});
});
