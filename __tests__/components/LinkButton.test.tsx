import LinkButton from '@/src/components/LinkButton';
import { fireEvent, render } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

jest.mock('@/src/util/useSoundEffect', () => ({
	useSoundEffect: () => jest.fn(),
}));

function ChapterScreen() {
	return <Text>Chapter destination</Text>;
}

describe('<LinkButton />', () => {
	test('navigates to a screen with its params and runs the press handlers', async () => {
		const handler = jest.fn();
		const onPress = jest.fn();
		const result = await renderRouter({
			index: () => (
				<LinkButton
					screen="/(routes)/ChapterSelect"
					params={{ storyId: 'story-one' }}
					handler={handler}
					onPress={onPress}
				>
					Start story
				</LinkButton>
			),
			'(routes)/ChapterSelect': ChapterScreen,
		});

		await fireEvent.press(result.getByText('Start story'));

		expect(result.getByText('Chapter destination')).toBeTruthy();
		expect(result.getSearchParams()).toEqual({ storyId: 'story-one' });
		expect(handler).toHaveBeenCalledTimes(1);
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	test('navigates with an href', async () => {
		const result = await renderRouter({
			index: () => <LinkButton href="/ChapterSelect">Open chapter</LinkButton>,
			ChapterSelect: ChapterScreen,
		});

		await fireEvent.press(result.getByText('Open chapter'));

		expect(result.getByText('Chapter destination')).toBeTruthy();
	});

	test('does not navigate or run its handler when disabled', async () => {
		const handler = jest.fn();
		const result = await renderRouter({
			index: () => (
				<LinkButton
					href="/ChapterSelect"
					handler={handler}
					disabled
				>
					Open chapter
				</LinkButton>
			),
			ChapterSelect: ChapterScreen,
		});

		await fireEvent.press(result.getByText('Open chapter'));

		expect(result.getPathname()).toBe('/');
		expect(handler).not.toHaveBeenCalled();
	});

	test('runs an action without a navigation context', async () => {
		const handler = jest.fn();
		const result = await render(<LinkButton handler={handler}>Save</LinkButton>);

		await fireEvent.press(result.getByText('Save'));

		expect(handler).toHaveBeenCalledTimes(1);
	});
});
