import LinkButton from '@/src/components/LinkButton';
import { fireEvent, render } from '@testing-library/react-native';
import { useLinkProps } from 'expo-router/react-navigation';

const mockLinkPress = jest.fn();

jest.mock('expo-router/react-navigation', () => ({
	useLinkProps: jest.fn(() => ({
		onPress: mockLinkPress,
	})),
}));

jest.mock('expo-audio', () => ({
	useAudioPlayer: jest.fn(() => ({
		volume: 0,
		seekTo: jest.fn(),
		play: jest.fn(),
	})),
}));

const mockUseLinkProps = jest.mocked(useLinkProps);

describe('<LinkButton />', () => {
	beforeEach(() => {
		mockLinkPress.mockClear();
		mockUseLinkProps.mockClear();
	});

	test('renders text and presses the link', async () => {
		const { getByText } = await render(
			<LinkButton screen="TestingScreen">Testing link text</LinkButton>,
		);

		const linkText = getByText('Testing link text');

		await fireEvent.press(linkText);

		expect(mockLinkPress).toHaveBeenCalled();

		expect(mockUseLinkProps).toHaveBeenCalledWith(
			expect.objectContaining({
				screen: 'TestingScreen',
			}),
		);
	});

	test('can remove its shadow and inner border', async () => {
		const { getByTestId, getByText } = await render(
			<LinkButton
				showInnerBorder={false}
				showShadow={false}
				testID="flat-link-button"
			>
				Flat link
			</LinkButton>,
		);

		expect(getByTestId('flat-link-button')).toHaveStyle({
			shadowColor: 'transparent',
			shadowOpacity: 0,
		});
		expect(getByText('Flat link').parent).toHaveStyle({
			borderColor: 'transparent',
			borderWidth: 0,
		});
	});
});
